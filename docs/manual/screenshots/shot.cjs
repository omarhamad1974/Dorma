const {start,open}=require('./mock.cjs');
const fs=require('fs');
/* markers: [{t:'text'|sel:'css', n:1, nth:0, within:'css', pos:'tl'|'tr'|'l'|'r'}] */
async function mark(p,marks){
  await p.evaluate((marks)=>{
    document.querySelectorAll('.mm-mark').forEach(e=>e.remove());
    const find=(m)=>{ const root=m.within?document.querySelector(m.within):document; if(!root) return null;
      if(m.sel){ const all=[...root.querySelectorAll(m.sel)].filter(e=>e.getBoundingClientRect().width>0); return all[m.nth||0]; }
      const all=[...root.querySelectorAll(m.tag||'button,a,h1,h2,h3,h4,label,summary,span,b,strong,p,div,li,input,select')].filter(e=>{const r=e.getBoundingClientRect(); if(!r.width) return false;
        const tx=(e.innerText||e.value||'').trim(); return m.exact===false? tx.includes(m.t) : tx===m.t;});
      // pick the smallest
      all.sort((a,b)=>a.getBoundingClientRect().width*a.getBoundingClientRect().height-b.getBoundingClientRect().width*b.getBoundingClientRect().height);
      return all[m.nth||0]; };
    const miss=[];
    for(const m of marks){ const el=find(m); if(!el){miss.push(m.t||m.sel);continue;}
      const r=el.getBoundingClientRect(), sx=scrollX, sy=scrollY;
      if(m.box!==false){ const b=document.createElement('div'); b.className='mm-mark';
        Object.assign(b.style,{position:'absolute',left:(r.left+sx-4)+'px',top:(r.top+sy-4)+'px',width:(r.width+8)+'px',height:(r.height+8)+'px',border:'3px solid #ED0677',borderRadius:'8px',zIndex:2147483646,pointerEvents:'none',boxSizing:'border-box'}); document.body.append(b);}
      const c=document.createElement('div'); c.className='mm-mark'; c.textContent=m.n;
      const pos=m.pos||'tl'; let x=r.left+sx-16, y=r.top+sy-16;
      if(pos==='tr'){x=r.right+sx-14;} if(pos==='r'){x=r.right+sx+8;y=r.top+sy+r.height/2-14;} if(pos==='l'){x=r.left+sx-38;y=r.top+sy+r.height/2-14;} if(pos==='b'){x=r.left+sx+r.width/2-14;y=r.bottom+sy+6;}
      Object.assign(c.style,{position:'absolute',left:x+'px',top:y+'px',width:'28px',height:'28px',borderRadius:'50%',background:'#ED0677',color:'#fff',font:'700 16px/28px Arial,sans-serif',textAlign:'center',zIndex:2147483647,boxShadow:'0 0 0 3px #fff, 0 2px 6px rgba(0,0,0,.35)',pointerEvents:'none'});
      document.body.append(c); }
    return miss;
  },marks).then(m=>{ if(m.length) console.log('  MISSING marks:',m.join(' | ')); });
}
async function snap(p,name,opts={}){
  if(opts.marks) await mark(p,opts.marks);
  let clip=opts.clip; if(opts.main) clip={x:233,y:opts.y0??140,width:1047,height:opts.h||(900-(opts.y0??140))};
  if(opts.el){ const bb=await p.locator(opts.el).first().boundingBox(); const pad=opts.pad??8; clip={x:Math.max(0,bb.x-pad),y:Math.max(0,bb.y-pad),width:bb.width+2*pad,height:Math.min(bb.height+2*pad,opts.maxH||2000)}; }
  await p.screenshot({path:`shots/${name}.png`,clip,fullPage:!!opts.full});
  await p.evaluate(()=>document.querySelectorAll('.mm-mark').forEach(e=>e.remove()));
  console.log('shot',name);
}
async function base(opts={}){
  const r=await start({viewport:opts.viewport||{width:1280,height:900},dsf:opts.dsf??1.5,hash:opts.hash,noAuth:opts.noAuth,ctx:opts.ctx});
  if(!opts.keepText){ await r.p.evaluate(()=>{try{localStorage.setItem('dorma.studioText', '1.12')}catch{}}); await r.p.reload(); await r.p.waitForTimeout(2500); }
  return r;
}
module.exports={mark,snap,base,open};
module.exports.top=async(p,loc,off=270)=>{ await loc.first().evaluate((e,off)=>scrollTo(0,e.getBoundingClientRect().top+scrollY-off),off); await p.waitForTimeout(450); };
module.exports.T=async(name,fn)=>{try{await fn()}catch(e){console.log('FAIL',name,e.message.split('\n')[0])}};
