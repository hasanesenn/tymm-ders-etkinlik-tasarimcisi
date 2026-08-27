// MEB / Türkiye Yüzyılı Maarif Modeli öğretim programı scraper'ı.
//
// Ne yapar:
//   1. Verilen index sayfa(lar)ından ders sayfası linklerini çeker.
//   2. Her ders sayfasındaki program PDF linklerini bulur.
//   3. PDF'leri .cache/'e indirir (varsa tekrar indirmez).
//   4. pdftotext -layout ile metne çevirir (sistemde poppler kurulu olmalı).
//   5. Öğrenme çıktısı kodlarını (DERS.SINIF.ÜNİTE.ÇIKTI) + açıklamaları ayrıştırır.
//   6. lib/curriculum.ts dosyasını üretir.
//
// Hiçbir LLM çağrısı yok — tamamen deterministik, sıfır AI token.
//
// Kullanım:
//   node scripts/scrape-curriculum.mjs ortaogretim
//   node scripts/scrape-curriculum.mjs ortaogretim temel-egitim

import { execFileSync } from "node:child_process"
import { mkdirSync, existsSync, writeFileSync, readFileSync, readdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE = join(ROOT, ".cache", "meb")
const outArg = process.argv.indexOf("--out")
const OUT = outArg > -1 ? process.argv[outArg + 1] : join(ROOT, "lib", "curriculum.ts")
const BASE = "https://tymm.meb.gov.tr"
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

const levels = process.argv
  .slice(2)
  .filter((a, i, arr) => a !== "--out" && a !== "--cache" && arr[i - 1] !== "--out")
if (levels.length === 0) levels.push("ortaogretim")

mkdirSync(CACHE, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchText(url) {
  const res = await fetch(url, { headers: { "User-Agent": UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.text()
}

async function download(url, file) {
  if (existsSync(file)) return
  const res = await fetch(url, { headers: { "User-Agent": UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  const buf = Buffer.from(await res.arrayBuffer())
  writeFileSync(file, buf)
  await sleep(500) // sunucuya nazik ol
}

function pdfToText(pdf, txt) {
  if (!existsSync(txt)) {
    execFileSync("pdftotext", ["-layout", "-enc", "UTF-8", pdf, txt])
  }
  return readFileSync(txt, "utf8")
}

// Slug → düzgün Türkçe ders adı (form'daki DERSLER ile eşleşsin, URL slug'ları
// Türkçe karakter kaybettiği için elle eşleniyor)
const DERS_ADLARI = {
  // ortaöğretim
  "beden-egitimi-ve-spor": "Beden Eğitimi ve Spor",
  biyoloji: "Biyoloji",
  cografya: "Coğrafya",
  "din-kulturu-ve-ahlak-bilgisi": "Din Kültürü ve Ahlak Bilgisi",
  felsefe: "Felsefe",
  fizik: "Fizik",
  "gorsel-sanatlar": "Görsel Sanatlar",
  ingilizce: "İngilizce",
  kimya: "Kimya",
  matematik: "Matematik",
  muzik: "Müzik",
  tarih: "Tarih",
  "tc-inkilap-tarihi-ve-ataturkculuk": "T.C. İnkılap Tarihi ve Atatürkçülük",
  "turk-dili-ve-edebiyati": "Türk Dili ve Edebiyatı",
  // temel eğitim (ilkokul/ortaokul)
  "fen-bilimleri": "Fen Bilimleri",
  "hayat-bilgisi": "Hayat Bilgisi",
  "ilkokul-matematik": "İlkokul Matematik",
  "ortaokul-matematik": "Ortaokul Matematik",
  "ilkokul-turkce": "İlkokul Türkçe",
  "ortaokul-turkce": "Ortaokul Türkçe",
  "sosyal-bilgiler": "Sosyal Bilgiler",
  "insan-haklari-vatandaslik-ve-demokrasi": "İnsan Hakları, Yurttaşlık ve Demokrasi",
  "bilisim-teknolojileri-ve-yazilim": "Bilişim Teknolojileri ve Yazılım",
  "teknoloji-tasarim": "Teknoloji Tasarım",
  "trafik-guvenligi": "Trafik Güvenliği",
}

// Temel eğitimde çok sayıda niş ders var (müzik okulları modülleri, spor
// varyantları). Sadece akademik çekirdek dersleri al.
const TEMEL_EGITIM_ALLOWLIST = [
  "fen-bilimleri",
  "hayat-bilgisi",
  "ilkokul-matematik",
  "ortaokul-matematik",
  "ilkokul-turkce",
  "ortaokul-turkce",
  "sosyal-bilgiler",
  "insan-haklari-vatandaslik-ve-demokrasi",
  "bilisim-teknolojileri-ve-yazilim",
  "teknoloji-tasarim",
  "din-kulturu-ve-ahlak-bilgisi",
  "gorsel-sanatlar-dersi-temel-egitim",
  "muzik-dersi-temel-egitim",
  "trafik-guvenligi",
]

function dersAdi(slug) {
  const core = slug.replace(/-dersi.*$/, "").replace(/-2$/, "")
  if (DERS_ADLARI[core]) return DERS_ADLARI[core]
  return core
    .split("-")
    .map((w) => w.charAt(0).toLocaleUpperCase("tr") + w.slice(1))
    .join(" ")
    .trim()
}

// Standart Maarif kodu: DERS.SINIF.ÜNİTE.ÇIKTI (örn. TAR.9.1.1)
// Fen Bilimleri'nde ünite altında ayrıca KONU seviyesi var, kod beş parçalı:
// DERS.SINIF.ÜNİTE.KONU.ÇIKTI (örn. FB.7.1.2.1). Beşinci grup opsiyonel.
const CODE_RE =
  /\b([A-ZÇĞİÖŞÜ]{2,5})\.(\d{1,2})\.(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?\.?\s*(.*)$/
// Türk Dili: sınıf prefix'e bitişik, 3 parça (TDE1.2.3 → 9. sınıf, 2.tema, 3)
const TDE_RE = /\b(TDE)(\d)\.(\d{1,2})\.(\d{1,2})\.?\s*(.*)$/
const TDE_SINIF = { 1: 9, 2: 10, 3: 11, 4: 12 }
// İlkokul/Ortaokul Türkçe: T.<ALAN>.SINIF.NO
// Dört öğrenme alanı, dört ayrı kod öneki:
//   T.D = Dinleme/İzleme, T.O = Okuma, T.K = Konuşma, T.Y = Yazma
// (Eskiden yalnız T.D taranıyordu; Okuma/Konuşma/Yazma çıktıları hiç
//  derlenmiyordu — ortaokulda 302, ilkokulda 58 kazanım eksikti.)
const TURKCE_RE = /\bT\.([DOKY])\.(\d{1,2})\.(\d{1,2})\.?\s*(.*)$/
const TURKCE_ALAN_UNITE = { D: 1, O: 2, K: 3, Y: 4 }

const isCodeLine = (l) => CODE_RE.test(l) || TDE_RE.test(l) || TURKCE_RE.test(l)

// Bir satırdan kod bileşenlerini çıkar (iki formatı da dener)
function matchCode(line) {
  const m = line.match(CODE_RE)
  if (m) {
    const [, prefix, sinif, unite, dort, bes] = m
    // Beş parçalıysa dördüncü grup KONU, beşinci ÇIKTI olur (Fen Bilimleri).
    const konu = bes ? Number(dort) : null
    const no = bes ? Number(bes) : Number(dort)
    return {
      prefix,
      kod: bes
        ? `${prefix}.${sinif}.${unite}.${dort}.${bes}`
        : `${prefix}.${sinif}.${unite}.${dort}`,
      sinif: Number(sinif),
      unite: Number(unite),
      konu,
      no,
      desc: m[6] || "",
    }
  }
  const t = line.match(TDE_RE)
  if (t) {
    return {
      prefix: t[1],
      kod: `${t[1]}${t[2]}.${t[3]}.${t[4]}`, // literal: TDE1.2.3
      sinif: TDE_SINIF[Number(t[2])] ?? Number(t[2]),
      unite: Number(t[3]),
      no: Number(t[4]),
      desc: t[5] || "",
    }
  }
  const td = line.match(TURKCE_RE)
  if (td) {
    return {
      // Dört alanın tek prefix altında toplanması önemli: prefix sıklık
      // filtresi alanları birbirinden ayırıp elemesin.
      prefix: "T.",
      kod: `T.${td[1]}.${td[2]}.${td[3]}`, // literal: T.O.5.1
      sinif: Number(td[2]),
      unite: TURKCE_ALAN_UNITE[td[1]] ?? 1,
      no: Number(td[3]),
      desc: td[4] || "",
    }
  }
  return null
}

// İki sütunlu PDF düzeninin metne kattığı kalıpları temizle:
//   - "VE SÜREÇ BİLEŞENLERİ" sağ sütun başlığı (bazen kelime ortasına yapışık)
//   - "ÖĞRENME ÇIKTILARI" başlık artığı
//   - "a) ... b) ..." süreç bileşeni listesi (öğrenme çıktısının kendisi değil)
//
// Süreç bileşeni işaretinden ÖNCE boşluk (ya da satır başı) şart. Eskiden
// `\s*` (sıfır da olabilir) yazıyordu ve bu, metnin içindeki parantezli
// ifadeleri de kesiyordu:
//   "Gerçek sayılarda f(x) = x ..."      → "x) " eşleşiyor → "Gerçek sayılarda f("
//   "Allah'ın (cc) varlığının ..."        → "c) " eşleşiyor → "Allah'ın (c"
//   "Hz. Muhammed'in (sav) örnekliği ..." → "v) " eşleşiyor → "Hz. Muhammed'in (sa"
// 47 öğrenme çıktısı bu yüzden yarım kalmıştı. Gerçek bir bileşen işaretinin
// öncesinde her zaman boşluk olur; f(x) içindeki "x"in öncesinde "(" vardır.
// Sıra önemli: başlık artıkları BOŞLUKLA değiştirilir ve boşluklar bileşen
// işareti aranmadan önce sadeleştirilir. Aksi hâlde "…çözümleyebilme VE SÜREÇ
// BİLEŞENLERİ a) Müzik…" ifadesinde başlık silinince "çözümleyebilmea)" yapışık
// kalıyor ve işaretin önündeki boşluk şartı tutmadığı için bileşen listesi
// çıktının içinde kalıyordu.
function cleanCikti(s) {
  return kesBilesenListesi(
    s
      .replace(/ÖĞRENME ÇIKTILARI/g, " ")
      .replace(/(VE\s+)?SÜREÇ BİLEŞENLER[İI]/g, " ")
      // Sütun kırpılınca başlığın yalnız son kelimesi metnin ORTASINDA kalabiliyor
      // ("…inceleyebilme BİLEŞENLERİ a) …betimler."). Büyük harfli hâli daima
      // başlık artığıdır; çıktı metinlerinde küçük harfle geçer.
      .replace(/\bBİLEŞENLER[İI]\b/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  )
    // "yapa bilme" → "yapabilme": satır sonunda bölünen fiil, tire düşünce
    // boşlukla yapışık kalıyor (KİM.10.1.1, TT.7.3.1, TT.7.7.1).
    .replace(/([a-zçğıöşü][ae])\s+(bilme(?:si)?)\b/gu, "$1$2")
    // Çıktı bittikten sonra yeni bir cümle başlıyorsa (büyük harf) o cümle
    // çıktının parçası değil, süreç bileşeni ya da açıklamadır.
    .replace(/((?:abilme|ebilme))\s+(?=[A-ZÇĞİÖŞÜ])[\s\S]*$/u, "$1")
    .trim()
}

// Süreç bileşeni listesini ("a) b) c)") çıktı metninden ayırır.
//
// İşareti körlemesine aramak matematik gösterimini bozuyordu: "f(x ± r) ± k"
// ifadesindeki " r) " de bir işaret gibi görünüyor ve metin oradan kesiliyordu
// (MAT.9.2.1, MAT.10.2.2, MAT.10.2.3, MAT.11.1.3, MAT.11.1.5).
//
// Kural: yalnızca işaretten ÖNCEKİ metin zaten tam bir öğrenme çıktısıysa
// ("…-abilme" ile bitiyorsa) ya da işaret en baştaysa kes. "f(x ±" tam bir
// çıktı olmadığı için formüle dokunulmaz.
function kesBilesenListesi(t) {
  const re = /(?:^|\s)([a-zçğıöşü])\)(?:\s|$)/gu
  let m
  while ((m = re.exec(t)) !== null) {
    const once = t.slice(0, m.index).trim()
    if (once === "" || /(abilme|ebilme)$/i.test(once)) return once
  }
  return t
}

// Bir ders metninden öğrenme çıktılarını çıkar.
function parseOutcomes(text) {
  const lines = text.split(/\r?\n/)
  const raw = [] // { prefix, sinif, unite, no, cikti }

  // Türkçe programında bir öğrenme çıktısı birden çok sınıf için ORTAK tanımlanır:
  //   "T.D.5.24. / T.D.6.24. / T.D.7.26. / T.D.8.26. Dinlediğindeki ... üretebilme"
  // matchCode tek eşleşme döndürdüğü için yalnız ilk kod (T.D.5.24) kayıt alıyor,
  // kalan sınıflar bu satırdan hiç beslenmiyordu. Satırdaki her kodu ayrı kayda aç.
  const ORTAK_TD =
    /^\s*((?:T\.[DOKY]\.\d{1,2}\.\d{1,2}\.?\s*\/\s*)+T\.[DOKY]\.\d{1,2}\.\d{1,2}\.?)\s+(\S.*)$/

  for (let i = 0; i < lines.length; i++) {
    const ortak = lines[i].match(ORTAK_TD)
    if (ortak) {
      const kodlar = ortak[1].match(/T\.[DOKY]\.\d{1,2}\.\d{1,2}/g) || []
      let metin = ortak[2].trim()
      let k = i + 1
      // Satır zaten tam bir çıktıyla bitiyorsa devam etme; sonrasında çıktının
      // kendisi değil, açıklama paragrafı geliyor.
      const tamam = () => /(abilme|ebilme)\.?$/i.test(metin)
      while (
        k < lines.length &&
        !tamam() &&
        metin.length < 320 &&
        !isCodeLine(lines[k]) &&
        lines[k].trim().length > 0 &&
        !/^[\sA-ZÇĞİÖŞÜ.•]+$/.test(lines[k].trim())
      ) {
        const cont = lines[k].trim()
        if (metin.endsWith("-")) metin = metin.slice(0, -1) + cont
        else metin += " " + cont
        if (cont.match(/[.:]$/) || cont.length < 40) break
        k++
      }
      const temiz = cleanCikti(metin)
      for (const kod of kodlar) {
        const [, alan, sinif, no] = kod.match(/T\.([DOKY])\.(\d{1,2})\.(\d{1,2})/)
        raw.push({
          prefix: "T.",
          kod,
          sinif: Number(sinif),
          unite: TURKCE_ALAN_UNITE[alan] ?? 1,
          no: Number(no),
          cikti: temiz,
        })
      }
      continue
    }

    const c = matchCode(lines[i])
    if (!c) continue
    let desc = c.desc.trim()

    // Satır tireyle bölünmüşse veya açıklama boşsa sonraki satırı birleştir
    let j = i + 1
    // 480 karakter sınırı: matematikte formül içeren çıktılar uzun oluyor
    // ("f(x) = logax (a > 0, a ≠ 1, x > 0) şeklinde tanımlı ... g(x) = k ∙ f(mx ± n) ± r").
    // 200'de kesildikleri için yarım kalıyorlardı. Döngü zaten kod satırında,
    // boş satırda ve büyük harfli başlıkta duruyor.
    while (
      j < lines.length &&
      desc.length < 480 &&
      !isCodeLine(lines[j]) &&
      lines[j].trim().length > 0 &&
      // satır bir süreç bileşeni işaretiyle başlıyorsa çıktı bitmiştir
      !/^\s*[a-zçğıöşü]\)\s/u.test(lines[j]) &&
      // büyük harfli başlık satırlarını alma
      !/^[\sA-ZÇĞİÖŞÜ.•]+$/.test(lines[j].trim())
    ) {
      const cont = lines[j].trim()
      // Kesir ve üs gösterimi metne tek karakterlik satır olarak düşüyor:
      // "…rasyonel referans fonksiyo-" / "x" / "nun nitel özellikleri…"
      // Yalnız TEK karakter: "me", "nun" gibi hece devamları korunmalı.
      // ("1/x" ifadesinin paydası). Birleştirilirse "fonksiyox" oluyordu.
      if (cont.length <= 1) {
        j++
        continue
      }
      if (desc.endsWith("-")) desc = desc.slice(0, -1) + cont
      else desc += " " + cont
      if (cont.match(/[.:]$/) || cont.length < 40) break
      j++
    }

    raw.push({
      prefix: c.prefix,
      kod: c.kod,
      sinif: c.sinif,
      unite: c.unite,
      konu: c.konu ?? null,
      no: c.no,
      cikti: cleanCikti(desc),
    })
  }

  // Bir derste birden çok geçerli alan prefixi olabilir (Türkçe: OK/DO/KY...).
  // Yeterince sık geçen TÜM prefixleri tut; tek tük çapraz referansları ele.
  // (Beceri kodları E3.2/SDB2.2 zaten 4 parçalı değil, CODE_RE'ye uymaz.)
  const freq = {}
  for (const o of raw) freq[o.prefix] = (freq[o.prefix] || 0) + 1
  const entries = Object.entries(freq)
  const maxCount = entries.reduce((m, [, c]) => Math.max(m, c), 0)
  const keep = new Set(
    entries.filter(([, c]) => c >= 3 && c >= maxCount * 0.12).map(([p]) => p)
  )

  // Aynı kod birden çok geçer (özet liste + uzun uygulama notu). Kanonik
  // öğrenme çıktısı "...abilme/ebilme" ile biter ve kısadır — onu seçeriz.
  const cands = new Map() // kod -> { sinif, unite, no, ciktilar: [] }
  for (const o of raw) {
    if (!keep.has(o.prefix)) continue
    if (!cands.has(o.kod))
      cands.set(o.kod, { sinif: o.sinif, unite: o.unite, konu: o.konu ?? null, no: o.no, ciktilar: [] })
    cands.get(o.kod).ciktilar.push(o.cikti)
  }

  const isOutcome = (t) => /(abilme|ebilme|abilmesi|ebilmesi)\.?$/i.test(t)
  const isUygulama = (t) =>
    /^(Öğrenci|Öğretmen|Verilen|Grup|Bu\b|Konu\b|Öğrenme|Uygulamaları|Sınıfa|Yazılı)/i.test(t) ||
    /^[.,;)]/.test(t)
  // Uygulama notlarının sonundaki çapraz referans listeleri de aynı kodu taşır:
  //   "...sergilemeleri istenir. (MÜZ.1.2.1; MÜZ.1.2.3; MÜZ.1.2.4)"
  // Bunlar öğrenme çıktısı değil. Noktalama ile başlayan ya da içinde başka
  // çıktı kodu barındıran adayları ele.
  const isCaprazReferans = (t) =>
    /^[;,.)\s]/.test(t) ||
    /[A-ZÇĞİÖŞÜ]{2,5}\.\d+\.\d+\.\d+/.test(t) ||
    // Türkçe/Türk Dili kodları da metnin içinde kalabiliyor. İki sütunlu
    // tablolarda kod metnin SAĞINDA durduğu için "T.D.6.4. T.D.7.4. T.D.8.4.
    // larının anlamını tahmin edebilme" gibi kısa ama sahte adaylar oluşuyordu
    // ve pickBest en kısayı seçtiği için bunlar kazanıyordu.
    /T\.[DOKY]\.\d+\.\d+/.test(t) ||
    /TDE\d\.\d+\.\d+/.test(t) ||
    // Sütunları iç içe geçmiş sayfalarda metin paramparça çıkıyor ve bileşen
    // işareti kelimeye yapışıyor ("a)Trafik Trafikişaret levhalarını").
    // Bu adaylar kurtarılabilir değil.
    /(?:^|\s)[a-zçğıöşü]\)\S/u.test(t)

  // Türk Dili (TDE) çıktıları "-abilme" ile bitmez, betimleyici cümlelerdir;
  // aynı kodun en uzun (en tam) hâlini seç. Diğer dersler "-abilme" + kısa.
  const tdeMode = keep.has("TDE")

  function pickBest(list) {
    const clean = list.filter(
      (t) => t.length >= 8 && !t.endsWith("-") && !isCaprazReferans(t)
    )
    const pool = clean.length ? clean : list
    if (tdeMode) {
      const nonApp = pool.filter((t) => !isUygulama(t))
      const fb = nonApp.length ? nonApp : pool
      return fb.sort((a, b) => b.length - a.length)[0] // en uzun
    }
    const outcomes = pool.filter(isOutcome)
    if (outcomes.length) return outcomes.sort((a, b) => a.length - b.length)[0]
    const nonApp = pool.filter((t) => !isUygulama(t))
    // Bir kod için TEK aday varsa ve o da uygulama notuysa, bu bir öğrenme
    // çıktısı değildir — kaydı düşür (eskiden TT.8.3.2 böyle sızıyordu).
    if (!nonApp.length) return null
    return nonApp.sort((a, b) => a.length - b.length)[0]
  }

  return [...cands.entries()]
    .map(([kod, v]) => ({
      kod,
      sinif: v.sinif,
      unite: v.unite,
      konu: v.konu,
      no: v.no,
      cikti: pickBest(v.ciktilar),
    }))
    .filter((o) => o.cikti && o.cikti.length >= 8)
    .sort(
      (a, b) =>
        a.sinif - b.sinif || a.unite - b.unite || (a.konu ?? 0) - (b.konu ?? 0) || a.no - b.no
    )
}


// Cache'teki dosya adı → ders adı. --cache modunda siteye hiç bağlanılmaz;
// site 2026 yazında ders listesini istemci tarafında üretmeye başladığı için
// link taraması güvenilmez hâle geldi. PDF'ler zaten .cache/meb altında.
const DOSYA_DERS = {
  "2024programbiy9101112Onayli": "Biyoloji",
  "2024programcog9101112Onayli": "Coğrafya",
  "2024programdin45678Onayli": "Din Kültürü ve Ahlak Bilgisi",
  "2024programdin9101112Onayli": "Din Kültürü ve Ahlak Bilgisi",
  "2024programfel1011Onayli": "Felsefe",
  "2024programfen345678Onayli": "Fen Bilimleri",
  "2024programfiz9101112Onayli": "Fizik",
  "2024programhay123Onayli": "Hayat Bilgisi",
  "2024programink12Onayli": "T.C. İnkılap Tarihi ve Atatürkçülük",
  "2024programkim9101112Onayli": "Kimya",
  "2024programmat1234Onayli": "İlkokul Matematik",
  "2024programmat5678Onayli": "Ortaokul Matematik",
  "2024programmath9101112Onayli": "Matematik",
  "2024programsos4567Onayli": "Sosyal Bilgiler",
  "2024programtar91011Onayli": "Tarih",
  "2024programtur1234Onayli": "İlkokul Türkçe",
  "2024programtur5678Onayli": "Ortaokul Türkçe",
  "2024programturh9101112Onayli": "Türk Dili ve Edebiyatı",
  "2024programvat4Onayli": "İnsan Hakları, Yurttaşlık ve Demokrasi",
  "beden-egitimi-ve-spor-ogretim-programi": "Beden Eğitimi ve Spor",
  "bilisim-teknolojileri-ve-yazilim-tegm": "Bilişim Teknolojileri ve Yazılım",
  "gorsel-sanatlar-ogretim-programi": "Görsel Sanatlar",
  "gorsel-sanatlar-ogretim-programi-temel-egitim": "Görsel Sanatlar",
  "ingilizce_9_12_ogretim_programi": "İngilizce",
  "ingilizce_hazirlik_9_12_ogretim_programi": "İngilizce",
  "muzik-dersi-ogretim-programi": "Müzik",
  "muzik-dersi-programi-tegm": "Müzik",
  "teknoloji-tasarim-dersi-ogretim-programi-7-8": "Teknoloji Tasarım",
  "trafik-guvenligi-programi-tegm": "Trafik Güvenliği",
}

function cachedenUret() {
  const curriculum = {}
  const dosyalar = readdirSync(CACHE)
    .filter((f) => f.endsWith(".pdf"))
    .sort()
  for (const dosya of dosyalar) {
    const base = dosya.replace(/\.pdf$/i, "")
    const ders = DOSYA_DERS[base]
    if (!ders) {
      console.log(`  ? ${base}: ders adı eşlenmedi, atlandı`)
      continue
    }
    const pdf = join(CACHE, dosya)
    const txt = pdf.replace(/\.pdf$/i, ".txt")
    const outcomes = parseOutcomes(pdfToText(pdf, txt))
    if (outcomes.length === 0) {
      console.log(`  - ${ders} (${base}): çıktı ayrıştırılamadı`)
      continue
    }
    curriculum[ders] = (curriculum[ders] || []).concat(outcomes)
    console.log(`  ✓ ${ders.padEnd(38)} ${String(outcomes.length).padStart(4)} çıktı`)
  }
  for (const ders of Object.keys(curriculum)) {
    const uniq = new Map()
    for (const o of curriculum[ders]) if (!uniq.has(o.kod)) uniq.set(o.kod, o)
    curriculum[ders] = [...uniq.values()].sort(
      (a, b) =>
        a.sinif - b.sinif || a.unite - b.unite || (a.konu ?? 0) - (b.konu ?? 0) || a.no - b.no
    )
  }
  writeCurriculum(curriculum)
}

async function main() {
  if (process.argv.includes("--cache")) {
    console.log("\n## cache'ten üretiliyor (siteye bağlanılmıyor)...")
    cachedenUret()
    return
  }
  const curriculum = {} // dersAdi -> outcomes[]

  for (const level of levels) {
    console.log(`\n## ${level} index taranıyor...`)
    const indexHtml = await fetchText(`${BASE}/ogretim-programlari/${level}`)
    let dersPaths = [
      ...new Set(
        [...indexHtml.matchAll(/href="(\/ogretim-programlari\/ders\/[^"]+)"/g)].map(
          (m) => m[1]
        )
      ),
    ]
    // Temel eğitimde niş dersleri (müzik okulları, spor varyantları) ele
    if (level === "temel-egitim") {
      dersPaths = dersPaths.filter((p) =>
        TEMEL_EGITIM_ALLOWLIST.some((a) => p.includes(a))
      )
    }
    console.log(`  ${dersPaths.length} ders sayfası işlenecek`)

    for (const path of dersPaths) {
      const slug = path.split("/").pop()
      const ders = dersAdi(slug)
      try {
        const html = await fetchText(BASE + path)
        const pdfPaths = [
          ...new Set(
            // Site 2026 yazında program PDF'lerini /upload/program/ altından
            // /assets/pdf/ altına taşıdı; iki yolu da tanı.
            [...html.matchAll(/href="((?:\/upload\/program|\/assets\/pdf)\/[^"]+\.pdf)"/g)].map(
              (m) => m[1]
            )
          ),
        ]
        if (pdfPaths.length === 0) {
          console.log(`  - ${ders}: PDF yok, atlandı`)
          continue
        }

        const all = []
        for (const pdfPath of pdfPaths) {
          const name = pdfPath.split("/").pop()
          const pdf = join(CACHE, name)
          const txt = pdf.replace(/\.pdf$/i, ".txt")
          await download(BASE + pdfPath, pdf)
          all.push(...parseOutcomes(pdfToText(pdf, txt)))
        }

        // farklı PDF'lerden gelen kopya kodları temizle
        const uniq = new Map()
        for (const o of all) if (!uniq.has(o.kod)) uniq.set(o.kod, o)
        const outcomes = [...uniq.values()].sort(
          (a, b) => a.sinif - b.sinif || a.unite - b.unite || a.no - b.no
        )

        if (outcomes.length > 0) {
          curriculum[ders] = (curriculum[ders] || []).concat(outcomes)
          console.log(`  ✓ ${ders}: ${outcomes.length} öğrenme çıktısı`)
        } else {
          console.log(`  - ${ders}: çıktı ayrıştırılamadı`)
        }
      } catch (e) {
        console.log(`  ! ${ders}: ${e.message}`)
      }
    }
  }

  writeCurriculum(curriculum)
}

// tymm.meb.gov.tr'nin WEB sayfaları Fen kodlarını konu seviyesi olmadan,
// ünite içinde düz sırayla yazıyor: PDF'teki FB.7.1.2.1 → web'de FB.7.1.4.
// İki gösterim de resmî olarak dolaşımda (MEB çerçeve yıllık planı PDF
// biçimini, site düz biçimi kullanıyor), bu yüzden ikisini de tutuyoruz.
// Eşleme: aynı sınıf+ünite içinde (konu, no) sırasına göre 1'den say.
function duzKodEkle(liste) {
  const gruplar = new Map()
  for (const o of liste) {
    if (o.konu == null) continue
    const anahtar = `${o.sinif}.${o.unite}`
    if (!gruplar.has(anahtar)) gruplar.set(anahtar, [])
    gruplar.get(anahtar).push(o)
  }
  for (const [, grup] of gruplar) {
    grup.sort((a, b) => a.konu - b.konu || a.no - b.no)
    const onek = grup[0].kod.split(".")[0]
    grup.forEach((o, i) => {
      o.kodDuz = `${onek}.${o.sinif}.${o.unite}.${i + 1}`
    })
  }
}

function writeCurriculum(curriculum) {
  for (const liste of Object.values(curriculum)) duzKodEkle(liste)
  const dersler = Object.keys(curriculum).sort((a, b) => a.localeCompare(b, "tr"))
  const total = dersler.reduce((n, d) => n + curriculum[d].length, 0)

  let ts = `// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: ${BASE}
// scripts/scrape-curriculum.mjs ile yeniden üretilir.
// Üretim: ${new Date().toISOString().slice(0, 10)} | ${dersler.length} ders, ${total} öğrenme çıktısı

export interface Kazanim {
  kod: string // örn. "TAR.9.1.1" → DERS.SINIF.ÜNİTE.ÇIKTI
  // Fen Bilimleri'nde kod beş parçalıdır (DERS.SINIF.ÜNİTE.KONU.ÇIKTI,
  // örn. "FB.7.1.2.1"); bu derste konu ve kodDuz alanları da dolar.
  sinif: number
  unite: number
  konu?: number // yalnız Fen Bilimleri
  no: number
  kodDuz?: string // tymm.meb.gov.tr web sayfalarındaki düz karşılık (FB.7.1.4)
  cikti: string
}

export const CURRICULUM: Record<string, Kazanim[]> = {
`
  for (const ders of dersler) {
    ts += `  ${JSON.stringify(ders)}: [\n`
    for (const o of curriculum[ders]) {
      const konuAlan = o.konu != null ? `konu: ${o.konu}, ` : ""
      const duzAlan = o.kodDuz ? `kodDuz: ${JSON.stringify(o.kodDuz)}, ` : ""
      ts += `    { kod: ${JSON.stringify(o.kod)}, sinif: ${o.sinif}, unite: ${o.unite}, ${konuAlan}no: ${o.no}, ${duzAlan}cikti: ${JSON.stringify(o.cikti)} },\n`
    }
    ts += `  ],\n`
  }
  ts += `}

// Bir ders + sınıf için öğrenme çıktılarını döndürür (prompt'a gömmek için).
export function getKazanimlar(ders: string, sinif?: number): Kazanim[] {
  const list = CURRICULUM[ders] ?? []
  return sinif ? list.filter((k) => k.sinif === sinif) : list
}
`
  mkdirSync(dirname(OUT), { recursive: true })
  writeFileSync(OUT, ts)
  console.log(`\n✅ ${OUT} yazıldı — ${dersler.length} ders, ${total} çıktı`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
