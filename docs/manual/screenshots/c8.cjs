const {mark,snap,base,open,top,T}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p; p.setDefaultTimeout(8000);
 await T('ai',async()=>{ await open(p,'content','Pages');
   await p.locator('#admBody .ai-btn').nth(0).click(); await p.waitForTimeout(1000);
   await p.locator('.ai-dlg button',{hasText:'Write new'}).click(); await p.waitForTimeout(400);
   await p.locator('.ai-dlg textarea').first().fill('A short welcome line for the home page');
   await p.locator('.ai-dlg .ai-go button').first().click(); await p.waitForTimeout(1500);
   await snap(p,'32-aidialog',{el:'.ai-dlg',pad:6,marks:[{t:'Write new',n:1,tag:'button',within:'.ai-dlg'},{sel:'.ai-dlg textarea',n:2,pos:'l'},{t:'Style and references',n:3,tag:'b',within:'.ai-dlg'},{t:'Use this',n:4,tag:'button',within:'.ai-dlg'}]});
   await p.locator('.ai-dlg summary',{hasText:'Style and references'}).click(); await p.waitForTimeout(600);
   await snap(p,'33-aistyle',{el:'.ai-dlg',pad:6,maxH:880});
   await p.locator('.ai-dlg button',{hasText:'Save to archive'}).click(); await p.waitForTimeout(800);
   await p.locator('.ai-dlg button',{hasText:'Cancel'}).click().catch(()=>p.keyboard.press('Escape')); await p.waitForTimeout(500);
 });
 await T('aitab',async()=>{ await open(p,'content','AI writing'); await snap(p,'34-aitab',{main:true}); });
 await T('aiarch',async()=>{ await open(p,'content','AI archive'); await snap(p,'35-aiarchive',{main:true}); });
 await r.b.close();
})();
