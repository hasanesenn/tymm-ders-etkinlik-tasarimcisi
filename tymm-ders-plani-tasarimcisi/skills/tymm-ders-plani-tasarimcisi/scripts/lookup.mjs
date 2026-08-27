// Skill'in kendi TYMM veri kaynağını (references/data.mjs) sorgulamak için
// kullanılan küçük CLI. Amaç: tüm curriculum.ts + skills.ts'i (270KB+)
// context'e dökmek yerine, sadece ihtiyaç duyulan dilimi döndürmek.
//
// Kullanım:
//   node scripts/lookup.mjs dersler
//     → curriculum.ts'te kayıtlı tüm ders adlarını listeler
//
//   node scripts/lookup.mjs kazanim "Tarih" 10
//     → "Tarih" dersi, 10. sınıf öğrenme çıktılarını (kod + metin) döndürür
//     → sınıf verilmezse dersin tüm kademelerini döndürür
//
//   node scripts/lookup.mjs beceri "Erdem-Değer-Eylem Çerçevesi"
//     → o kategorideki tüm kod + ad (+ varsa tanım) listesini döndürür
//
//   node scripts/lookup.mjs kategoriler
//     → SKILLS içindeki tüm kategori adlarını listeler
//
//   node scripts/lookup.mjs kod FB.7.1.4
//     → kazanımı kodun HER İKİ biçiminden de bulur (Fen'de PDF kodu
//       FB.7.1.2.1, web sitesindeki düz karşılığı FB.7.1.4) ve süreç
//       bileşenlerini de birlikte döndürür
//
//   node scripts/lookup.mjs bilesen "Fen Bilimleri" 5
//     → o ders + sınıfın öğrenme çıktılarını SÜREÇ BİLEŞENLERİYLE döndürür
//       (yıllık planın SÜREÇ BİLEŞENLERİ sütunu için)
//
//   node scripts/lookup.mjs bilesen FB.5.1.2.2
//     → tek bir öğrenme çıktısının bileşenlerini döndürür
//
// Ders/kategori adı verilenle birebir eşleşmezse (yazım farkı, boşluk vb.)
// en yakın 3 adayı önerir — sessizce boş dönmez.

import { CURRICULUM, SKILLS, getKazanimlar, getBeceriler } from "../references/data.mjs"
import { SUREC_BILESENLERI, getBilesenler } from "../references/surec-bilesenleri.mjs"

const [, , cmd, arg1, arg2] = process.argv

function benzerlik(a, b) {
  a = a.toLocaleLowerCase("tr"); b = b.toLocaleLowerCase("tr")
  if (a === b) return 100
  if (a.includes(b) || b.includes(a)) return 80
  const setA = new Set(a.split(""))
  const setB = new Set(b.split(""))
  const kesisim = [...setA].filter((c) => setB.has(c)).length
  return (kesisim / Math.max(setA.size, setB.size)) * 100
}

function enYakinAdaylar(hedef, adaylar, n = 3) {
  return adaylar
    .map((a) => ({ a, skor: benzerlik(hedef, a) }))
    .sort((x, y) => y.skor - x.skor)
    .slice(0, n)
    .map((x) => x.a)
}

