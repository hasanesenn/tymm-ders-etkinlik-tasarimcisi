---
name: tymm-ders-plani-tasarimcisi
description: Türkiye Yüzyılı Maarif Modeli (TYMM) kazanımlarına dayalı iki tür plan üretir — (1) aktif öğrenme yaklaşımları (yaşantısal, bağlamsal, sorgulamaya dayalı, iş birlikli, proje temelli) ve farklılaştırma stratejileri içeren ders/etkinlik planı, (2) MEB taslak çerçeve yıllık plan biçiminde ünitelendirilmiş yıllık plan (öğrenme çıktıları, süreç bileşenleri, öğrenme kanıtları, programlar arası bileşenler, farklılaştırma, okul temelli planlama sütunlarıyla). Bir öğretmen ders planı, etkinlik tasarımı, farklılaştırılmış öğrenme materyali, ünitelendirilmiş yıllık plan, çerçeve yıllık plan uyarlaması veya TYMM'e uygun bir öğrenme deneyimi istediğinde kullan.
license: Proprietary — TeacherX
metadata:
  author: Hasan Esen / TeacherX
  version: "1.5.0"
  language: tr
  domain: egitim, mufredat-tasarimi, farklilastirma
---

# TYMM Ders / Etkinlik Planı Tasarımcısı

## İki mod

Öğretmenin isteğine göre iki farklı çıktı üretilir. Önce hangisinin istendiğini belirle:

| İstek | Mod | Nereye bak |
|---|---|---|
| "Şu kazanım için ders planı", "bu konuyu nasıl işlerim", "etkinlik tasarla", "farklılaştırma önerisi" | **Mod 1 — Ders/etkinlik planı** | Bu dosyanın devamı |
| "Yıllık plan", "ünitelendirilmiş yıllık plan", "çerçeve plan", "yıla yayılmış plan", "zümre planı" | **Mod 2 — Çerçeve yıllık plan** | `references/yillik-plan-formati.md` — okumadan yıllık plan üretme |

İkisi farklı belgelerdir: Mod 1 tek bir dersin/etkinliğin nasıl işleneceğini anlatır,
Mod 2 tüm öğretim yılını haftalara bölen bir tablodur. Terminolojileri de farklıdır —
en belirgin fark farklılaştırmanın yazılışı (Mod 1: içerik/süreç/ürün/öğrenme ortamı
tablosu; Mod 2: Zenginleştirme/Destekleme blokları). Öğretmen "plan" deyip hangisini
kastettiğini belli etmiyorsa sor.

## Zemin: Türkiye Yüzyılı Maarif Modeli'nin temel çerçevesi

Bu bilgi, tymm.meb.gov.tr'de yayımlanan Genel Bakış / Süreç sayfalarına ve 2024
Öğretim Programları Ortak Metni'ne dayanır. Her plan üretiminde bu çerçeveyle
tutarlı kal:

- **Model beceri temelli, kazanım-merkezli değil.** TYMM'de kazanımlar; bilgi, beceri,
  eğilim ve değerlerin bir arada geliştirilmesi için birer araçtır, tek başına hedef
  değildir. Plan, sadece "kazanımı verdim" değil, öğrencinin ne yapabilir hale geldiğini
  göstermeli.
- **Öğrenci Profili** — TYMM, öğrenciyi 10 temel özellikle tanımlar; yetkinlik ve erdem
  merkezdedir, bilgi/beceri/eğilim/değer birlikte ele alınır.
- **Erdem-Değer-Eylem Çerçevesi** — 20 temel değer üzerine kurulu (ör. adalet, hikmet,
  merhamet, doğruluk, çalışkanlık, faydalı olmak, güzellik). Değerler ayrı bir "ahlak
  dersi" değil, ders içeriğine ve eylemine gömülü olmalı.
- **Beceriler Çerçevesi** — Kavramsal Beceriler ve Alan Becerileri öğrenme çıktılarında
  kullanılır; Sosyal-Duygusal Öğrenme Becerileri ve Okuryazarlık Becerileri programlar
  arası bileşenlerdir; Eğilimler (merak, eleştirel düşünme, esneklik, iş birliği,
  problem çözme vb.) tüm becerilerin tetikleyicisi sayılır.
