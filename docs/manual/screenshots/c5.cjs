const {mark,snap,base,open,top,T}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p;
 await T('lib',async()=>{ await open(p,'media','Library');
  await snap(p,'26-library',{main:true,marks:[{t:'Check GitHub for new files',n:1,tag:'button'},{t:'Add by link',n:2,exact:false,tag:'button'},{t:'Choose a category…',n:3,exact:false,tag:'select,button,div'},{t:'Select several',n:4,tag:'button'},{t:'Possible duplicates (0)',n:5,exact:false,tag:'button'},{t:'Sort: Newest first',n:6,exact:false,tag:'select,button'}]});
  await p.screenshot({path:'tour/lib-full.png',fullPage:true});
  const tiles=p.locator('#admBody .lib-grid > *, #admBody [class*=lib-item], #admBody .media-tile');
  console.log('tiles',await tiles.count());
 });
 await T('missing',async()=>{ await open(p,'media','Missing images'); await snap(p,'29-missing',{main:true,marks:[{t:'Fill missing from category',n:1,exact:false,tag:'button'},{t:'Go there',n:2,tag:'button',nth:0},{t:'Change from library',n:3,exact:false,tag:'button'}]}); });
 await T('stock',async()=>{ await open(p,'media','Find photos'); await p.waitForTimeout(800); await snap(p,'30-findphotos',{main:true}); await p.screenshot({path:'tour/stock-full.png',fullPage:true}); });
 await r.b.close();
})();