if (cmd === "dersler") {
  console.log(JSON.stringify(Object.keys(CURRICULUM).sort((a, b) => a.localeCompare(b, "tr")), null, 2))
} else if (cmd === "kategoriler") {
  console.log(JSON.stringify(Object.keys(SKILLS), null, 2))
} else if (cmd === "kazanim") {
  if (!arg1) { console.error("Kullanım: kazanim <ders> [sinif]"); process.exit(1) }
  if (!CURRICULUM[arg1]) {
    console.error(`"${arg1}" bulunamadı. Yakın adaylar:`, enYakinAdaylar(arg1, Object.keys(CURRICULUM)))
    process.exit(1)
  }
  const sinif = arg2 ? Number(arg2) : undefined
  const sonuc = getKazanimlar(arg1, sinif)
  if (sonuc.length === 0) {
    console.error(`"${arg1}" için ${sinif ?? "hiçbir"} sınıfta kayıt yok. Mevcut sınıflar:`,
      [...new Set(CURRICULUM[arg1].map((k) => k.sinif))].sort((a, b) => a - b))
    process.exit(1)
  }
  console.log(JSON.stringify(sonuc, null, 2))
} else if (cmd === "beceri") {
  if (!arg1) { console.error("Kullanım: beceri <kategori>"); process.exit(1) }
  if (!SKILLS[arg1]) {
    console.error(`"${arg1}" bulunamadı. Yakın adaylar:`, enYakinAdaylar(arg1, Object.keys(SKILLS)))
    process.exit(1)
  }
  console.log(JSON.stringify(getBeceriler(arg1), null, 2))
} else if (cmd === "kod") {
  // Fen'de iki kod şeması dolaşımda (PDF: FB.7.1.2.1, web sitesi: FB.7.1.4).
  // Hangisi yazılırsa yazılsın kaydı bul ve varsa süreç bileşenlerini de ekle.
  if (!arg1) { console.error("Kullanım: kod <kazanım kodu>"); process.exit(1) }
  let bulunan = null, ders = null
  for (const [d, liste] of Object.entries(CURRICULUM)) {
    const k = liste.find((x) => x.kod === arg1 || x.kodDuz === arg1)
    if (k) { bulunan = k; ders = d; break }
  }
  if (!bulunan) {
    console.error(`"${arg1}" bulunamadı. Fen kodları hem beş parçalı (FB.7.1.2.1) hem düz (FB.7.1.4) biçimde aranır.`)
    process.exit(1)
  }
  const bilesen = getBilesenler(bulunan.kod)
  console.log(JSON.stringify({ ders, ...bulunan, bilesenler: bilesen ? bilesen.bilesenler : null }, null, 2))
} else if (cmd === "bilesen") {
  if (!arg1) { console.error("Kullanım: bilesen <ders> [sinif]  |  bilesen <kod>"); process.exit(1) }
  // Tek kod sorgusu: "FB.5.1.2.2" gibi
  if (/^[A-ZÇĞİÖŞÜ]{2,5}\.\d/.test(arg1)) {
    const k = getBilesenler(arg1)
    if (!k) {
      console.error(`"${arg1}" için süreç bileşeni yok. Kod doğru mu? Fen kodları beş parçalıdır (FB.5.1.2.2).`)
      process.exit(1)
    }
    console.log(JSON.stringify(k, null, 2))
  } else {
    if (!SUREC_BILESENLERI[arg1]) {
      console.error(`"${arg1}" bulunamadı. Yakın adaylar:`, enYakinAdaylar(arg1, Object.keys(SUREC_BILESENLERI)))
      console.error("Not: Türkçe, Türk Dili ve Edebiyatı ve İngilizce programlarında süreç bileşeni yok.")
      process.exit(1)
    }
    const sinif = arg2 ? Number(arg2) : undefined
    const sonuc = sinif
      ? SUREC_BILESENLERI[arg1].filter((k) => k.sinif === sinif)
      : SUREC_BILESENLERI[arg1]
    if (sonuc.length === 0) {
      console.error(`"${arg1}" için ${sinif}. sınıfta kayıt yok. Mevcut sınıflar:`,
        [...new Set(SUREC_BILESENLERI[arg1].map((k) => k.sinif))].sort((a, b) => a - b))
      process.exit(1)
    }
    console.log(JSON.stringify(sonuc, null, 2))
  }
} else {
  console.error("Komutlar: dersler | kategoriler | kazanim <ders> [sinif] | kod <kazanım kodu> | beceri <kategori> | bilesen <ders> [sinif] | bilesen <kod>")
  process.exit(1)
}
