// TYMM veri dosyalarını TEK geçişte üretir.
//
// Neden: curriculum.ts ve surec-bilesenleri.mjs ayrı ayrı, farklı zamanlarda
// üretiliyordu. Biri düzeltilip diğeri unutulunca iki dosya birbirinden
// kayıyordu — kod şeması, kayıp kayıtlar ve kodDuz alanı hep bu yüzden
// tutarsız kaldı. Artık her iki dosya aynı çalıştırmada, aynı PDF metninden
// üretiliyor ve aralarındaki tutarlılık yazmadan önce denetleniyor.
//
// Kullanım:
//   node scripts/build-tymm-data.mjs                      # lib/ altına yazar
//   node scripts/build-tymm-data.mjs --out-dir /yol/references
//
// Üretilenler:
//   curriculum.ts           öğrenme çıktıları (kod, sinif, unite, konu, no, kodDuz, cikti)
//   surec-bilesenleri.mjs   süreç bileşenleri (a/b/c/ç), aynı kodlarla
//
// Not: PDF'ler .cache/meb altında olmalı. Yoksa önce
// `node scripts/scrape-curriculum.mjs ortaogretim temel-egitim` çalıştırın.

import { readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs"
import { join, dirname } from "node:path"
import { fileURLToPath } from "node:url"

import {
  parseOutcomes,
  duzKodEkle,
  pdfToText,
  DOSYA_DERS,
  CACHE,
} from "./scrape-curriculum.mjs"
import { parseBilesenler, KAPSAM_DISI } from "./scrape-surec-bilesenleri.mjs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, "..")
const dirArg = process.argv.indexOf("--out-dir")
const OUT_DIR = dirArg > -1 ? process.argv[dirArg + 1] : join(ROOT, "lib")

const BUGUN = new Date().toISOString().slice(0, 10)

// ---------------------------------------------------------------- tek geçiş

function topla() {
  if (!existsSync(CACHE)) {
    console.error(`Cache yok: ${CACHE}\nÖnce scrape-curriculum.mjs çalıştırın.`)
    process.exit(1)
  }

  const kazanimlar = {} // ders -> kayıt[]
  const bilesenler = {} // ders -> kayıt[]
  const atlanan = []

  for (const dosya of readdirSync(CACHE).filter((f) => f.endsWith(".pdf")).sort()) {
    const base = dosya.replace(/\.pdf$/i, "")
    const ders = DOSYA_DERS[base]
    if (!ders) {
      console.log(`  ? ${base}: ders adı eşlenmedi, atlandı`)
      continue
    }

    // PDF metni bir kez üretilir, iki ayrıştırıcı da aynı metni görür.
    const metin = pdfToText(join(CACHE, dosya), join(CACHE, base + ".txt"))

    const k = parseOutcomes(metin)
    if (k.length) kazanimlar[ders] = (kazanimlar[ders] || []).concat(k)

    if (KAPSAM_DISI.includes(base)) {
      atlanan.push(base)
    } else {
      const b = parseBilesenler(metin)
      if (b.length) bilesenler[ders] = (bilesenler[ders] || []).concat(b)
    }

    console.log(
      `  ✓ ${ders.padEnd(38)} ${String(k.length).padStart(4)} çıktı` +
        (KAPSAM_DISI.includes(base) ? "  (bileşen kapsam dışı)" : "")
    )
  }

  // Aynı ders birden çok PDF'ten gelebilir; kodu tekille ve sırala.
  const sirala = (a, b) =>
    a.sinif - b.sinif || a.unite - b.unite || (a.konu ?? 0) - (b.konu ?? 0) || a.no - b.no

  for (const grup of [kazanimlar, bilesenler]) {
    for (const ders of Object.keys(grup)) {
      const uniq = new Map()
      for (const o of grup[ders]) {
        const varolan = uniq.get(o.kod)
        // Bileşen tarafında aynı kod birden çok kez çıkarsa en zengini kalsın.
        if (!varolan || (o.bilesenler?.length ?? 0) > (varolan.bilesenler?.length ?? 0)) {
          uniq.set(o.kod, o)
        }
      }
      grup[ders] = [...uniq.values()]
    }
  }

  // Düz kod (web sitesi biçimi) İKİ tarafta da aynı fonksiyonla üretilir.
  for (const liste of Object.values(kazanimlar)) duzKodEkle(liste)
  for (const [ders, liste] of Object.entries(bilesenler)) {
    const duzHarita = new Map()
    for (const k of kazanimlar[ders] ?? []) if (k.kodDuz) duzHarita.set(k.kod, k.kodDuz)
    for (const b of liste) {
      const d = duzHarita.get(b.kod)
      if (d) b.kodDuz = d
    }
  }

  // İki ayrıştırıcı aynı çıktı için farklı metin bulabiliyor: biri sütun
  // başlığını içeri alıyor ("...katkıları ve becerilerin süreç bileşenlerini
  // yorumlayabilme"), diğeri satır sonunda kelimeyi bölüyor ("faali yetlere").
  // Her iki hata da metni UZATIYOR; kanonik çıktı ikisinin kısa olanıdır.
  // Seçilen metin İKİ dosyaya birden yazılır, böylece kayma imkânsız olur.
  let uzlastirilan = 0
  const kazHarita = new Map()
  for (const l of Object.values(kazanimlar)) for (const k of l) kazHarita.set(k.kod, k)
  for (const liste of Object.values(bilesenler)) {
    for (const b of liste) {
      const k = kazHarita.get(b.kod)
      if (!k || k.cikti === b.cikti) continue
      const kisa = b.cikti.length < k.cikti.length ? b.cikti : k.cikti
      k.cikti = kisa
      b.cikti = kisa
      uzlastirilan++
    }
  }
  if (uzlastirilan) console.log(`\n   ${uzlastirilan} çıktı metni uzlaştırıldı (kısa olan seçildi)`)

  for (const grup of [kazanimlar, bilesenler])
    for (const ders of Object.keys(grup)) grup[ders].sort(sirala)

  return { kazanimlar, bilesenler, atlanan }
}

// ------------------------------------------------------------- tutarlılık

function denetle(kazanimlar, bilesenler) {
  const kazKod = new Map()
  for (const [d, l] of Object.entries(kazanimlar)) for (const k of l) kazKod.set(k.kod, { d, ...k })

  const sorunlar = []
  let bilesenSayisi = 0

  for (const [ders, liste] of Object.entries(bilesenler)) {
    for (const b of liste) {
      bilesenSayisi++
      const k = kazKod.get(b.kod)
      if (!k) {
        sorunlar.push(`${b.kod} (${ders}): bileşen var ama kazanım listesinde yok`)
        continue
      }
      if (k.d !== ders) sorunlar.push(`${b.kod}: ders adı uyuşmuyor (${k.d} ≠ ${ders})`)
      if ((k.kodDuz ?? null) !== (b.kodDuz ?? null))
        sorunlar.push(`${b.kod}: kodDuz uyuşmuyor (${k.kodDuz} ≠ ${b.kodDuz})`)
      if (k.cikti !== b.cikti)
        sorunlar.push(
          `${b.kod}: çıktı metni uyuşmuyor\n      kazanım: ${k.cikti.slice(0, 70)}\n      bileşen: ${b.cikti.slice(0, 70)}`
        )
    }
  }

  const toplamKazanim = [...kazKod.keys()].length
  console.log(`\n## tutarlılık denetimi`)
  console.log(`   kazanım: ${toplamKazanim} | bileşenli çıktı: ${bilesenSayisi}`)
  if (sorunlar.length) {
    console.error(`   ✗ ${sorunlar.length} tutarsızlık:`)
    sorunlar.slice(0, 20).forEach((x) => console.error("     - " + x))
    process.exit(1)
  }
  console.log(`   ✓ iki dosya tutarlı (kod, ders, kodDuz ve çıktı metni birebir)`)
  return { toplamKazanim, bilesenSayisi }
}

// ------------------------------------------------------------------ yazım

function yazCurriculum(kazanimlar, ozet) {
  const dersler = Object.keys(kazanimlar).sort((a, b) => a.localeCompare(b, "tr"))
  let ts = `// OTOMATİK ÜRETİLDİ — elle düzenlemeyin.
// scripts/build-tymm-data.mjs ile surec-bilesenleri.mjs ile BİRLİKTE üretilir;
// iki dosyanın kodları, ders adları ve çıktı metinleri yazmadan önce
// karşılaştırılır. Kaynak: https://tymm.meb.gov.tr öğretim programı PDF'leri.
// Üretim: ${BUGUN} | ${dersler.length} ders, ${ozet.toplamKazanim} öğrenme çıktısı
//
// FEN BİLİMLERİ — İKİ KOD ŞEMASI
//   Fen'de ünite altında ayrıca KONU seviyesi var. Öğretim programı PDF'i ve
//   MEB çerçeve yıllık planı beş parçalı kod kullanır (FB.7.1.2.1);
//   tymm.meb.gov.tr ünite sayfaları konu seviyesini kaldırıp ünite içinde düz
//   sayar (aynı çıktı orada FB.7.1.4). İkisi de tutuluyor: kod + kodDuz.
//
// TÜRKÇE — DÖRT ÖĞRENME ALANI
//   T.D Dinleme/İzleme (unite 1) · T.O Okuma (2) · T.K Konuşma (3) · T.Y Yazma (4)
//
// BİLİNEN AÇIK SORUNLAR
//   - TG.4.1.2: kaynak sayfada sütunlar iç içe geçmiş, metin paramparça.
//   - İngilizce kapsam dışı (CEFR tabanlı farklı yapı).
//   - Türk Dili ve Edebiyatı verisi 2024 tarihli programdan; MEB 19.08.2026
//     tarihli revize bir program yayımladı, henüz işlenmedi.

export interface Kazanim {
  kod: string // "TAR.9.1.1" → DERS.SINIF.ÜNİTE.ÇIKTI (Fen'de beş parçalı)
  sinif: number
  unite: number
  konu?: number // yalnız Fen Bilimleri
  no: number
  kodDuz?: string // tymm.meb.gov.tr web biçimi (yalnız Fen)
  cikti: string
}

export const CURRICULUM: Record<string, Kazanim[]> = {
`
  for (const ders of dersler) {
    ts += `  ${JSON.stringify(ders)}: [\n`
    for (const o of kazanimlar[ders]) {
      const konu = o.konu != null ? `konu: ${o.konu}, ` : ""
      const duz = o.kodDuz ? `kodDuz: ${JSON.stringify(o.kodDuz)}, ` : ""
      ts += `    { kod: ${JSON.stringify(o.kod)}, sinif: ${o.sinif}, unite: ${o.unite}, ${konu}no: ${o.no}, ${duz}cikti: ${JSON.stringify(o.cikti)} },\n`
    }
    ts += `  ],\n`
  }
  ts += `}

// Bir ders + sınıf için öğrenme çıktılarını döndürür.
export function getKazanimlar(ders: string, sinif?: number): Kazanim[] {
  const list = CURRICULUM[ders] ?? []
  return sinif ? list.filter((k) => k.sinif === sinif) : list
}
`
  writeFileSync(join(OUT_DIR, "curriculum.ts"), ts)
}

function yazBilesenler(bilesenler, atlanan, ozet) {
  const dersler = Object.keys(bilesenler).sort((a, b) => a.localeCompare(b, "tr"))
  const toplamBilesen = dersler.reduce(
    (n, d) => n + bilesenler[d].reduce((m, k) => m + k.bilesenler.length, 0),
    0
  )
  let js = `// OTOMATİK ÜRETİLDİ — elle düzenlemeyin.
// scripts/build-tymm-data.mjs ile curriculum.ts ile BİRLİKTE üretilir.
// Üretim: ${BUGUN} | ${dersler.length} ders, ${ozet.bilesenSayisi} öğrenme çıktısı, ${toplamBilesen} süreç bileşeni
//
// Öğrenme çıktısının altındaki "a) b) c) ç)" süreç bileşenleri. Yıllık planın
// SÜREÇ BİLEŞENLERİ sütunu ve ders planındaki gözlenebilir adımlar için.
// Kodlar curriculum.ts ile birebir aynıdır (üretimde denetleniyor).
//
// Bazı programlar (ör. Hayat Bilgisi) bileşeni harfle işaretlemez, çıktının
// ardına tek cümle yazar; o kayıtlar harf: "-" ile gelir.
//
// KAPSAM DIŞI: İlkokul/Ortaokul Türkçe ve Türk Dili ve Edebiyatı süreç bileşeni
// yapısı kullanmaz ("Öğrenme Yaşantısı" paragrafı); İngilizce CEFR tabanlıdır.
${atlanan.map((a) => `//   - ${a}`).join("\n")}

export const SUREC_BILESENLERI = {
`
  for (const ders of dersler) {
    js += `  ${JSON.stringify(ders)}: [\n`
    for (const k of bilesenler[ders]) {
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
// Fen'de hem beş parçalı kod hem web sitesindeki düz kod kabul edilir.
export function getBilesenler(kod) {
  for (const liste of Object.values(SUREC_BILESENLERI)) {
    const bulunan = liste.find((k) => k.kod === kod || k.kodDuz === kod)
    if (bulunan) return bulunan
  }
  return null
}
`
  writeFileSync(join(OUT_DIR, "surec-bilesenleri.mjs"), js)
  return toplamBilesen
}

// ------------------------------------------------------------------- main

console.log("## cache'ten tek geçişte üretiliyor...\n")
const { kazanimlar, bilesenler, atlanan } = topla()
const ozet = denetle(kazanimlar, bilesenler)
mkdirSync(OUT_DIR, { recursive: true })
yazCurriculum(kazanimlar, ozet)
const toplamBilesen = yazBilesenler(bilesenler, atlanan, ozet)
console.log(`\n✅ ${OUT_DIR}`)
console.log(`   curriculum.ts          ${ozet.toplamKazanim} öğrenme çıktısı`)
console.log(`   surec-bilesenleri.mjs  ${ozet.bilesenSayisi} çıktı, ${toplamBilesen} süreç bileşeni`)
