const {mark,snap,base,open}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p;
 await p.locator('#admTop button',{hasText:'Live preview'}).click(); await p.waitForTimeout(1500);
 await p.click('.lp-b.dock'); await p.waitForTimeout(3500);
 await snap(p,'04-livepreview',{marks:[{sel:'.lp-b.dev',n:1,pos:'b'},{sel:'.lp-b.fol',n:2,pos:'b'},{sel:'.lp-b.rel',n:3,pos:'b'},{sel:'.lp-b.dock',n:4,pos:'b'},{sel:'.lp-b.min',n:5,pos:'b'},{sel:'.lp-b.cls',n:6,pos:'b'}]});
 await p.click('.lp-b.dock'); await p.waitForTimeout(500); await p.click('.lp-b.cls'); await p.waitForTimeout(500);
 await p.locator('#admSub button',{hasText:'Find'}).click(); await p.waitForTimeout(500);
 await p.keyboard.type('layout'); await p.waitForTimeout(600);
 await snap(p,'05-find',{clip:{x:180,y:110,width:740,height:420}});
 await r.b.close();
})();
