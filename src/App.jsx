import React,{useEffect,useMemo,useRef,useState}from"react";
import{supabase,supabaseConfigured}from"./supabase";
import{Bell,Camera,Check,ChevronLeft,ChevronRight,CircleAlert,Download,Edit3,Expand,Home,ImagePlus,LayoutDashboard,Map,MapPin,Minus,PawPrint,Plus,QrCode,Save,ScanLine,Settings,Shield,Trash2,UserRound,Users,Utensils,X,LogIn,LogOut,Mail,Lock,Building2,BookOpen,Eye,EyeOff}from"lucide-react";
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

function FeedingPoints({points,onBack,onShowMap,onUpdate,onProfile}){
 const[sort,setSort]=useState('priority');
 const[filter,setFilter]=useState('all');
 const[detail,setDetail]=useState(null);
 const priority={empty:0,urgent:1,warning:2,full:3};
 const filtered=[...points].filter(point=>filter==='all'||point.status===filter).sort((a,b)=>sort==='name'?a.name.localeCompare(b.name,'tr'):sort==='newest'?b.updated-a.updated:priority[a.status]-priority[b.status]||a.updated-b.updated);
 const update=status=>{onUpdate(detail.id,status);setDetail(current=>({...current,status,updated:Date.now()}));};
 return <main><div className="phone pointsPage"><header className="pointsHead"><button onClick={onBack}><ChevronLeft/></button><div><small>MAMA NOKTALARI</small><h1>Kampüs ihtiyaçları</h1><p>Öncelikli noktaları görüntüle ve hızlıca destek ol.</p></div></header><div className="filterRow"><button className={filter==='all'?'active':''} onClick={()=>setFilter('all')}>Tümü</button><button className={filter==='empty'?'active':''} onClick={()=>setFilter('empty')}>Acil</button><button className={filter==='urgent'?'active':''} onClick={()=>setFilter('urgent')}>Kontrol</button><button className={filter==='warning'?'active':''} onClick={()=>setFilter('warning')}>Azalıyor</button><button className={filter==='full'?'active':''} onClick={()=>setFilter('full')}>Dolu</button></div><div className="sortRow"><span>{filtered.length} nokta</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="priority">En acil</option><option value="newest">En son güncellenen</option><option value="name">A’dan Z’ye</option></select></div><section className="pointsList">{filtered.map(point=><article key={point.id} className="pointCard"><i className="statusLine" style={{background:S[point.status][1]}}/><div className="pointBody"><span className="pointBadge" style={{color:S[point.status][1],background:S[point.status][1]+'18'}}>{S[point.status][0]}</span><h2>{point.name}</h2><p><MapPin size={14}/>{point.area}</p><div className="pointMeta"><span><PawPrint size={14}/>{point.animals}</span><span>{ago(point.updated)}</span></div><div className="pointActions"><button onClick={()=>setDetail(point)}>Detaylar</button><button className="mapButton" onClick={()=>onShowMap(point)}><Map size={16}/> Haritada göster</button></div></div></article>)}</section><nav>{[[Home,'Ana'],[MapPin,'Mama Noktaları'],[QrCode,'QR'],[CircleAlert,'Acil'],[UserRound,'Profil']].map(([Icon,label])=><button key={label} className={label==='Mama Noktaları'?'activeNav':''} onClick={()=>label==='Ana'?onBack():label==='Profil'?onProfile():null}><Icon/><span>{label}</span></button>)}</nav>{detail&&<Sheet point={detail} onClose={()=>setDetail(null)} onUpdate={update}/>}</div></main>
}

