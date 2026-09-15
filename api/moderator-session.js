import crypto from 'node:crypto';
export default function handler(req,res){
  const secret=process.env.SESSION_SECRET;
  if(!secret) return res.status(200).json({authenticated:false});
  const cookies=Object.fromEntries(String(req.headers.cookie||'').split(';').map(v=>v.trim().split('=')));
  const expected=crypto.createHmac('sha256',secret).update('akdeniz-pati-moderator').digest('hex');
  const got=String(cookies.pati_admin||'');
  const a=Buffer.from(got),b=Buffer.from(expected);
  const authenticated=a.length===b.length&&crypto.timingSafeEqual(a,b);
  return res.status(200).json({authenticated});
}
