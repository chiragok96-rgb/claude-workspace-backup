// node render.js <worker> <nworkers> : renders frames worker::nworkers to frames/
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const wi=+process.argv[2],nw=+process.argv[3];const FPS=30,N=Math.round(55.56*FPS);const only=process.argv[4]?process.argv[4].split(',').map(Number):null;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('http://localhost:8123/index.html');await p.waitForFunction(()=>window.READY||window.ERR,null,{timeout:300000});
const list=only||[...Array(N).keys()].filter(i=>i%nw===wi);
for(const i of list){const f=`frames/f_${String(i).padStart(5,'0')}.jpg`;if(!only&&fs.existsSync(f))continue;
 await p.evaluate(t=>window.render(t),i/FPS);const d=await p.evaluate(()=>document.getElementById('out').toDataURL('image/jpeg',.95));fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));
 if(i%60===wi)console.log('w'+wi,i)}
await b.close()})();
