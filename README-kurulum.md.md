# HaySev seviye bazlı profil fotoğrafları

1. `public/avatars` klasörünü projenizin `public` klasörüne kopyalayın.
2. `src/components` ve `src/lib` dosyalarını projenizin `src` klasörüne kopyalayın.
3. Profil sayfanızda bileşeni içe aktarın:

```jsx
import LevelAvatarPicker from "./components/LevelAvatarPicker";
```

4. Bileşeni profil ekranına ekleyin:

```jsx
<LevelAvatarPicker
  points={points}
  selectedAvatarId={profile.avatar_id || "avatar-04"}
  onSave={async (avatarId) => {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_id: avatarId })
      .eq("id", user.id);
    if (error) throw error;
  }}
/>
```

5. Supabase'de `profiles` tablosuna alan ekleyin:

```sql
alter table public.profiles
add column if not exists avatar_id text default 'avatar-04';
```

Güvenlik: Arayüz kilit kontrolü yapar. Üretimde Supabase tarafında puan ve avatar uygunluğunu ayrıca doğrulayan bir RPC veya trigger kullanılması önerilir.
