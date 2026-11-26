// "The Gate" — PropertyKatha video 1. One continuous camera. window.render(t) draws frame at time t.
import * as THREE from 'three';
import {clamp,lerp,ss,sm,env,rng,cnv,fitFont,spaced,spacedWidth,tex} from './lib.js';
import {buildWorld,softDot} from './world.js';
import * as D from './docs.js';

const W=1080,H=1920,DUR=55.56;
const out=document.getElementById('out'),O=out.getContext('2d');
const P=new URLSearchParams(location.search);

async function fonts(){const L=[['700 60px NSO','ଅଧିକାର'],['500 60px NSO','ଅଧିକାର'],['600 60px CG','Road ₹'],['700 60px CG','Road ₹'],['500 60px CG','Road'],['600 60px CGI','Right'],['500 60px CGI','Right'],['600 30px IT','ROAD'],['500 30px IT','ROAD'],['700 60px NSL','412 ₹'],['500 60px NSL','412']];
  await Promise.all(L.map(([f,s])=>document.fonts.load(f,s)));await document.fonts.ready}

let R,scene,cam,world,sun,hemi,papers={},mapMesh,mapCanvas,mapBaseC,mapT,logo,gl;
const st={};

function paperMesh(w,h,canvas){const t=tex(canvas);t.anisotropy=16;const g=new THREE.PlaneGeometry(w,h,24,24);
  const m=new THREE.MeshBasicMaterial({map:t,transparent:true,opacity:0,fog:false,toneMapped:false});
  const u={uCurl:{value:0},uPeel:{value:0},w:{value:w},h:{value:h}};
  m.onBeforeCompile=sh=>{Object.assign(sh.uniforms,u);sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uCurl,uPeel,w,h;')
    .replace('#include <begin_vertex>','#include <begin_vertex>\nfloat ex=position.x/(w*.5),ey=position.y/(h*.5);transformed.z+=uCurl*ex*ex*.5+uPeel*pow(max(ey,0.),2.)*1.4+uPeel*.15*ex*ey;')};
  m.customProgramCacheKey=()=>'paper';
  const mesh=new THREE.Mesh(g,m);mesh.rotation.x=-Math.PI/2;mesh.renderOrder=5;
  // soft shadow
  const sc=cnv(256,256),sg=sc.getContext('2d');sg.filter='blur(18px)';sg.fillStyle='#000';sg.fillRect(40,40,176,176);
  const sh=new THREE.Mesh(new THREE.PlaneGeometry(w*1.32,h*1.32),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(sc),transparent:true,opacity:0,depthWrite:false,fog:false,color:'#1a0f08'}));
  sh.rotation.x=-Math.PI/2;sh.renderOrder=4;
  scene.add(sh,mesh);return {mesh,m,t,u,sh,canvas,w,h,key:''}}

