const {mark,snap,base,open,top,T}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p;
 await open(p,'content','Pages');
 await T('secopen',async()=>{
  await p.locator('.sub-head .t').nth(1).click(); await p.waitForTimeout(800);
  await top(p,p.locator('.sub-item').nth(1));
  await snap(p,'10-section-open',{marks:[{sel:'.sub-item.open .sub-head, .sub-item:not(.closed) .sub-head',n:1,pos:'l'},{t:'AI',n:2,tag:'button',nth:2}]});
  const more=p.locator('.sub-item:not(.closed) details.sec-deco').first(); await more.locator('summary').click(); await p.waitForTimeout(600);
  await top(p,more,250); await snap(p,'12-extras',{});
  await more.locator('summary').click();
  const mo=p.locator('.sub-item:not(.closed) details.sec-more:not(.sec-deco)').first(); await mo.locator('summary').click(); await p.waitForTimeout(600);
  await top(p,mo,250); await snap(p,'13-moreoptions',{});
  await mo.locator('summary').click();
 });
 await T('typepicker',async()=>{
  const add=p.locator('.sec-add').first(); await top(p,add,500);
  await add.locator('button,select').first().click(); await p.waitForTimeout(1200);
  await snap(p,'11-typepicker',{});
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
 });
 await T('carousels',async()=>{ await open(p,'content','Carousels'); await p.screenshot({path:'tour/car-full.png',fullPage:true}); });
 await r.b.close();
})();
