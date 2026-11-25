// Map + documents: canvas painters (static base + dynamic state)
import {clamp,lerp,ss,rng,makeNoise,fbmOf,cnv,pix,hex,mix3,fitFont,spaced} from './lib.js';
const nP=makeNoise(77,256),fP=fbmOf(nP);

export function paperBase(w,h,{tint='#f3ead6',edge='#c9b48c',age=0,seed=1}={}){
  const t=hex(tint),e=hex(edge),st=hex('#b89a62');const r=rng(seed);const ox=r()*50,oy=r()*50;
  return pix(w,h,(x,y)=>{const u=x/w,v=y/h;const n=fP(u*6+ox,v*6*h/w+oy,5),fib=nP(x/1.6+ox,y/14+oy),fine=nP(x/2.2,y/2.2);
    let c=mix3(t,mix3(t,e,.5),n*.5);const ed=Math.min(u,1-u,v,1-v);c=mix3(c,e,(1-ss(0,.06,ed))*.55);
    if(age>0){const s=fP(u*3+ox+9,v*3+oy,4);c=mix3(c,st,ss(.58,.75,s)*age*.6)}
    const k=.965+fib*.04+fine*.025;return [c[0]*k,c[1]*k,c[2]*k]})}
const INK='#3b2a1c',SEP='#6b4a30',GOLD='#b08a45';

// ---------------- MAP ----------------
export const MAP={x0:-20,z0:-35,w:40,h:65,ppm:40};
const mx=x=>(x-MAP.x0)*MAP.ppm, mz=z=>(z-MAP.z0)*MAP.ppm;
export function mapBase(){const c=paperBase(MAP.w*MAP.ppm,MAP.h*MAP.ppm,{tint:'#efe3c8',edge:'#cdb488',seed:3});const g=c.getContext('2d');
  g.lineCap='round';g.lineJoin='round';
  // paddy fields
  g.strokeStyle='rgba(107,74,48,.55)';g.lineWidth=2;
  for(const side of [-1,1])for(let i=0;i<9;i++)for(let j=0;j<4;j++){const w=11,d=12;const x=side*(3.8+w/2+j*(w+.6)),z=9.8+d/2+i*(d+.6);g.strokeRect(mx(x-w/2),mz(z-d/2),w*40,d*40);
    // paddy marks
    g.fillStyle='rgba(107,74,48,.35)';const r=rng(i*10+j+(side>0?100:0));for(let k=0;k<10;k++){const px=mx(x-w/2+1+r()*(w-2)),pz=mz(z-d/2+1+r()*(d-2));g.fillRect(px-6,pz,12,2);g.fillRect(px-1,pz-9,2,9)}}
  // parcels
  const rect=(x0,z0,x1,z1,lw=3)=>{g.lineWidth=lw;g.strokeStyle=SEP;g.strokeRect(mx(x0),mz(z0),(x1-x0)*40,(z1-z0)*40)};
  rect(-10,-26,10,-6,4);rect(-20,-26,-10,-6);rect(10,-26,20,-6);rect(-20,-35,0,-26);rect(0,-35,20,-26);rect(-18,-6,12,8,4);rect(12,-6,20,8);rect(-20,-6,-18,8);
  // road (outer, government) and road strip 412 inside neighbour parcel
  g.lineWidth=3;g.strokeStyle=SEP;for(const x of [-2.2,2.2]){g.beginPath();g.moveTo(mx(x),mz(30));g.lineTo(mx(x),mz(-6));g.stroke()}
  g.setLineDash([10,8]);g.beginPath();g.moveTo(mx(-2.2),mz(8));g.lineTo(mx(2.2),mz(8));g.stroke();g.setLineDash([]);
  // wall with hatch
  g.lineWidth=5;g.strokeStyle=INK;for(const [a,b] of [[-20,-3],[3,12]]){g.beginPath();g.moveTo(mx(a),mz(8));g.lineTo(mx(b),mz(8));g.stroke()}
  // trees and palms
  const tree=(x,z,r)=>{g.strokeStyle='rgba(59,42,28,.7)';g.lineWidth=2;g.beginPath();g.arc(mx(x),mz(z),r*40,0,7);g.stroke();g.fillStyle='rgba(59,42,28,.5)';g.beginPath();g.arc(mx(x),mz(z),4,0,7);g.fill()};
  [[-9,3,1.8],[-14,-1,2],[12,1,1.8],[15,6,1.6]].forEach(t=>tree(...t));
  const palmS=(x,z)=>{g.strokeStyle='rgba(59,42,28,.7)';g.lineWidth=2;for(let i=0;i<8;i++){const a=i/8*6.283;g.beginPath();g.moveTo(mx(x),mz(z));g.lineTo(mx(x+Math.cos(a)*1.1),mz(z+Math.sin(a)*1.1));g.stroke()}};
  [[-4.6,12],[5.2,17],[-5.4,24],[-13,-29],[-7,-31],[8,-30],[14,-27],[17,-12],[-16,-14],[-18,2]].forEach(p=>palmS(...p));
  // numbers
  g.fillStyle=INK;g.textAlign='center';g.textBaseline='middle';
  const num=(n,x,z,s=64)=>{g.font=`500 ${s*.8}px NSL`;g.fillText(n,mx(x),mz(z))};
  num('418',0,-21,96);num('417',-15,-16);num('419',15,-16);num('420',-10,-30);num('421',10,-30);num('413',-10,1,84);num('414',16,1);
  g.save();g.translate(mx(0),mz(20));g.rotate(-Math.PI/2);g.font='600 46px CG';g.fillStyle=SEP;spaced(g,'ROAD · 401',0,0,6);g.restore();
  // north arrow + scale bar
  g.save();g.translate(mx(11.5),mz(-22.5));g.fillStyle=INK;g.beginPath();g.moveTo(0,-70);g.lineTo(20,20);g.lineTo(0,5);g.closePath();g.fill();g.strokeStyle=INK;g.lineWidth=2;g.beginPath();g.moveTo(0,-70);g.lineTo(-20,20);g.lineTo(0,5);g.stroke();
  g.font='600 40px CG';g.fillText('N',0,-100);g.restore();
  g.save();g.translate(mx(-12.5),mz(21.5));g.fillStyle=INK;for(let i=0;i<4;i++){g.fillStyle=i%2?'#efe3c8':INK;g.fillRect(i*80,0,80,14)}g.strokeStyle=INK;g.lineWidth=2;g.strokeRect(0,0,320,14);
  g.fillStyle=INK;g.font='500 30px CG';g.textAlign='left';g.fillText('0',-6,44);g.fillText('8 m',300,44);g.restore();
  // neat frame
  g.strokeStyle=INK;g.lineWidth=6;g.strokeRect(14,14,MAP.w*40-28,MAP.h*40-28);g.lineWidth=2;g.strokeRect(30,30,MAP.w*40-60,MAP.h*40-60);
  return c}
