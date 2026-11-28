const { chromium } = require('playwright');
(async()=>{ const b=await chromium.launch(); const p=await b.newPage();
await p.goto('file://'+process.cwd()+'/manual.html'); await p.waitForTimeout(800);
await p.pdf({path:process.argv[2]||'manual.pdf',format:'A4',printBackground:true,displayHeaderFooter:true,
 headerTemplate:'<span></span>',
 footerTemplate:'<div style="width:100%;font-family:Inter,sans-serif;font-size:9pt;color:#6b7280;padding:0 17mm;display:flex;justify-content:space-between"><span>Dorma Studio · Admin manual</span><span><span class="pageNumber" style="font-weight:700;color:#0072BC;font-size:11pt"></span></span></div>',
 margin:{top:'18mm',bottom:'20mm',left:'17mm',right:'17mm'}});
await b.close();})();