- **Süreç ilkesi — aktif öğrenci.** Model açıkça "öğrencinin aktif ve çevresiyle
  etkileşim içinde olduğu, öğrenme sorumluluğunu aldığı" bir süreç tanımlar ve şu beş
  yaklaşımı öne çıkarır: **yaşantısal öğrenme, bağlamsal öğrenme, sorgulamaya dayalı
  öğrenme, iş birlikli öğrenme, proje temelli öğrenme.**
- **Farklılaştırma açıkça modelin bir parçası.** TYMM dokümanları bireysel farklılıkları
  (yetenek, ilgi, ihtiyaç) gözeten farklılaştırılmış öğrenmeyi doğrudan hedefler.
- **Disiplinler arası/üstü/ötesi yaklaşım** teşvik edilir — mümkünse etkinlik başka bir
  dersle/gerçek hayat bağlamıyla ilişkilendirilsin.

## Veri kaynağı — önce buna bak, sonra öğretmene sor

Bu skill'in yanında gerçek, deterministik olarak tymm.meb.gov.tr'den derlenmiş bir
veri kaynağı var (ezbere/halüsinasyon değil):

- `references/curriculum.ts` (+ çalıştırılabilir hâli `references/data.mjs`) — 24 ders,
  2223 öğrenme çıktısı, kod + sınıf + ünite + metin
- `references/skills.ts` (+ `data.mjs`) — Erdem-Değer-Eylem Çerçevesi (20 değer),
  Kavramsal Beceriler, Eğilimler, Sosyal-Duygusal Öğrenme Becerileri, Okuryazarlık
  Becerileri (kod + ad + varsa tanım)
- `references/surec-bilesenleri.mjs` — 21 ders, 1590 öğrenme çıktısı, 5385 **süreç
  bileşeni** (`a) b) c) ç)`), her çıktının konu/bölüm adıyla. Öğretim programı
  PDF'lerinden derlendi.
- `scripts/lookup.mjs` — tüm dosyayı context'e dökmeden ilgili dilimi sorgulamak için:
  ```
  node scripts/lookup.mjs dersler                    # kayıtlı ders adları
  node scripts/lookup.mjs kazanim "Tarih" 10          # ders + sınıf öğrenme çıktıları
  node scripts/lookup.mjs kategoriler                 # beceri/değer kategorileri
  node scripts/lookup.mjs beceri "Eğilimler"           # bir kategorinin tam listesi
  node scripts/lookup.mjs kod FB.7.1.4                # kodun iki biçiminden de bul
  node scripts/lookup.mjs bilesen "Fen Bilimleri" 5   # çıktı + süreç bileşenleri
  node scripts/lookup.mjs bilesen FB.5.1.2.2          # tek çıktının bileşenleri
  ```

  Ders veya kategori adı birebir eşleşmezse script sessizce boş dönmez, en yakın 3
  adayı önerir — o önerilerden doğru olanı seç, uydurma.

**Fen Bilimleri'nde iki kod şeması var, ikisi de resmî.** Öğretim programı
PDF'i ve MEB çerçeve yıllık planı beş parçalı kod kullanır (`FB.7.1.2.1`);
tymm.meb.gov.tr'nin ünite sayfaları konu seviyesini kaldırıp ünite içinde düz
sayar (aynı çıktı orada `FB.7.1.4`). Veride ikisi de var: `kod` beş parçalı,
`kodDuz` düz karşılık. **Yıllık plan ve resmî belgelerde `kod`'u kullan**,
öğretmen siteden baktığı için farklı bir kod söylüyorsa `lookup.mjs kod` ile
ikisinden de bulabilirsin ve çıktıda ikisini birden belirt.

**Sıra şu şekilde işlesin:**
1. Öğretmen kazanımı zaten metin/kod olarak verdiyse, aynen onu kullan.
2. Vermediyse, `lookup.mjs kazanim` ile önce veri kaynağına bak. Ders/sınıf orada
   varsa, gerçek kazanım(lar)ı listele ve öğretmene hangisini/hangilerini
   kullanmak istediğini sor ya da en uygun olanı seçip belirt.
3. Çıktının gözlenebilir adımları gerekiyorsa (ders planında öğrenme hedefleri,
   yıllık planda süreç bileşenleri sütunu) `lookup.mjs bilesen` ile gerçek
   bileşenleri al — kendin adım uydurma. Türkçe/Türk Dili ve Edebiyatı/İngilizce'de
   bu yapı yok, orada bileşen üretme.
