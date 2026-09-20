import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { supabase, supabaseConfigured } from './supabase';
import './style.css';

const awardRules = [
  ['Mama bıraktım', 20, 'bowl'], ['Su doldurdum', 20, 'drop'],
  ['Fotoğraf bonusu', 30, 'camera'], ['Mama hâlâ var', 5, 'check'],
  ['Mama bitmiş', 5, 'empty'], ['Noktayı kontrol ettim', 5, 'pin'],
  ['Görevi tamamladım', 5, 'tick'], ['Onaylı hata bildirimi', 10, 'flag'],
];
const levels = [
  { min: 0, title: 'Yeni Pati' }, { min: 100, title: 'Pati Dostu' },
  { min: 250, title: 'Mama Destekçisi' }, { min: 500, title: 'Kampüs Gönüllüsü' },
  { min: 800, title: 'Pati Koruyucusu' }, { min: 1200, title: 'HaySev Elçisi' },
];
const demo = {
  user: { id: 'demo-me', name: 'Ebrar Akova', points: 180 },
  stats: { total: 21, food: 5, water: 0, photo: 1 },
  ranking: [
    { id: 'demo-me', name: 'Ebrar Akova', points: 180 },
    { id: 'demo-2', name: 'selin örün', points: 60 },
  ],
};
function getName(row, fallback = 'Pati Dostu') {
  return row?.full_name || row?.display_name || row?.name || row?.username || fallback;
}
function getPoints(row) {
  return Number(row?.pati_points ?? row?.total_points ?? row?.points ?? row?.score ?? 0) || 0;
}
function levelAt(points) {
  return [...levels].reverse().find((l) => points >= l.min) || levels[0];
}
function initials(name) {
  return String(name || '?').trim().split(/\s+/).slice(0, 2).map((x) => x[0]?.toLocaleUpperCase('tr-TR')).join('');
}
function Icon({ name }) {
  const icons = { bowl:'●', drop:'◆', camera:'▣', check:'✓', empty:'○', pin:'⌖', tick:'✓', flag:'⚑' };
  return <span className="mini-icon" aria-hidden="true">{icons[name] || '•'}</span>;
}
async function loadLiveData() {
  if (!supabaseConfigured || !supabase) return demo;
  const { data: auth } = await supabase.auth.getUser();
  const authUser = auth?.user;
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error || !profiles?.length) return { ...demo, user: authUser ? { ...demo.user, id: authUser.id, name: authUser.user_metadata?.full_name || demo.user.name } : demo.user };
  const normalized = profiles.map((row) => ({ id: row.id || row.user_id, name: getName(row), points: getPoints(row), raw: row }));
  const active = normalized.find((x) => x.id === authUser?.id) || normalized[0];
  const raw = active?.raw || {};
  return {
    user: active,
    stats: {
      total: Number(raw.total_contributions ?? raw.contribution_count ?? raw.contributions ?? 0),
      food: Number(raw.food_support ?? raw.food_count ?? raw.mama_count ?? 0),
      water: Number(raw.water_support ?? raw.water_count ?? raw.su_count ?? 0),
      photo: Number(raw.photo_bonus ?? raw.photo_count ?? 0),
    },
    ranking: normalized,
  };
}
function PointsPage({ onBack }) {
  const [data, setData] = useState(demo);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let live = true; loadLiveData().then((x) => live && setData(x)).finally(() => live && setLoading(false)); return () => { live = false; }; }, []);
  const rank = useMemo(() => [...data.ranking].sort((a,b) => b.points - a.points || a.name.localeCompare(b.name, 'tr')), [data.ranking]);
  const points = data.user.points;
  const currentLevel = levelAt(points);
  const next = levels.find((l) => l.min > points);
  const progress = next ? Math.max(0, Math.min(100, ((points-currentLevel.min)/(next.min-currentLevel.min))*100)) : 100;
  return <main className="screen points-screen">
    <header className="topbar">
      <button className="back" onClick={onBack} aria-label="Geri dön">‹</button>
      <div><span className="kicker">PATI PUANLARI</span><h1>Kupa Merkezi</h1><p>Her gerçek destek kampüsteki dostlara ulaşır.</p></div>
    </header>
    <section className="level-card">
      <div className="trophy">🏆</div><div className="identity"><small>SEVİYE</small><strong>{currentLevel.title}</strong><span>{data.user.name}</span></div>
      <div className="score"><b>{points}</b><small>Pati Puanı</small></div>
      <div className="progress"><i style={{width:`${progress}%`}} /></div>
      <div className="next-level">{next ? <><span>{next.title}</span><b>{next.min-points} puan kaldı</b></> : <b>En yüksek seviyedesin</b>}</div>
    </section>
    <section className="stats">
      <article><div>↗</div><b>{data.stats.total}</b><span>Toplam katkı</span></article>
      <article><div>●</div><b>{data.stats.food}</b><span>Mama desteği</span></article>
      <article><div>◆</div><b>{data.stats.water}</b><span>Su desteği</span></article>
      <article><div>▣</div><b>{data.stats.photo}</b><span>Fotoğraf bonusu</span></article>
    </section>
    <section className="block"><h2>Puan kazanma</h2><div className="rules">{awardRules.map(([label,value,icon]) => <article key={label}><Icon name={icon}/><span>{label}</span><b>+{value}</b></article>)}</div></section>
    <section className="block ranking"><div className="section-title"><h2>Sıralama</h2><button>Tüm zamanlar⌄</button></div>
      {loading && <p className="loading">Puanlar yükleniyor…</p>}
      <ol>{rank.map((person,index) => <li key={person.id || index} className={person.id===data.user.id?'me':''}><span className="place">{index+1}</span><span className="avatar">{initials(person.name)}</span><span className="person"><b>{person.name}</b><small>{levelAt(person.points).title}</small></span><strong>{person.points}<small> Pati Puanı</small></strong></li>)}</ol>
    </section>
    {!supabaseConfigured && <p className="config-note">Önizleme verileri gösteriliyor. Vercel ortam değişkenleri bağlandığında profil puanları Supabase'den okunur.</p>}
  </main>;
}
function MapPage({ openPoints }) {
  return <main className="screen map-screen"><header className="map-head"><div><span className="kicker">HAYSEV</span><h1>Pati Haritası</h1><p>Kampüsteki mama ve su noktalarını keşfet.</p></div><button className="cup" onClick={openPoints}>🏆<span>Kupa Merkezi</span></button></header><div className="map-card"><img src="/kampus-haritasi.png" alt="Akdeniz Üniversitesi kampüs haritası" /></div><nav className="bottom-nav"><button className="active">⌂<span>Harita</span></button><button onClick={openPoints}>🏆<span>Puanlar</span></button><button>◎<span>Profil</span></button></nav></main>;
}
function App(){ const [page,setPage]=useState(location.hash==='#puanlar'?'points':'map'); const go=(p)=>{setPage(p);location.hash=p==='points'?'puanlar':''}; return page==='points'?<PointsPage onBack={()=>go('map')}/>:<MapPage openPoints={()=>go('points')}/>; }

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
