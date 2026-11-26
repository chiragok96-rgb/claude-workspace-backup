// node render_paper.js <worker> <nworkers> <from> <to> : v1 paper scenes WITHOUT captions -> film2/paper/f_NNNNN.png
// Serve the v1 page first: (cd ../film && python3 -m http.server 8123)
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const [wi,nw,a,b]=process.argv.slice(2).map(Number);const FPS=30;const dir=path.join(__dirname,'paper');fs.mkdirSync(dir,{recursive:true});
const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await br.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('http://localhost:8123/index.html?nowords=1');await p.waitForFunction(()=>window.READY||window.ERR,null,{timeout:300000});
for(let i=a;i<=b;i++){if((i-a)%nw!==wi)continue;const f=path.join(dir,`f_${String(i).padStart(5,'0')}.png`);if(fs.existsSync(f))continue;
 await p.evaluate(t=>window.render(t),i/FPS);const d=await p.evaluate(()=>document.getElementById('out').toDataURL('image/png'));
 fs.writeFileSync(f,Buffer.from(d.split(',')[1],'base64'));if(i%60===0)console.log('w'+wi,i)}
await br.close()})();
