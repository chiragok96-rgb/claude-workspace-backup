// The 3D land: plot, road, wall + gate, paddy, palms, trees, sky, birds, dust
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {clamp,lerp,ss,rng,makeNoise,fbmOf,cnv,pix,tex,hex,mix3} from './lib.js';

const nA=makeNoise(11,256), fA=fbmOf(nA);
const nB=makeNoise(23,64), fB=fbmOf(nB);

export const WIND={t:0};
const windUniform={value:0};
// vertex wind: needs attribute aw (0 base..1 tip)
function addWind(mat,amp=0.25,freq=1.6){
  mat.onBeforeCompile=sh=>{sh.uniforms.uTime=windUniform;
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute float aw;uniform float uTime;')
    .replace('#include <begin_vertex>',`#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 wp0=(modelMatrix*instanceMatrix*vec4(0.,0.,0.,1.)).xyz;
      #else
        vec3 wp0=(modelMatrix*vec4(0.,0.,0.,1.)).xyz;
      #endif
      float ph=wp0.x*0.21+wp0.z*0.17;
      float g=sin(uTime*${freq.toFixed(2)}+ph)*0.6+sin(uTime*${(freq*2.3).toFixed(2)}+ph*1.7)*0.3+sin(uTime*${(freq*5.1).toFixed(2)}+position.x*3.0)*0.12;
      float w=aw*aw*${amp.toFixed(3)};
      transformed.x+=g*w; transformed.z+=g*w*0.55; transformed.y-=abs(g)*w*0.25;`)};
  mat.customProgramCacheKey=()=>'wind'+amp+freq;
}
function setAW(geo,fn){const p=geo.attributes.position,a=new Float32Array(p.count);for(let i=0;i<p.count;i++)a[i]=fn(p.getX(i),p.getY(i),p.getZ(i));geo.setAttribute('aw',new THREE.BufferAttribute(a,1));return geo}

// ---------- textures ----------
function groundCanvas(){const S=1024;const dry=hex('#8f8a4c'),grn=hex('#6b7a3a'),lat=hex('#9c5a38'),dk=hex('#5c5a2e');
  return pix(S,S,(x,y)=>{const u=x/S*16,v=y/S*16;const f=fA(u*4,v*4,5),g=fA(u*16+40,v*16,3),h=nA(u*64,v*64);
    let c=mix3(grn,dry,ss(.35,.7,f));c=mix3(c,lat,ss(.62,.8,fA(u*2+9,v*2+3,4))*.75);c=mix3(c,dk,(1-g)*.35);const k=.86+h*.22;return [c[0]*k,c[1]*k,c[2]*k]})}
function roadCanvas(){const Wd=512,Ht=1024;const base=hex('#c0774a'),rut=hex('#93522f'),edge=hex('#8a8448');
  return pix(Wd,Ht,(x,y)=>{const u=x/Wd,v=y/Ht;const n=fB(u*8,v*16,4),fine=nB(u*90,v*180);
    let c=mix3(base,hex('#b06a40'),n);for(const r of [.3,.7]){const d=Math.abs(u-r-(nB(v*8,3)-.5)*.04);c=mix3(c,rut,(1-ss(.02,.07,d))*.55)}
    const cr=Math.abs(u-.5);c=mix3(c,hex('#9a7a46'),(1-ss(.0,.05,cr))*.25*n);
    const pebble=fine>.86?.75:1;let k=(.9+fine*.16)*pebble;
    const e=Math.min(u,1-u)+(fB(v*20,u*3+5,3)-.5)*.06;const a=ss(.02,.13,e);c=mix3(edge,c,ss(.05,.16,e));
    return [c[0]*k,c[1]*k,c[2]*k,255*a]})}
