# TYMM Çerçeve Yıllık Plan — biçim referansı

Bu dosya, MEB'in TYMM'e geçen derslerde yayımladığı **taslak çerçeve yıllık plan**
biçimini tarif eder. Kaynak: 2025-2026 Fen Bilimleri (3-8) taslak çerçeve yıllık
planı, 5 ve 6. sınıf sayfaları (TYMM formatındaki sayfalar). İncelenme tarihi:
2026-08-05.

Yıllık plan istendiğinde bu dosyadaki sütun yapısına, terminolojiye ve satır
tiplerine birebir uy. Eski (2018 programı) yıllık plan biçimiyle karıştırma —
farkları en altta.

## Sütun yapısı — 14 sütun, iki seviyeli başlık

Üst başlık satırı sütunları gruplar, alt başlık satırı tek tek sütunları adlandırır:

| Grup başlığı | Sütun | Alt başlık |
|---|---|---|
| **SÜRE** | A | AY |
| | B | HAFTA |
| | C | DERS SAATİ |
| **ÜNİTE/TEMA/ÖĞRENME ALANI - İÇERİK ÇERÇEVESİ** | D | ÜNİTE / TEMA |
| | E | KONU (İÇERİK ÇERÇEVESİ) |
| **ÖĞRENME ÇIKTILARI VE SÜREÇ BİLEŞENLERİ** | F | ÖĞRENME ÇIKTILARI |
| | G | SÜREÇ BİLEŞENLERİ |
| **ÖĞRENME KANITLARI** | H | ÖLÇME VE DEĞERLENDİRME |
| **PROGRAMLAR ARASI BİLEŞENLER** | I | SOSYAL-DUYGUSAL ÖĞRENME BECERİLERİ |
| | J | DEĞERLER |
| | K | OKURYAZARLIK BECERİLERİ |
| (grupsuz) | L | BELİRLİ GÜN VE HAFTALAR |
| (grupsuz) | M | FARKLILAŞTIRMA |
| (grupsuz) | N | OKUL TEMELLİ PLANLAMA |

Sütun sırası sabittir, sütun atlanmaz. Bir hafta için bir sütun boşsa hücre boş
bırakılır (uydurma içerikle doldurulmaz).

## Sütun sütun kurallar

**A — AY.** Sadece ayın ilk haftasında yazılır, sonraki haftalarda dikey birleştirilir.

**B — HAFTA.** `12. Hafta: 1-5 Aralık` biçiminde: hafta numarası + o haftanın tarih
aralığı. Numaralandırma öğretim yılı boyunca kesintisiz devam eder; tatil haftaları
numara almaz.

**C — DERS SAATİ.** Aşağıdaki "Ders saati gösterimi" bölümüne bak.

**D — ÜNİTE / TEMA.** Tam ünite adı, numarasıyla: `1. ÜNİTE: GÖKYÜZÜNDEKİ
KOMŞULARIMIZ VE BİZ`. Bir hafta içinde ünite değişiyorsa iki ünite adı da aynı
hücrede alt alta yazılır.

**E — KONU (İÇERİK ÇERÇEVESİ).** Ünitenin altındaki içerik çerçevesi başlığı
(ör. `Gökyüzündeki Komşumuz: Ay`). Öğrenme çıktısı değil, konu başlığıdır.

**F — ÖĞRENME ÇIKTILARI.** Kod + tam çıktı metni. TYMM öğrenme çıktıları
**"-abilme/-ebilme"** ile biter (ör. "…bilgileri toplayabilme"), eski kazanımlar
gibi "…açıklar / …ifade eder" ile bitmez. Bir haftada birden fazla çıktı işleniyorsa
hepsi aynı hücrede, aralarında boş satır bırakılarak yazılır.

**G — SÜREÇ BİLEŞENLERİ.** Her öğrenme çıktısının kodu, iki nokta, ardından
`a) b) c) ç) d)` harfleriyle alt bileşenler. Bunlar çıktının gözlenebilir adımlarıdır
ve **öğretim programında tanımlıdır** — üretilmez, programdan alınır. Örnek:

```
FB.5.1.1.1.:
a) Güneş'in yapısı ve dönme hareketi ile ilgili bilgiye ulaşmak için kullanacağı araçları belirler.
b) Belirlediği araçları kullanarak Güneş'in yapısı ve dönme hareketi hakkında bilgileri bulur.
c) Güneş'in yapısı ve dönme hareketi hakkında bulduğu bilgileri doğrular.
ç) Güneş'in yapısı ve dönme hareketi hakkında ulaşılan bilgileri kaydeder.
```

Harf sırası Türk alfabesine göredir: a, b, c, **ç**, d, e, f, g, ğ…

