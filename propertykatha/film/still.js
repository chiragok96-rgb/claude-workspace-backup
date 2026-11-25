const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const times=process.argv.slice(2).map(Number);
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1080,height:1920}});
p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')console.log('CONSOLE',m.type(),m.text().slice(0,300))});p.on('pageerror',e=>console.log('PAGEERR',e.message));
await p.goto('http://localhost:8123/index.html');
await p.waitForFunction(()=>window.READY||window.ERR,null,{timeout:180000});
const err=await p.evaluate(()=>window.ERR);if(err){console.log(err);process.exit(1)}
for(const t of times){const t0=Date.now();await p.evaluate(t=>window.render(t),t);
 const d=await p.evaluate(()=>document.getElementById('out').toDataURL('image/jpeg',.9));fs.writeFileSync(`stills/s_${t.toFixed(2)}.jpg`,Buffer.from(d.split(',')[1],'base64'));console.log(t,Date.now()-t0,'ms')}
await b.close()})();
