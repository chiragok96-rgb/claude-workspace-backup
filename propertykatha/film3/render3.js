// node render3.js <worker> <nworkers> : renders all frames to film3/frames/f_NNNNN.png (skips existing)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const [wi,nw]=process.argv.slice(2).map(Number);const FPS=30,N=Math.round(57.16*FPS);const dir=path.join(__dirname,'frames');fs.mkdirSync(dir,{recursive:true});
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('http://localhost:8126/film3/index.html');await p.waitForFunction(()=>window.READY||window.ERR,null,{timeout:300000});
for(let i=wi;i<N;i+=nw){const f=path.join(dir,`f_${String(i).padStart(5,'0')}.png`);if(fs.existsSync(f))continue;
 await p.evaluate(t=>window.render(t),i/FPS);const d=await p.evaluate(()=>document.getElementById('out').toDataURL('image/png'));
 fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));if(i%150<nw)console.log('w'+wi,i)}
await b.close()})();
