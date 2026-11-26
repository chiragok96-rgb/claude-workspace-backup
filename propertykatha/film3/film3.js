// "The Dream Home" (PMAY-U 2.0) — PropertyKatha video 2. One continuous camera, three.js + canvas.
// window.render(t) draws the frame at time t (no captions: those are composited later in Python).
import * as THREE from 'three';
import {clamp,lerp,ss,sm,rng,cnv,tex,spaced} from './lib.js';

const W=1080,H=1920,DUR=57.16;
const out=document.getElementById('out'),O=out.getContext('2d');
const P=new URLSearchParams(location.search);
const NAVY='#13243f',GOLD='#e2b866',IVORY='#f3ead8';

async function fonts(){const L=[['700 60px NSO','ଘର'],['500 60px NSO','ଘର'],['600 60px CG','Home ₹'],['600 60px CGI','Loan'],['600 30px IT','EMI'],['500 30px IT','EMI'],['700 60px NSL','₹1']];
  await Promise.all(L.map(([f,s])=>document.fonts.load(f,s)));await document.fonts.ready}

let R,scene,cam,gl,sunL,hemi,houseG,solids=[],edges=[],winMats=[],stack={},tubes=[],cards={},ring,beam,dust,stars,paperMat,logo;
const KEYS=[ // t, camera pos, target, fov
 [0.0,[4.4,3.9,5.6],[0,1.0,0],40],[3.3,[6.6,3.3,9.2],[0,2.0,0],38],[8.9,[7.6,5.2,10.6],[0,2.8,0],42],
 [12.0,[8.2,4.4,12.2],[0,3.4,0],40],[17.2,[5.4,3.2,11.2],[0,4.4,0],40],[18.8,[9.5,4.6,10.5],[4.6,2.2,0],40],
 [29.7,[3.5,6.5,15.5],[2.4,2.0,0],40],[32.5,[0.5,12.5,12.8],[0,0,12.2],38],[35.4,[0.3,12.6,12.9],[0,0,12.3],38],
 [43.1,[0.0,12.8,13.0],[0,0,12.4],38],[47.8,[7.5,3.4,12.5],[0,2.6,0],40],[52.0,[3.6,3.0,9.4],[0,4.2,0],38],[57.2,[2.9,3.1,8.6],[0,4.5,0],38]];
function camAt(t){let i=0;while(i<KEYS.length-2&&t>KEYS[i+1][0])i++;const a=KEYS[i],b=KEYS[i+1];
  const u=sm(0,1,(t-a[0])/(b[0]-a[0]));const v=(p,q)=>p.map((x,k)=>lerp(x,q[k],u));
  // gentle continuous drift so the camera is never static
  const d=[Math.sin(t*.37)*.25,Math.sin(t*.29+1)*.12,Math.cos(t*.31)*.2];
  const tg=v(a[2],b[2]),ps=v(a[1],b[1]);const F=1.85;
  return {pos:ps.map((x,k)=>tg[k]+(x-tg[k])*F+d[k]),tgt:tg,fov:lerp(a[3],b[3],u)}}

// ---------------------------------------------------------------- textures
function blueprintTex(){const c=cnv(2048,2048),g=c.getContext('2d');g.fillStyle=NAVY;g.fillRect(0,0,2048,2048);
  const r=rng(3);for(let i=0;i<60000;i++){g.fillStyle=`rgba(255,255,255,${r()*.035})`;g.fillRect(r()*2048,r()*2048,1.4,1.4)}
  g.strokeStyle='rgba(160,190,240,.20)';g.lineWidth=1;for(let i=0;i<=2048;i+=32){g.beginPath();g.moveTo(i,0);g.lineTo(i,2048);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(2048,i);g.stroke()}
  g.strokeStyle='rgba(170,200,245,.38)';for(let i=0;i<=2048;i+=256){g.beginPath();g.moveTo(i,0);g.lineTo(i,2048);g.stroke();g.beginPath();g.moveTo(0,i);g.lineTo(2048,i);g.stroke()}
  return tex(c,3,3)}