**H — ÖLÇME VE DEĞERLENDİRME.** İki katmanlı yazılır: (1) çıktının
değerlendirilmesinde kullanılabilecek araçlar, (2) somut bir performans görevi +
o görevin hangi puanlama aracıyla değerlendirileceği. Geçen araç adları:
kısa cevaplı test, yapılandırılmış grid, eşleştirme testi, açık uçlu soru, çalışma
kâğıdı, kavram/zihin haritası, balık kılçığı, tanılayıcı dallanmış ağaç, performans
görevi, ürün dosyası; puanlama için analitik/bütüncül dereceli puanlama anahtarı,
kontrol listesi, öz-akran-grup değerlendirme formu.

**I / J / K — Programlar arası bileşenler.** Kodlu ve adlı liste, alt alta.
Kodlar `references/skills.ts` ile birebir aynıdır:
- I: `SDB1.1. Kendini Tanıma (Öz Farkındalık)`, `SDB2.2. İş Birliği` …
- J: `D1. Adalet`, `D3. Çalışkanlık`, `D16. Sorumluluk` … (D1–D20)
- K: `OB1. Bilgi Okuryazarlığı`, `OB7. Veri Okuryazarlığı` … (OB1–OB9)

Bunlar tek tek haftaya değil, genelde bir **ünite bloğuna** yazılır ve blok boyunca
dikey birleştirilir. Kod ve ad birlikte yazılır, sadece kod yazılmaz.

**L — BELİRLİ GÜN VE HAFTALAR.** O haftaya denk gelen resmî gün/hafta
(ör. `24 Kasım Öğretmenler Günü`, `Tutum, Yatırım ve Türk Malları Haftası (12-18 Aralık)`).
Yoksa boş.

**M — FARKLILAŞTIRMA.** Aşağıdaki "Farklılaştırma dili" bölümüne bak. Ünite bloğuna
yazılır, her haftaya ayrı ayrı değil.

**N — OKUL TEMELLİ PLANLAMA.** Tüm planda tek bir hücre; yılın tamamı için dikey
birleştirilir ve şu açıklamayı taşır:

> Okul temelli planlama; Zümre Öğretmenler Kurulu tarafından ders kapsamında
> yapılması kararlaştırılan; okul dışı öğrenme etkinlikleri, araştırma ve gözlem,
> sosyal etkinlikler, proje çalışmaları, yerel çalışmalar, okuma çalışmaları vb.
> çalışmalar için ayrılan süredir. Çalışmalar için ayrılan süre eğitim öğretim yılı
> içinde planlanır ve yıllık planlarda ifade edilir.
>
> *Bu çerçeve planda belirtilen okul temelli planlama haftaları örnek olarak
> sunulmuştur. Planlama, zümre öğretmenler kurulunda alınan kararlara göre okul ve
> ders koşulları göz önünde bulundurularak yapılmalıdır.

## Ders saati gösterimi

Haftalık ders saati, o hafta işlenen konulara göre bölünerek yazılır:

| Gösterim | Anlamı |
|---|---|
| `4` | Haftanın 4 saatinin tamamı tek konuya/çıktıya ayrılmış |
| `2+2` | 4 saat iki konu arasında bölünmüş (sırayla D/E/F sütunundaki iki bloğa karşılık gelir) |
| `1+3`, `3+1`, `1+2+(1)*` | Aynı mantık, farklı dağılım |
| `2+(2)*` | Parantezli saat **okul temelli planlamaya** ayrılmıştır; `*` dipnotu işaret eder |
| `OKUL TEMELLİ PLANLAMA*` | O hafta tamamen okul temelli planlamaya ayrılmış |
| `SOSYAL ETKİNLİK` | Yılın son haftası tipik olarak buraya ayrılır |

Toplam saat, o dersin **Haftalık Ders Çizelgesi**'ndeki saatiyle tutmalı
(örnekteki 5. sınıf Fen Bilimleri: haftada 4 saat).

## Özel satırlar

Takvim satırları, A'dan L'ye kadar birleştirilmiş tek hücre olarak araya girer ve
hafta numarası almaz:

- `1. DÖNEM ARA TATİLİ: 10-14 Kasım 2025`
- `YARIYIL TATİLİ: 19 Ocak - 30 Ocak 2026`
- `2. DÖNEM ARA TATİLİ: 16-20 MART 2026`
- `RAMAZAN BAYRAMI (19-20-21 VE 22 MART 2026)`
- `KURBAN BAYRAMI (26-27-28-29 VE 30 MAYIS 2026)`

**Sınav haftaları** ayrı satır değildir; H sütununa yazılır:
`SINAV HAFTASI (22 Aralık 2025-9 Ocak 2026)`.