4. Erdem-değer bağlantısı için `lookup.mjs beceri "Erdem-Değer-Eylem Çerçevesi"` ile
   gerçek değer/alt-boyut listesine bak, zorlama eşleme uydurma.
5. **Yalnızca** ders/sınıf veri kaynağında yoksa (bilinen boşluklar: İngilizce ve
   diğer dil dersleri, Alan Becerileri, Fiziksel Beceriler) kazanım **taslağı**
   önerebilirsin — ama çıktının en üstüne kalın harflerle şu uyarıyı koy:
   **"⚠️ Bu kazanım taslaktır, veri kaynağında yok; MEB/TYMM'in güncel öğretim
   programıyla karşılaştırıp doğrulayın."**
6. Veri kaynağı da güncel olmayabilir (derleme tarihi dosyaların başında yazılı) —
   emin değilsen bunu öğretmene açıkça söyle, doğrulanmış bir kaynakmış gibi sunma.

## Mod 1 — Ders / etkinlik planı

### Amaç

Bir öğretmenin verdiği ders, sınıf düzeyi ve kazanımdan yola çıkarak; Türkiye Yüzyılı
Maarif Modeli'nin (TYMM) öngördüğü aktif öğrenme yaklaşımlarını ve farklılaştırma
ilkelerini somut, sınıfta doğrudan uygulanabilir bir ders/etkinlik planına dönüştürür.
Amaç genel geçer bir "ders planı şablonu" doldurmak değil; kazanımı, TYMM'in erdem-değer
çerçevesini ve sınıftaki gerçek öğrenci çeşitliliğini birbirine bağlayan, öğretmenin
gerçekten sınıfta kullanacağı bir belge üretmektir.

### Ne zaman kullanılır

- "Bu kazanım için ders planı hazırlar mısın" gibi istekler
- "Bu konuyu aktif öğrenme ile nasıl işlerim" soruları
- "Bu sınıfta hem geri kalan hem ileri düzey öğrenciler var, farklılaştırma önerisi ister
  misin" gibi farklılaştırma talepleri
- TYMM'e/Maarif Modeli'ne uygun etkinlik, öğrenme deneyimi veya ölçme-değerlendirme
  önerisi istendiğinde

### Girdi olarak isteyeceklerin

Öğretmen aşağıdakileri vermediyse, plana başlamadan önce kısaca sor (hepsini tek tek
sormak yerine tek mesajda topla):

1. Ders/branş ve sınıf düzeyi
2. Ünite/konu, mümkünse kazanım (metin/kod)
3. Ders süresi (kaç ders saati)
4. Sınıf profili — en az kaba bir tanım: örn. "genelde homojen", ya da "5-6 öğrenci
   destek ihtiyacında, 4-5 öğrenci ileri düzey", dil/okuma düzeyi farkları, ilgi alanları
5. (opsiyonel) Tercih edilen aktif öğrenme yaklaşımı ya da kaçınılması istenen bir yöntem

Sınıf profili verilmediyse, genel bir heterojen sınıf varsayımıyla ilerle ve bunu
çıktıda açıkça belirt.

### Aktif öğrenme entegrasyonu — nasıl uygulanır

Her planda TYMM'in beş yaklaşımından **en az ikisi**, somut ve zaman etiketli bir
etkinlik adımına dönüşmeli — "öğrenciler tartışsın" gibi belirsiz ifadeler yeterli değil:

| Yaklaşım | Somut karşılığı planda |
|---|---|
| Yaşantısal öğrenme | Öğrencinin doğrudan deneyimlediği/yaptığı bir eylem (deney, simülasyon, rol yapma, saha gözlemi) |
| Bağlamsal öğrenme | Konu, öğrencinin gündelik hayatından/güncel bir olaydan somut bir bağlama oturtulur |
| Sorgulamaya dayalı öğrenme | Öğretmenin cevabı vermediği, öğrencinin araştırıp/tartışıp ulaştığı bir soru/problem |
| İş birlikli öğrenme | Net rol dağılımlı grup çalışması (tek kişinin taşımadığı bir yapı) |
| Proje temelli öğrenme | Birden fazla ders saatine yayılan, somut bir ürünle sonuçlanan görev |

Tek yönlü anlatım/dinleme sadece giriş kısmında, kısa ve gerekçeli olarak yer alabilir.

