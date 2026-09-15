# Akdeniz Pati Haritası 🐾

Akdeniz Üniversitesi kampüsündeki mama noktalarının durumunu takip etmek, gönüllüleri yönlendirmek ve noktaları QR kodlarla güncellemek için hazırlanmış mobil öncelikli web uygulaması.

## Özellikler

- Mobil uyumlu kampüs haritası
- Harita üzerinde renkli mama noktaları
- Nokta ayrıntıları ve hızlı durum güncelleme
- QR tarama arayüzü
- Yönetici paneli
- Haritaya çift tıklayarak yeni nokta ekleme
- Nokta düzenleme ve silme
- Harita görselini panelden değiştirme
- Tarayıcıda kalıcı prototip verisi
- GitHub Pages için otomatik yayınlama iş akışı

## Yerel kurulum

Node.js 20 veya üzeri gereklidir.

```bash
npm install
npm run dev
```

Üretim derlemesi:

```bash
npm run build
npm run preview
```

## GitHub'a yükleme

Yeni, boş bir GitHub deposu oluşturduktan sonra proje klasöründe:

```bash
git init
git add .
git commit -m "Akdeniz Pati Haritası ilk sürüm"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/REPO_ADIN.git
git push -u origin main
```

## GitHub Pages ile yayınlama

1. GitHub deposunda **Settings > Pages** bölümünü açın.
2. **Source** alanında **GitHub Actions** seçin.
3. `main` dalına yapılan her gönderimde `.github/workflows/deploy-pages.yml` otomatik olarak siteyi derler ve yayınlar.
4. Yayın adresi Actions işlemi tamamlandığında repository Pages ekranında görünür.

## Demo yönetici paneli

Ana sayfadaki **Yönet** düğmesinden açılır. Yönetici haritasında yeni nokta eklemek için haritaya çift tıklayın. Bu MVP sürümünde noktalar ve özel harita görseli yalnızca kullanılan tarayıcının `localStorage` alanında tutulur.

## Üretime geçmeden önce

Gerçek kullanım için aşağıdakiler eklenmelidir:

- Supabase veritabanı
- Güvenli yönetici kimlik doğrulaması
- Rol ve yetki sistemi
- Gerçek QR kamera okuma
- Noktaya özel QR üretimi
- Fotoğraf yükleme ve depolama
- Sunucu tarafında otomatik 24, 48 ve 72 saat durum hesaplama

## Proje yapısı

```text
.github/workflows/deploy-pages.yml
public/kampus-haritasi.png
src/App.jsx
src/main.jsx
src/style.css
.env.example
.gitignore
index.html
package.json
vite.config.js
```

## Moderatör güvenliği
Vercel Project Settings > Environment Variables bölümüne `MODERATOR_PASSWORD` ve en az 32 karakterlik `SESSION_SECRET` ekleyin. Ardından projeyi yeniden yayınlayın. Yönetici paneli Profil sekmesindeki güvenli moderatör girişinden açılır.