export function mapDraw(ctx,base,t,s){ // s: {trace 0..1, strip 0..1, label 0..1, green 0..1}
  ctx.drawImage(base,0,0);
  if(s.trace>0){ctx.save();ctx.strokeStyle='#b8862e';ctx.lineWidth=22;ctx.lineCap='round';ctx.globalAlpha=.9;const z0=26,z1=-5.4;const zz=lerp(z0,z1,s.trace);
    ctx.shadowColor='rgba(184,134,46,.6)';ctx.shadowBlur=24;ctx.beginPath();ctx.moveTo(mx(0),mz(z0));ctx.lineTo(mx(0),mz(zz));ctx.stroke();
    ctx.fillStyle='#b8862e';ctx.beginPath();ctx.arc(mx(0),mz(zz),18,0,7);ctx.fill();ctx.restore()}
  if(s.strip>0){ctx.save();ctx.globalAlpha=s.strip*.5;ctx.fillStyle=s.green>0?`rgb(${lerp(201,118,s.green)},${lerp(162,169,s.green)},${lerp(91,130,s.green)})`:'#c9a25b';ctx.fillRect(mx(-2.2),mz(-6),4.4*40,14*40);ctx.restore()}
  if(s.label>0){ctx.save();ctx.globalAlpha=s.label;const x=mx(0),y=mz(1);const r=90*(0.85+.15*s.label);
    ctx.fillStyle='#f6eed9';ctx.strokeStyle='#8a6b33';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.stroke();
    ctx.fillStyle=INK;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='700 74px NSL';ctx.fillText('412',x,y+4);ctx.restore()}
}

