// MEB / Türkiye Yüzyılı Maarif Modeli — SÜREÇ BİLEŞENİ scraper'ı.
//
// scrape-curriculum.mjs öğrenme çıktısının metnini alır ama altındaki
// "a) b) c) ç)" süreç bileşenlerini bilerek atar (cleanCikti). Bu script
// aynı PDF'lerden o bileşenleri çıkarır.
//
// scrape-curriculum.mjs'den iki farkı var:
//   1. Kod regex'i 5 parçalı kodu da tanır. Fen Bilimleri'nde ünite altında
//      ayrıca *konu* seviyesi var (FB.5.1.2.2); 4 parçalı regex bunları
//      FB.5.1.2'ye indirip aynı konunun çıktılarını birbirine eziyordu.
//   2. Çıktının üstündeki "N. Bölüm: ..." başlığını konu adı olarak taşır.
//
// Hiçbir LLM çağrısı yok — tamamen deterministik.
//
// Kullanım:
//   node scripts/scrape-surec-bilesenleri.mjs            # .cache/meb/*.txt kullanır
//   node scripts/scrape-surec-bilesenleri.mjs --out /yol/surec-bilesenleri.mjs
//
// Not: PDF'ler ve .txt karşılıkları .cache/meb/ altında olmalı — önce
// scrape-curriculum.mjs çalıştırılmış olmalı (indirme + pdftotext orada).

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const CACHE = join(ROOT, ".cache", "meb")
const outArg = process.argv.indexOf("--out")
const OUT = outArg > -1 ? process.argv[outArg + 1] : join(ROOT, "lib", "surec-bilesenleri.mjs")

// Cache dosya adı → ders adı. scrape-curriculum.mjs'deki DERS_ADLARI ile
// aynı adları kullanır ki curriculum.ts ile eşleşsin.
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
  "2024programvat4Onayli": "İnsan Hakları, Yurttaşlık ve Demokrasi",
  "beden-egitimi-ve-spor-ogretim-programi": "Beden Eğitimi ve Spor",
  "bilisim-teknolojileri-ve-yazilim-tegm": "Bilişim Teknolojileri ve Yazılım",
  "gorsel-sanatlar-ogretim-programi": "Görsel Sanatlar",
  "gorsel-sanatlar-ogretim-programi-temel-egitim": "Görsel Sanatlar",
  "muzik-dersi-ogretim-programi": "Müzik",
  "muzik-dersi-programi-tegm": "Müzik",
  "teknoloji-tasarim-dersi-ogretim-programi-7-8": "Teknoloji Tasarım",
  "trafik-guvenligi-programi-tegm": "Trafik Güvenliği",
}

// Süreç bileşeni olmayan programlar — zorlamak yerine kapsam dışı bırakılır.
// İlkokul/Ortaokul Türkçe ve Türk Dili ve Edebiyatı, çıktının altına
// "a) b) c)" koymaz; "Öğrenme Çıktısına Yönelik Öğrenme Yaşantısı" paragrafı
// kullanır. İngilizce ise CEFR tabanlı, TYMM kod yapısında değil.
const KAPSAM_DISI = [
  "2024programtur1234Onayli",
  "2024programtur5678Onayli",
  "2024programturh9101112Onayli",
  "ingilizce_9_12_ogretim_programi",
  "ingilizce_hazirlik_9_12_ogretim_programi",
]

// Türk alfabesi sırası — bileşen işaretleri bu harflerle gider (a, b, c, ç, d…)
const TR_HARF = "abcçdefgğhıijklmnoöprsştuüvyz"
const MARKER = new RegExp(`^\\s*([${TR_HARF}])\\)\\s+(.*)$`, "u")

