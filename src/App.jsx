import React,{useEffect,useMemo,useRef,useState}from"react";
import{supabase,supabaseConfigured}from"./supabase";
import{Bell,Camera,Check,ChevronLeft,ChevronRight,CircleAlert,Download,Edit3,Expand,Home,ImagePlus,LayoutDashboard,Map,MapPin,Minus,PawPrint,Plus,QrCode,Save,ScanLine,Settings,Shield,Trash2,UserRound,Users,Utensils,X,Trophy}from"lucide-react";
const seed=[
{id:1,name:"HaySev Topluluk Odası",area:"Yakut Çarşı karşısı",x:61.3,y:26.5,status:"full",updated:Date.now()-2*3600000,animals:"8-12 kedi",text:"HaySev kulübesinin yanındaki ağaçlık alan."},
{id:2,name:"İletişim Fakültesi Bahçesi",area:"İletişim Fakültesi",x:29.2,y:46.5,status:"warning",updated:Date.now()-31*3600000,animals:"6-9 kedi",text:"Fakülte girişinin sol tarafındaki yeşil alan."},
{id:3,name:"KYK Kız Yurtları Noktası",area:"Yurtlar Bölgesi",x:55.8,y:75.5,status:"urgent",updated:Date.now()-55*3600000,animals:"10-15 kedi",text:"Yurt kümesinin kuzey girişindeki yürüyüş yolu yanı."}];
const S={full:["Dolu","#0A8F5B"],warning:["Azalıyor","#FFB000"],urgent:["Kontrol","#7146D9"],empty:["Boş olabilir","#F04444"]};
const ago=t=>{let h=Math.max(0,Math.floor((Date.now()-t)/3600000));return h<1?"Şimdi":h<24?`${h} saat önce`:`${Math.floor(h/24)} gün önce`};
function MapView({image,points,onPoint,admin,onAdd,full=false,onExpand,onClose}){
 const viewport=useRef(null);
 const pointers=useRef(new globalThis.Map());
 const gesture=useRef({});
 const [view,setView]=useState({scale:1,x:0,y:0});
 const [dragging,setDragging]=useState(false);
 const [viewportSize,setViewportSize]=useState({width:1,height:1});

 useEffect(()=>{
  const element=viewport.current;
  if(!element)return;
  const measure=()=>setViewportSize({width:element.clientWidth||1,height:element.clientHeight||1});
  measure();
  const observer=new ResizeObserver(measure);
  observer.observe(element);
  return()=>observer.disconnect();
 },[]);

 const imageRatio=1.5;
 const baseSize=useMemo(()=>{
  const {width,height}=viewportSize;
  return width/height>imageRatio
   ?{width,height:width/imageRatio}
   :{width:height*imageRatio,height};
 },[viewportSize]);

 const clamp=(next,nextScale=next.scale)=>{
  const maxX=Math.max(0,(baseSize.width*nextScale-viewportSize.width)/2);
  const maxY=Math.max(0,(baseSize.height*nextScale-viewportSize.height)/2);
  return{scale:nextScale,x:Math.max(-maxX,Math.min(maxX,next.x)),y:Math.max(-maxY,Math.min(maxY,next.y))};
 };
 const distance=values=>Math.hypot(values[0].x-values[1].x,values[0].y-values[1].y);
 const pointerDown=e=>{
  if(e.target.closest('button'))return;
  e.preventDefault();
  e.currentTarget.setPointerCapture?.(e.pointerId);
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const values=[...pointers.current.values()];
  if(values.length===1)gesture.current={startX:values[0].x,startY:values[0].y,x:view.x,y:view.y,scale:view.scale};
  if(values.length===2)gesture.current={distance:distance(values),x:view.x,y:view.y,scale:view.scale};
  setDragging(true);
 };
 const pointerMove=e=>{
  if(!pointers.current.has(e.pointerId))return;
  e.preventDefault();
  pointers.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const values=[...pointers.current.values()];
  if(values.length===1){
   setView(current=>clamp({...current,x:gesture.current.x+values[0].x-gesture.current.startX,y:gesture.current.y+values[0].y-gesture.current.startY}));
  }else if(values.length>=2){
   const scale=Math.max(1,Math.min(4,gesture.current.scale*distance(values)/Math.max(1,gesture.current.distance)));
   setView(clamp({scale,x:gesture.current.x,y:gesture.current.y},scale));
  }
 };
 const pointerUp=e=>{
  pointers.current.delete(e.pointerId);
  e.currentTarget.releasePointerCapture?.(e.pointerId);
  const values=[...pointers.current.values()];
  if(values.length===1)gesture.current={startX:values[0].x,startY:values[0].y,x:view.x,y:view.y,scale:view.scale};
  if(values.length===0){setDragging(false);setView(current=>clamp(current,current.scale));}
 };
 const zoom=delta=>setView(current=>{const scale=Math.max(1,Math.min(4,current.scale+delta));return clamp({...current,scale},scale)});

 return <div ref={viewport} className={full?'map mapFull':'map'} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onDoubleClick={e=>{if(!admin)return;const rect=e.currentTarget.getBoundingClientRect();onAdd({x:+(((e.clientX-rect.left)/rect.width)*100).toFixed(1),y:+(((e.clientY-rect.top)/rect.height)*100).toFixed(1)})}}>
  <div className="mapInner mapCanvas" style={{width:baseSize.width,height:baseSize.height,left:'50%',top:'50%',transform:`translate(-50%,-50%) translate3d(${view.x}px,${view.y}px,0) scale(${view.scale})`,transition:dragging?'none':'transform .16s ease-out'}}>
   <img src={image} draggable="false" alt="Akdeniz Üniversitesi kampüs haritası"/>
   {points.map(point=><button key={point.id} className="pin" style={{left:point.x+'%',top:point.y+'%',background:S[point.status][1]}} onPointerDown={e=>e.stopPropagation()} onClick={()=>onPoint(point)}><PawPrint size={15}/></button>)}
  </div>
  <div className="zoom">
   {full&&<button aria-label="Tam ekranı kapat" onClick={onClose}><X/></button>}
   <button aria-label="Yakınlaştır" onClick={()=>zoom(.3)}><Plus/></button>
   <button aria-label="Uzaklaştır" onClick={()=>zoom(-.3)}><Minus/></button>
   {!full&&!admin&&<button aria-label="Tam ekran" onClick={onExpand}><Expand/></button>}
  </div>
  {admin&&<div className="mapHint"><MapPin size={15}/> Nokta eklemek için haritaya çift tıkla</div>}
 </div>
}
function Sheet({point,onClose,onUpdate}){if(!point)return null;return <><button className="shade" onClick={onClose}/><section className="sheet"><div className="handle"/><button className="close" onClick={onClose}><X/></button><span className="badge" style={{color:S[point.status][1]}}>{S[point.status][0]} · {ago(point.updated)}</span><h2>{point.name}</h2><p><MapPin size={14}/> {point.area}</p><div className="info"><b><PawPrint/> {point.animals}</b><b><Utensils/> Mama noktası</b></div><div className="note">{point.text}</div><h3>Hızlı güncelleme</h3><div className="actions"><button className="primary" onClick={()=>onUpdate('full')}><Utensils/> Mama bıraktım</button><button onClick={()=>onUpdate('full')}><Check/> Mama hâlâ var</button><button onClick={()=>onUpdate('empty')}><CircleAlert/> Mama bitmiş</button><button><Camera/> Fotoğraf ekle</button></div></section></>}

