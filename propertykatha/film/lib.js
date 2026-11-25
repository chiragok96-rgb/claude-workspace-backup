// shared helpers: math, noise, canvas textures
import * as THREE from 'three';
export const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
export const lerp=(a,b,t)=>a+(b-a)*t;
export const ss=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*(3-2*t)};
export const sm=(a,b,x)=>{const t=clamp((x-a)/(b-a));return t*t*t*(t*(t*6-15)+10)}; // smootherstep
export const env=(t,a,b,fi=.35,fo=.35)=>ss(a,a+fi,t)*(1-ss(b-fo,b,t));
export function rng(seed){let s=seed>>>0;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
export function makeNoise(seed,P=256){const R=rng(seed);const p=new Float32Array(P*P);for(let i=0;i<p.length;i++)p[i]=R();const m=P-1;
  return (x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const x0=((xi%P)+P)&m,y0=((yi%P)+P)&m,x1=(x0+1)&m,y1=(y0+1)&m;
  const a=p[y0*P+x0],b=p[y0*P+x1],c=p[y1*P+x0],d=p[y1*P+x1];const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}}
export function fbmOf(n){return (x,y,o=4)=>{let s=0,a=.5,f=1,tot=0;for(let i=0;i<o;i++){s+=a*n(x*f,y*f);tot+=a;f*=2;a*=.5}return s/tot}}
export function cnv(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
export function pix(w,h,fn){const c=cnv(w,h),g=c.getContext('2d'),im=g.createImageData(w,h),d=im.data;let i=0;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const r=fn(x,y);d[i++]=r[0];d[i++]=r[1];d[i++]=r[2];d[i++]=r.length>3?r[3]:255}g.putImageData(im,0,0);return c}
export function tex(c,rx,ry){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;
  if(rx){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx,ry||rx)}return t}
export const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
export const mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
// fit text to a max width by shrinking the font; returns used size
export function fitFont(g,text,family,weight,size,maxW,style=''){let s=size;
  for(let i=0;i<40;i++){g.font=`${style} ${weight} ${s}px ${family}`;if(g.measureText(text).width<=maxW)break;s*=.95}return s}
export function spaced(g,text,x,y,ls,align='center'){ // letter-spaced text
  const chars=[...text];let w=0;const ws=chars.map(c=>{const m=g.measureText(c).width;w+=m+ls;return m});w-=ls;
  let cx=align==='center'?x-w/2:align==='right'?x-w:x;const sa=g.textAlign;g.textAlign='left';
  chars.forEach((c,i)=>{g.fillText(c,cx,y);cx+=ws[i]+ls});g.textAlign=sa;return w}
export function spacedWidth(g,text,ls){let w=0;for(const c of text)w+=g.measureText(c).width+ls;return w-ls}
