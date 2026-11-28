const {mark,snap,base,open,top,T}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p; p.setDefaultTimeout(8000);
 const card=n=>p.locator('section.card-a',{has:p.locator('h2',{hasText:n})}).first();
 await T('inbox',async()=>{ await open(p,'inbox','Messages'); await p.waitForTimeout(800);
   await p.locator('#admBody',{hasText:'Sample visitor'}).locator('text=Sample visitor').first().click(); await p.waitForTimeout(800);
   await snap(p,'43-inbox',{main:true,marks:[{t:'Reply by email',n:1,tag:'button,a',exact:false},{t:'Archive',n:2,tag:'button',nth:1},{t:'Export CSV',n:3,tag:'button',exact:false}]}); });
 await T('inboxset',async()=>{ await open(p,'inbox','Form settings'); await snap(p,'44-formsettings',{main:true}); });
 await T('social',async()=>{ await open(p,'social','Create posts'); await p.waitForTimeout(800); await snap(p,'45-social-create',{main:true});
   await p.evaluate(()=>scrollBy(0,560)); await p.waitForTimeout(400); await snap(p,'45b-social-post',{main:true}); });
 await T('cal',async()=>{ await open(p,'social','Calendar'); await p.locator('#admBody button',{hasText:'Fill empty rhythm days'}).click(); await p.waitForTimeout(1500); await snap(p,'46-calendar',{main:true}); });
 await T('socset',async()=>{ await open(p,'social','Social settings'); await snap(p,'47-socialsettings',{main:true}); });
 await T('health',async()=>{ await open(p,'care','Health check'); await p.waitForTimeout(1200); await snap(p,'48-health',{main:true,marks:[{t:'Fix it',n:2,tag:'button',nth:0},{t:'Ignore',n:3,tag:'button',nth:0}]}); });
 await T('backups',async()=>{ await open(p,'care','Backups'); await p.waitForTimeout(1000); await snap(p,'49-backups',{main:true,marks:[{t:'Download backup',n:1,tag:'button',exact:false},{t:'Bring back from a file',n:2,tag:'button',exact:false},{t:'Save a snapshot now',n:3,tag:'button',exact:false},{t:'Put in draft',n:4,tag:'button',nth:0}]}); });
 await r.b.close();
 // site views
 const s=await base({hash:'#home',keepText:true}); await s.p.waitForTimeout(3000); await s.p.screenshot({path:'shots/50-site-home.png'});
 await s.b.close();
})();