function plotCanvas(){const S=1024;const base=hex('#a5502c'),dk=hex('#7d3a20'),lt=hex('#c06a3e');
  return pix(S,S,(x,y)=>{const u=x/S,v=y/S;const n=fA(u*10,v*10,5),f=nA(u*200,v*200);let c=mix3(base,lt,ss(.4,.75,n));
    const till=Math.sin(v*Math.PI*2*46+nA(u*6,v*6)*2)*.5+.5;c=mix3(c,dk,ss(.75,1,till)*.28);
    c=mix3(c,hex('#3a2416'),f>.9?.45:0);const e=Math.min(u,1-u,v,1-v)+(fA(u*30,v*30,3)-.5)*.03;const a=ss(.0,.04,e);const k=.9+f*.14;return [c[0]*k,c[1]*k,c[2]*k,255*a]})}
function paddyCanvas(){const S=512;const g1=hex('#6f9a3e'),g2=hex('#4f7a2c'),wt=hex('#9aa86a');
  return pix(S,S,(x,y)=>{const u=x/S,v=y/S;const row=Math.sin(u*Math.PI*2*24)*.5+.5;const n=fB(u*8,v*8,4),f=nB(u*120,v*120);
    let c=mix3(g2,g1,ss(.3,.8,row*.6+n*.5));c=mix3(c,wt,(1-ss(0,.25,row))*.25);const k=.9+f*.18;return [c[0]*k,c[1]*k,c[2]*k]})}
function wallCanvas(){const Wd=512,Ht=256;const lat=hex('#a3583a'),dk=hex('#6d3420'),mor=hex('#c9b08c');
  return pix(Wd,Ht,(x,y)=>{const bw=Wd/4,bh=Ht/4;const row=Math.floor(y/bh);const off=row%2?bw/2:0;const bx=(x+off)%bw,by=y%bh;
    const m=Math.min(bx,bw-bx,by,bh-by);const n=fA(x/40,y/40,4),f=nA(x/3,y/3);let c=mix3(lat,hex('#b8684a'),n);
    if(f>.82)c=mix3(c,dk,.7);c=mix3(mor,c,ss(1.5,4,m));const k=.88+nA(x/6+50,y/6)*.2;return [c[0]*k,c[1]*k,c[2]*k]})}
function barkCanvas(){return pix(64,256,(x,y)=>{const ring=Math.sin(y/256*Math.PI*2*22)*.5+.5;const n=nA(x/8,y/4);let c=mix3(hex('#6b5843'),hex('#8f7b62'),ring*.6+n*.4);return c})}
function frondCanvas(){const c=cnv(512,128),g=c.getContext('2d');const R=rng(5);
  g.strokeStyle='#6b6a2e';g.lineWidth=5;g.beginPath();g.moveTo(0,64);g.lineTo(512,64);g.stroke();
  for(let i=0;i<120;i++){const x=6+i*4.2;const L=(1-x/560)*62+12;for(const s of [-1,1]){const ang=s*(0.55+R()*.25);
    const col=['#3f6a2a','#4b7a30','#5a8838','#36602a'][Math.floor(R()*4)];g.fillStyle=col;g.beginPath();
    const ex=x+Math.cos(ang)*L*.55+L*.45,ey=64+Math.sin(ang)*L;g.moveTo(x,64);g.quadraticCurveTo(x+L*.3,64+Math.sin(ang)*L*.5+s*2,ex,ey);
    g.quadraticCurveTo(x+L*.32,64+Math.sin(ang)*L*.5-s*3,x+3,64);g.fill();g.strokeStyle=col;g.lineWidth=2.5;g.stroke()}}return c}
function grassCanvas(){const c=cnv(128,128),g=c.getContext('2d');const R=rng(9);
  for(let i=0;i<26;i++){const x=64+(R()-.5)*70,h=50+R()*70,b=(R()-.5)*40;g.strokeStyle=['#7c8a3e','#9a9a52','#5f7a30','#b0a060'][i%4];g.lineWidth=2+R()*2;
    g.beginPath();g.moveTo(x,128);g.quadraticCurveTo(x+b*.3,128-h*.5,x+b,128-h);g.stroke()}return c}
export function softDot(){const c=cnv(64,64),g=c.getContext('2d');const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,240,210,1)');r.addColorStop(.4,'rgba(255,230,190,.5)');r.addColorStop(1,'rgba(255,230,190,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return c}

