# Akdeniz Pati Haritası - Güncel Paket

Bu paket React + Vite ile çalışır. Kupa Merkezi, mor seviye kartlı eski detaylı tasarıma döndürülmüştür.

## Kupa Merkezi
- Mor kullanıcı/seviye kartı
- İlerleme çubuğu ve sonraki seviyeye kalan puan
- 2x2 katkı, mama, su ve fotoğraf istatistikleri
- Puan kazanma kuralları
- Toplam puana göre sıralama
- Aktif kullanıcı için yeşil çerçeve

## Kurulum
1. ZIP içeriğini GitHub deposunun köküne yükleyin.
2. Vercel ayarlarında `VITE_SUPABASE_URL` ve `VITE_SUPABASE_PUBLISHABLE_KEY` tanımlı kalsın.
3. Build komutu: `npm run build`
4. Çıktı klasörü: `dist`

Uygulama `profiles` tablosundaki mevcut profil ve puan alanlarını okumayı dener. Desteklenen puan alanları: `pati_points`, `total_points`, `points`, `score`. Hiçbiri yoksa 0 gösterir. Paket veritabanına puan yazmaz, kayıt silmez ve mevcut puanları sıfırlamaz.