function labelTex(w,h,draw){const c=cnv(w,h),g=c.getContext('2d');draw(g,w,h);return {c,g,t:tex(c)}}
function loanFile(g,w,h){g.fillStyle='#e9dfc8';g.fillRect(0,0,w,h);g.fillStyle='#8a2f24';g.fillRect(0,0,w,h*.16);
  g.fillStyle=IVORY;g.font='600 64px IT';g.textAlign='center';spaced(g,'HOME LOAN',w/2,h*.11,10);
  g.fillStyle='#3a2a1c';g.font='600 120px CG';g.fillText('₹ 25,00,000',w/2,h*.42);g.font='500 34px IT';g.fillStyle='#6b5a44';spaced(g,'SANCTION LETTER · 20 YEARS',w/2,h*.52,4);
  g.strokeStyle='rgba(60,40,20,.25)';g.lineWidth=4;for(let y=h*.6;y<h*.93;y+=40){g.beginPath();g.moveTo(w*.12,y);g.lineTo(w*(.5+.38*((y*7)%5)/5),y);g.stroke()}}
function emiCal(g,w,h){g.fillStyle='#f4efe3';g.fillRect(0,0,w,h);g.fillStyle='#24324d';g.fillRect(0,0,w,h*.2);
  g.fillStyle=IVORY;g.font='600 70px IT';g.textAlign='center';spaced(g,'EMI',w/2,h*.13,14);
  g.font='500 30px IT';g.fillStyle='#2a3350';const r=rng(5);
  for(let i=0;i<35;i++){const x=w*.12+(i%7)*w*.127,y=h*.3+Math.floor(i/7)*h*.13;g.fillText(String(i+1),x+20,y+30);
    if(i%7===4){g.strokeStyle='#a8352a';g.lineWidth=5;g.beginPath();g.arc(x+20,y+18,30,0,7);g.stroke()}}}