## Takvim iskeleti — 2025-2026 örneği

Yıl bazlı olduğu için **her yıl MEB Çalışma Takvimi Genelgesi'nden yeniden alınmalı**.
2025-2026 iskeleti (37 hafta):

```
1-3.   hafta   8 Eylül – 26 Eylül
4-9.   hafta   29 Eylül – 7 Kasım        (8. hafta 27-31 Ekim: okul temelli planlama)
       1. DÖNEM ARA TATİLİ               10-14 Kasım 2025
10-18. hafta   17 Kasım – 16 Ocak        (16. hafta 29 Aralık-2 Ocak: okul temelli planlama)
       YARIYIL TATİLİ                    19-30 Ocak 2026
19-24. hafta   2 Şubat – 13 Mart
       2. DÖNEM ARA TATİLİ               16-20 Mart 2026
       RAMAZAN BAYRAMI                   19-22 Mart 2026
25-33. hafta   23 Mart – 22 Mayıs        (25. hafta: okul temelli planlama)
       KURBAN BAYRAMI                    26-30 Mayıs 2026
34-37. hafta   1 Haziran – 26 Haziran    (34. hafta: okul temelli planlama, 37. hafta: sosyal etkinlik)
```

Sınav haftaları (5. sınıf örneği): 27 Ekim-7 Kasım 2025, 22 Aralık 2025-9 Ocak 2026,
01-12 Haziran 2026.

## Farklılaştırma dili — ders planındakinden farklı

Yıllık planda farklılaştırma **Tomlinson'ın içerik/süreç/ürün/öğrenme ortamı
tablosuyla değil**, iki başlıkla yazılır:

```
Zenginleştirme:
- (ileri düzey/hızlı tamamlayan öğrenciler için somut etkinlik önerileri)
- …

Destekleme:
- (desteğe ihtiyaç duyan öğrenciler için somut uyarlamalar)
- …

Farklılaştırma kapsamındaki tüm uygulamalar; öğrencilerin ilgi, ihtiyaç ve istekleri
göz önünde bulundurularak öğretmenler tarafından planlanır ve uygulanır.
```

Son cümle standarttır, her farklılaştırma hücresinin sonuna aynen yazılır.
Öneriler ünitenin gerçek içeriğine bağlı olmalı; "ek ödev verilir" gibi genel
ifadeler kullanılmaz. Çerçeve planda sık geçen zenginleştirme türleri: dijital
içerik/animasyon üretme, 3B baskı, FETEMM tabanlı tasarım görevi, uzmanla görüşme,
sosyal sorumluluk projesi, **Türk-İslam bilim insanlarının** (Bîrûnî, Hâzinî,
İbn Sînâ, Battânî, Fergânî) ilgili çalışmalarını araştırma. Destekleme türleri:
somut materyal (kes-yapıştır, yapboz), rol oynama, animasyon/simülasyon ile
soyut kavramı somutlaştırma, süreç adımlarının öğretmenle birlikte yapılması.

## Dolu örnek satır (5. sınıf Fen Bilimleri, 2. hafta)

| Sütun | İçerik |
|---|---|
| A / B / C | EYLÜL / `2. Hafta: 15-19 Eylül` / `4` |
| D | `1. ÜNİTE: GÖKYÜZÜNDEKİ KOMŞULARIMIZ VE BİZ` |
| E | `Gökyüzündeki Komşumuz: Güneş` |
| F | `FB.5.1.1.1. Güneş'in yapısı ve dönme hareketi ile ilgili bilgileri toplayabilme` |
| G | `FB.5.1.1.1.:` + a) araçları belirler b) bilgileri bulur c) bilgileri doğrular ç) kaydeder |
| H | Kısa cevaplı test, yapılandırılmış grid, eşleştirme testi, açık uçlu soru, performans görevi… + kısa rapor/günlük/afiş/poster performans görevi, analitik dereceli puanlama anahtarı ile |
| I | `SDB1.1. Kendini Tanıma (Öz Farkındalık)` / `SDB1.2. Kendini Düzenleme (Öz Düzenleme)` / `SDB2.1. İletişim` / `SDB2.2. İş Birliği` |
| J | `D1. Adalet` / `D3. Çalışkanlık` / `D6. Dürüstlük` / `D7. Estetik` / `D8. Mahremiyet` / `D16. Sorumluluk` / `D19. Vatanseverlik` / `D20. Yardımseverlik` |
| K | `OB1. Bilgi Okuryazarlığı` / `OB2. Dijital Okuryazarlık` / `OB7. Veri Okuryazarlığı` |
| L | `15 Temmuz Demokrasi ve Millî Birlik Günü` |
| M | Zenginleştirme / Destekleme blokları (ünite bloğuna) |
| N | Okul temelli planlama açıklaması (yıla tek) |

