const {mark,snap,base,open,top,T}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p;
 await T('libitem',async()=>{ await open(p,'media','Library');
  await p.locator('#admBody .lib-grid > *').first().click(); await p.waitForTimeout(1000);
  await p.screenshot({path:'tour/libitem.png',fullPage:false});
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  const po=p.locator('section.card-a',{hasText:'Picture optimizing'}).first(); await po.locator('.fold-btn').first().click(); await p.waitForTimeout(500); await top(p,po,160);
  await snap(p,'28-optimizing',{main:true});
  await p.locator('#admBody button',{hasText:'Select several'}).click(); await p.waitForTimeout(500);
  await p.locator('#admBody .lib-grid > *').nth(0).click(); await p.locator('#admBody .lib-grid > *').nth(2).click(); await p.waitForTimeout(500);
  await top(p,p.locator('#admBody button',{hasText:'Select several'}).first(),300);
  await p.screenshot({path:'tour/libselect.png'});
 });
 await T('picker',async()=>{ await open(p,'media','Missing images'); await p.locator('#admBody button',{hasText:'Change from library'}).first().click(); await p.waitForTimeout(1200); await p.screenshot({path:'shots/31-picker.png'}); await p.keyboard.press('Escape'); });
 await r.b.close();
})();
