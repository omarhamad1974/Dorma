const {mark,snap,base,open}=require('./shot.cjs');
const T=async(name,fn)=>{try{await fn()}catch(e){console.log('FAIL',name,e.message.split('\n')[0])}};
(async()=>{
 const r=await base(); const p=r.p;
 await T('outline',async()=>{ await open(p,'outline','Site outline');
  await snap(p,'07-outline',{marks:[{t:'Open all',n:1,tag:'button'},{sel:'#admBody .handle, #admBody [class*=grip]',n:2,pos:'l'},{t:'IN MENU',n:3,exact:false,tag:'button,span'},{t:'Jump to design',n:4,tag:'button'},{t:'＋ Add section',n:5,exact:false,tag:'button,select,summary,div'}]});
 });
 await T('conn',async()=>{ await open(p,'outline','Connections');
  await snap(p,'08-connections',{marks:[{t:'What opens what',n:1,tag:'button'},{t:'What opens this',n:2,tag:'button'},{t:'Problems',n:3,exact:false,tag:'button'},{sel:'#admBody input[type=search], #admBody input[placeholder*=Search]',n:4},{t:'Open',n:5,exact:false,tag:'button',nth:2}]});
  await p.locator('#admBody button',{hasText:'Problems'}).first().click(); await p.waitForTimeout(600);
  await snap(p,'08b-problems',{clip:{x:208,y:200,width:1072,height:700}});
 });
 await T('pages',async()=>{ await open(p,'content','Pages');
  const card=p.locator('section.card-a',{hasText:'Sections · drag'}).first(); await card.scrollIntoViewIfNeeded(); await p.evaluate(()=>scrollBy(0,-120)); await p.waitForTimeout(400);
  await snap(p,'09-sections',{marks:[{sel:'.sub-head .handle',n:1,pos:'l'},{sel:'.sub-head .vis-pill',n:2,pos:'tl'},{sel:'.sub-head button.x',n:3,pos:'tr'},{sel:'.sub-head button.x',nth:1,n:4,pos:'tr'},{sel:'.sub-head .t',n:5,pos:'tl'}]});
  // open second section
  await p.locator('.sub-head .t').nth(1).click(); await p.waitForTimeout(800);
  await p.locator('.sub-item').nth(1).scrollIntoViewIfNeeded(); await p.evaluate(()=>{const e=document.querySelectorAll('.sub-item')[1]; scrollTo(0,e.getBoundingClientRect().top+scrollY-20)}); await p.waitForTimeout(500);
  await snap(p,'10-section-open',{marks:[{t:'AI',n:1,tag:'button',nth:0},{sel:'.sub-item:nth-child(2) .media-slot, .sub-item:nth-child(2) [class*=thumb]',n:2}]});
  await p.screenshot({path:'tour/sec-full.png',fullPage:true});
 });
 await r.b.close();
})();