// ---------- builders ----------
export function buildWorld(scene,M){
  const R=rng(42);
  const std=(o)=>new THREE.MeshStandardMaterial(Object.assign({roughness:.95,metalness:0},o));
  const tall=new THREE.Group();scene.add(tall); // everything that flattens into the map
  const flat=new THREE.Group();scene.add(flat);

  // sky dome
  const skyU={sunDir:{value:new THREE.Vector3()},zen:{value:new THREE.Color()},hor:{value:new THREE.Color()},glow:{value:new THREE.Color()},uT:{value:0}};
  const sky=new THREE.Mesh(new THREE.SphereGeometry(900,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,uniforms:skyU,
    vertexShader:`varying vec3 vd;void main(){vd=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`varying vec3 vd;uniform vec3 sunDir,zen,hor,glow;uniform float uT;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n(p);p*=2.03;a*=.5;}return s;}
      void main(){float y=max(vd.y,0.);vec3 c=mix(hor,zen,pow(y,.55));float sd=max(dot(vd,sunDir),0.);
        c+=glow*(pow(sd,12.)*.55+pow(sd,180.)*2.2);c+=vec3(1.,.95,.85)*smoothstep(.9994,.9997,sd)*3.;
        vec2 cp=vd.xz/(vd.y+.18)*1.6+vec2(uT*.018,uT*.006);float cl=smoothstep(.52,.78,fbm(cp))*smoothstep(.02,.25,vd.y);
        vec3 cc=mix(vec3(1.,.86,.68),vec3(1.,.97,.9),pow(sd,4.));c=mix(c,cc*(.85+.4*pow(sd,6.)),cl*.55);
        if(vd.y<0.)c=hor*.9;gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`}));
  sky.renderOrder=-10;scene.add(sky);

  // far hills
  for(const [z,hgt,col,seed] of [[-420,46,'#b99a7e',3],[-300,30,'#a48a6c',8]]){const s=new THREE.Shape();s.moveTo(-900,-5);
    for(let x=-900;x<=900;x+=20){s.lineTo(x,hgt*(.35+.65*fA(x/260+seed,seed,4)))}s.lineTo(900,-5);
    const m=new THREE.Mesh(new THREE.ShapeGeometry(s),new THREE.MeshBasicMaterial({color:col}));m.position.z=z;scene.add(m)}

  // ground
  const gT=tex(groundCanvas(),60);const ground=new THREE.Mesh(new THREE.PlaneGeometry(600,600),std({map:gT}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);
  // paddy fields both sides of the road (z 9..120), with bunds
  const pT=tex(paddyCanvas(),1,1);
  const paddyMat=std({map:pT,roughness:.8});
  const paddyU={value:0};
  paddyMat.onBeforeCompile=sh=>{sh.uniforms.uTime=windUniform;sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;').replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvWp=(modelMatrix*vec4(transformed,1.)).xyz;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vWp;uniform float uTime;').replace('#include <map_fragment>',`#include <map_fragment>
      float wv=sin(vWp.x*.22+vWp.z*.35-uTime*1.3)*.5+.5; wv=pow(wv,3.)*.5+sin(vWp.x*.7-vWp.z*.4-uTime*2.1)*.06; diffuseColor.rgb*=1.+wv*.32;`)};
  paddyMat.customProgramCacheKey=()=>'paddy';
  const pads=[];
  for(const side of [-1,1]){for(let i=0;i<9;i++){for(let j=0;j<4;j++){const w=11,d=12;const x=side*(3.8+w/2+j*(w+.6)),z=9.8+d/2+i*(d+.6);
    const g=new THREE.PlaneGeometry(w,d);const uv=g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k)*w/6+R(),uv.getY(k)*d/6+R());
    const m=new THREE.Mesh(g,paddyMat);m.rotation.x=-Math.PI/2;m.position.set(x,.05,z);m.receiveShadow=true;flat.add(m);pads.push(m)}}}
  // bunds
  const bundMat=std({color:'#8a6a42'});
  for(const side of [-1,1]){for(let i=0;i<=9;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(48,.22,.5),bundMat);b.position.set(side*(3.6+24),.08,9.5+i*12.6);b.receiveShadow=true;b.castShadow=true;tall.add(b)}
    for(let j=0;j<=4;j++){const b=new THREE.Mesh(new THREE.BoxGeometry(.45,.22,116),bundMat);b.position.set(side*(3.5+j*11.6),.08,9.5+58);b.receiveShadow=true;tall.add(b)}}

  // road
  const rT=tex(roadCanvas(),1,1);const roadLen=130;const rg=new THREE.PlaneGeometry(4.6,roadLen,1,1);const ruv=rg.attributes.uv;for(let k=0;k<ruv.count;k++)ruv.setY(k,ruv.getY(k)*roadLen/9);
  rT.wrapT=THREE.RepeatWrapping;const road=new THREE.Mesh(rg,std({map:rT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));road.rotation.x=-Math.PI/2;road.position.set(0,.06,-6+roadLen/2);road.receiveShadow=true;road.renderOrder=1;flat.add(road);
  // plot
  const plT=tex(plotCanvas());const plot=new THREE.Mesh(new THREE.PlaneGeometry(21,21),std({map:plT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2}));plot.rotation.x=-Math.PI/2;plot.position.set(0,.07,-16);plot.receiveShadow=true;plot.renderOrder=1;flat.add(plot);

  // pegs + rope
  const pegMat=std({color:'#ece4d2',roughness:.7}),tipMat=std({color:'#a8382a'});
  const corners=[[-10,-6],[10,-6],[10,-26],[-10,-26]];const pegPts=[];
  corners.forEach(([x,z],i)=>{const a=corners[(i+1)%4];for(let s=0;s<4;s++){const px=lerp(x,a[0],s/4),pz=lerp(z,a[1],s/4);pegPts.push([px,pz])}});
  const pegGeo=[];pegPts.forEach(([x,z])=>{const g=new THREE.BoxGeometry(.09,.7,.09);g.translate(x,.35,z);pegGeo.push(g)});
  const pegs=new THREE.Mesh(mergeGeometries(pegGeo),pegMat);pegs.castShadow=true;tall.add(pegs);
  const tipGeo=pegPts.map(([x,z])=>{const g=new THREE.BoxGeometry(.1,.12,.1);g.translate(x,.66,z);return g});const tips=new THREE.Mesh(mergeGeometries(tipGeo),tipMat);tall.add(tips);
  const ropeGeo=[];for(let i=0;i<pegPts.length;i++){const a=pegPts[i],b=pegPts[(i+1)%pegPts.length];const pts=[];for(let s=0;s<=8;s++){const t=s/8;pts.push(new THREE.Vector3(lerp(a[0],b[0],t),.55-Math.sin(t*Math.PI)*.08,lerp(a[1],b[1],t)))}
    ropeGeo.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),8,.012,4))}
  const rope=new THREE.Mesh(mergeGeometries(ropeGeo),std({color:'#f3ead6',roughness:.6,emissive:'#3a3020'}));rope.castShadow=true;tall.add(rope);

  // SOLD board on the plot
  const soldC=cnv(512,300),sg=soldC.getContext('2d');sg.fillStyle='#3b2416';sg.fillRect(0,0,512,300);sg.strokeStyle='#c9a25b';sg.lineWidth=8;sg.strokeRect(18,18,476,264);
  sg.lineWidth=2;sg.strokeRect(32,32,448,236);sg.fillStyle='#d9b56a';sg.textAlign='center';sg.font='600 150px CG';sg.fillText('SOLD',256,205);
  const sold=new THREE.Group();const sp=new THREE.Mesh(new THREE.BoxGeometry(.1,1.6,.1),std({color:'#4a3423'}));sp.position.y=.8;sp.castShadow=true;
  const sb=new THREE.Mesh(new THREE.BoxGeometry(1.3,.76,.05),[std({color:'#3b2416'}),std({color:'#3b2416'}),std({color:'#3b2416'}),std({color:'#3b2416'}),std({map:tex(soldC),roughness:.6,emissive:'#ffffff',emissiveMap:tex(soldC),emissiveIntensity:.12}),std({color:'#3b2416'})]);
  sb.position.set(0,1.45,.06);sb.castShadow=true;sold.add(sp,sb);sold.position.set(5.5,0,-6.6);sold.rotation.y=-.18;tall.add(sold);
  const soldTag=sb;

  // wall + pillars along z=8
  const wT=tex(wallCanvas());wT.wrapS=wT.wrapT=THREE.RepeatWrapping;
  const wallMat=std({map:wT,roughness:.95});
  for(const [x0,x1] of [[-22,-3.03],[3.03,22]]){const len=x1-x0;const g=new THREE.BoxGeometry(len,1.15,.36);const uv=g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k)*len/2.4,uv.getY(k)*1.15/1.2);
    const w=new THREE.Mesh(g,wallMat);w.position.set((x0+x1)/2,.575,8);w.castShadow=true;w.receiveShadow=true;tall.add(w);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(len,.07,.44),std({color:'#d8cdb6'}));cap.position.set((x0+x1)/2,1.18,8);cap.castShadow=true;tall.add(cap)}
  for(const x of [-2.78,2.78]){const g=new THREE.BoxGeometry(.56,2.4,.56);const p=new THREE.Mesh(g,wallMat);p.position.set(x,1.2,8);p.castShadow=true;p.receiveShadow=true;tall.add(p);
    const c=new THREE.Mesh(new THREE.BoxGeometry(.72,.12,.72),std({color:'#e2d8c2'}));c.position.set(x,2.46,8);c.castShadow=true;tall.add(c);
    const k=new THREE.Mesh(new THREE.SphereGeometry(.16,16,10),std({color:'#e2d8c2'}));k.position.set(x,2.62,8);tall.add(k)}

  // gate leaves (hinged at inner pillar faces)
  const iron=std({color:'#1d1a17',metalness:.65,roughness:.42});
  function leafGeo(){const L=2.47,gs=[];const bars=Math.round(L/.14);for(let i=0;i<=bars;i++){const x=.05+i*(L-.1)/bars;const g=new THREE.BoxGeometry(.03,1.95,.03);g.translate(x,1.08,0);gs.push(g);
      const c=new THREE.ConeGeometry(.04,.13,4);c.translate(x,2.1,0);gs.push(c)}
    for(const y of [.18,1.0,1.98]){const g=new THREE.BoxGeometry(L,.06,.05);g.translate(L/2,y,0);gs.push(g)}
    const f=new THREE.BoxGeometry(.06,2.0,.06);f.translate(.03,1.08,0);gs.push(f);const f2=f.clone();f2.translate(L-.06,0,0);gs.push(f2);
    for(let i=0;i<5;i++){const r=new THREE.TorusGeometry(.17,.012,6,20);r.translate(.25+i*.5,.59,0);gs.push(r)}
    return mergeGeometries(gs)}
  const lg=leafGeo();
  const leafL=new THREE.Mesh(lg,iron.clone()),leafR=new THREE.Mesh(lg,iron.clone());leafL.castShadow=leafR.castShadow=true;
  const hingeL=new THREE.Group(),hingeR=new THREE.Group();hingeL.position.set(-2.5,0,8);hingeR.position.set(2.5,0,8);hingeR.scale.x=-1;
  hingeL.add(leafL);hingeR.add(leafR);tall.add(hingeL,hingeR);
  leafL.material.transparent=leafR.material.transparent=true;

  // board hung on gate
  const boardC=cnv(1024,512);
  const boardT=tex(boardC);
  const board=new THREE.Group();const bm=new THREE.Mesh(new THREE.PlaneGeometry(1.5,.75),std({map:boardT,roughness:.75,emissive:'#ffffff',emissiveMap:boardT,emissiveIntensity:.32}));bm.position.y=-.375;bm.castShadow=true;board.add(bm);
  const wireG=[];for(const x of [-.6,.6]){const g=new THREE.CylinderGeometry(.006,.006,.16);g.translate(x,.08,0);wireG.push(g)}board.add(new THREE.Mesh(mergeGeometries(wireG),iron));
  board.position.set(0,1.86,8.06);tall.add(board);
  // padlock
  const lock=new THREE.Group();const brass=std({color:'#b08a45',metalness:.8,roughness:.35});
  const lb=new THREE.Mesh(new THREE.BoxGeometry(.13,.1,.05),brass);const ls=new THREE.Mesh(new THREE.TorusGeometry(.04,.009,8,16,Math.PI),std({color:'#9a9a9a',metalness:.9,roughness:.3}));ls.position.y=.05;
  lock.add(lb,ls);lock.position.set(0,.92,8.07);tall.add(lock);
  const chainG=[];for(let i=0;i<9;i++){const r=new THREE.TorusGeometry(.025,.006,6,10);r.rotateY(i%2?Math.PI/2:0);r.translate(0,1.0+i*.045,8.05);chainG.push(r)}
  const chain=new THREE.Mesh(mergeGeometries(chainG),std({color:'#8a8a86',metalness:.9,roughness:.35}));tall.add(chain);

  // palms
  const frT=tex(frondCanvas());const frMat=std({map:frT,alphaTest:.45,side:THREE.DoubleSide,roughness:.8});addWind(frMat,.55,1.25);
  const barkMat=std({map:tex(barkCanvas())});
  const palms=[];
  function palm(x,z,h,lean,yaw,seed){const r=rng(seed);const pts=[];for(let i=0;i<=8;i++){const t=i/8;pts.push(new THREE.Vector3(Math.sin(yaw)*lean*t*t*h*.25,t*h,Math.cos(yaw)*lean*t*t*h*.25))}
    const curve=new THREE.CatmullRomCurve3(pts);const trunk=new THREE.Mesh(new THREE.TubeGeometry(curve,16,.17,8),barkMat);trunk.castShadow=true;
    const top=pts[8];const fg=[];const nf=14;
    for(let i=0;i<nf;i++){const L=3.2+r()*1.2;const g=new THREE.PlaneGeometry(L,1.5,12,1);g.translate(L/2,0,0);const p=g.attributes.position;
      const pitch=.45-r()*.35-(i%3)*.18;for(let k=0;k<p.count;k++){const xx=p.getX(k);const t=xx/L;p.setY(k,p.getY(k)*(1-t*.6)*.5);p.setZ(k,p.getY(k));p.setY(k,0);
        const ang=pitch-t*t*1.25;p.setXYZ(k,Math.cos(ang)*xx,Math.sin(ang)*xx*.9,p.getZ(k))}
      g.computeVertexNormals();setAW(g,(xx,yy,zz)=>Math.hypot(xx,zz)/L);g.rotateY(i/nf*Math.PI*2+r()*.4);g.translate(top.x,top.y,top.z);fg.push(g)}
    const cg=mergeGeometries(fg);const crown=new THREE.Mesh(cg,frMat);crown.castShadow=true;
    const nuts=new THREE.Mesh(new THREE.SphereGeometry(.28,10,8),std({color:'#5a4a22'}));nuts.position.copy(top).add(new THREE.Vector3(0,-.25,0));
    const g=new THREE.Group();g.add(trunk,crown,nuts);g.position.set(x,0,z);tall.add(g);palms.push({g,crown,top});return g}
  const palmSpots=[[-4.6,12,9,.8,2.6],[5.2,17,10.5,.6,-.5],[-5.4,24,8.5,.9,2.2],[6.0,31,11,.7,-.8],[-5.0,40,10,.6,2.8],[5.6,49,9,.7,-.4],[-6,58,10.5,.8,2.4],
    [-13,-29,11,.5,1.2],[-7,-31,9.5,.7,.4],[8,-30,12,.5,-.6],[14,-27,9,.8,-1.2],[17,-12,10,.6,-1.8],[-16,-14,11,.7,1.6],[-18,2,9,.6,1.7],[20,4,10.5,.5,-1.5],
    [-28,-40,12,.4,1],[26,-44,11,.5,-1],[34,-20,10,.6,-1.4],[-35,-18,12,.4,1.5]];
  palmSpots.forEach((p,i)=>palm(p[0],p[1],p[2],p[3],p[4],100+i));
  // far palm silhouettes (cheap)
  for(let i=0;i<26;i++){const x=-140+i*11+R()*6,z=-70-R()*25;palm(x,z,9+R()*6,.5,R()*6,300+i)}

  // broadleaf trees (mango / neem) on neighbour land and treeline
  function treeGeo(seed,scale){const r=rng(seed);const gs=[];const tr=new THREE.CylinderGeometry(.18*scale,.26*scale,2.4*scale,7);tr.translate(0,1.2*scale,0);
    const cols=[];const addCol=(g,c)=>{const col=new THREE.Color(c);const n=g.attributes.position.count;const a=new Float32Array(n*3);for(let i=0;i<n;i++){a[i*3]=col.r;a[i*3+1]=col.g;a[i*3+2]=col.b}g.setAttribute('color',new THREE.BufferAttribute(a,3));return g};
    gs.push(setAW(addCol(tr.toNonIndexed(),'#5a4632'),()=>0));
    for(let i=0;i<16;i++){const s=(.8+r()*.7)*scale;const g=new THREE.IcosahedronGeometry(s,2);const p=g.attributes.position;
      for(let k=0;k<p.count;k++){const v=new THREE.Vector3(p.getX(k),p.getY(k),p.getZ(k));const d=1+(nA(v.x*2.1+seed,v.y*2.1+v.z*1.7)-.5)*.55;v.multiplyScalar(d);p.setXYZ(k,v.x,v.y*.8,v.z)}
      g.computeVertexNormals();const ang=r()*6.28,rad=r()*1.7*scale;g.translate(Math.cos(ang)*rad,(2.7+r()*2.0)*scale,Math.sin(ang)*rad);
      gs.push(setAW(addCol(g,['#3f5a2a','#4a6630','#36502a','#55703a'][i%4]),(x,y)=>clamp((y-2*scale)/(5*scale))*.6))}
    return mergeGeometries(gs)}
  const treeMat=std({vertexColors:true,roughness:.9});addWind(treeMat,.18,.9);
  const trees=[[-9,3,1],[-14,-1,1.15],[12,1,1],[15,6,.9],[-20,-8,1.2],[22,-14,1.1]];
  trees.forEach(([x,z,s],i)=>{const m=new THREE.Mesh(treeGeo(500+i,s),treeMat);m.position.set(x,0,z);m.castShadow=true;m.receiveShadow=true;tall.add(m)});
  for(let i=0;i<40;i++){const m=new THREE.Mesh(treeGeo(700+i,1.3+R()*.8),treeMat);m.position.set(-170+i*8.5+R()*5,0,-62-R()*30);tall.add(m)}

  // grass tufts (instanced, wind)
  const grT=tex(grassCanvas());const grMat=std({map:grT,alphaTest:.4,side:THREE.DoubleSide,roughness:.9});addWind(grMat,.12,2.2);
  const tuft=(()=>{const a=new THREE.PlaneGeometry(.7,.42);a.translate(0,.21,0);const b=a.clone();b.rotateY(Math.PI/2);const g=mergeGeometries([a,b]);return setAW(g,(x,y)=>y/.42)})();
  function tufts(n,fn,mat,sz=1){const im=new THREE.InstancedMesh(tuft,mat,n);const m4=new THREE.Matrix4(),q=new THREE.Quaternion(),s=new THREE.Vector3(),p=new THREE.Vector3();
    for(let i=0;i<n;i++){const [x,z,k]=fn(i);p.set(x,0,z);q.setFromAxisAngle(new THREE.Vector3(0,1,0),R()*6.28);const sc=(k||1)*sz*(.45+R()*.6);s.set(sc,sc,sc);m4.compose(p,q,s);im.setMatrixAt(i,m4)}
    im.receiveShadow=true;return im}
  const edgeGrass=tufts(2200,i=>{const side=i%2?1:-1;return [side*(2.3+R()*1.2),9+R()*70,.8]},grMat);tall.add(edgeGrass);
  const nbGrass=tufts(900,i=>[(R()-.5)*40,-6+R()*13.5,1.1],grMat);tall.add(nbGrass);
  const plotGrass=tufts(500,i=>[(R()-.5)*19,-7-R()*18,.8],grMat.clone());addWind(plotGrass.material,.12,2.2);tall.add(plotGrass);
  const pgBase=[];{const m=new THREE.Matrix4();for(let i=0;i<500;i++){plotGrass.getMatrixAt(i,m);pgBase.push(m.clone())}}

  // egrets (white birds) crossing the sky
  const birdMat=new THREE.MeshBasicMaterial({color:'#f4efe4',side:THREE.DoubleSide,fog:false});
  const birds=[];for(let i=0;i<6;i++){const g=new THREE.Group();const wl=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,-.15),new THREE.Vector3(0,0,.15),new THREE.Vector3(-1.1,0,0)]),birdMat);
    const wr=new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,.15),new THREE.Vector3(0,0,-.15),new THREE.Vector3(1.1,0,0)]),birdMat);
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.5,4,8),birdMat);body.rotation.x=Math.PI/2;g.add(wl,wr,body);scene.add(g);birds.push({g,wl,wr,ph:R()*6,off:new THREE.Vector3((R()-.5)*10,(R()-.5)*3,(R()-.5)*6)})}

  // dust motes in the sun
  const dN=220;const dp=new Float32Array(dN*3),dseed=[];for(let i=0;i<dN;i++){dseed.push([R(),R(),R(),R()])}
  const dGeo=new THREE.BufferGeometry();dGeo.setAttribute('position',new THREE.BufferAttribute(dp,3));
  const dust=new THREE.Points(dGeo,new THREE.PointsMaterial({map:tex(softDot()),size:.09,transparent:true,opacity:.75,depthWrite:false,blending:THREE.AdditiveBlending,color:'#ffe6b8'}));scene.add(dust);

  // survey overlay (S4): parcel fills + boundary ribbons, drawn progressively
  const survey=new THREE.Group();scene.add(survey);
  const fillNb=new THREE.Mesh(new THREE.PlaneGeometry(30,14),new THREE.MeshBasicMaterial({color:'#c8452c',transparent:true,opacity:0,depthWrite:false}));fillNb.rotation.x=-Math.PI/2;fillNb.position.set(-3,.25,1);survey.add(fillNb);
  const grayRoad=new THREE.Mesh(new THREE.PlaneGeometry(4.4,14),new THREE.MeshBasicMaterial({color:'#8d8579',transparent:true,opacity:0,depthWrite:false}));grayRoad.rotation.x=-Math.PI/2;grayRoad.position.set(0,.3,1);survey.add(grayRoad);
  const lineMat=new THREE.MeshBasicMaterial({color:'#fff6e4',transparent:true,opacity:0,depthWrite:false,fog:false});
  const ribbons=[];
  function rib(ax,az,bx,bz,t0,t1){const len=Math.hypot(bx-ax,bz-az);const g=new THREE.PlaneGeometry(1,.16);g.translate(.5,0,0);const m=new THREE.Mesh(g,lineMat);m.rotation.x=-Math.PI/2;m.rotation.z=Math.atan2(-(bz-az),bx-ax);m.position.set(ax,.4,az);m.scale.x=.0001;survey.add(m);ribbons.push({m,len,t0,t1})}
  // neighbour parcel x[-18,12] z[-6,8]
  rib(-18,8,12,8,13.0,14.2);rib(12,8,12,-6,13.6,14.6);rib(12,-6,-18,-6,14.0,15.2);rib(-18,-6,-18,8,14.4,15.3);
  // buyer plot
  rib(-10,-6,-10,-26,14.8,15.8);rib(10,-6,10,-26,14.8,15.8);rib(-10,-26,10,-26,15.3,16.2);
  return {tall,flat,sky,skyU,ground,paddyMat,hingeL,hingeR,leafL,leafR,board,bm,boardC,boardT,lock,chain,palms,plotGrass,pgBase,birds,dust,dseed,dp,survey,fillNb,grayRoad,lineMat,ribbons,soldTag,sold,windUniform};
}