// ---------------- PATTA (Record of Rights) ----------------
export function pattaBase(){const W=1200,H=1620;const c=paperBase(W,H,{tint:'#f5edda',edge:'#ccb88e',seed:5});const g=c.getContext('2d');
  g.strokeStyle='#8a6b33';g.lineWidth=5;g.strokeRect(44,44,W-88,H-88);g.lineWidth=1.5;g.strokeRect(60,60,W-120,H-120);
  g.fillStyle=INK;g.textAlign='center';g.textBaseline='alphabetic';
  fitFont(g,'ଅଧିକାର ଅଭିଲେଖ','NSO,CG',700,70,900);g.fillText('ଅଧିକାର ଅଭିଲେଖ',W/2,185);
  g.font='600 26px IT';g.fillStyle='#8a6b33';spaced(g,'RECORD OF RIGHTS',W/2,232,9);
  g.strokeStyle='#8a6b33';g.lineWidth=2;g.beginPath();g.moveTo(140,262);g.lineTo(W-140,262);g.moveTo(140,270);g.lineTo(W-140,270);g.stroke();
  const rows=[['PLOT NO.','ପ୍ଲଟ ନଂ',330],['KHATA NO.','ଖାତା ନଂ',470],['OWNER','ମାଲିକ',640],['KISAM','କିସମ',860],['AREA','ରକବା',1060]];
  rows.forEach(([en,od,y],i)=>{g.textAlign='left';g.font='600 22px IT';g.fillStyle='#8a6b33';spaced(g,en,110,y+10,5,'left');g.font='500 40px NSO,CG';g.fillStyle='#5a4632';g.fillText(od,110,y+64);
    g.strokeStyle='rgba(107,74,48,.35)';g.lineWidth=1.5;const yb=i<4?[470,640,860,1060][i]-40:1180;g.beginPath();g.moveTo(100,yb);g.lineTo(W-100,yb);g.stroke()});
  g.strokeStyle='rgba(107,74,48,.35)';g.beginPath();g.moveTo(380,300);g.lineTo(380,1180);g.stroke();
  g.fillStyle=INK;g.textAlign='left';g.font='700 62px NSL';g.fillText('412',420,400);g.fillText('127',420,540);
  g.font='500 54px NSL';g.fillText('0.062',420,1126);g.font='italic 500 36px CGI';g.fillText('acre',600,1126);
  // footer rosette + lines
  g.save();g.translate(W-260,1380);g.strokeStyle='rgba(138,107,51,.45)';g.lineWidth=2;for(let i=0;i<36;i++){g.rotate(Math.PI/18);g.beginPath();g.ellipse(0,0,95,30,0,0,7);g.stroke()}g.restore();
  g.strokeStyle='rgba(59,42,28,.5)';g.lineWidth=2;g.beginPath();g.moveTo(130,1440);g.lineTo(520,1440);g.stroke();g.font='600 20px IT';g.fillStyle='#8a6b33';spaced(g,'VERIFIED ON BHULEKH',130,1478,4,'left');
  return c}
function tick(g,x,y,p,col,al=1){if(p<=0||al<=0)return;g.save();g.strokeStyle=col;g.lineWidth=7;g.lineCap='round';g.globalAlpha=Math.min(1,p*2)*al;g.beginPath();g.arc(x,y,40,0,7*Math.min(1,p*1.5)/1.1);g.stroke();
  const q=clamp((p-.4)/.6);g.beginPath();g.moveTo(x-18,y);g.lineTo(x-18+12*Math.min(1,q*2),y+12*Math.min(1,q*2));if(q>.5)g.lineTo(x-6+22*(q-.5)*2,y+12-26*(q-.5)*2);g.stroke();g.restore()}
export function pattaDraw(ctx,base,s){ // s: {own 0..1, kis 0..1, ownTick, kisTick, caution 0..1, under 0..1}
  ctx.drawImage(base,0,0);const vx=420,vw=560;
  const reveal=(text,y,p,size,col)=>{if(p<=0)return;ctx.save();ctx.textAlign='left';ctx.fillStyle=col;const fs=fitFont(ctx,text,'NSO,CG',700,size,vw);ctx.font=`700 ${fs}px NSO,CG`;
    const w=ctx.measureText(text).width;ctx.beginPath();ctx.rect(vx-10,y-fs*1.3,(w+30)*p+10,fs*1.9);ctx.clip();ctx.fillText(text,vx,y);ctx.restore()};
  const own=1-s.caution;
  ctx.save();ctx.globalAlpha=own;reveal('ଓଡ଼ିଶା ସରକାର',740,s.own,76,INK);reveal('ରାସ୍ତା',960,s.kis,80,INK);
  tick(ctx,1050,715,s.ownTick,'#3f7d4f',own);tick(ctx,1050,935,s.kisTick,'#3f7d4f',own);ctx.restore();
  if(s.caution>0){ctx.save();ctx.globalAlpha=s.caution;ctx.filter='blur(11px)';ctx.fillStyle=INK;ctx.textAlign='left';ctx.font='700 70px NSO,CG';ctx.fillText('ଶ୍ରୀ ରମାକାନ୍ତ ମହାନ୍ତି',vx,740);ctx.filter='none';
    ctx.fillStyle='rgba(59,42,28,.25)';ctx.font='700 60px NSO,CG';ctx.filter='blur(9px)';ctx.fillText('ଘରବାରି',vx,960);ctx.filter='none';ctx.restore();
    if(s.under>0){ctx.save();ctx.strokeStyle='#b8402a';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(vx,772);ctx.lineTo(vx+600*s.under,772+Math.sin(s.under*9)*2);ctx.stroke();ctx.restore()}}
}