// 4 VEYA 5 parçalı kod. 5. grup opsiyonel: FB.5.1.2.2 ↔ TAR.9.1.1
const CODE = /\b([A-ZÇĞİÖŞÜ]{2,5})\.(\d{1,2})\.(\d{1,2})\.(\d{1,2})(?:\.(\d{1,2}))?\.?\s*(.*)$/
// "1. Bölüm: Gökyüzündeki Komşumuz: Güneş" — satır başında sol sütun etiketi olabilir
const BOLUM = /(?:^|\s)(?:\d+\.\s*)?Bölüm:\s*(.+?)\s*$/
// Bileşen listesini bitiren bölüm başlıkları (iki sütunlu düzende sola düşer)
const KESICI =
  /^\s*(İÇERİK ÇERÇEVESİ|Anahtar Kavramlar|ÖĞRENME\s+KANITLARI|PROGRAMLAR ARASI|Öğrenme-Öğretme|ÖĞRENME-ÖĞRETME|FARKLILAŞTIRMA|Ders Saati|ÜNİTE|TEMA)/

// İki sütunlu düzende sol sütun başlığı, sağ sütunun ilk satırının önüne
// düşüyor: "     VE SÜREÇ BİLEŞENLERİ      a) Müzik dinleme/söyleme ...".
// Bu yüzden satır başına çapalı bileşen işareti tanınmıyordu. Etiketi at.
const solEtiketsiz = (l) =>
  l.replace(/^\s*(?:ÖĞRENME ÇIKTILARI|(?:VE\s+)?SÜREÇ BİLEŞENLER[İI])\s*/u, "    ")

// PDF satır sonu tirelemesini geri al: "araç-\nları" → "araçları"
const deHyphen = (acc, s) =>
  acc.endsWith("-") ? acc.slice(0, -1) + s.trimStart() : (acc ? acc + " " : "") + s.trim()