function FeedingPoints({points,onBack,onShowMap,onUpdate,onProfile,onScores}){
 const[sort,setSort]=useState('priority');
 const[filter,setFilter]=useState('all');
 const[detail,setDetail]=useState(null);
 const priority={empty:0,urgent:1,warning:2,full:3};
 const filtered=[...points].filter(point=>filter==='all'||point.status===filter).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'tr'):sort==='newest'?b.updated-a.updated:priority[a.status]-priority[b.status]||a.updated-b.updated);
 const update=status=>{onUpdate(detail.id,status);setDetail(current=>({...current,status,updated:Date.now()}));};
 return <main><div className="phone pointsPage"><header className="pointsHead"><button onClick={onBack}><ChevronLeft/></button><div><small>MAMA NOKTALARI</small><h1>Kampüs ihtiyaçları</h1><p>Öncelikli noktaları görüntüle ve hızlıca destek ol.</p></div></header><div className="filterRow"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>Tümü</button><button className={filter==='empty'?'active':''} onClick={()=>setFilter('empty')}>Acil</button><button className={filter==='urgent'?'active':''} onClick={()=>setFilter('urgent')}>Kontrol</button><button className={filter==='warning'?'active':''} onClick={()=>setFilter('warning')}>Azalıyor</button><button className={filter==='full'?'active':''} onClick={()=>setFilter('full')}>Dolu</button></div><div className="sortRow"><span>{filtered.length} nokta</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="priority">En acil</option><option value="newest">En son güncellenen</option><option value="name">A’dan Z’ye</option></select></div><section className="pointsList">{filtered.map(point=><article key={point.id} className="pointCard"><i className="statusLine" style={{background:S[point.status][1]}}/><div className="pointBody"><span className="pointBadge" style={{color:S[point.status][1],background:S[point.status][1]+'18'}}>{S[point.status][0]}</span><h2>{point.name}</h2><p><MapPin size={14}/>{point.area}</p><div className="pointMeta"><span><PawPrint size={14}/>{point.animals}</span><span>{ago(point.updated)}</span></div><div className="pointActions"><button onClick={()=>setDetail(point)}>Detaylar</button><button className="mapButton" onClick={()=>onShowMap(point)}><Map size={16}/> Haritada göster</button></div></div></article>)}</section><nav>{[[Home,'Ana'],[MapPin,'Mama Noktaları'],[QrCode,'QR'],[Trophy,'Puanlar'],[PawPrint,'Profil']].map(([Icon,label])=><button key={label} className={label==='Mama Noktaları'?'activeNav':''} onClick={()=>label==='Ana'?onBack():label==='Profil'?onProfile():label==='Puanlar'?onScores():null}><Icon/><span>{label}</span></button>)}</nav>{detail&&<Sheet point={detail} onClose={()=>setDetail(null)} onUpdate={update}/>}</div></main>
}

