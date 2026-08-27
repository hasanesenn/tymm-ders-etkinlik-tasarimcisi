# TYMM Ders/Etkinlik Planı Tasarımcısı

Türkiye Yüzyılı Maarif Modeli (TYMM) temelli iki tür plan üreten bir Claude skill'i:

- **Ders/etkinlik planı** — kazanıma dayalı, aktif öğrenme yaklaşımları (yaşantısal,
  bağlamsal, sorgulamaya dayalı, iş birlikli, proje temelli öğrenme) ve
  farklılaştırma stratejileri (içerik/süreç/ürün/öğrenme ortamı) ile.
- **Çerçeve yıllık plan** — MEB'in TYMM taslak çerçeve yıllık plan biçiminde; öğrenme
  çıktıları, süreç bileşenleri, öğrenme kanıtları, programlar arası bileşenler
  (SDB/değerler/okuryazarlık), farklılaştırma ve okul temelli planlama sütunlarıyla.

Hasan Esen tarafından hazırlanmıştır. Kazanım ve beceri/değer verileri
[tymm.meb.gov.tr](https://tymm.meb.gov.tr)'den derlenmiştir (bkz.
[Bilinen sınırlar](#bilinen-sınırlar)).

## Kurulum — iki yoldan biri yeterli

### Yol 1 — claude.ai Skills (herkes için, önerilen)

Team/Enterprise organizasyonu gerekmez, Free/Pro/Max hesabında da çalışır.

1. Bu reponun sağındaki **[Releases](https://github.com/hasanesenn/tymm-ders-etkinlik-tasarimcisi/releases/latest)**
   bölümünden en güncel
   `tymm-ders-plani-tasarimcisi.zip` dosyasını indirin (kuruluma hazır,
   içinde doğrudan SKILL.md var — repoyu bütün olarak indirmenize gerek yok).
2. claude.ai → sağ üstte profil ikonu → **Settings → Capabilities**'te
   "Code execution and file creation" açık olsun.
3. **Customize → Skills** → "+" → **"+ Create skill"** → **"Upload a skill"**
   → indirdiğiniz zip'i seçin.
4. Skill listenizde görünecek, açık (toggle on) olduğundan emin olun.

### Yol 2 — Claude Cowork / Desktop üzerinden Plugin olarak

Bu repo aynı zamanda bir plugin marketplace'i olarak da yapılandırıldı — GitHub
linkini yapıştırmanız yeterli, indirme/paketleme Claude tarafında otomatik olur.

1. Claude Desktop'ı açın, **Cowork** sekmesine geçin.
2. **Customize → Plugins** → "+" → **"Add marketplace"**.
3. Bu reponun adresini yapıştırın:

   ```
   hasanesenn/tymm-ders-etkinlik-tasarimcisi
   ```

4. Listede çıkan **tymm-ders-plani-tasarimcisi** plugin'ini **Install** edin.
5. Kurulan plugin'in skill'i hem Cowork'te hem normal web sohbetinde kullanılabilir.

## Kullanım

Kuruluma sonra, herhangi bir sohbette ders/etkinlik planı isteyin — örnek:

> "10. sınıf Tarih dersi için, Türkistan'dan Türkiye'ye göç ünitesiyle ilgili,
> aktif öğrenme ve farklılaştırma içeren bir ders planı hazırlar mısın?"

Skill otomatik devreye girer; kazanımı kendi veri kaynağından bulur, TYMM'in
erdem-değer çerçevesiyle ilişkilendirir, aktif öğrenme + farklılaştırma
tablosu ekler.

Yıllık plan için de aynı şekilde isteyin:

> "6. sınıf Fen Bilimleri için TYMM çerçeve yıllık planı hazırlar mısın?"

Elinizde MEB'in taslak çerçeve yıllık planı varsa paylaşın — skill onu iskelet
olarak alıp okul temelli planlama haftalarını, farklılaştırma ve ölçme-değerlendirme
sütunlarını sizin sınıfınıza göre yeniden yazar. Elinizde yoksa eksik bilgileri
(takvim, haftalık ders saati, ünite adları) sorar ve ürettiği planı taslak olarak
işaretler.

## Bilinen sınırlar

- Kazanım verisi (`references/curriculum.ts`) 24 ders, 2223 öğrenme çıktısı
  kapsıyor. **İngilizce ve diğer dil dersleri, Alan Becerileri, Fiziksel
  Beceriler** kapsam dışı — bkz. dosyaların başındaki notlar.
- **Tek bozuk kayıt kaldı: TG.4.1.2.** Kaynak PDF sayfasında sütunlar iç içe
  geçtiği için metin paramparça çıkıyor. Bu kodu öğretim programından
  doğrulayın. (v1.3.0 öncesinde yarım kayıt sayısı 47'ydi.)
- **Fen Bilimleri'nde iki kod şeması var, ikisi de resmî.** Öğretim programı
  PDF'i ve MEB çerçeve yıllık planı beş parçalı kod kullanır (`FB.7.1.2.1`);
  tymm.meb.gov.tr'nin ünite sayfaları konu seviyesini kaldırıp ünite içinde
  düz sayar (aynı çıktı orada `FB.7.1.4`). Veride ikisi de tutuluyor —
  `kod` ve `kodDuz`; hangisini yazarsanız yazın bulunur.
  (v1.5.0 öncesinde Fen kodları hatalıydı ve çıktı kaybı vardı.)
- **Türk Dili ve Edebiyatı verisi 2024 tarihli programdan.** MEB 19.08.2026
  tarihli revize bir program yayımladı, bu sürümde henüz işlenmedi.
- Türkçe dersinde kodlar öğrenme alanına göre ayrışır: `T.D.*` Dinleme/İzleme,
  `T.O.*` Okuma, `T.K.*` Konuşma, `T.Y.*` Yazma. (v1.4.0 öncesinde yalnız
  Dinleme/İzleme derlenmişti; diğer üç alan eksikti.)
- Türk Dili ve Edebiyatı çıktıları `-abilme` kalıbıyla bitmez; o program
  betimleyici cümleler kullanır. Bu bir hata değil, programın yapısı.
- Veri kaynağı anlık görüntüdür: kazanımlar 2026-08-27, beceri/değer listeleri
  ve süreç bileşenleri 2026-08-05 tarihinde derlendi.

## Katkı / güncelleme

Kazanım verisini kendi `scrape-curriculum.mjs` / `scrape-skills.mjs`
script'lerinizle yeniden ürettikçe `references/` altındaki dosyaları
güncelleyip bu repoya push edebilirsiniz. Yol 2 ile kuran kullanıcılar
otomatik güncel sürümü alır; Yol 1 ile kuranların zip'i elle yeniden
yüklemesi gerekir.
