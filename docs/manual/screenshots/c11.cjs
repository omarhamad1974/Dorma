const {mark,snap,base,open,top,T}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p; p.setDefaultTimeout(8000);
 await T('health2',async()=>{ await open(p,'care','Health check'); await p.waitForTimeout(1200);
   await top(p,p.locator('#admBody',{hasText:'BROKEN'}).locator('text=BROKEN').first(),220); await snap(p,'48b-health-list',{main:true,marks:[{t:'Fix it',n:1,tag:'button',nth:0},{t:'Ignore',n:2,tag:'button',nth:0}]}); });
 await T('logo',async()=>{ await open(p,'design','Logo'); await p.mouse.move(5,890); await p.waitForTimeout(800); await snap(p,'22-logo',{main:true}); });
 await T('extras',async()=>{ await open(p,'content','Pages');
  await p.locator('.sub-head .t').nth(1).click(); await p.waitForTimeout(800);
  const more=p.locator('.sub-item:not(.closed) details.sec-deco').first(); await more.locator('summary').click(); await p.waitForTimeout(600);
  await top(p,more.locator('summary'),330); await snap(p,'12-extras',{main:true,marks:[{t:'Icon, text, logo and button',n:1,tag:'b'}]});
  await more.locator('summary').click(); await p.waitForTimeout(300);
  const mo=p.locator('.sub-item:not(.closed) details.sec-more:not(.sec-deco)').first(); await mo.locator('summary').click(); await p.waitForTimeout(600);
  await top(p,mo.locator('summary'),330); await snap(p,'13-moreoptions',{main:true,marks:[{t:'More options',n:1,tag:'b'}]}); });
 await r.b.close();
})();