function PointsPage({onBack,onGoPoints,onOpenQr,onProfile}){
 const[session,setSession]=useState(null),[profile,setProfile]=useState(null),[summary,setSummary]=useState({points:0,total:0,food:0,water:0,photo:0}),[loading,setLoading]=useState(true);
 useEffect(()=>{if(!supabaseConfigured){setLoading(false);return}supabase.auth.getSession().then(async({data})=>{const current=data.session;setSession(current);if(current){const[{data:user},{data:stats}]=await Promise.all([supabase.from('profiles').select('first_name,last_name').eq('id',current.user.id).single(),supabase.rpc('get_my_point_summary')]);setProfile(user);if(stats?.[0])setSummary(stats[0])}setLoading(false)})},[]);
 const nav=[[Home,'Ana'],[MapPin,'Mama Noktaları'],[QrCode,'QR'],[Trophy,'Puanlar'],[PawPrint,'Profil']];
 const navBar=<nav>{nav.map(([Icon,label])=><button key={label} className={label==='Puanlar'?'activeNav':''} onClick={()=>label==='Ana'?onBack():label==='Mama Noktaları'?onGoPoints():label==='QR'?onOpenQr():label==='Profil'?onProfile():null}><Icon/><span>{label}</span></button>)}</nav>;
 if(loading)return <main><div className="phone pointsScorePage"><section className="scoreEmpty"><Trophy/><h2>Puanlar yükleniyor</h2></section>{navBar}</div></main>;
 if(!session)return <main><div className="phone pointsScorePage"><section className="scoreEmpty"><Trophy/><h2>Puanlarını görmek için giriş yap</h2><button onClick={onProfile}>Giriş Yap</button></section>{navBar}</div></main>;
 return <main><div className="phone pointsScorePage"><section className="scoreTop"><div className="scoreIcon"><Trophy/></div><small>PATİ PUANLARI</small><h1>{profile?.first_name} {profile?.last_name}</h1><strong>{summary.points||0} Pati Puanı</strong></section><section className="scoreCards"><div><b>{summary.total||0}</b><span>Toplam katkı</span></div><div><b>{summary.food||0}</b><span>Mama desteği</span></div><div><b>{summary.water||0}</b><span>Su desteği</span></div><div><b>{summary.photo||0}</b><span>Fotoğraf bonusu</span></div></section>{navBar}</div></main>
}
function ProfilePage({onBack,onGoPoints,onOpenQr,onScores}){
 const[mode,setMode]=useState('welcome');
 const[showPassword,setShowPassword]=useState(false);
 const[faculty,setFaculty]=useState('');const[pawColor,setPawColor]=useState(()=>localStorage.getItem('pati-avatar-color')||'#087A50');
 const submit=e=>{e.preventDefault();};
 const nav=[[Home,'Ana'],[MapPin,'Mama Noktaları'],[QrCode,'QR'],[Trophy,'Puanlar'],[PawPrint,'Profil']];
 return <main><div className="phone profilePage"><section className="profileTop"><div className="profileMark" style={{background:pawColor}}><PawPrint size={30}/></div><small>HAYSEV PATİ HARİTASI</small><h1>{mode==='login'?'Tekrar hoş geldin!':mode==='register'?'Aramıza katıl':'Pati Haritası’na Katıl'}</h1><p>{mode==='welcome'?'Mama noktalarını güncellemek ve katkılarını takip etmek için hesabına giriş yap.':mode==='login'?'Kaldığın yerden devam etmek için bilgilerini gir.':'Kampüsteki dostlarımız için birlikte hareket edelim.'}</p></section><section className="pawPicker"><b>Pati rengini seç</b><div className="pawColors">{['#087A50','#7146D9','#1677E8','#F08A24','#E64B8C','#F04444'].map(color=><button key={color} type="button" aria-label="Pati rengi seç" className={pawColor===color?'selected':''} style={{background:color}} onClick={()=>{setPawColor(color);localStorage.setItem('pati-avatar-color',color)}}><PawPrint size={18}/></button>)}</div></section>{mode==='welcome'&&<section className="profileChoices"><button className="profilePrimary" onClick={()=>setMode('login')}>Giriş Yap</button><button className="profileSecondary" onClick={()=>setMode('register')}>Hesap Oluştur</button><button className="forgotLink" onClick={()=>setMode('forgot')}>Şifremi unuttum</button><div className="supportBox"><b>İletişim ve Destek</b><span>İstek, öneri ve şikâyetlerin için</span><a href="mailto:akduhaysevpatiharitasi@gmail.com">akduhaysevpatiharitasi@gmail.com</a></div></section>}{mode==='login'&&<form className="authForm" onSubmit={submit}><label>E-posta<input type="email" required placeholder="ornek@ogr.akdeniz.edu.tr"/></label><label>Şifre<div className="passwordField"><input type={showPassword?'text':'password'} required placeholder="Şifren"/><button type="button" onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Gizle':'Göster'}</button></div></label><button className="profilePrimary">Giriş Yap</button><button type="button" className="forgotLink" onClick={()=>setMode('forgot')}>Şifremi unuttum</button><p className="switchAuth">Hesabın yok mu? <button type="button" onClick={()=>setMode('register')}>Hesap oluştur</button></p></form>}{mode==='register'&&<form className="authForm registerForm" onSubmit={submit}><div className="nameGrid"><label>Ad<input required placeholder="Adın"/></label><label>Soyad<input required placeholder="Soyadın"/></label></div><label>E-posta<input type="email" required placeholder="E-posta adresin"/></label><label>Şifre<input type="password" minLength="8" required placeholder="En az 8 karakter"/></label><label>Şifre tekrarı<input type="password" minLength="8" required placeholder="Şifreni yeniden yaz"/></label><div className="optionalTitle"><b>İsteğe bağlı bilgiler</b><span>Sonradan da ekleyebilirsin</span></div><label>Fakülte <em>İsteğe bağlı</em><select value={faculty} onChange={e=>setFaculty(e.target.value)}><option value="">Seçmek istemiyorum</option><option>İletişim Fakültesi</option><option>Fen Fakültesi</option><option>Mühendislik Fakültesi</option><option>Eğitim Fakültesi</option><option>Hukuk Fakültesi</option><option>Diğer</option></select></label><label>Bölüm <em>İsteğe bağlı</em><input placeholder="Bölümünü yazabilirsin"/></label><label className="consent"><input type="checkbox" required/><span>Kullanım koşullarını ve gizlilik bilgilendirmesini kabul ediyorum.</span></label><button className="profilePrimary">Hesap Oluştur</button><p className="switchAuth">Zaten hesabın var mı? <button type="button" onClick={()=>setMode('login')}>Giriş yap</button></p></form>}{mode==='forgot'&&<form className="authForm forgotForm" onSubmit={submit}><div className="forgotIcon">✉</div><h2>Şifreni yenile</h2><p>E-posta adresini yaz, şifre yenileme bağlantısını gönderelim.</p><label>E-posta<input type="email" required placeholder="E-posta adresin"/></label><button className="profilePrimary">Bağlantı Gönder</button><button type="button" className="forgotLink" onClick={()=>setMode('login')}>Giriş ekranına dön</button></form>}<nav>{nav.map(([Icon,label])=><button key={label} className={label==='Profil'?'activeNav':''} onClick={()=>label==='Ana'?onBack():label==='Mama Noktaları'?onGoPoints():label==='QR'?onOpenQr():label==='Puanlar'?onScores():null}><Icon/><span>{label}</span></button>)}</nav></div></main>
}
function Admin({points,setPoints,image,setImage,onBack}){const [selected,setSelected]=useState(null);const [draft,setDraft]=useState(null);const input=useRef();function add(pos){setDraft({id:Date.now(),name:"Yeni Mama Noktası",area:"Kampüs",status:"full",updated:Date.now(),animals:"Hayvan sayısı girilmedi",text:"Konum tarifi ekleyin.",...pos})}function save(){if(!draft)return;setPoints(v=>v.some(x=>x.id===draft.id)?v.map(x=>x.id===draft.id?draft:x):[...v,draft]);setDraft(null)}function file(e){let f=e.target.files?.[0];if(!f)return;let r=new FileReader();r.onload=()=>{setImage(r.result)};r.readAsDataURL(f)}
return <div className="admin"><header className="adminHead"><button onClick={onBack}><ChevronLeft/></button><div><small>YÖNETİCİ PANELİ</small><h1>Pati kontrol merkezi</h1></div><Shield/></header><div className="adminStats"><div><b>{points.length}</b><span>Toplam nokta</span></div><div><b>{points.filter(x=>x.status==='empty'||x.status==='urgent').length}</b><span>Kontrol</span></div><div><b>{points.filter(x=>Date.now()-x.updated<86400000).length}</b><span>Bugün</span></div></div><div className="adminMap"><MapView image={image} points={points} admin onAdd={add} onPoint={q=>setDraft({...q})}/></div><div className="toolbar"><button onClick={()=>input.current.click()}><ImagePlus/> Haritayı değiştir</button><input ref={input} hidden type="file" accept="image/*" onChange={file}/><button onClick={()=>add({x:50,y:50})}><Plus/> Nokta ekle</button></div><section className="panel"><h2>Mama noktaları</h2>{points.map(q=><article key={q.id}><i style={{background:S[q.status][1]}}/><div><b>{q.name}</b><small>{q.area} · {ago(q.updated)}</small></div><button onClick={()=>setDraft({...q})}><Edit3/></button><button onClick={()=>setPoints(v=>v.filter(x=>x.id!==q.id))}><Trash2/></button></article>)}</section>{draft&&<div className="editor"><div className="editorHead"><h2>Nokta bilgileri</h2><button onClick={()=>setDraft(null)}><X/></button></div><label>Nokta adı<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Bölge<input value={draft.area} onChange={e=>setDraft({...draft,area:e.target.value})}/></label><label>Hayvan bilgisi<input value={draft.animals} onChange={e=>setDraft({...draft,animals:e.target.value})}/></label><label>Konum tarifi<textarea value={draft.text} onChange={e=>setDraft({...draft,text:e.target.value})}/></label><label>Durum<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}>{Object.entries(S).map(([k,v])=><option value={k}>{v[0]}</option>)}</select></label><div className="coords">Harita konumu: %{draft.x} / %{draft.y}</div><button className="save" onClick={save}><Save/> Kaydet</button></div>}</div>}
export default function App(){const[page,setPage]=useState('home');const[fullMap,setFullMap]=useState(false);const[points,setPoints]=useState(()=>JSON.parse(localStorage.getItem('aph-points')||'null')||seed);const[image,setImage]=useState(`${import.meta.env.BASE_URL}kampus-haritasi.png?v=final-map-2`);const[selected,setSelected]=useState(null);const[scan,setScan]=useState(false);useEffect(()=>localStorage.setItem('aph-points',JSON.stringify(points)),[points]);const counts=useMemo(()=>({today:points.filter(x=>Date.now()-x.updated<86400000).length,control:points.filter(x=>x.status==='urgent').length,empty:points.filter(x=>x.status==='empty').length}),[points]);if(page==='scores')return <PointsPage onBack={()=>setPage('home')} onGoPoints={()=>setPage('points')} onOpenQr={()=>{setPage('home');setScan(true)}} onProfile={()=>setPage('profile')}/>;if(page==='profile')return <ProfilePage onBack={()=>setPage('home')} onGoPoints={()=>setPage('points')} onOpenQr={()=>{setPage('home');setScan(true)}} onScores={()=>setPage('scores')}/>;if(page==='points')return <FeedingPoints points={points} onBack={()=>setPage('home')} onShowMap={point=>{setSelected(point);setPage('home');setFullMap(true)}} onProfile={()=>setPage('profile')} onScores={()=>setPage('scores')} onUpdate={(id,status)=>setPoints(items=>items.map(item=>item.id===id?{...item,status,updated:Date.now()}:item))}/>;if(page==='admin')return <Admin {...{points,setPoints,image,setImage}} onBack={()=>setPage('home')}/>;return <main><div className="phone"><header><div><small>AKDENİZ ÜNİVERSİTESİ</small><h1>Pati Haritası</h1><p>Kampüsteki dostlarımız için birlikte.</p></div><button><Bell/></button></header><div className="stats">{[[points.length,'Nokta'],[counts.today,'Bugün'],[counts.control,'Kontrol'],[counts.empty,'Acil']].map(x=><div><b>{x[0]}</b><span>{x[1]}</span></div>)}</div><section className="mapSec"><div className="title"><div><h2>Kampüs haritası</h2><p>Pati işaretlerine dokunarak incele</p></div><button onClick={()=>setPage('admin')}><Settings/> Yönet</button></div><MapView image={image} points={points} onPoint={setSelected} onExpand={()=>setFullMap(true)}/><p className="mapNote">* Bu harita, kampüsteki besleme noktalarının takibi amacıyla hazırlanmıştır; gerçek ölçek ve mesafeleri yansıtmaz.</p></section><section><h2>Hızlı işlemler</h2><div className="quick"><button onClick={()=>setScan(true)}><ScanLine/><b>QR kodu tara</b><span>Noktayı hızlı güncelle</span></button><button><CircleAlert/><b>Acil noktalar</b><span>Öncelikli alanları gör</span></button></div></section><nav>{[[Home,'Ana'],[MapPin,'Mama Noktaları'],[QrCode,'QR'],[Trophy,'Puanlar'],[PawPrint,'Profil']].map(([I,t])=><button onClick={()=>t==='QR'?setScan(true):t==='Mama Noktaları'?setPage('points'):t==='Profil'?setPage('profile'):t==='Puanlar'?setPage('scores'):null}><I/><span>{t}</span></button>)}</nav><Sheet point={selected} onClose={()=>setSelected(null)} onUpdate={s=>{setPoints(v=>v.map(x=>x.id===selected.id?{...x,status:s,updated:Date.now()}:x));setSelected(null)}}/>{fullMap&&<div className="mapOverlay"><MapView image={image} points={points} onPoint={setSelected} full onClose={()=>setFullMap(false)}/></div>}{scan&&<div className="scanner"><button onClick={()=>setScan(false)}><X/></button><h2>QR kodu tara</h2><div><ScanLine size={55}/></div><p>Mama noktasındaki QR kodu çerçevenin içine yerleştir.</p></div>}</div></main>}