function ProfilePage({onBack}){
 const[mode,setMode]=useState('login');
 const[session,setSession]=useState(null);
 const[profile,setProfile]=useState(null);
 const[loading,setLoading]=useState(true);
 const[busy,setBusy]=useState(false);
 const[message,setMessage]=useState('');
 const[error,setError]=useState('');
 const[showPassword,setShowPassword]=useState(false);
 const[pendingEmail,setPendingEmail]=useState('');
 const[form,setForm]=useState({firstName:'',lastName:'',email:'',password:'',confirmPassword:'',faculty:'',department:'',accepted:false});
 const change=(key,value)=>setForm(current=>({...current,[key]:value}));
 useEffect(()=>{
  if(!supabaseConfigured){setLoading(false);return;}
  supabase.auth.getSession().then(({data})=>{setSession(data.session);if(data.session)loadProfile(data.session.user.id);else setLoading(false)});
  const{data:listener}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next);if(next)loadProfile(next.user.id);else{setProfile(null);setLoading(false)}});
  return()=>listener.subscription.unsubscribe();
 },[]);
 async function loadProfile(id){setLoading(true);const{data,error}=await supabase.from('profiles').select('*').eq('id',id).single();if(error)setError('Profil bilgileri alınamadı: '+error.message);else setProfile(data);setLoading(false)}
 function resetNotice(){setError('');setMessage('')}
 async function login(e){e.preventDefault();resetNotice();setBusy(true);const{error}=await supabase.auth.signInWithPassword({email:form.email.trim(),password:form.password});if(error)setError(error.message);setBusy(false)}
 async function signup(e){e.preventDefault();resetNotice();if(form.password.length<8){setError('Şifre en az 8 karakter olmalı.');return}if(form.password!==form.confirmPassword){setError('Şifreler eşleşmiyor.');return}if(!form.accepted){setError('Kullanım ve gizlilik koşullarını kabul etmelisin.');return}setBusy(true);const{data,error}=await supabase.auth.signUp({email:form.email.trim(),password:form.password,options:{emailRedirectTo:window.location.origin,data:{first_name:form.firstName.trim(),last_name:form.lastName.trim(),faculty:form.faculty.trim(),department:form.department.trim()}}});if(error)setError(error.message);else if(!data.session){setPendingEmail(form.email.trim());setMessage('')}else{setMessage('Hesabın oluşturuldu ve giriş yapıldı.')}setBusy(false)}
 async function resendConfirmation(){resetNotice();setBusy(true);const{error}=await supabase.auth.resend({type:'signup',email:pendingEmail,options:{emailRedirectTo:window.location.origin}});if(error)setError(error.message);else setMessage('Doğrulama e-postası yeniden gönderildi. Spam ve Gereksiz klasörünü de kontrol et.');setBusy(false)}
 async function forgot(e){e.preventDefault();resetNotice();setBusy(true);const{error}=await supabase.auth.resetPasswordForEmail(form.email.trim(),{redirectTo:window.location.origin});if(error)setError(error.message);else setMessage('Şifre yenileme bağlantısı e-posta adresine gönderildi.');setBusy(false)}
 async function saveProfile(e){e.preventDefault();resetNotice();setBusy(true);const payload={first_name:profile.first_name.trim(),last_name:profile.last_name.trim(),faculty:profile.faculty?.trim()||null,department:profile.department?.trim()||null};const{data,error}=await supabase.from('profiles').update(payload).eq('id',session.user.id).select().single();if(error)setError(error.message);else{setProfile(data);setMessage('Profil bilgileri kaydedildi.')}setBusy(false)}
 async function logout(){await supabase.auth.signOut();setMode('login');setMessage('Oturum kapatıldı.')}
 if(!supabaseConfigured)return <main><div className="phone authPage"><ProfileHeader onBack={onBack}/><div className="authNotice error">Supabase bağlantısı bulunamadı. Vercel değişkenlerini kontrol edip yeniden yayınla.</div></div></main>;
 if(loading)return <main><div className="phone authPage"><ProfileHeader onBack={onBack}/><div className="authLoading"><PawPrint/><span>Profil yükleniyor...</span></div></div></main>;
 if(session&&profile)return <main><div className="phone authPage"><ProfileHeader onBack={onBack}/><section className="profileHero"><div className="avatar">{(profile.first_name?.[0]||'P').toUpperCase()}</div><div><span className="roleBadge">{profile.role==='super_admin'?'Ana Yönetici':profile.role==='moderator'?'Moderatör':'Üye'}</span><h2>{profile.first_name} {profile.last_name}</h2><p>{session.user.email}</p></div></section>{message&&<div className="authNotice success">{message}</div>}{error&&<div className="authNotice error">{error}</div>}<form className="authForm profileForm" onSubmit={saveProfile}><AuthField label="Ad" icon={<UserRound/>}><input value={profile.first_name||''} onChange={e=>setProfile({...profile,first_name:e.target.value})} required/></AuthField><AuthField label="Soyad" icon={<UserRound/>}><input value={profile.last_name||''} onChange={e=>setProfile({...profile,last_name:e.target.value})} required/></AuthField><AuthField label="Fakülte (isteğe bağlı)" icon={<Building2/>}><input value={profile.faculty||''} onChange={e=>setProfile({...profile,faculty:e.target.value})} placeholder="Örn. İletişim Fakültesi"/></AuthField><AuthField label="Bölüm (isteğe bağlı)" icon={<BookOpen/>}><input value={profile.department||''} onChange={e=>setProfile({...profile,department:e.target.value})} placeholder="Örn. Gazetecilik"/></AuthField><button className="authPrimary" disabled={busy}><Save/>{busy?'Kaydediliyor...':'Profili kaydet'}</button><button type="button" className="authSecondary logout" onClick={logout}><LogOut/>Çıkış yap</button></form><p className="supportLink">İstek, öneri ve şikâyet: <a href="mailto:akduhaysevpatiharitasi@gmail.com">akduhaysevpatiharitasi@gmail.com</a></p></div></main>;
 if(pendingEmail)return <main><div className="phone authPage"><ProfileHeader onBack={onBack}/><section className="verifyCard"><div className="verifyIcon"><Mail/></div><span className="verifyBadge">HESABIN OLUŞTURULDU</span><h2>E-postanı kontrol et</h2><p><b>{pendingEmail}</b> adresine doğrulama bağlantısı gönderdik. Hesabını etkinleştirmek için e-postadaki bağlantıya dokun.</p><div className="verifySteps"><span><b>1</b> Gelen kutunu aç</span><span><b>2</b> Doğrulama bağlantısına dokun</span><span><b>3</b> Pati Haritası'na dönüp giriş yap</span></div><div className="spamNote">E-posta görünmüyorsa Spam, Gereksiz veya Tanıtımlar klasörünü kontrol et.</div>{message&&<div className="authNotice success">{message}</div>}{error&&<div className="authNotice error">{error}</div>}<button className="authPrimary" onClick={resendConfirmation} disabled={busy}><Mail/>{busy?'Gönderiliyor...':'Doğrulama e-postasını tekrar gönder'}</button><button className="authSecondary" onClick={()=>{setPendingEmail('');setMode('login');resetNotice()}}><LogIn/>Giriş ekranına dön</button><button className="textButton" onClick={()=>{setPendingEmail('');setMode('signup');resetNotice()}}>E-posta adresini değiştir</button></section><p className="supportLink">Destek: <a href="mailto:akduhaysevpatiharitasi@gmail.com">akduhaysevpatiharitasi@gmail.com</a></p></div></main>;
 return <main><div className="phone authPage"><ProfileHeader onBack={onBack}/><section className="authIntro"><div className="authLogo"><PawPrint/></div><h2>{mode==='signup'?'Pati topluluğuna katıl':mode==='forgot'?'Şifreni yenile':'Tekrar hoş geldin'}</h2><p>{mode==='signup'?'Katkılarını güvenli biçimde kaydetmek için hesap oluştur.':mode==='forgot'?'Yenileme bağlantısı için e-posta adresini yaz.':'Mama noktalarını güncellemek için hesabına giriş yap.'}</p></section>{message&&<div className="authNotice success">{message}</div>}{error&&<div className="authNotice error">{error}</div>}<form className="authForm" onSubmit={mode==='signup'?signup:mode==='forgot'?forgot:login}>{mode==='signup'&&<><AuthField label="Ad" icon={<UserRound/>}><input value={form.firstName} onChange={e=>change('firstName',e.target.value)} required autoComplete="given-name"/></AuthField><AuthField label="Soyad" icon={<UserRound/>}><input value={form.lastName} onChange={e=>change('lastName',e.target.value)} required autoComplete="family-name"/></AuthField></>}<AuthField label="E-posta" icon={<Mail/>}><input type="email" value={form.email} onChange={e=>change('email',e.target.value)} required autoComplete="email"/></AuthField>{mode!=='forgot'&&<AuthField label="Şifre" icon={<Lock/>}><div className="passwordWrap"><input type={showPassword?'text':'password'} value={form.password} onChange={e=>change('password',e.target.value)} required autoComplete={mode==='signup'?'new-password':'current-password'}/><button type="button" onClick={()=>setShowPassword(v=>!v)}>{showPassword?<EyeOff/>:<Eye/>}</button></div></AuthField>}{mode==='signup'&&<><AuthField label="Şifre tekrarı" icon={<Lock/>}><input type="password" value={form.confirmPassword} onChange={e=>change('confirmPassword',e.target.value)} required autoComplete="new-password"/></AuthField><AuthField label="Fakülte (isteğe bağlı)" icon={<Building2/>}><input value={form.faculty} onChange={e=>change('faculty',e.target.value)} placeholder="Örn. İletişim Fakültesi"/></AuthField><AuthField label="Bölüm (isteğe bağlı)" icon={<BookOpen/>}><input value={form.department} onChange={e=>change('department',e.target.value)} placeholder="Örn. Gazetecilik"/></AuthField><label className="terms"><input type="checkbox" checked={form.accepted} onChange={e=>change('accepted',e.target.checked)}/><span>Kullanım ve gizlilik koşullarını kabul ediyorum.</span></label></>}<button className="authPrimary" disabled={busy}>{mode==='signup'?<UserRound/>:mode==='forgot'?<Mail/>:<LogIn/>}{busy?'Lütfen bekle...':mode==='signup'?'Hesap oluştur':mode==='forgot'?'Bağlantı gönder':'Giriş yap'}</button></form><div className="authSwitch">{mode==='login'&&<><button onClick={()=>{resetNotice();setMode('forgot')}}>Şifremi unuttum</button><p>Hesabın yok mu? <button onClick={()=>{resetNotice();setMode('signup')}}>Hesap oluştur</button></p></>}{mode!=='login'&&<button onClick={()=>{resetNotice();setMode('login')}}>Giriş ekranına dön</button>}</div><p className="supportLink">Destek: <a href="mailto:akduhaysevpatiharitasi@gmail.com">akduhaysevpatiharitasi@gmail.com</a></p></div></main>
}
function ProfileHeader({onBack}){return <header className="profileHeader"><button onClick={onBack}><ChevronLeft/></button><div><small>HESABIM</small><h1>Profil</h1></div></header>}
function AuthField({label,icon,children}){return <label className="authField"><span>{icon}{label}</span>{children}</label>}
function Admin({points,setPoints,image,setImage,onBack}){const [selected,setSelected]=useState(null);const [draft,setDraft]=useState(null);const input=useRef();function add(pos){setDraft({id:Date.now(),name:"Yeni Mama Noktası",area:"Kampüs",status:"full",updated:Date.now(),animals:"Hayvan sayısı girilmedi",text:"Konum tarifi ekleyin.",...pos})}function save(){if(!draft)return;setPoints(v=>v.some(x=>x.id===draft.id)?v.map(x=>x.id===draft.id?draft:x):[...v,draft]);setDraft(null)}function file(e){let f=e.target.files?.[0];if(!f)return;let r=new FileReader();r.onload=()=>{setImage(r.result)};r.readAsDataURL(f)}
return <div className="admin"><header className="adminHead"><button onClick={onBack}><ChevronLeft/></button><div><small>YÖNETİCİ PANELİ</small><h1>Pati kontrol merkezi</h1></div><Shield/></header><div className="adminStats"><div><b>{points.length}</b><span>Toplam nokta</span></div><div><b>{points.filter(x=>x.status==='empty'||x.status==='urgent').length}</b><span>Kontrol</span></div><div><b>{points.filter(x=>Date.now()-x.updated<86400000).length}</b><span>Bugün</span></div></div><div className="adminMap"><MapView image={image} points={points} admin onAdd={add} onPoint={q=>setDraft({...q})}/></div><div className="toolbar"><button onClick={()=>input.current.click()}><ImagePlus/> Haritayı değiştir</button><input ref={input} hidden type="file" accept="image/*" onChange={file}/><button onClick={()=>add({x:50,y:50})}><Plus/> Nokta ekle</button></div><section className="panel"><h2>Mama noktaları</h2>{points.map(q=><article key={q.id}><i style={{background:S[q.status][1]}}/><div><b>{q.name}</b><small>{q.area} · {ago(q.updated)}</small></div><button onClick={()=>setDraft({...q})}><Edit3/></button><button onClick={()=>setPoints(v=>v.filter(x=>x.id!==q.id))}><Trash2/></button></article>)}</section>{draft&&<div className="editor"><div className="editorHead"><h2>Nokta bilgileri</h2><button onClick={()=>setDraft(null)}><X/></button></div><label>Nokta adı<input value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label><label>Bölge<input value={draft.area} onChange={e=>setDraft({...draft,area:e.target.value})}/></label><label>Hayvan bilgisi<input value={draft.animals} onChange={e=>setDraft({...draft,animals:e.target.value})}/></label><label>Konum tarifi<textarea value={draft.text} onChange={e=>setDraft({...draft,text:e.target.value})}/></label><label>Durum<select value={draft.status} onChange={e=>setDraft({...draft,status:e.target.value})}>{Object.entries(S).map(([k,v])=><option value={k}>{v[0]}</option>)}</select></label><div className="coords">Harita konumu: %{draft.x} / %{draft.y}</div><button className="save" onClick={save}><Save/> Kaydet</button></div>}</div>}
export default function App(){const[page,setPage]=useState('home');const[fullMap,setFullMap]=useState(false);const[points,setPoints]=useState(()=>JSON.parse(localStorage.getItem('aph-points')||'null')||seed);const[image,setImage]=useState(`${import.meta.env.BASE_URL}kampus-haritasi.png?v=final-map-2`);const[selected,setSelected]=useState(null);const[scan,setScan]=useState(false);useEffect(()=>localStorage.setItem('aph-points',JSON.stringify(points)),[points]);const counts=useMemo(()=>({today:points.filter(x=>Date.now()-x.updated<86400000).length,control:points.filter(x=>x.status==='urgent').length,empty:points.filter(x=>x.status==='empty').length}),[points]);if(page==='profile')return <ProfilePage onBack={()=>setPage('home')}/>;if(page==='points')return <FeedingPoints points={points} onBack={()=>setPage('home')} onShowMap={point=>{setSelected(point);setPage('home');setFullMap(true)}} onProfile={()=>setPage('profile')} onUpdate={(id,status)=>setPoints(items=>items.map(item=>item.id===id?{...item,status,updated:Date.now()}:item))}/>;if(page==='admin')return <Admin {...{points,setPoints,image,setImage}} onBack={()=>setPage('home')}/>;return <main><div className="phone"><header><div><small>AKDENİZ ÜNİVERSİTESİ</small><h1>Pati Haritası</h1><p>Kampüsteki dostlarımız için birlikte.</p></div><button><Bell/></button></header><div className="stats">{[[points.length,'Nokta'],[counts.today,'Bugün'],[counts.control,'Kontrol'],[counts.empty,'Acil']].map(x=><div><b>{x[0]}</b><span>{x[1]}</span></div>)}</div><section className="mapSec"><div className="title"><div><h2>Kampüs haritası</h2><p>Pati işaretlerine dokunarak incele</p></div><button onClick={()=>setPage('admin')}><Settings/> Yönet</button></div><MapView image={image} points={points} onPoint={setSelected} onExpand={()=>setFullMap(true)}/><p className="mapNote">* Bu harita, kampüsteki besleme noktalarının takibi amacıyla hazırlanmıştır; gerçek ölçek ve mesafeleri yansıtmaz.</p></section><section><h2>Hızlı işlemler</h2><div className="quick"><button onClick={()=>setScan(true)}><ScanLine/><b>QR kodu tara</b><span>Noktayı hızlı güncelle</span></button><button><CircleAlert/><b>Acil noktalar</b><span>Öncelikli alanları gör</span></button></div></section><nav>{[[Home,'Ana'],[MapPin,'Mama Noktaları'],[QrCode,'QR'],[CircleAlert,'Acil'],[UserRound,'Profil']].map(([I,t])=><button onClick={()=>t==='QR'?setScan(true):t==='Mama Noktaları'?setPage('points'):t==='Profil'?setPage('profile'):null}><I/><span>{t}</span></button>)}</nav><Sheet point={selected} onClose={()=>setSelected(null)} onUpdate={s=>{setPoints(v=>v.map(x=>x.id===selected.id?{...x,status:s,updated:Date.now()}:x));setSelected(null)}}/>{fullMap&&<div className="mapOverlay"><MapView image={image} points={points} onPoint={setSelected} full onClose={()=>setFullMap(false)}/></div>}{scan&&<div className="scanner"><button onClick={()=>setScan(false)}><X/></button><h2>QR kodu tara</h2><div><ScanLine size={55}/></div><p>Mama noktasındaki QR kodu çerçevenin içine yerleştir.</p></div>}</div></main>}