// ---------------- SALE DEED + old papers ----------------
function fauxLines(g,x,y0,y1,w,step,seed,col='rgba(70,52,36,.32)',skip=[]){const r=rng(seed);g.fillStyle=col;let y=y0;let k=0;
  while(y<y1){if(!skip.some(([a,b])=>y>a&&y<b)){const para=(k%6===5);const L=para?w*(.35+r()*.3):w*(.86+r()*.14);
      let cx=x;while(cx<x+L){const ww=30+r()*90;const e=Math.min(cx+ww,x+L);g.beginPath();g.roundRect(cx,y,e-cx,9,4.5);g.fill();cx=e+14}}
    y+=step;k++}}
export function deedBase(){const W=1140,H=1560;const c=paperBase(W,H,{tint:'#f4ead2',edge:'#c9ae80',seed:9,age:.25});const g=c.getContext('2d');
  g.fillStyle=INK;g.textAlign='center';g.font='600 74px CG';spaced(g,'SALE DEED',W/2,160,14);
  fitFont(g,'ବିକ୍ରୟ କବଲା','NSO,CG',500,44,800);g.fillStyle='#5a4632';g.fillText('ବିକ୍ରୟ କବଲା',W/2,226);
  g.strokeStyle='#8a6b33';g.lineWidth=2;g.beginPath();g.moveTo(160,258);g.lineTo(W-160,258);g.stroke();
  fauxLines(g,100,320,1300,W-200,48,21,'rgba(70,52,36,.30)',[[760,880]]);
  // signatures
  g.strokeStyle='rgba(40,40,70,.0)';g.strokeStyle='rgba(52,40,30,.75)';g.lineWidth=3;g.lineCap='round';
  for(const [sx,sy,sd] of [[160,1400,1],[700,1410,2]]){const r=rng(sd);g.beginPath();g.moveTo(sx,sy);for(let i=0;i<9;i++)g.bezierCurveTo(sx+i*28+r()*20,sy-40*r(),sx+i*28+r()*20,sy+30*r(),sx+(i+1)*28,sy-8+r()*16);g.stroke()}
  return c}
export const DEED_LINE={pre:'…together with the ',key:'Right of Way',post:' over Plot No. 412.',y:830,x:100};
export function deedDraw(ctx,base,s){ctx.drawImage(base,0,0);const L=DEED_LINE;ctx.save();ctx.textAlign='left';ctx.textBaseline='alphabetic';
  const full=L.pre+L.key+L.post;const fs=fitFont(ctx,full,'CGI',500,52,940);ctx.font=`500 ${fs}px CGI`;
  const wPre=ctx.measureText(L.pre).width,wKey=ctx.measureText(L.key).width;
  if(s.hl>0){ctx.fillStyle=`rgba(214,170,80,${.55*s.hl})`;ctx.beginPath();ctx.roundRect(L.x+wPre-8,L.y-fs*.82,(wKey+16)*clamp(s.hl*1.2),fs*1.12,6);ctx.fill()}
  ctx.fillStyle='#3b2a1c';ctx.fillText(L.pre,L.x,L.y);ctx.fillStyle=s.hl>0?`rgb(${lerp(59,122,s.hl)},${lerp(42,78,s.hl)},${lerp(28,20,s.hl)})`:'#3b2a1c';
  ctx.font=`600 ${fs}px CGI`;ctx.fillText(L.key,L.x+wPre,L.y);const wKey2=ctx.measureText(L.key).width;ctx.font=`500 ${fs}px CGI`;ctx.fillStyle='#3b2a1c';ctx.fillText(L.post,L.x+wPre+wKey2,L.y);ctx.restore();
  return {cx:(L.x+wPre+wKey/2)/1140,cy:(L.y-fs*.3)/1560}}