### Farklılaştırma entegrasyonu — nasıl uygulanır

Tomlinson'ın içerik / süreç / ürün / öğrenme ortamı çerçevesini kullan; TYMM'in beceri
ve eğilim vurgusuyla uyumlu tut. Her planda en az üç öğrenci profili için (destek
gereken, ortalama, ileri düzey/hızlı tamamlayan) somut bir farklılaştırma tablosu üret:

| Boyut | Destek gereken öğrenci | Ortalama düzey | İleri düzey / hızlı tamamlayan |
|---|---|---|---|
| İçerik | (sadeleştirilmiş metin, görsel destek, kısaltılmış kaynak vb.) | (standart materyal) | (ek kaynak, daha karmaşık metin/veri) |
| Süreç | (adım adım rehber, ek zaman, akran desteği) | (standart adımlar) | (daha az yönlendirme, açık uçlu görev) |
| Ürün | (basitleştirilmiş çıktı biçimi, sözlü sunum seçeneği) | (standart ürün) | (daha derin analiz, öğretici rol) |

Genel geçer "ileri düzeye ekstra ödev ver" gibi yüzeysel önerilerden kaçın; her hücre o
dersin somut içeriğine göre yazılmalı.

### Çıktı şablonu

1. **Üst bilgi** — ders, sınıf, süre, kazanım (kaynağı belirt: verilen / taslak)
2. **Kazanım – erdem/değer bağlantısı** — bu dersin içeriği hangi TYMM değeriyle/
   eğilimiyle doğal olarak örtüşüyor, 1-2 cümlelik gerekçeli bağlantı (zorlama yapma,
   uymuyorsa atla)
3. **Öğrenme hedefleri** — ders sonunda öğrenci ne yapabilecek (gözlemlenebilir fiillerle)
4. **Aktif öğrenme akışı** — giriş / geliştirme / sonuç, her adımda süre ve kullanılan
   yaklaşım(lar) etiketli
5. **Farklılaştırma tablosu** — yukarıdaki formatta
6. **Değerlendirme** — süreç odaklı, beceri-temelli; tek bir yazılı sınav yerine gözlem/
   ürün/dönüt önerileri
7. **Materyal/kaynak listesi**
8. **Öğretmen notu** — olası zorluklar, B planı, süre kısalırsa nereden kısılabilir

## Mod 2 — Çerçeve yıllık plan

MEB'in TYMM'e geçen derslerde yayımladığı **taslak çerçeve yıllık plan** biçiminde,
öğretim yılının tamamını haftalara bölen 14 sütunlu bir tablo üretilir.

**Önce `references/yillik-plan-formati.md` dosyasını oku.** Sütun yapısı, ders saati
gösterimi (`2+2`, `2+(2)*`), özel satırlar (ara tatil, bayram, okul temelli planlama,
sınav haftası), farklılaştırma dili ve mevzuat dayanağı orada tanımlı. Ezberden
üretme — biçim eski yıllık plan biçiminden belirgin şekilde farklı.

### İki farklı senaryo

**A) Öğretmenin elinde MEB çerçeve planı var (tercih edilen yol).** Öğretmenden
planı paylaşmasını iste, iskeleti aynen koru ve okula/sınıfa uyarla:
- `OKUL TEMELLİ PLANLAMA` haftalarını zümre kararına göre doldur
- `FARKLILAŞTIRMA` sütununu sınıfın gerçek profiline göre yeniden yaz
- `ÖLÇME VE DEĞERLENDİRME` önerilerini somut görevlere dönüştür
- Ünite sürelerini okul takvimine (tatil, tören, sınav haftası) göre kaydır

Çerçeve plandaki öğrenme çıktısı kodlarını, süreç bileşenlerini ve ünite adlarını
**değiştirme** — bunlar öğretim programından gelir.

**B) Elinde çerçeve plan yok.** Bu durumda tam güvenilir bir plan üretilemez;
`references/` verisinde süreç bileşenleri, ünite/konu adları, akademik takvim ve
haftalık ders saati yok (ayrıntı için biçim dosyasının son bölümü). Şunları yap:
1. Öğretmenden eksikleri iste: ders + sınıf, haftalık ders saati, öğretim yılı
   takvimi, ünite adları ve sıralaması, varsa süreç bileşenleri.
