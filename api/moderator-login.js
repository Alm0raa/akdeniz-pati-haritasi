import crypto from 'node:crypto';
export default function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({ok:false});
  const password=String(req.body?.password||'');
  const expected=process.env.MODERATOR_PASSWORD;
  const secret=process.env.SESSION_SECRET;
  if(!expected||!secret) return res.status(503).json({ok:false,message:'Sunucu ayarları eksik.'});
  const a=Buffer.from(password),b=Buffer.from(expected);
  const valid=a.length===b.length&&crypto.timingSafeEqual(a,b);
  if(!valid) return res.status(401).json({ok:false,message:'Şifre yanlış.'});
  const token=crypto.createHmac('sha256',secret).update('akdeniz-pati-moderator').digest('hex');
  res.setHeader('Set-Cookie',`pati_admin=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`);
  return res.status(200).json({ok:true});
}