async function init(){
  await fonts();
  logo=new Image();logo.src='logo.png';await logo.decode();
  gl=document.createElement('canvas');gl.width=W;gl.height=H;
  R=new THREE.WebGLRenderer({canvas:gl,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  R.setPixelRatio(1);R.setSize(W,H,false);R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.0;
  R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap;
  scene=new THREE.Scene();scene.fog=new THREE.Fog('#e6c48f',60,380);
  cam=new THREE.PerspectiveCamera(52,W/H,.1,2000);
  world=buildWorld(scene);
  sun=new THREE.DirectionalLight('#ffd29a',3.3);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);
  const sc=sun.shadow.camera;sc.left=-46;sc.right=46;sc.top=46;sc.bottom=-46;sc.near=1;sc.far=320;sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;sun.shadow.radius=3;
  scene.add(sun,sun.target);sun.target.position.set(0,0,6);
  hemi=new THREE.HemisphereLight('#f6dcb4','#5d3a24',1.15);scene.add(hemi);
  // board text
  {const c=world.boardC,g=c.getContext('2d');const base=g.createLinearGradient(0,0,0,512);base.addColorStop(0,'#6a4632');base.addColorStop(1,'#553524');g.fillStyle=base;g.fillRect(0,0,1024,512);
    const r=rng(3);for(let i=0;i<900;i++){g.fillStyle=`rgba(${120+r()*60|0},${55+r()*30|0},${25+r()*15|0},${r()*.25})`;g.beginPath();g.arc(r()*1024,r()*512,r()*14,0,7);g.fill()}
    g.strokeStyle='rgba(30,18,10,.6)';g.lineWidth=10;g.strokeRect(12,12,1000,488);
    g.fillStyle='#f4efe3';g.textAlign='center';g.textBaseline='middle';const fs=fitFont(g,'ଏ ରାସ୍ତା ମୋ ଜମି','NSO,CG',700,150,880);g.font=`700 ${fs}px NSO,CG`;
    g.globalAlpha=.95;g.fillText('ଏ ରାସ୍ତା ମୋ ଜମି',512,262);g.globalAlpha=1;
    g.globalCompositeOperation='multiply';for(let i=0;i<400;i++){g.fillStyle=`rgba(150,90,50,${r()*.35})`;g.fillRect(r()*1024,r()*512,r()*20,r()*3)}g.globalCompositeOperation='source-over';
    world.boardT.needsUpdate=true}
  // map
  mapBaseC=D.mapBase();mapCanvas=cnv(mapBaseC.width,mapBaseC.height);mapT=tex(mapCanvas);mapT.anisotropy=16;
  mapMesh=new THREE.Mesh(new THREE.PlaneGeometry(D.MAP.w,D.MAP.h),new THREE.MeshBasicMaterial({map:mapT,transparent:true,opacity:0,fog:false,toneMapped:false,depthWrite:false}));
  mapMesh.rotation.x=-Math.PI/2;mapMesh.position.set(D.MAP.x0+D.MAP.w/2,.32,D.MAP.z0+D.MAP.h/2);mapMesh.renderOrder=3;scene.add(mapMesh);
  // papers
  st.pattaBase=D.pattaBase();st.deedBase=D.deedBase();st.stampBase=D.stampBase();
  papers.patta=paperMesh(8,10.8,cnv(1200,1620));
  papers.oldA=paperMesh(7.4,10,D.oldPaper(41,'ପୁରୁଣା ପଟ୍ଟା · ୧୯୭୮'));papers.oldB=paperMesh(7.4,10,D.oldPaper(52,'ଦାନପତ୍ର · ୧୯୯୧'));
  papers.deed=paperMesh(7.6,10.4,cnv(1140,1560));papers.stamp=paperMesh(7.4,10,cnv(1110,1500));
  for(const k of ['oldA','oldB'])papers[k].t.needsUpdate=true;
  makeGrain();makeDust2D();
  window.READY=true;
}

// ---------- camera path ----------
const K=[
 {t:0,p:[.5,1.6,31],l:[0,1.3,-14]},
 {t:3.6,p:[.38,1.55,22.6],l:[0,1.3,-12]},
 {t:6.0,p:[.2,1.5,14.3],l:[0,1.3,-8]},
 {t:6.8,p:[.14,1.48,12.9],l:[0,1.32,-6],hold:1},
 {t:10.9,p:[.1,1.45,11.85],l:[0,1.36,-4],hold:1},
 {t:13.6,p:[2.2,8.5,20.5],l:[0,.5,-1]},
 {t:16.6,p:[2.4,30,26],l:[0,0,-3]},
 {t:19.6,p:[0,95,-1.9],l:[0,0,-2],hold:1},
 {t:22.0,p:[0,72,-.3],l:[0,0,-.4]},
 {t:23.7,p:[0,36,2.1],l:[0,.4,-.1],hold:1},
 {t:28.6,p:[.3,34.2,1.9],l:[.25,.4,-.1]},
 {t:31.1,p:[.28,32.6,1.8],l:[.25,.4,-.05],hold:1},
 {t:32.3,p:[.28,32.5,1.8],l:[.25,.4,-.05],hold:1},
 {t:35.1,p:[.9,34,2.2],l:[.8,.4,-.1]},
 {t:37.7,p:[1.0,34.4,2.3],l:[.85,.4,-.1]},
 {t:40.2,p:[.55,33,2.1],l:[.45,.4,0]},
 {t:42.5,p:[.4,32.6,2.0],l:[.35,.4,0],hold:1},
 {t:44.5,p:[0,92,-1.9],l:[0,0,-2]},
 {t:46.3,p:[.6,26,46],l:[0,.5,-4]},
 {t:48.4,p:[.6,4.2,40.5],l:[0,1.3,-12]},
 {t:52.2,p:[.55,1.8,35],l:[0,1.3,-13]},
 {t:DUR,p:[.5,1.6,31],l:[0,1.3,-14]}];
function tangents(key){return K.map((k,i)=>{if(k.hold||i===0||i===K.length-1){
  if(!k.hold&&(i===0||i===K.length-1)){const a=K[1],b=K[0],c=K[K.length-1],d=K[K.length-2];// loop tangent: average of both ends
    const v0=b[key].map((x,j)=>(a[key][j]-x)/(a.t-b.t)),v1=c[key].map((x,j)=>(x-d[key][j])/(c.t-d.t));return v0.map((x,j)=>(x+v1[j])/2)}
  return [0,0,0]}const a=K[i-1],b=K[i+1];return b[key].map((x,j)=>(x-a[key][j])/(b.t-a.t))})}
const TP=tangents('p'),TL=tangents('l');
function herm(key,T,t){let i=0;while(i<K.length-2&&t>K[i+1].t)i++;const a=K[i],b=K[i+1];const dt=b.t-a.t;const s=clamp((t-a.t)/dt);
  const h00=2*s*s*s-3*s*s+1,h10=s*s*s-2*s*s+s,h01=-2*s*s*s+3*s*s,h11=s*s*s-s*s;
  return a[key].map((x,j)=>h00*x+h10*dt*T[i][j]+h01*b[key][j]+h11*dt*T[i+1][j])}

// ---------- 2D helpers ----------
let grains=[];function makeGrain(){for(let k=0;k<4;k++){const c=cnv(540,960),g=c.getContext('2d'),im=g.createImageData(540,960);const r=rng(90+k);
  for(let i=0;i<im.data.length;i+=4){const v=128+(r()-.5)*190;im.data[i]=im.data[i+1]=im.data[i+2]=v;im.data[i+3]=255}g.putImageData(im,0,0);grains.push(c)}}
let mouthPts=[];function makeDust2D(){const c=cnv(1080,240),g=c.getContext('2d');g.fillStyle='#fff';g.textAlign='center';g.textBaseline='middle';
  const fs=fitFont(g,'ମୁହଁ କଥାରେ ନୁହେଁ','NSO,CG',700,88,900);g.font=`700 ${fs}px NSO,CG`;g.fillText('ମୁହଁ କଥାରେ ନୁହେଁ',540,120);
  const d=g.getImageData(0,0,1080,240).data;const r=rng(17);for(let y=0;y<240;y+=3)for(let x=0;x<1080;x+=3){if(d[(y*1080+x)*4+3]>120)mouthPts.push([x,y,(r()-.2)*260,-(r())*160-40,r()])}
  st.mouthC=c}
function proj(x,y,z){const v=new THREE.Vector3(x,y,z).project(cam);return [(v.x+1)/2*W,(1-v.y)/2*H,v.z]}
function backing(y,w,a,light=0){if(a<=0)return;O.save();O.globalAlpha=Math.min(1,a*.42);O.translate(540,y);O.scale(Math.max(1,(w+300)/520),.62);const g=O.createRadialGradient(0,0,0,0,0,260);
  const bc=light?'246,236,214':'18,11,6';g.addColorStop(0,`rgba(${bc},.8)`);g.addColorStop(.5,`rgba(${bc},.42)`);g.addColorStop(1,`rgba(${bc},0)`);O.fillStyle=g;O.fillRect(-262,-262,524,524);O.restore()}
function hero(text,y,a,{size=88,color='#f4ecdc',lab=null,labCol='#d9b46a',it=null,rise=1,family='NSO,CG',weight=700,maxW=930,dark=0,back=1}={}){if(a<=0)return;if(dark){color='#2b1d12';labCol='#7a5a26'}
  const dy=(1-a)*14*rise;O.save();O.textAlign='center';O.textBaseline='alphabetic';let fs=fitFont(O,text,family,weight,size,maxW);O.font=`${weight} ${fs}px ${family}`;const w=O.measureText(text).width;
  if(!dark)backing(y-fs*.3+dy+(lab?14:0),w,a*back);O.globalAlpha=a;O.shadowColor=dark?'rgba(255,248,232,.9)':'rgba(12,6,2,.55)';O.shadowBlur=22;O.shadowOffsetY=3;O.fillStyle=color;O.fillText(text,540,y+dy);
  if(lab){O.shadowBlur=10;O.font='600 25px IT';O.fillStyle=labCol;const lw=spacedWidth(O,lab,5.5);if(lw>900){O.font='600 21px IT'};spaced(O,lab,540,y+dy+58,5.5)}
  if(it){O.shadowBlur=14;const f2=fitFont(O,it,'CGI',600,62,900);O.font=`600 ${f2}px CGI`;O.fillStyle='#d9b46a';O.fillText(it,540,y+dy+fs*.95+10)}
  O.restore()}
function label(text,x,y,a,col='#f4ecdc'){if(a<=0)return;x=clamp(x,200,880);y=clamp(y,300,1450);O.save();O.globalAlpha=a;O.font='600 22px IT';O.fillStyle=col;O.shadowColor='rgba(0,0,0,.6)';O.shadowBlur=10;spaced(O,text,x,y,4.5);O.restore()}
const inr=v=>{const s=String(Math.round(v));if(s.length<=3)return s;const last=s.slice(-3);let rest=s.slice(0,-3);const parts=[];while(rest.length>2){parts.unshift(rest.slice(-2));rest=rest.slice(0,-2)}if(rest)parts.unshift(rest);return parts.join(',')+','+last};

// ---------- per-frame scene state ----------
function slide(p,from,to,arc=.8){const e=sm(0,1,p);return [lerp(from[0],to[0],e),lerp(from[1],to[1],e)+Math.sin(Math.PI*e)*arc,lerp(from[2],to[2],e)]}
function placePaper(P,pos,rotY,op,curl=0,peel=0,tableY=.33){pos=[pos[0],pos[1],pos[2]+.5*(st.docDark||0)];P.mesh.position.set(...pos);P.mesh.rotation.set(-Math.PI/2,0,rotY);P.m.opacity=op;P.u.uCurl.value=curl;P.u.uPeel.value=peel;
  const h=Math.max(0,pos[1]-tableY);P.sh.position.set(pos[0]+h*.12,tableY+.01,pos[2]+h*.22);P.sh.rotation.set(-Math.PI/2,0,rotY);P.sh.scale.setScalar(1+h*.05);
  P.sh.material.opacity=op*clamp(.55-h*.06,.12,.55);P.mesh.visible=P.sh.visible=op>0.001}
function update(t){
  world.windUniform.value=t;world.skyU.uT.value=t;
  // camera
  const p=herm('p',TP,t),l=herm('l',TL,t);cam.position.set(...p);const dir=new THREE.Vector3(l[0]-p[0],l[1]-p[1],l[2]-p[2]).normalize();
  const top=ss(.8,.995,-dir.y);cam.up.set(0,1-top,-top).normalize();cam.lookAt(...l);cam.fov=lerp(52,30,top);
  // clang micro-shake (decays in ~0.3 s)
  if(t>6.45&&t<7.0){const k=Math.exp(-(t-6.45)*12)*.006;cam.position.y+=Math.sin((t-6.45)*70)*k;cam.position.x+=Math.sin((t-6.45)*53)*k*.6}
  cam.updateProjectionMatrix();
  // sun / sky (time-lapse 3.6–4.9)
  const tl=sm(3.55,4.95,t);const az=-.37+tl*Math.PI*2;const el=.16+Math.sin(tl*Math.PI)*.62;
  const sd=new THREE.Vector3(Math.sin(az)*Math.cos(Math.asin(el))*1,el,-Math.cos(az)*Math.cos(Math.asin(el))).normalize();
  world.skyU.sunDir.value.copy(sd);sun.position.copy(sd).multiplyScalar(140).add(sun.target.position);
  const noon=Math.sin(tl*Math.PI);
  world.skyU.zen.value.set('#b4c2bf').lerp(new THREE.Color('#a9bfc6'),noon);world.skyU.hor.value.set('#f0c98f').lerp(new THREE.Color('#ece3cf'),noon);world.skyU.glow.value.set('#ffb35e').lerp(new THREE.Color('#fff1d6'),noon);
  scene.fog.color.set('#e6c48f').lerp(new THREE.Color('#e4dfcf'),noon);sun.color.set('#ffcf94').lerp(new THREE.Color('#fff4e2'),noon);
  // flatten into map
  const f=ss(17.3,19.0,t)*(1-ss(44.0,45.4,t));world.tall.scale.y=1-f*.995;
  const mo=ss(17.6,19.1,t)*(1-ss(44.0,45.3,t));mapMesh.material.opacity=mo;mapMesh.visible=mo>0;
  const docDark=ss(22.2,23.4,t)*(1-ss(42.6,43.8,t));st.docDark=docDark;const caution=env(t,30.85,32.45,.5,.45);
  const tc=new THREE.Color(1,1,1).lerp(new THREE.Color(.34,.27,.21),docDark).multiplyScalar(1-caution*.45);mapMesh.material.color.copy(tc);
  R.shadowMap.autoUpdate=mo<.999;
  // map dynamic
  const ms={trace:ss(19.4,20.7,t),strip:ss(20.5,21.1,t),label:ss(20.8,21.4,t),green:0};const mk=[ms.trace,ms.strip,ms.label].map(x=>x.toFixed(3)).join();
  if(mo>0&&mk!==st.mapKey){D.mapDraw(mapCanvas.getContext('2d'),mapBaseC,t,ms);mapT.needsUpdate=true;st.mapKey=mk}
  // gate
  const OPEN=1.62;let ang=0,lop=0;
  if(t<6.0)ang=OPEN;else if(t<6.45){const q=(t-6.0)/.45;ang=OPEN*(1-Math.pow(q,2.3))}else if(t<45.8){ang=.055*Math.exp(-(t-6.45)*6)*Math.abs(Math.sin((t-6.45)*16))}else ang=OPEN*sm(45.8,47.7,t);
  lop=ss(3.95,4.75,t)*(1-ss(55.06,55.5,t));world.hingeL.rotation.y=ang;world.hingeR.rotation.y=ang;
  for(const lf of [world.leafL,world.leafR]){lf.material.opacity=lop;lf.visible=lop>0.01;lf.castShadow=lop>.5}
  // board + lock
  const bv=t>7.45&&t<44.2;world.board.visible=bv;if(bv){const d=1-sm(7.45,8.0,t);const sw=t>8.0?.32*Math.exp(-(t-8.0)*2.4)*Math.sin((t-8.0)*7.2):0;
    world.board.position.y=1.86+d*1.1;world.board.rotation.x=sw+Math.sin(t*1.3)*.012;world.bm.material.transparent=true;world.bm.material.opacity=ss(7.45,7.85,t)}
  const lv=t>8.4&&t<44.2;world.lock.visible=world.chain.visible=lv;if(lv){const q=sm(8.4,8.7,t);world.lock.position.y=.78+q*.14;world.lock.children[1].position.y=.09-ss(8.6,8.72,t)*.04;world.lock.rotation.z=(1-q)*.4+Math.sin(t*2.1)*.02}
  // grass on plot grows during the time-lapse, recedes before the loop
  const gr=ss(3.8,4.9,t)*(1-ss(52.6,55.4,t));const m4=new THREE.Matrix4(),sc=new THREE.Matrix4().makeScale(gr+.001,gr+.001,gr+.001);
  for(let i=0;i<world.pgBase.length;i++){m4.multiplyMatrices(world.pgBase[i],sc);world.plotGrass.setMatrixAt(i,m4)}world.plotGrass.instanceMatrix.needsUpdate=true;world.plotGrass.visible=gr>.01;
  // sold board gentle swing
  world.soldTag.rotation.x=Math.sin(t*1.7)*.03+(t>1.4&&t<3?.12*Math.exp(-(t-1.4)*3)*Math.sin((t-1.4)*9):0);
  // birds: egrets glide across the sky, loop-safe (period = DUR)
  world.birds.forEach((b,i)=>{const u=((t/DUR)+i*.013)%1;const x=lerp(-70,70,u),z=-60+Math.sin(u*6.28)*8,y=26+Math.sin(u*9+i)*1.5;b.g.position.set(x+b.off.x,y+b.off.y,z+b.off.z);b.g.rotation.y=-Math.PI/2;
    const fl=Math.sin(t*5.2+b.ph)*.55;b.wl.rotation.x=0;b.wl.rotation.z=fl;b.wr.rotation.z=-fl;b.g.visible=f<.5});
  // dust motes near camera, drifting in the light
  const dp=world.dp;world.dseed.forEach((s,i)=>{const ph=t*.12+s[3]*10;dp[i*3]=p[0]+(s[0]-.5)*12+Math.sin(ph)*.6;dp[i*3+1]=Math.max(.2,p[1]-1+s[1]*4+Math.sin(ph*1.3)*.3);dp[i*3+2]=p[2]-3-s[2]*14+Math.cos(ph)*.5});
  world.dust.geometry.attributes.position.needsUpdate=true;world.dust.visible=p[1]<10;world.dust.material.opacity=.7*(1-noon);
  // survey overlay
  const sv=ss(12.9,13.3,t)*(1-ss(18.4,19.2,t));world.lineMat.opacity=sv;world.ribbons.forEach(r=>{r.m.scale.x=Math.max(.0001,r.len*sm(r.t0,r.t1,t))});
  world.fillNb.material.opacity=.24*ss(14.6,15.6,t)*(1-ss(18.4,19.2,t));world.grayRoad.material.opacity=.5*ss(14.8,15.8,t)*(1-ss(18.4,19.2,t));world.survey.visible=sv>0;
  // ----- papers -----
  const Pt=papers.patta;
  {let pos,rot=0,op=0,peel=0,curl=0;
    if(t>=22.05&&t<43.9){op=ss(22.05,22.45,t);
      if(t<22.95){const q=sm(22.05,22.95,t);pos=[0,lerp(.34,3.4,q),lerp(1,.8,q)];peel=.9*q;rot=-.05*q}
      else if(t<23.75){const q=sm(22.95,23.75,t);pos=[0,lerp(3.4,.42,q),lerp(.8,.75,q)];peel=.9*(1-q)+Math.sin(q*Math.PI)*.15;rot=lerp(-.05,.012,q)}
      else{pos=[0,.42,.75];rot=.012;curl=.06*Math.exp(-(t-23.75)*3)*Math.sin((t-23.75)*8)}
      if(t>32.1){const q=sm(32.1,33.1,t);pos=[lerp(0,-3.2,q),.42+Math.sin(Math.PI*q)*.3,lerp(.75,1.4,q)];rot=lerp(.012,.07,q)}
      if(t>42.55){const q=sm(42.55,43.7,t);pos=[lerp(-3.2,0,q),lerp(.42,.34,q),lerp(1.4,1,q)];rot=lerp(.07,0,q);op=1-ss(43.1,43.85,t)}
      placePaper(Pt,pos,rot,op,curl,peel)} else placePaper(Pt,[0,.34,1],0,0);
    const s={own:ss(23.65,24.55,t),kis:ss(25.3,26.1,t),ownTick:ss(24.6,25.2,t),kisTick:ss(26.2,26.8,t),caution:ss(28.8,29.5,t),under:ss(30.0,30.9,t)};
    const k=Object.values(s).map(x=>x.toFixed(3)).join();if(Pt.m.opacity>0&&k!==Pt.key){D.pattaDraw(Pt.canvas.getContext('2d'),st.pattaBase,s);Pt.t.needsUpdate=true;Pt.key=k}
    const lit=1-caution*.55;Pt.m.color.setScalar(lerp(1,.93,docDark)*lit)}
  const slideIn=(Pp,t0,t1,from,to,rot0,rot1,arc,out0,outTo)=>{let pos,rot,op=0,curl=0;if(t<t0||t>out0+1.2){placePaper(Pp,from,rot0,0);return}
    const q=sm(t0,t1,t);pos=slide(q,from,to,arc);rot=lerp(rot0,rot1,q);op=ss(t0,t0+.25,t);curl=.35*Math.sin(Math.PI*q)+(t>t1?.05*Math.exp(-(t-t1)*3)*Math.sin((t-t1)*9):0);
    if(t>out0){const r=sm(out0,out0+1.0,t);pos=slide(r,to,outTo,.6);rot=lerp(rot1,rot1+.1,r);curl=.3*Math.sin(Math.PI*r);op=1-ss(out0+.6,out0+1.0,t)}
    placePaper(Pp,pos,rot,op,curl,0);Pp.m.color.setScalar(1-caution*.55)};
  slideIn(papers.oldA,31.95,32.85,[15,.5,-2],[1.7,.46,.2],.4,.15,.6,42.5,[16,.5,-1]);
  slideIn(papers.oldB,32.05,32.95,[15,.5,3],[1.1,.48,1.3],.3,-.09,.6,42.55,[16,.5,3]);
  slideIn(papers.deed,32.25,33.25,[16,.52,1],[.75,.52,.85],.25,-.028,.9,42.6,[17,.52,1]);
  slideIn(papers.stamp,37.85,38.75,[.4,.6,17],[.42,.6,.95],.0,.025,.9,42.55,[.4,.6,-18]);
  {const D2=papers.deed;const hl=ss(34.65,35.3,t);const k=hl.toFixed(3);if(D2.m.opacity>0&&k!==D2.key){st.deedHit=D.deedDraw(D2.canvas.getContext('2d'),st.deedBase,{hl});D2.t.needsUpdate=true;D2.key=k}
    if(!st.deedHit)st.deedHit=D.deedDraw(D2.canvas.getContext('2d'),st.deedBase,{hl:0})}
  {const S=papers.stamp;const seal=ss(39.85,40.3,t);const k=seal.toFixed(3);if(S.m.opacity>0&&k!==S.key){D.stampDraw(S.canvas.getContext('2d'),st.stampBase,{seal});S.t.needsUpdate=true;S.key=k}}
  sun.intensity=3.3*(1-mo);hemi.intensity=1.15;
  return {f,mo,docDark,caution,noon};
}

// ---------- overlays ----------
function overlays(t,S){
  // lamp pool on the table
  if(S.docDark>0){O.save();const g=O.createRadialGradient(540,1000,260,540,1000,1250);g.addColorStop(0,'rgba(10,6,3,0)');g.addColorStop(1,`rgba(10,6,3,${.7*S.docDark})`);O.fillStyle=g;O.fillRect(0,0,W,H);O.restore()}
  // caution: one light on the owner line
  if(S.caution>0){const pt=paperPt(papers.patta,700,720);O.save();const g=O.createRadialGradient(pt[0],pt[1],120,pt[0],pt[1],760);g.addColorStop(0,'rgba(5,3,2,0)');g.addColorStop(1,`rgba(5,3,2,${.78*S.caution})`);O.fillStyle=g;O.fillRect(0,0,W,H);O.restore()}
  // magnifier over "Right of Way"
  magnifier(t);stamp(t);
  // projected land labels
  if(t>14.6&&t<18.6){const a=env(t,14.9,18.5,.4,.5);const [x,y]=proj(-10,0,1.5);label("NEIGHBOUR'S LAND",x,y,a);const [x2,y2]=proj(0,0,-16);label('YOUR PLOT',x2,y2,a,'#f0d9a6')}
  // ---- words ----
  if(P.get('nowords')==='1')return;
  const ein=(a,b,fi=.3,fo=.35)=>env(t,a,b,fi,fo);
  if(t<2.75){const a=1-ss(2.35,2.75,t);const v=2000000*(1-Math.pow(1-ss(.0,1.35,t),3));
    O.save();O.globalAlpha=a;O.textAlign='center';backing(410,760,a*1.25);O.shadowColor='rgba(20,10,4,.5)';O.shadowBlur=26;
    const gd=O.createLinearGradient(0,330,0,450);gd.addColorStop(0,'#f6dc9c');gd.addColorStop(1,'#c89a4c');O.fillStyle=gd;O.font='700 132px NSL';O.fillText('₹'+inr(Math.round(v/1000)*1000),540,440);
    O.font='700 54px NSO,CG';O.fillStyle='#f4ecdc';O.shadowBlur=14;O.fillText('କୋଡ଼ିଏ ଲକ୍ଷ ଟଙ୍କାରେ Plot',540,528);O.restore()}
  hero('ତିନି ମାସ ପରେ',430,ein(3.6,5.35),{lab:'THREE MONTHS LATER'});
  hero('Gate ଲାଗିଗଲା',430,ein(6.42,7.4,.12,.35),{size:96,rise:0});
  hero('ସେ ଭୁଲ୍ କହୁନଥିଲେ',400,ein(10.96,12.65),{size:82,it:"He wasn't wrong."});
  hero('ସରକାରୀ Road ନୁହେଁ',400,ein(14.7,16.85),{size:90,lab:'NOT ALWAYS A GOVERNMENT ROAD'});
  hero('Advance ପୂର୍ବରୁ',400,ein(16.95,19.05),{size:92,lab:'BEFORE YOU PAY THE ADVANCE'});
  hero('Bhulekh Map',350,ein(19.1,21.9),{size:96,family:'CGI',weight:600,lab:"FIND THE ROAD'S PLOT NUMBER",dark:1});
  hero('ପଟ୍ଟା ଦେଖନ୍ତୁ',390,ein(22.45,23.95),{size:92,lab:'CHECK ITS PATTA · RECORD OF RIGHTS'});
  hero('ବଢ଼ିଆ, କିଛି tension ନାହିଁ',390,ein(26.85,28.65),{size:76,lab:'ALL CLEAR',labCol:'#9fd0a9'});
  hero('ବ୍ୟକ୍ତିଙ୍କ ନାମ ଥିଲେ',390,ein(28.8,31.0,.3,.25),{size:80,lab:"IF IT SHOWS A PERSON'S NAME"});
  hero('ସାବଧାନ୍',410,ein(31.05,32.4,.38,.4),{size:128,color:'#e0634a',lab:'CAUTION',labCol:'#e0634a',rise:.3});
  hero('Sale Deed · ପୁରୁଣା Documents',390,ein(32.45,34.55),{size:70});
  hero('Right of Way',400,ein(34.6,37.65),{size:116,family:'CGI',weight:600,color:'#e7c47e',lab:'IS THERE PROOF OF PASSAGE?'});
  hero('Registered କାଗଜରେ ବାଟ',390,ein(38.6,41.1),{size:80,lab:'TAKE IT ON REGISTERED PAPER'});
  // "ମୁହଁ କଥାରେ ନୁହେଁ" dissolves into dust
  if(t>41.15&&t<42.7){const a=ss(41.15,41.4,t);const p=ss(41.75,42.6,t);O.save();
    if(p<=0){O.globalAlpha=a*.95;backing(390,700,a);O.drawImage(st.mouthC,0,390-120-30)}
    else{backing(390,700,(1-p));O.fillStyle='#f4ecdc';for(const [x,y,vx,vy,r] of mouthPts){const q=clamp((p*1.25-r*.25));if(q>=1)continue;O.globalAlpha=(1-q)*.95;O.fillRect(x+vx*q*q,y+240+vy*q*q+120-120,2.6,2.6)}}
    O.globalAlpha=a*(1-p);O.font='600 25px IT';O.fillStyle='#d9b46a';O.textAlign='center';spaced(O,'NOT BY WORD OF MOUTH',540,448,5.5);O.restore()}
  hero('Gate ଲାଗିବା ପରେ ନୁହେଁ',390,ein(42.7,44.15),{size:76,color:'#e8dcc6'});
  hero('Advance ପୂର୍ବରୁ',340,ein(44.35,48.25),{size:92,back:1.8});
  hero('ରାସ୍ତାର ଅଧିକାର ନିଶ୍ଚିତ କରନ୍ତୁ',455,ein(45.9,48.25),{size:66,color:'#e7c47e',lab:'SECURE THE RIGHT OF WAY FIRST',back:2.2});
  hero('ଘରେ କେହି ଜମି କିଣିବାକୁ ଭାବୁଛନ୍ତି?',400,ein(48.4,50.6),{size:66});
  // share line (lower band) + end card (upper band)
  {const a=ein(50.55,55.05,.35,.45);if(a>0){hero('ତାଙ୍କୁ ପଠାନ୍ତୁ',1360,a,{size:74,lab:'SEND THIS TO THEM'});
    O.save();O.globalAlpha=a;O.translate(540,1250+(1-a)*10);O.strokeStyle='#e7c47e';O.lineWidth=5;O.lineCap='round';O.lineJoin='round';
    O.beginPath();O.moveTo(-26,22);O.lineTo(-26,6);O.quadraticCurveTo(-24,-14,6,-14);O.lineTo(14,-14);O.stroke();O.beginPath();O.moveTo(4,-28);O.lineTo(20,-14);O.lineTo(4,0);O.stroke();O.restore()}}
  {const a=ein(51.7,55.1,.5,.45);if(a>0){O.save();const y0=330+(1-a)*12;backing(y0+300,620,a*2.2,1);backing(y0+300,500,a*1.2,1);O.globalAlpha=a;
    O.shadowColor='rgba(10,5,2,.5)';O.shadowBlur=30;O.save();O.beginPath();O.arc(540,y0+130,130,0,7);O.clip();O.drawImage(logo,410,y0,260,260);O.restore();
    O.shadowBlur=0;O.strokeStyle='rgba(231,196,126,.9)';O.lineWidth=3;O.beginPath();O.arc(540,y0+130,134,0,7);O.stroke();
    O.textAlign='center';O.shadowBlur=22;O.shadowColor='rgba(255,246,228,.85)';O.fillStyle='#3b2416';O.font='700 90px CG';O.fillText('PropertyKatha',540,y0+372);
    O.font='600 24px IT';O.fillStyle='#7a5226';spaced(O,'ODISHA PROPERTY, EXPLAINED',540,y0+418,6);
    const pw=230,ph=64,py=y0+458;O.shadowBlur=0;O.fillStyle='#3b2416';O.beginPath();O.roundRect(540-pw/2,py,pw,ph,32);O.fill();O.fillStyle='#f0d9a0';O.font='600 26px IT';spaced(O,'FOLLOW',540,py+42,7);O.restore()}}
}
function paperPt(Pp,px,py){const m=Pp.mesh;const v=new THREE.Vector3((px/Pp.canvas.width-.5)*Pp.w,(.5-py/Pp.canvas.height)*Pp.h,0);m.updateMatrixWorld();v.applyMatrix4(m.matrixWorld);return proj(v.x,v.y,v.z)}
function magnifier(t){if(t<33.5||t>38.3||!st.deedHit)return;const Dd=papers.deed;const k=paperPt(Dd,st.deedHit.cx*1140,st.deedHit.cy*1560);
  const keys=[[33.5,420,760],[34.3,-230,-60],[35.15,0,0],[37.3,0,0],[38.3,620,820]];let i=0;while(i<keys.length-2&&t>keys[i+1][0])i++;const a=keys[i],b=keys[i+1];const q=sm(a[0],b[0],t);
  const cx=k[0]+lerp(a[1],b[1],q),cy=k[1]+lerp(a[2],b[2],q)+Math.sin(t*1.9)*2.5;const r=150,mag=1.55;
  O.save();O.globalAlpha=.35;O.fillStyle='#0c0703';O.filter='blur(16px)';O.beginPath();O.ellipse(cx+34,cy+46,r,r*.96,0,0,7);O.fill();O.filter='none';O.restore();
  // handle
  O.save();O.translate(cx,cy);O.rotate(.72);const hg=O.createLinearGradient(-18,0,18,0);hg.addColorStop(0,'#2a170c');hg.addColorStop(.5,'#5a351c');hg.addColorStop(1,'#20120a');O.fillStyle=hg;O.beginPath();O.roundRect(-20,r+30,40,250,18);O.fill();
  const bg=O.createLinearGradient(-22,0,22,0);bg.addColorStop(0,'#8a6526');bg.addColorStop(.5,'#e9c97e');bg.addColorStop(1,'#7a5520');O.fillStyle=bg;O.fillRect(-22,r+4,44,34);O.restore();
  // lens content
  O.save();O.beginPath();O.arc(cx,cy,r,0,7);O.clip();O.translate(cx,cy);O.scale(mag,mag);O.translate(-cx,-cy);O.drawImage(gl,0,0);O.restore();
  O.save();const gg=O.createRadialGradient(cx-60,cy-70,10,cx,cy,r);gg.addColorStop(0,'rgba(255,255,255,.22)');gg.addColorStop(.5,'rgba(255,255,255,.03)');gg.addColorStop(1,'rgba(40,30,20,.18)');O.fillStyle=gg;O.beginPath();O.arc(cx,cy,r,0,7);O.fill();
  const rg=O.createLinearGradient(cx-r,cy-r,cx+r,cy+r);rg.addColorStop(0,'#f1d48c');rg.addColorStop(.45,'#9a7330');rg.addColorStop(.7,'#e2bf74');rg.addColorStop(1,'#6e4d1c');O.strokeStyle=rg;O.lineWidth=18;O.beginPath();O.arc(cx,cy,r+8,0,7);O.stroke();
  O.strokeStyle='rgba(255,240,200,.5)';O.lineWidth=2;O.beginPath();O.arc(cx,cy,r-1,0,7);O.stroke();O.restore()}
function stamp(t){if(t<38.95||t>40.9)return;const S=papers.stamp;const pt=paperPt(S,D.SEAL.x,D.SEAL.y);
  let h;if(t<39.85)h=1-sm(38.95,39.85,t);else if(t<40.05)h=0;else h=sm(40.05,40.85,t);
  const cx=pt[0]+h*260,cy=pt[1]-h*520;const rr=96*(1+h*.55)*(t>39.83&&t<40.05?.985:1);
  O.save();O.globalAlpha=.45*(1-h*.5);O.filter=`blur(${8+h*26}px)`;O.fillStyle='#0b0603';O.beginPath();O.arc(pt[0]+h*120+18,pt[1]-h*40+22,96*(1+h*.2),0,7);O.fill();O.filter='none';O.restore();
  O.save();O.globalAlpha=ss(38.95,39.2,t)*(1-ss(40.6,40.85,t));const g=O.createRadialGradient(cx-rr*.35,cy-rr*.4,rr*.1,cx,cy,rr);g.addColorStop(0,'#8c5a33');g.addColorStop(.6,'#5a3519');g.addColorStop(1,'#2e1a0c');
  O.fillStyle=g;O.beginPath();O.arc(cx,cy,rr,0,7);O.fill();O.strokeStyle='#c9a25b';O.lineWidth=7;O.beginPath();O.arc(cx,cy,rr*.98,0,7);O.stroke();
  const k=O.createRadialGradient(cx-rr*.15,cy-rr*.2,2,cx,cy,rr*.42);k.addColorStop(0,'#a0703f');k.addColorStop(1,'#3a2210');O.fillStyle=k;O.beginPath();O.arc(cx,cy,rr*.42,0,7);O.fill();O.restore()}

function post(t){O.save();const g=O.createRadialGradient(540,900,560,540,960,1250);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(14,8,4,.38)');O.fillStyle=g;O.fillRect(0,0,W,H);
  O.globalCompositeOperation='overlay';O.globalAlpha=.07;O.drawImage(grains[Math.floor(t*30)%4],0,0,W,H);O.restore()}

window.render=async function(t){t=clamp(t,0,DUR);const S=update(t);R.render(scene,cam);O.clearRect(0,0,W,H);O.drawImage(gl,0,0);overlays(t,S);post(t);return true};
window.DUR=DUR;
init().then(()=>{const t0=parseFloat(P.get('t')||'0');window.render(t0)}).catch(e=>{console.error(e);window.ERR=String(e&&e.stack||e)});