## Mevzuat dayanağı

Planın altına konan dayanak cümlesi. Yıl ve karar numaraları değişebilir,
kullanmadan önce güncelini doğrula:

> Bu yıllık plan; 19.09.2022 tarih ve 58168473 sayılı "Millî Eğitim Bakanlığı
> Eğitim Öğretim Çalışmalarının Planlı Yürütülmesine İlişkin Yönerge", 2104 sayılı
> Tebliğler Dergisi "İlköğretim ve Ortaöğretim Kurumlarında Atatürk İnkılap ve
> İlkelerinin Öğretim Esasları Yönergesi", Talim ve Terbiye Kurulu'nun 26.05.2025
> tarih ve 13 sayılı Kurul Kararı eki "Türkiye Yüzyılı Maarif Modeli Öğretim
> Programları Ortak Metni", ilgili dersin öğretim programı, "MEB Eğitim ve Öğretim
> Yılı Çalışma Takvimi Genelgesi" ile Talim ve Terbiye Kurulu'nun 09.05.2025 tarih
> ve 04 sayılı Kurul Kararı eki "Haftalık Ders Çizelgesi" esas alınarak hazırlanmıştır.

## Eski biçimle farkları

Aynı dosyadaki TYMM'e geçmemiş sınıflar (ör. 7 ve 8. sınıf) eski biçimdedir.
Öğretmen eski biçimde bir plan gösterirse karıştırma:

| Eski biçim (2018 programı) | TYMM biçimi |
|---|---|
| KAZANIM (`F.7.1.1.1. Uzay teknolojilerini açıklar.`) | ÖĞRENME ÇIKTILARI (`FB.5.1.1.1. …toplayabilme`) |
| KAZANIM AÇIKLAMASI (`a. …değinilir.`) | SÜREÇ BİLEŞENLERİ (`a) …belirler.`) |
| YÖNTEM VE TEKNİKLER | *(yok — süreç bileşenleri ve öğrenme kanıtları yerini aldı)* |
| OKUL DIŞI ÖĞRENME | OKUL TEMELLİ PLANLAMA |
| *(yok)* | PROGRAMLAR ARASI BİLEŞENLER (SDB / Değerler / Okuryazarlık) |
| *(yok)* | FARKLILAŞTIRMA (Zenginleştirme / Destekleme) |
| *(yok)* | KONU (İÇERİK ÇERÇEVESİ) ayrı sütun |

Kod uzunluğu da ayırt edici: eski Fen kodu `F.7.1.1.1`, TYMM Fen kodu `FB.5.1.1.1`.

## Bu skill'in veri kaynağının yetmediği yerler

Yıllık plan üretirken aşağıdakiler `references/` altındaki veride **yok**.
Uydurma — öğretmenden iste ya da açıkça "doğrulayın" uyarısı koy:

1. **Süreç bileşenleri (G sütunu).** `curriculum.ts` yalnızca öğrenme çıktısı
   metnini içerir, `a) b) c) ç)` bileşenlerini içermez. Öğretmenden öğretim
   programının ilgili sayfasını iste, ya da ürettiğin bileşenleri "programdan
   doğrulayın" uyarısıyla ver.
2. **Ünite ve konu adları (D ve E sütunları).** Veride ünite yalnızca *numara*
   olarak var (`unite: 1`), adı yok.
3. **Fen Bilimleri kod derinliği.** Veride Fen kodları dört parçalı
   (`FB.5.1.2`), gerçek TYMM Fen kodu beş parçalıdır (`FB.5.1.2.2`) — Fen'de
   ünite altında ayrıca *konu* seviyesi var. Veride aynı konunun birden fazla
   çıktısı tek kayda düşmüş ve bazıları kaybolmuş (5. sınıf Fen: veride 18 kayıt,
   çerçeve planda 28 öğrenme çıktısı). **Fen Bilimleri için kazanım kodlarını
   veriden alma**, öğretmenden ya da çerçeve plandan al.
4. **Akademik takvim.** Hafta tarihleri, tatiller, sınav haftaları yıla özgüdür.
5. **Haftalık ders saati.** Dersin haftada kaç saat olduğu veride yok.
6. **Belirli gün ve haftalar listesi** ve **ölçme-değerlendirme önerileri** veride yok.

Bu yüzden en güvenilir yol: öğretmenin elindeki **MEB taslak çerçeve yıllık planını
temel alıp okula/sınıfa uyarlamak**; sıfırdan üretmek ancak yukarıdakiler
öğretmenden alındığında güvenilir olur.