function coinTex(g,w,h){const gr=g.createLinearGradient(0,0,w,0);gr.addColorStop(0,'#8a6326');gr.addColorStop(.5,'#f2cf7e');gr.addColorStop(1,'#8a6326');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(80,55,20,.5)';for(let x=0;x<w;x+=6){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke()}}
function tubeLabel(g,w,h,od,en,lim){g.fillStyle='rgba(14,26,47,.0)';g.clearRect(0,0,w,h);g.fillStyle=IVORY;g.textAlign='center';
  g.font='700 66px NSO';g.fillText(od,w/2,90);g.fillStyle=GOLD;g.font='600 30px IT';spaced(g,en,w/2,140,5);g.fillStyle=IVORY;g.font='700 92px NSL';g.fillText(lim,w/2,250)}
function checklist(g,w,h,p1,p2){g.fillStyle='#f3ecdc';g.fillRect(0,0,w,h);g.strokeStyle='rgba(120,90,50,.35)';g.lineWidth=3;g.strokeRect(24,24,w-48,h-48);
  g.fillStyle='#24324d';g.textAlign='left';g.font='600 40px IT';spaced(g,'ELIGIBILITY',80,120,8,'left');g.fillStyle='#8a6326';g.fillRect(80,145,140,4);
  const rows=[['ନିଜର ପକ୍କା ଘର ନାହିଁ','No pucca house of your own',p1],['ଅନ୍ୟ Eligibility Rules','Other scheme rules',p2]];
  rows.forEach(([o,e,p],i)=>{const y=280+i*210;g.strokeStyle='#24324d';g.lineWidth=5;g.strokeRect(80,y-60,72,72);
    g.fillStyle='#1d2638';g.font='700 54px NSO';g.fillText(o,190,y-8);g.fillStyle='#6b5a44';g.font='500 30px IT';g.fillText(e,190,y+40);
    if(p>0){g.strokeStyle='#2f7d4f';g.lineWidth=11;g.lineCap='round';g.beginPath();const k=clamp(p*1.6);g.moveTo(92,y-26);
      g.lineTo(92+28*Math.min(1,k*2),y-26+26*Math.min(1,k*2));if(k>.5)g.lineTo(120+(k-.5)*2*48,y+0-(k-.5)*2*60);g.stroke()}})}
function browserCard(g,w,h,p){g.fillStyle='#f6f2ea';g.fillRect(0,0,w,h);g.fillStyle='#24324d';g.fillRect(0,0,w,90);
  ['#e06c5a','#e6b85c','#6fbf86'].forEach((c,i)=>{g.fillStyle=c;g.beginPath();g.arc(50+i*40,45,12,0,7);g.fill()});
  g.fillStyle='rgba(255,255,255,.14)';g.fillRect(180,24,w-220,42);g.fillStyle=IVORY;g.font='500 26px IT';g.textAlign='left';g.fillText('PMAY-U 2.0 · official website',200,55);
  g.fillStyle='#24324d';g.font='600 60px CG';g.fillText('Eligibility Check',60,200);g.fillStyle='#6b5a44';g.font='500 28px IT';
  ['Annual family income','Property value','Loan amount'].forEach((s,i)=>{const y=280+i*90;g.fillText(s,60,y);g.strokeStyle='rgba(36,50,77,.3)';g.lineWidth=2;g.strokeRect(60,y+14,w-120,44);
    if(p>i/3){g.fillStyle='#2f7d4f';g.font='600 30px IT';g.fillText('✓',w-110,y+46);g.font='500 28px IT';g.fillStyle='#6b5a44'}});}
function bankCard(g,w,h,p){g.fillStyle='#1f3b34';g.fillRect(0,0,w,h);g.strokeStyle='rgba(226,184,102,.7)';g.lineWidth=4;g.strokeRect(30,30,w-60,h-60);
  g.fillStyle=GOLD;g.font='600 44px IT';g.textAlign='center';spaced(g,'YOUR BANK',w/2,150,12);g.fillStyle=IVORY;g.font='600 74px CG';g.fillText('Home Loan Desk',w/2,270);
  g.font='500 30px IT';g.fillStyle='rgba(243,234,216,.8)';spaced(g,'ASK ABOUT PMAY-U 2.0',w/2,350,5);
  if(p>0){g.strokeStyle='#8fd4a2';g.lineWidth=12;g.lineCap='round';const k=clamp(p);g.beginPath();g.moveTo(w/2-70,470);g.lineTo(w/2-70+50*Math.min(1,k*2),470+50*Math.min(1,k*2));
    if(k>.5)g.lineTo(w/2-20+(k-.5)*2*110,520-(k-.5)*2*120);g.stroke()}}

// ---------------------------------------------------------------- house
function box(w,h,d,x,y,z,mat){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;houseG.add(m);solids.push(m);
  const e=new THREE.EdgesGeometry(m.geometry);const p=e.attributes.position.array;for(let i=0;i<p.length;i+=6)edges.push([[p[i]+x,p[i+1]+y,p[i+2]+z],[p[i+3]+x,p[i+4]+y,p[i+5]+z]]);return m}
function buildHouse(){houseG=new THREE.Group();scene.add(houseG);
  const wall=new THREE.MeshStandardMaterial({color:'#ece5d8',roughness:.85}),teak=new THREE.MeshStandardMaterial({color:'#6b3a1c',roughness:.55}),
    lat=new THREE.MeshStandardMaterial({color:'#9a4a2c',roughness:.9}),roof=new THREE.MeshStandardMaterial({color:'#d9d1c3',roughness:.8});
  const win=()=>{const m=new THREE.MeshStandardMaterial({color:'#2a2018',emissive:new THREE.Color('#ff9a40'),emissiveIntensity:0,roughness:.4});winMats.push(m);return m};
  box(7.6,.35,5.6,0,.175,0,lat);                         // plinth
  box(3.4,2.8,4.6,-1.9,1.75,0,wall);                      // ground left
  box(3.6,2.8,4.4,1.8,1.75,.1,win());                     // glass living room (glow)
  box(7.8,.22,5.8,0,3.26,0,roof);                         // slab
  box(5.2,2.5,4.4,.6,4.62,-.2,wall);                      // upper volume
  box(4.0,1.2,.08,.6,4.7,2.05,win());                     // upper window strip
  box(.9,2.1,.1,-1.0,1.4,2.32,teak);
  for(let i=0;i<5;i++)box(.07,2.7,.08,.1+i*.85,1.75,2.33,teak);   // mullions over the glass                      // door
  for(let i=0;i<13;i++)box(.07,1.6,.12,-1.2+i*.3,4.7,2.16,teak); // teak fins
  box(5.8,.2,4.8,.6,5.97,-.2,roof);                       // roof slab
  box(.9,1.3,.1,-2.6,1.8,2.32,win());                     // small window left
  for(const s of solids){s.material=s.material.clone();s.material.transparent=true}
  winMats.length=0;solids.forEach(s=>{if(s.material.emissive&&s.material.emissive.r>.5)winMats.push(s.material)})}

// ---------------------------------------------------------------- init
async function init(){await fonts();
  R=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});R.setSize(W,H);R.setPixelRatio(1);R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
  R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;gl=R.domElement;
  scene=new THREE.Scene();scene.background=new THREE.Color(NAVY);scene.fog=new THREE.Fog(NAVY,22,60);
  cam=new THREE.PerspectiveCamera(40,W/H,.1,200);
  hemi=new THREE.HemisphereLight('#9fb6e0','#1a2236',.55);scene.add(hemi);
  sunL=new THREE.DirectionalLight('#ffd7a0',1.6);sunL.position.set(-8,10,6);sunL.castShadow=true;sunL.shadow.mapSize.set(2048,2048);
  Object.assign(sunL.shadow.camera,{left:-14,right:14,top:14,bottom:-14,near:1,far:40});sunL.shadow.bias=-.0005;scene.add(sunL);
  paperMat=new THREE.MeshStandardMaterial({map:blueprintTex(),roughness:.95});const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),paperMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  const pool=new THREE.SpotLight('#ffcf8a',60,40,.55,.8,1.4);pool.position.set(2,14,8);pool.target.position.set(0,0,1);scene.add(pool,pool.target);
  buildHouse();
  const glow=new THREE.PointLight('#ffb25e',0,9,1.6);glow.position.set(1.8,2,3.2);scene.add(glow);st.glow=glow;
  // the burden: loan file, EMI calendar, coin stacks
  const lf=labelTex(1024,1400,loanFile),em=labelTex(1024,1100,emiCal),cn=labelTex(256,64,coinTex);
  const pm=(t)=>[new THREE.MeshStandardMaterial({color:'#d9ceb6',roughness:.9}),new THREE.MeshStandardMaterial({color:'#d9ceb6',roughness:.9}),new THREE.MeshStandardMaterial({color:'#d9ceb6',roughness:.9}),new THREE.MeshStandardMaterial({color:'#d9ceb6',roughness:.9}),new THREE.MeshStandardMaterial({map:t,roughness:.8}),new THREE.MeshStandardMaterial({color:'#cfc3a8'})];
  stack.loan=new THREE.Mesh(new THREE.BoxGeometry(5.0,6.8,.35),pm(lf.t));stack.emi=new THREE.Mesh(new THREE.BoxGeometry(4.6,4.9,.3),pm(em.t));
  stack.coins=new THREE.Group();const cm=new THREE.MeshStandardMaterial({map:cn.t,metalness:.45,roughness:.35,color:'#ffe0a0',emissive:'#6a4410',emissiveIntensity:.7});
  const cr=rng(8);for(let s=0;s<6;s++){const n=6+Math.floor(cr()*9),bx=-3.8+s*1.5+cr()*.3,bz=3.4+cr()*.8;for(let k=0;k<n;k++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.12,40),cm);c.position.set(bx+(cr()-.5)*.05,.06+k*.125,bz);c.castShadow=true;c.userData={k,s,r:cr()};stack.coins.add(c)}}
  for(const m of [stack.loan,stack.emi]){m.castShadow=m.receiveShadow=true}
  scene.add(stack.loan,stack.emi,stack.coins);
  // beam of light
  beam=new THREE.Mesh(new THREE.CylinderGeometry(1.2,4.2,16,48,1,true),new THREE.MeshBasicMaterial({color:'#ffe7b0',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));beam.position.set(0,8,0);scene.add(beam);
  // three eligibility tubes
  const tl=[['ବାର୍ଷିକ Income','ANNUAL INCOME','₹9 L'],['ଘରର Value','HOUSE VALUE','₹35 L'],['Home Loan','LOAN AMOUNT','₹25 L']];
  tl.forEach(([o,e,l],i)=>{const g=new THREE.Group();g.position.set(5.6+i*2.2,0,-.4+i*.8);
    const glass=new THREE.Mesh(new THREE.CylinderGeometry(.55,.55,4.2,48,1,true),new THREE.MeshStandardMaterial({color:'#bfd6ff',transparent:true,opacity:.18,roughness:.05,metalness:.2,side:THREE.DoubleSide}));glass.position.y=2.1;
    const fill=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,1,48),new THREE.MeshStandardMaterial({color:'#e2b866',emissive:'#7a5214',emissiveIntensity:.6,metalness:.6,roughness:.25}));
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.75,.8,.25,48),new THREE.MeshStandardMaterial({color:'#2a3654',metalness:.4,roughness:.5}));base.position.y=.12;
    const lab=labelTex(512,280,(gg,w,h)=>tubeLabel(gg,w,h,o,e,l));const plate=new THREE.Mesh(new THREE.PlaneGeometry(3.3,1.8),new THREE.MeshBasicMaterial({map:lab.t,transparent:true}));plate.position.set(0,5.5,0);
    g.add(glass,fill,base);g.userData={fill,plate,glass};scene.add(g);tubes.push(g)});
  ring=new THREE.Mesh(new THREE.RingGeometry(5.2,5.6,128),new THREE.MeshBasicMaterial({color:'#ffd27a',transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;scene.add(ring);
  // cards on the paper
  cards.check=labelTex(1024,760,(g,w,h)=>checklist(g,w,h,0,0));cards.web=labelTex(900,620,(g,w,h)=>browserCard(g,w,h,0));cards.bank=labelTex(900,620,(g,w,h)=>bankCard(g,w,h,0));
  for(const [k,sz] of [['check',[5.4,4.0]],['web',[4.4,3.03]],['bank',[4.4,3.03]]]){const m=new THREE.Mesh(new THREE.PlaneGeometry(...sz),new THREE.MeshStandardMaterial({map:cards[k].t,roughness:.85,transparent:true}));
    m.rotation.x=-Math.PI/2;m.castShadow=true;m.receiveShadow=true;scene.add(m);cards[k].m=m}
  // gold dust and stars
  const N=1400,pos=new Float32Array(N*3),r=rng(12);for(let i=0;i<N;i++){pos[i*3]=(r()-.5)*24;pos[i*3+1]=r()*2;pos[i*3+2]=(r()-.5)*16+3}
  dust=new THREE.Points(new THREE.BufferGeometry().setAttribute('position',new THREE.BufferAttribute(pos,3)),new THREE.PointsMaterial({color:'#ffd88a',size:.09,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false}));dust.userData.base=pos.slice();scene.add(dust);
  logo=await new Promise(res=>{const i=new Image();i.onload=()=>res(i);i.src='logo.png'});
  window.READY=true}
const st={};

// ---------------------------------------------------------------- per-frame state
function proj(v){const p=new THREE.Vector3(...v).project(cam);return [(p.x+1)/2*W,(1-p.y)/2*H,p.z]}
function update(t){const c=camAt(t);cam.position.set(...c.pos);cam.lookAt(...c.tgt);cam.fov=c.fov;cam.updateProjectionMatrix();
  // house: blueprint -> solid
  const rise=sm(1.75,3.2,t),glow=ss(2.7,3.4,t);
  houseG.scale.y=Math.max(.001,rise);solids.forEach(s=>s.material.opacity=ss(1.75,2.4,t));houseG.visible=t>1.74;
  const lit=glow*(1-.55*ss(5.6,8.8,t)*(1-ss(10.4,12.2,t)))*(1+.4*ss(27.7,29.6,t));winMats.forEach(m=>m.emissiveIntensity=.75*lit);st.glow.intensity=6*lit;
  // mood: day-dusk to darker burden, light returns
  const dark=ss(5.6,8.8,t)*(1-ss(10.4,12.6,t));sunL.intensity=1.6*(1-.55*dark)*(1-.6*ss(43.6,46,t));hemi.intensity=.55*(1-.3*dark);
  scene.background.set(NAVY);
  // burden objects drop on the words (Home Loan 6.35, EMI 7.45, coins 8.05)
  const drop=(t0,y1)=>{const k=clamp((t-t0)/.45);const b=k<1?(1-k*k)*7:0;const bo=k>=1?Math.exp(-(t-t0-.45)*8)*Math.abs(Math.sin((t-t0-.45)*22))*.18:0;return y1+b+bo};
  const lift=ss(10.6,13.5,t);
  stack.loan.position.set(-3.4,drop(6.35,3.4)+lift*9,3.3);stack.loan.rotation.set(-.06,.55,.1+lift*.6);stack.loan.visible=t>6.0&&lift<.999;
  stack.emi.position.set(3.6,drop(7.45,2.45)+lift*10,3.6);stack.emi.rotation.set(-.08,-.5,-.08-lift*.5);stack.emi.visible=t>7.1&&lift<.999;
  stack.coins.children.forEach(cn=>{const {k,s,r}=cn.userData;const t0=8.05+s*.06+k*.012;const kk=clamp((t-t0)/.25);cn.visible=t>t0-.3;
    const fl=ss(11.0+r*1.4,14.5+r,t);cn.position.y=.06+k*.125+(1-kk*kk)*4+fl*(7+r*5);cn.rotation.set(fl*r*3,fl*2,fl*r*2);cn.material.opacity=1});
  stack.coins.visible=t>7.6&&t<16;
  // beam
  beam.material.opacity=.16*ss(9.4,10.4,t)*(1-ss(16.5,18.5,t));
  // tubes: rise in 18.8-20, fill on each phrase
  const fills=[[19.6,21.9],[22.6,24.6],[25.1,27.2]];
  tubes.forEach((g,i)=>{const a=ss(18.8+i*.25,19.8+i*.25,t)*(1-ss(43.6,45.2,t));g.visible=a>0.001;g.scale.setScalar(Math.max(.001,a));
    const f=sm(fills[i][0],fills[i][1],t)*.86;const fm=g.userData.fill;fm.scale.y=Math.max(.001,f*4.1);fm.position.y=.25+f*4.1/2;
  });
  ring.material.opacity=.85*ss(27.7,29.4,t)*(1-ss(30.5,32,t))+.35*ss(45.5,47.5,t);
  // cards
  const cardIn=(m,t0,t1,x,z,ry)=>{const a=sm(t0,t0+.8,t)*(1-ss(t1,t1+.8,t));m.visible=a>0.001;m.material.opacity=a;m.position.set(x+(1-a)*-6,.02+(1-a)*1.5,z);m.rotation.z=ry*(1-.6*a)};
  cardIn(cards.check.m,30.1,35.1,0,12.3,.06);cardIn(cards.web.m,35.6,43.3,-2.25,12.0,.08);cardIn(cards.bank.m,36.4,43.3,2.4,12.8,-.07);
  redraw(cards.check,(g,w,h)=>checklist(g,w,h,ss(30.6,31.6,t),ss(33.2,34.4,t)),'c'+Math.round(ss(30.6,31.6,t)*30)+'_'+Math.round(ss(33.2,34.4,t)*30));
  redraw(cards.web,(g,w,h)=>browserCard(g,w,h,ss(40.9,42.4,t)),'w'+Math.round(ss(40.9,42.4,t)*3));
  redraw(cards.bank,(g,w,h)=>bankCard(g,w,h,ss(41.3,42.6,t)),'b'+Math.round(ss(41.3,42.6,t)*30));
  // gold dust rising into stars (43.6-47.8), faint all along later
  const dp=dust.geometry.attributes.position,b=dust.userData.base;const da=ss(43.4,44.4,t);dust.material.opacity=.9*da*(1-.5*ss(50,57,t));
  for(let i=0;i<dp.count;i++){const u=clamp((t-43.4-(i%37)*.02)/4.2);dp.array[i*3]=b[i*3]+Math.sin(i+t*.7)*.25*u;dp.array[i*3+1]=b[i*3+1]+u*u*(14+(i%11));dp.array[i*3+2]=b[i*3+2]}
  dp.needsUpdate=true;
  return {t}}
const _rd={};function redraw(o,fn,key){if(_rd[o.c.id||(o.c.id='x'+Math.random())]===key)return;_rd[o.c.id]=key;o.g.clearRect(0,0,o.c.width,o.c.height);fn(o.g,o.c.width,o.c.height);o.t.needsUpdate=true}

// ---------------------------------------------------------------- 2D overlay: gold blueprint lines with a glowing pen tip
function overlays(t){
  const d=sm(0,1.95,t*1.0+.12),fade=1-ss(2.2,3.3,t);if(fade<=0)return;
  const segs=edges.map(([a,b])=>[a.slice(),b.slice()]);let tot=0;const L=segs.map(([a,b])=>{const l=Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2]);tot+=l;return l});
  // the plan outline on the paper first, then walls
  O.save();O.lineCap='round';O.strokeStyle=GOLD;O.shadowColor='rgba(255,200,110,.9)';O.shadowBlur=14;O.lineWidth=3.2;O.globalAlpha=fade;
  let acc=0,tip=null;const lim=d*tot;const sc=houseG.scale.y;
  for(let i=0;i<segs.length;i++){if(acc>=lim)break;const [a,b]=segs[i];const k=clamp((lim-acc)/L[i]);acc+=L[i];
    const ya=t>1.74?a[1]*sc:a[1],yb=t>1.74?b[1]*sc:b[1];const pa=proj([a[0],ya,a[2]]),pb=proj([lerp(a[0],b[0],k),lerp(ya,yb,k),lerp(a[2],b[2],k)]);
    O.beginPath();O.moveTo(pa[0],pa[1]);O.lineTo(pb[0],pb[1]);O.stroke();tip=pb}
  if(tip&&d<.999){O.shadowBlur=30;O.fillStyle='#fff3d6';O.beginPath();O.arc(tip[0],tip[1],6,0,7);O.fill()}
  O.restore()}
function post(t){O.save();const g=O.createRadialGradient(540,900,520,540,960,1250);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(4,8,16,.45)');O.fillStyle=g;O.fillRect(0,0,W,H);O.restore()}

window.render=async function(t){t=clamp(t,0,DUR);update(t);R.render(scene,cam);O.clearRect(0,0,W,H);O.drawImage(gl,0,0);overlays(t);post(t);return true};
window.DUR=DUR;
init().then(()=>{const t0=parseFloat(P.get('t')||'0');window.render(t0)}).catch(e=>{console.error(e);window.ERR=String(e&&e.stack||e)});
