const map=document.querySelector('#map');
const canvas=document.querySelector('#canvas');
const pointers=new Map();
let scale=1.34;
let x=0;
let y=0;
let gesture={};
let frame=0;

function limits(nextScale=scale){
  const w=map.clientWidth;
  const h=map.clientHeight;
  const contentW=w*nextScale;
  const contentH=h*nextScale;
  return {x:Math.max(0,(contentW-w)/2),y:Math.max(0,(contentH-h)/2)};
}
function clamp(){
  const lim=limits();
  x=Math.max(-lim.x,Math.min(lim.x,x));
  y=Math.max(-lim.y,Math.min(lim.y,y));
}
function draw(){
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{canvas.style.transform=`translate3d(${x}px,${y}px,0) scale(${scale})`;});
}
function distance(values){
  const [a,b]=values;
  return Math.hypot(a.x-b.x,a.y-b.y);
}
function begin(e){
  e.preventDefault();
  map.setPointerCapture?.(e.pointerId);
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const values=[...pointers.values()];
  if(values.length===1) gesture={startX:values[0].x,startY:values[0].y,x,y};
  if(values.length===2) gesture={distance:distance(values),scale,x,y};
}
function move(e){
  if(!pointers.has(e.pointerId)) return;
  e.preventDefault();
  pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const values=[...pointers.values()];
  if(values.length===1){
    x=gesture.x+values[0].x-gesture.startX;
    y=gesture.y+values[0].y-gesture.startY;
    clamp();
    draw();
  }else if(values.length>=2){
    scale=Math.max(1,Math.min(4,gesture.scale*(distance(values)/Math.max(1,gesture.distance))));
    clamp();
    draw();
  }
}
function end(e){
  pointers.delete(e.pointerId);
  map.releasePointerCapture?.(e.pointerId);
  const values=[...pointers.values()];
  if(values.length===1) gesture={startX:values[0].x,startY:values[0].y,x,y};
  clamp();
  draw();
}
function zoom(delta){
  scale=Math.max(1,Math.min(4,scale+delta));
  clamp();
  draw();
}
map.addEventListener('pointerdown',begin,{passive:false});
map.addEventListener('pointermove',move,{passive:false});
map.addEventListener('pointerup',end);
map.addEventListener('pointercancel',end);
document.querySelector('#zoomIn').onclick=()=>zoom(.3);
document.querySelector('#zoomOut').onclick=()=>zoom(-.3);
document.querySelector('#reset').onclick=()=>{scale=1.34;x=0;y=0;draw();};
window.addEventListener('resize',()=>{clamp();draw();});
draw();