2. Veremediklerini taslak olarak üret ama o hücreleri açıkça işaretle.
3. Çıktının en üstüne şu uyarıyı koy:
   **"⚠️ Bu plan taslaktır. Öğrenme çıktısı kodları, süreç bileşenleri ve takvim
   MEB'in güncel öğretim programı ve çerçeve yıllık planıyla karşılaştırılmalıdır."**

### Çıktı biçimi

Varsayılan olarak markdown tablo üret; sütun sayısı fazla olduğu için haftaları
**ünite bloklarına** ayırıp her blok için ayrı tablo vermek okunabilirliği artırır.
Öğretmen Excel/Word isterse, sütun sırasını ve başlık gruplarını bozmadan üret
(iki seviyeli başlık: grup satırı + alt başlık satırı).

Dikey birleştirilen sütunlar — `OKUL TEMELLİ PLANLAMA` (yıla tek), `FARKLILAŞTIRMA`
ve programlar arası bileşenler (ünite bloğuna) — markdown'da her satırda
tekrarlanmak yerine blok başında bir kez yazılır.

## Ton ve dil

Türkçe, sade, doğrudan uygulanabilir. MEB'in resmi/bürokratik dilini taklit etme;
öğretmenin gerçekten sınıfta kullanacağı, gereksiz jargondan arınmış bir belge üret.

## Bilinen sınırlar

- Veri kaynağının kapsamadığı alanlar: İngilizce ve diğer dil dersleri (CEFR tabanlı
  farklı bir yapı kullanıyor), Alan Becerileri (tek sayfa değil, her ders ailesi için
  ayrı bir kaynak — henüz derlenmedi), Fiziksel Beceriler (kaynakta ayrı kod listesi yok).
- `references/curriculum.ts`'te **tek bozuk kayıt kaldı: TG.4.1.2.** Kaynak
  sayfada sütunlar iç içe geçtiği için metin paramparça çıkıyor ("Trafik ile
  ilgili temel kurallarının kavramlara"). Bu kodu kullanma, öğretmene öğretim
  programından doğrulamasını söyle.
- **Türkçe dersinde kodlar öğrenme alanına göre ayrışır** ve `unite` alanı bu
  alanı gösterir: `T.D.*` Dinleme/İzleme (1), `T.O.*` Okuma (2), `T.K.*` Konuşma
  (3), `T.Y.*` Yazma (4). Öğretmen "Türkçe kazanımı" derken hangi alanı
  kastettiğini belirtmediyse sor; `lookup.mjs kazanim "Ortaokul Türkçe" 5`
  dördünü birden döndürür.
- **Türk Dili ve Edebiyatı çıktıları `-abilme` ile bitmez** — o program
  betimleyici cümleler kullanır ("Seçim yapar."). Bu bir ayrıştırma hatası
  değil, programın kendi yapısı.
- **Türk Dili ve Edebiyatı verisi 2024 tarihli programdan.** MEB 19.08.2026
  tarihli revize bir TDE programı yayımladı; bu sürümde henüz işlenmedi.
- **Süreç bileşenleri Türkçe, Türk Dili ve Edebiyatı ve İngilizce'de yok.** Bu
  programlar çıktının altına `a) b) c)` koymuyor (Türkçe "Öğrenme Yaşantısı"
  paragrafı kullanıyor, İngilizce CEFR tabanlı). Bu üç derste süreç bileşeni
  uydurma; öğretmene programın farklı yapıda olduğunu söyle.
- **Ünite adları veride yok.** `surec-bilesenleri.mjs` çıktının *konu/bölüm* adını
  taşır (`bolum` alanı) ama ünite adı hiçbir dosyada yok — ünite yalnızca numara.
- Yıllık plan modu için akademik takvim, haftalık ders saati, belirli gün ve haftalar
  listesi de veride yok; ayrıntı için `references/yillik-plan-formati.md`.
- TYMM'in erdem-değer eşlemeleri her konuda doğal biçimde kurulamayabilir; zorlama
  eşleme yapmaktansa o bölümü kısa tutmak ya da atlamak tercih edilmeli.
- Veri kaynağı 2026-08-05 tarihli bir anlık görüntüdür; TYMM programları güncellenirse
  yeniden derlenmesi gerekir.
- Bu skill sınıf yönetimi veya disiplin sorunlarına çözüm üretmez; sadece ders/etkinlik
  tasarımına odaklanır.
