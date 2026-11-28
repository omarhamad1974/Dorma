const {mark,snap,base,open,top,T}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p; p.setDefaultTimeout(8000);
 await open(p,'content','Proposals');
 await p.locator('#admBody button',{hasText:'New proposal'}).click(); await p.waitForTimeout(1200);
 const card=n=>p.locator('section.card-a',{has:p.locator('h2',{hasText:n})}).first();
 await T('fill',async()=>{
  const cl=card('Client'); await cl.locator('input').nth(0).fill('Example Client'); await cl.locator('input').nth(1).fill('عميل تجريبي');
  const sv=card('Services'); await sv.locator('label',{hasText:'Packaging'}).first().click(); await sv.locator('label',{hasText:'Signage & Displays'}).first().click();
  await card('Link and status').locator('select').first().selectOption({index:0}).catch(()=>{});
  await p.waitForTimeout(1500);
 });
 await T('shots',async()=>{
  await top(p,card('Link and status'),150); await snap(p,'36-prop-link',{main:true,marks:[{t:'Copy link',n:1,tag:'button',exact:false},{t:'PDF (English)',n:2,tag:'button',exact:false},{sel:'section.card-a select',n:3},{t:'Freeze this version',n:4,tag:'button'}]});
  await top(p,card('Brief'),150); await snap(p,'37-prop-brief',{main:true,marks:[{t:'Use template',n:1,tag:'button'},{t:'[client name]',n:2,tag:'button'}]});
  await top(p,card('Services'),150); await snap(p,'38-prop-services',{main:true});
  await top(p,card('Signature'),150); await snap(p,'39-prop-signature',{main:true});
  await top(p,p.locator('#admBody button',{hasText:'New proposal'}),190);
  await p.locator('#admBody button',{hasText:'Templates and signature'}).click(); await p.waitForTimeout(1000);
  await snap(p,'40-prop-templates',{main:true});
 });
 const slug=await p.evaluate(()=>{const i=[...document.querySelectorAll('input')].find(x=>/client/i.test(x.value)&&x.value.includes('-')); return i?i.value:null});
 console.log('slug',slug);
 const DB=require('./mock.cjs').DB; console.log('props',DB.proposals.length, DB.proposals[0]&&DB.proposals[0].slug, DB.proposals[0]&&DB.proposals[0].status);
 const s=DB.proposals[0]&&DB.proposals[0].slug;
 if(s){ const q=await r.ctx.newPage(); await q.setViewportSize({width:1280,height:900});
   await q.goto('http://localhost:5174/#for/'+s); await q.waitForTimeout(4000); await q.screenshot({path:'shots/41-prop-site.png'});
   await q.goto('http://localhost:5174/#for/'+s+'/pdf/en'); await q.waitForTimeout(3500); await q.screenshot({path:'shots/42-prop-pdf.png'}); }
 await r.b.close();
})();
