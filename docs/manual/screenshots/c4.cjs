const {mark,snap,base,open,top,T}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p;
 await T('car',async()=>{ await open(p,'content','Carousels');
   const c=p.locator('section.card-a',{hasText:'Slides'}).first(); await top(p,c,260);
   await snap(p,'14-carousels',{main:true});
   await p.locator('.sub-head .t').first().click(); await p.waitForTimeout(700); await top(p,p.locator('.sub-item:not(.closed)').first(),260);
   await snap(p,'14b-slide',{main:true});
   const sec=p.locator('text=Seconds on screen').first(); if(await sec.count()){ await top(p,sec,420); await snap(p,'14c-slide-timing',{main:true,marks:[{t:'Seconds on screen',exact:false,n:1,tag:'label,span,div'}]}); }
 });
 await T('flows',async()=>{ await open(p,'blocks','Flows'); await snap(p,'15-flows',{main:true,marks:[{t:'New flow',n:1,tag:'button',exact:false},{t:'Replay animation',n:2,tag:'button',exact:false},{t:'Row: each ite…',n:3,exact:false,tag:'button,select,div,span'}]}); });
 await T('modals',async()=>{ await open(p,'blocks','Modals'); await snap(p,'16-modals',{main:true,marks:[{t:'Preview modal',n:1,tag:'button',exact:false},{t:'Type 1 · Media',n:2,exact:false,tag:'button,div,span'}]}); });
 await T('icons',async()=>{ await open(p,'blocks','Icons'); await snap(p,'17-icons',{main:true,marks:[{t:'New icon',n:1,exact:false,tag:'button'}]}); });
 await T('blog',async()=>{ await open(p,'content','Blog'); await snap(p,'18-blog',{main:true,marks:[{t:'New post',n:1,exact:false,tag:'button'},{t:'Preview post',n:2,exact:false,tag:'button'},{t:'Published (visible to visitors)',exact:false,n:3,tag:'label,span,div'}]}); });
 await T('import',async()=>{ await open(p,'content','Import'); await p.locator('#admBody .fold-btn').first().click().catch(()=>{}); await p.waitForTimeout(600); await snap(p,'19-import',{main:true}); });
 await T('style',async()=>{ await open(p,'design','Global style'); await snap(p,'20-globalstyle',{main:true});
   const ss=p.locator('section.card-a',{hasText:'Saved styles'}).first(); await ss.locator('.fold-btn').first().click(); await p.waitForTimeout(500); await top(p,ss,260); await snap(p,'20b-savedstyles',{main:true});
   const f=p.locator('section.card-a',{hasText:'Image filter'}).first(); await top(p,f,260); await snap(p,'25-imagefilter',{main:true});
   await p.screenshot({path:'tour/style-full.png',fullPage:true});
 });
 await T('theme',async()=>{ await open(p,'design','Colours and type'); await snap(p,'21-colours',{main:true}); await p.screenshot({path:'tour/theme-full.png',fullPage:true}); });
 await T('logo',async()=>{ await open(p,'design','Logo'); await snap(p,'22-logo',{main:true}); });
 await T('motion',async()=>{ await open(p,'design','Animation'); await snap(p,'23-animation',{main:true}); });
 await T('site',async()=>{ await open(p,'design','Site and titles'); await snap(p,'24-site',{main:true});
   const l=p.locator('section.card-a',{hasText:'Languages and numbering'}).first(); await top(p,l,260); await snap(p,'24b-languages',{main:true});
   await p.screenshot({path:'tour/site-full.png',fullPage:true}); });
 await r.b.close();
})();
