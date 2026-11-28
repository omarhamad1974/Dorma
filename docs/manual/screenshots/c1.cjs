const {mark,snap,base,open}=require('./shot.cjs');
(async()=>{
 const r=await base(); const p=r.p;
 await snap(p,'02-overview',{marks:[{t:'Content',n:1,tag:'button',within:'.adm-side'},{sel:'#admSub .tabs',n:2,pos:'tl'},{sel:'#admTop .status',n:3,pos:'l'},{t:'Find',n:4,tag:'button'},{sel:'.md-list, .master, .adm-body .list',n:5},{t:'Page',n:6,tag:'h2,h3,h4,span,b,div',exact:true}]});
 // live preview
 await p.locator('#admTop button',{hasText:'Live preview'}).click(); await p.waitForTimeout(3500);
 await snap(p,'04-livepreview',{});
 const lpInfo=await p.evaluate(()=>{const e=document.querySelector('[class*=lp]'); return [...document.querySelectorAll('[class^=lp],[class*=" lp"]')].slice(0,15).map(e=>e.className+' :: '+(e.getAttribute('title')||e.getAttribute('aria-label')||'')).join('\n')}); console.log(lpInfo);
 await p.locator('#admTop button',{hasText:'Live preview'}).click(); await p.waitForTimeout(500);
 // find
 await p.locator('#admSub button',{hasText:'Find'}).click(); await p.waitForTimeout(500);
 await p.keyboard.type('menu'); await p.waitForTimeout(600);
 await snap(p,'05-find',{clip:{x:560,y:120,width:720,height:560}});
 await p.keyboard.press('Escape'); await p.waitForTimeout(300);
 await p.locator('#admSub button',{hasText:'Aa'}).click(); await p.waitForTimeout(500);
 await snap(p,'06-textsize',{clip:{x:700,y:120,width:580,height:520}});
 await p.keyboard.press('Escape');
 await r.b.close();
})();
