// node still3.js <outdir> t1 t2 ... : renders stills from http://localhost:8125 (serve film3/)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const [dir,...ts]=process.argv.slice(2);fs.mkdirSync(dir,{recursive:true});
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await p.goto('http://localhost:8125/index.html');await p.waitForFunction(()=>window.READY||window.ERR,null,{timeout:300000});
const err=await p.evaluate(()=>window.ERR);if(err){console.log('ERR',err);process.exit(1)}
for(const t of ts){await p.evaluate(t=>window.render(t),+t);const d=await p.evaluate(()=>document.getElementById('out').toDataURL('image/png'));
 fs.writeFileSync(`${dir}/s_${String(Math.round(t*100)).padStart(5,'0')}.png`,Buffer.from(d.split(',')[1],'base64'))}
await b.close()})();