export function oldPaper(seed,title){const W=1110,H=1500;const c=paperBase(W,H,{tint:'#e8d6ad',edge:'#b8935a',seed,age:1});const g=c.getContext('2d');
  g.fillStyle='rgba(59,42,28,.8)';g.textAlign='center';fitFont(g,title,'NSO,CG',700,52,800);g.fillText(title,W/2,170);
  fauxLines(g,100,260,1350,W-200,54,seed+3,'rgba(70,52,36,.28)');return c}

// ---------------- REGISTERED stamp paper ----------------
export function stampBase(){const W=1110,H=1500;const c=paperBase(W,H,{tint:'#f2ecd8',edge:'#c2b28a',seed:13});const g=c.getContext('2d');
  // guilloche band
  g.save();g.beginPath();g.rect(60,60,W-120,300);g.clip();g.fillStyle='rgba(111,138,106,.10)';g.fillRect(60,60,W-120,300);
  g.strokeStyle='rgba(88,112,84,.55)';g.lineWidth=1.2;for(let k=0;k<14;k++){g.beginPath();for(let x=60;x<=W-60;x+=3){const y=210+Math.sin(x/38+k*.45)*90*Math.cos(x/170+k*.2);x===60?g.moveTo(x,y):g.lineTo(x,y)}g.stroke()}g.restore();
  g.strokeStyle='rgba(88,112,84,.8)';g.lineWidth=4;g.strokeRect(60,60,W-120,300);
  g.save();g.translate(W/2,210);g.fillStyle='#f2ecd8';g.beginPath();g.arc(0,0,104,0,7);g.fill();g.strokeStyle='rgba(88,112,84,.9)';g.lineWidth=3;g.beginPath();g.arc(0,0,104,0,7);g.stroke();g.beginPath();g.arc(0,0,90,0,7);g.stroke();
  g.fillStyle='#4f6a4a';g.textAlign='center';g.font='700 58px NSL';g.fillText('₹100',0,22);g.restore();
  g.fillStyle=INK;g.textAlign='center';g.font='600 30px IT';spaced(g,'RIGHT OF WAY AGREEMENT',W/2,450,8);
  fitFont(g,'ବାଟ ଅଧିକାର ଚୁକ୍ତିନାମା','NSO,CG',700,50,850);g.fillStyle='#3b2a1c';g.fillText('ବାଟ ଅଧିକାର ଚୁକ୍ତିନାମା',W/2,525);
  g.strokeStyle='#8a6b33';g.lineWidth=2;g.beginPath();g.moveTo(160,560);g.lineTo(W-160,560);g.stroke();
  fauxLines(g,100,620,1120,W-200,48,31);
  g.strokeStyle='rgba(52,40,30,.75)';g.lineWidth=3;g.lineCap='round';const r=rng(4);g.beginPath();g.moveTo(140,1330);for(let i=0;i<8;i++)g.bezierCurveTo(140+i*30+r()*20,1290,150+i*30,1360,170+i*30,1320+r()*10);g.stroke();
  return c}
export const SEAL={x:800,y:1270};
const sealC=cnv(400,400);
export function stampDraw(ctx0,base,s){ctx0.drawImage(base,0,0);if(s.seal<=0)return;const p=s.seal;const ctx=sealC.getContext('2d');ctx.clearRect(0,0,400,400);ctx.save();ctx.translate(200,200);ctx.rotate(-.18);
  const k=1+(1-ss(0,.25,p))*.06;ctx.scale(k,k);ctx.globalAlpha=.88*ss(0,.12,p);ctx.strokeStyle='#a8352a';ctx.fillStyle='#a8352a';
  ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,150,0,7);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,128,0,7);ctx.stroke();ctx.beginPath();ctx.arc(0,0,74,0,7);ctx.stroke();
  ctx.font='600 30px IT';ctx.textAlign='center';const txt='REGISTERED · REGISTERED · ';const ch=[...txt];ch.forEach((c,i)=>{ctx.save();ctx.rotate(i/ch.length*Math.PI*2);ctx.fillText(c,0,-101);ctx.restore()});
  ctx.font='700 46px NSL';ctx.fillText('2026',0,16);
  // ink texture: knock out speckles
  ctx.globalCompositeOperation='destination-out';const r=rng(8);for(let i=0;i<260;i++){ctx.globalAlpha=.5*r();ctx.beginPath();ctx.arc((r()-.5)*320,(r()-.5)*320,r()*5,0,7);ctx.fill()}
  ctx.restore();ctx0.drawImage(sealC,SEAL.x-200,SEAL.y-200)}
