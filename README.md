# TYMM Ders/Etkinlik Planı Tasarımcısı

Türkiye Yüzyılı Maarif Modeli (TYMM) kazanımlarına, aktif öğrenme yaklaşımlarına
(yaşantısal, bağlamsal, sorgulamaya dayalı, iş birlikli, proje temelli öğrenme) ve
farklılaştırma stratejilerine dayalı ders/etkinlik planı üreten bir Claude skill'i.

TeacherX tarafından hazırlanmıştır. Kazanım ve beceri/değer verileri
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

## Bilinen sınırlar

- Kazanım verisi (`references/curriculum.ts`) 24 ders, ~1800 öğrenme çıktısı
  kapsıyor. **İngilizce ve diğer dil dersleri, Alan Becerileri, Fiziksel
  Beceriler** kapsam dışı — bkz. dosyaların başındaki notlar.
- 47 kayıt PDF ayrıştırma sırasında parantez içinde kesik kalmış (Din Kültürü
  ve Ahlak Bilgisi 19, Matematik 8, Ortaokul Matematik 8, Türk Dili ve
  Edebiyatı 7, Fizik 2, Biyoloji/İlkokul Matematik/Kimya 1'er) — tam liste
  `references/curriculum.ts` başındaki notta; kullanmadan önce doğrulayın.
- Veri kaynağı 2026-08-05 tarihli bir anlık görüntüdür.

## Katkı / güncelleme

Kazanım verisini kendi `scrape-curriculum.mjs` / `scrape-skills.mjs`
script'lerinizle yeniden ürettikçe `references/` altındaki dosyaları
güncelleyip bu repoya push edebilirsiniz. Yol 2 ile kuran kullanıcılar
otomatik güncel sürümü alır; Yol 1 ile kuranların zip'i elle yeniden
yüklemesi gerekir.