const temizle = (s) =>
  s
    .replace(/\s*(VE\s+)?SÜREÇ BİLEŞENLER[İI]\s*/g, "")
    .replace(/ÖĞRENME ÇIKTILARI\s*/g, "")
    .replace(/\bBİLEŞENLER[İI]\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    // Satır sonunda bölünen fiil, tire düşünce boşlukla yapışık kalıyor
    .replace(/([a-zçğıöşü][ae])\s+(bilme(?:si)?)\b/gu, "$1$2")

function parse(text) {
  const lines = text.split(/\r?\n/)
  const out = []
  let bolum = null

  for (let i = 0; i < lines.length; i++) {
    const bm = lines[i].match(BOLUM)
    if (bm) {
      bolum = bm[1].replace(/\s+/g, " ").trim()
      continue
    }

    const m = lines[i].match(CODE)
    if (!m) continue
    const [, pre, sinif, a, b, c, rest] = m
    const kod = c ? `${pre}.${sinif}.${a}.${b}.${c}` : `${pre}.${sinif}.${a}.${b}`

    // Çıktı metni: kod satırından ilk "a)" işaretine kadar
    let cikti = rest.trim()
    if (MARKER.test(cikti)) continue // "a) TDE1.1.1 ..." gibi ters düzen — bu script kapsamı dışı
    let j = i + 1
    for (; j < lines.length; j++) {
      const l = solEtiketsiz(lines[j])
      if (!l.trim() || MARKER.test(l) || CODE.test(l) || BOLUM.test(l) || KESICI.test(l)) break
      // Kesir/üs gösterimi tek karakterlik satır olarak düşüyor ("1/x"in paydası);
      // birleştirilirse "fonksiyox" gibi bozuk kelimeler oluşuyor.
      if (l.trim().length <= 1) continue
      cikti = deHyphen(cikti, l)
    }
    cikti = temizle(cikti)
    // Bazı programlar (ör. Hayat Bilgisi) süreç bileşenini a) b) c) ile
    // işaretlemez, çıktının hemen ardına tek bir cümle olarak yazar. Çıktı
    // "-abilme" ile bittikten sonra büyük harfle başlayan kısım bileşendir.
    let etiketsiz = null
    const kesim = cikti.match(/^(.*?(?:abilme|ebilme))\s+([A-ZÇĞİÖŞÜ][\s\S]*)$/u)
    if (kesim) {
      cikti = kesim[1]
      etiketsiz = kesim[2].trim()
    }
    // Kanonik öğrenme çıktısı "-abilme/-ebilme" ile biter. Aynı kod PDF'de
    // özet tabloda ve uygulama notunda da geçer; bu filtre onları eler.
    if (!/(abilme|ebilme)\.?$/i.test(cikti)) continue

    // Süreç bileşenleri
    const bilesenler = []
    let cur = null
    for (; j < lines.length; j++) {
      const l = solEtiketsiz(lines[j])
      if (CODE.test(l) || BOLUM.test(l) || KESICI.test(l)) break
      const mk = l.match(MARKER)
      if (mk) {
        if (cur) bilesenler.push(cur)
        cur = { harf: mk[1], metin: mk[2].trim() }
      } else if (cur && l.trim()) {
        cur.metin = deHyphen(cur.metin, l)
      } else if (!l.trim() && bilesenler.length && !cur) break
    }
    if (cur) bilesenler.push(cur)
    // İşaretli bileşen yoksa ama etiketsiz cümle yakalandıysa onu kullan.
    if (!bilesenler.length && etiketsiz && etiketsiz.length > 15) {
      bilesenler.push({ harf: "-", metin: etiketsiz })
    }

    if (bilesenler.length) {
      for (const bs of bilesenler) bs.metin = temizle(bs.metin)
      out.push({ kod, sinif: Number(sinif), bolum, cikti, bilesenler })
    }
    i = j - 1
  }

  // Aynı kod PDF'de birden çok yerde geçebilir; en çok bileşenli olanı tut.
  const best = new Map()
  for (const o of out) {
    const p = best.get(o.kod)
    if (!p || o.bilesenler.length > p.bilesenler.length) best.set(o.kod, o)
  }
  return [...best.values()]
}

function main() {
  if (!existsSync(CACHE)) {
    console.error(`Cache yok: ${CACHE}\nÖnce scrape-curriculum.mjs çalıştırın.`)
    process.exit(1)
  }

  const veri = {} // ders -> kayıt[]
  const atlanan = []

  for (const file of readdirSync(CACHE).filter((f) => f.endsWith(".txt")).sort()) {
    const base = file.replace(/\.txt$/, "")
    if (KAPSAM_DISI.includes(base)) {
      atlanan.push(base)
      continue
    }
    const ders = DOSYA_DERS[base]
    if (!ders) {
      console.log(`  ? ${base}: ders adı eşlenmedi, atlandı`)
      continue
    }
    const kayitlar = parse(readFileSync(join(CACHE, file), "utf8"))
    if (kayitlar.length === 0) {
      console.log(`  - ${ders} (${base}): bileşen bulunamadı`)
      continue
    }
    veri[ders] = (veri[ders] || []).concat(kayitlar)
    console.log(`  ✓ ${ders.padEnd(38)} ${String(kayitlar.length).padStart(4)} çıktı`)
  }

  // Aynı ders birden çok PDF'ten gelebilir (ör. Görsel Sanatlar) — kodu tekille
  for (const ders of Object.keys(veri)) {
    const uniq = new Map()
    for (const k of veri[ders]) if (!uniq.has(k.kod)) uniq.set(k.kod, k)
    veri[ders] = [...uniq.values()].sort(
      (x, y) => x.sinif - y.sinif || x.kod.localeCompare(y.kod, "tr")
    )
  }

  write(veri, atlanan)
}

// tymm.meb.gov.tr web sayfaları Fen kodlarını konu seviyesi olmadan, ünite
// içinde düz sayar: PDF'teki FB.7.1.2.1 → sitede FB.7.1.4. curriculum.ts ile
// aynı eşlemeyi burada da üret ki iki dosya aynı kodları taşısın.
function duzKodEkle(liste) {
  const gruplar = new Map()
  for (const o of liste) {
    const parca = o.kod.split(".")
    if (parca.length !== 5) continue
    o.unite = Number(parca[2])
    o.konu = Number(parca[3])
    o.no = Number(parca[4])
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

function write(veri, atlanan) {
  for (const liste of Object.values(veri)) duzKodEkle(liste)
  const dersler = Object.keys(veri).sort((a, b) => a.localeCompare(b, "tr"))
  const toplam = dersler.reduce((n, d) => n + veri[d].length, 0)
  const bilesenSayisi = dersler.reduce(
    (n, d) => n + veri[d].reduce((m, k) => m + k.bilesenler.length, 0),
    0
  )

  let js = `// OTOMATİK ÜRETİLDİ — elle düzenleme.
// scripts/scrape-surec-bilesenleri.mjs ile yeniden üretilir.
// Kaynak: https://tymm.meb.gov.tr öğretim programı PDF'leri
// Üretim: ${new Date().toISOString().slice(0, 10)} | ${dersler.length} ders, ${toplam} öğrenme çıktısı, ${bilesenSayisi} süreç bileşeni
//
// Öğrenme çıktısının altındaki "a) b) c) ç)" süreç bileşenleri. Yıllık planın
// SÜREÇ BİLEŞENLERİ sütunu ve ders planındaki gözlenebilir adımlar için.
//
// KOD FORMATI: curriculum.ts'ten farklı olabilir. Burada kodlar programdaki
// hâliyle, Fen Bilimleri'nde beş parçalı (FB.5.1.2.2). curriculum.ts dört
// parçalı derlediği için Fen'de çıktı kaybı var — Fen için BU dosya doğrudur.
//
// KAPSAM DIŞI: İlkokul/Ortaokul Türkçe ve Türk Dili ve Edebiyatı programları
// çıktının altına süreç bileşeni koymuyor ("Öğrenme Yaşantısı" paragrafı
// kullanıyorlar); İngilizce CEFR tabanlı farklı bir yapıda. Atlanan dosyalar:
${atlanan.map((a) => `//   - ${a}`).join("\n")}

export const SUREC_BILESENLERI = {
`
  for (const ders of dersler) {
    js += `  ${JSON.stringify(ders)}: [\n`
    for (const k of veri[ders]) {
      const bs = k.bilesenler
        .map((b) => `{ harf: ${JSON.stringify(b.harf)}, metin: ${JSON.stringify(b.metin)} }`)
        .join(", ")
      const duz = k.kodDuz ? `kodDuz: ${JSON.stringify(k.kodDuz)}, ` : ""
      js += `    { kod: ${JSON.stringify(k.kod)}, sinif: ${k.sinif}, ${duz}bolum: ${JSON.stringify(k.bolum)}, cikti: ${JSON.stringify(k.cikti)}, bilesenler: [${bs}] },\n`
    }
    js += `  ],\n`
  }
  js += `}

// Bir öğrenme çıktısı kodunun süreç bileşenlerini döndürür.
export function getBilesenler(kod) {
  for (const liste of Object.values(SUREC_BILESENLERI)) {
    const bulunan = liste.find((k) => k.kod === kod || k.kodDuz === kod)
    if (bulunan) return bulunan
  }
  return null
}
`
  writeFileSync(OUT, js)
  console.log(
    `\n✅ ${OUT}\n   ${dersler.length} ders, ${toplam} öğrenme çıktısı, ${bilesenSayisi} süreç bileşeni`
  )
}

// Doğrudan çalıştırıldığında üretim yapar; içeri aktarıldığında yalnızca
// fonksiyonları verir.
const dogrudanCalisiyor =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href

if (dogrudanCalisiyor) main()

export { parse as parseBilesenler, duzKodEkle as duzKodEkleBilesen, KAPSAM_DISI }
