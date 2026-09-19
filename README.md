# Akdeniz Pati Haritası - Temiz Paket

Bu paket GitHub deponuzun kök dizinine topluca yüklenmek üzere hazırlanmıştır.

## İçerik
- Mobil ana sayfa ve kampüs haritası
- Mama noktaları listesi ve Supabase Realtime
- Profil, giriş/kayıt, seviye ve puan alanı
- Seviyeye göre açılan 11 profil avatarı
- Avatar seçimini Supabase `profiles.avatar_id` alanına kaydetme

## Yükleme
1. ZIP'i çıkartın.
2. GitHub deposunun kökünde **Add file > Upload files** seçin.
3. ZIP'in içindeki tüm dosya ve klasörleri sürükleyin.
4. Aynı isimli dosyaların değiştirilmesini onaylayın.
5. `supabase-avatar-migration.sql` içeriğini Supabase SQL Editor'da bir defa çalıştırın.
6. Vercel'de `VITE_SUPABASE_URL` ve `VITE_SUPABASE_PUBLISHABLE_KEY` değişkenleri mevcut olmalıdır.

## Avatar dağılımı
- Yeni Pati: 4
- Pati Dostu: 3, 5
- Mama Destekçisi: 7
- Kampüs Gönüllüsü: 10
- Pati Koruyucusu: 11, 8, 6
- HaySev Elçisi: 1, 2, 9
