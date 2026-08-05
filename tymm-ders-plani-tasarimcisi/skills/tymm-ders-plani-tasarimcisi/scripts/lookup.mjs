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
// Ders/kategori adı verilenle birebir eşleşmezse (yazım farkı, boşluk vb.)
// en yakın 3 adayı önerir — sessizce boş dönmez.

import { CURRICULUM, SKILLS, getKazanimlar, getBeceriler } from "../references/data.mjs"

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
} else {
  console.error("Komutlar: dersler | kategoriler | kazanim <ders> [sinif] | beceri <kategori>")
  process.exit(1)
}
