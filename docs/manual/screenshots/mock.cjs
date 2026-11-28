const { chromium } = require('playwright');
const SB='https://uhytsroauemdkuanwdoh.supabase.co';
const now=Date.now(), iso=(h)=>new Date(now-h*3600e3).toISOString();
const user={id:'00000000-0000-0000-0000-000000000001',aud:'authenticated',role:'authenticated',email:'editor@example.com',app_metadata:{},user_metadata:{},created_at:iso(500)};
const session={access_token:'x.eyJzdWIiOiIxIn0.x',refresh_token:'r',token_type:'bearer',expires_in:360000,expires_at:Math.floor(now/1000)+360000,user};
const DB={ site_config:[], proposals:[], proposal_opens:[], social_plan:[], ai_archive:[], enquiries:[
 {id:'e1',created_at:iso(2),kind:'quote',status:'new',name:'Sample visitor',email:'sample@example.com',phone:'',company:'Example Co.',service:'Signage & Displays',quantity:'4',deadline:'',message:'This is a sample message, sent to show how the Inbox looks.',lang:'en',page:'#signage',proposal_id:null,proposal_slug:'',client:'',replied_at:null},
 {id:'e2',created_at:iso(26),kind:'contact',status:'read',name:'Second sample',email:'second@example.com',phone:'',company:'',service:'',quantity:'',deadline:'',message:'Another sample message for the manual.',lang:'en',page:'#home',proposal_id:null,proposal_slug:'',client:'',replied_at:null}]};
const RPC={ is_editor:true, studio_badges:{unread:1,new_opens:0}, proposal_stats:[], database_size:9.4e6, publish_draft:null, keep_alive:null, save_snapshot:null, update_version:null, delete_version:true,
 keepalive_status:[{at:iso(9),source:'github',note:'Daily keep-alive'},{at:iso(33),source:'github',note:'Daily keep-alive'}],
 version_list:[{id:12,published_at:iso(1),kind:'publish',label:'',pinned:false,bytes:76000,mine:true},{id:11,published_at:iso(5),kind:'snapshot',label:'Before the new home page',pinned:true,bytes:75000,mine:true},{id:10,published_at:iso(28),kind:'auto',label:'Before restoring version 9',pinned:false,bytes:74000,mine:true},{id:9,published_at:iso(50),kind:'publish',label:'',pinned:false,bytes:74000,mine:true}],
 submit_enquiry:{ok:true}, open_proposal:(b)=>{ const x=DB.proposals.find(q=>q.slug===b.p_slug); return x?{ok:true,slug:x.slug,data:x.data,searchable:false,status:x.status||'live',expires_on:null}:{ok:false,code:'missing'}; } };
let FN={ 'ai-write':(b)=>b.action==='status'?{ok:true,ready:true,used:4,limit:150}:{ok:true,used:5,limit:150,refs:[],notes:[],text:{en:'An agency and in-house production house, with 20 years of experience.',ar:'وكالة ودار إنتاج داخلية، بخبرة 20 عامًا.'}},
 'stock-search':(b)=>b.action==='status'?{ok:true,providers:{pexels:true,pixabay:true,unsplash:true},ai:true}:{ok:true,photos:[],alternatives:[]} };
async function mock(ctx){
  await ctx.addInitScript(([s])=>{try{localStorage.setItem('sb-uhytsroauemdkuanwdoh-auth-token',JSON.stringify(s));localStorage.setItem('dorma.studioMode','light')}catch{}},[session]);
  await ctx.route(SB+'/**', async (route)=>{
    const r=route.request(), u=new URL(r.url()), m=r.method(), p=u.pathname;
    const json=(b,st=200)=>route.fulfill({status:st,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*','content-range':'0-0/*'},body:JSON.stringify(b)});
    if(m==='OPTIONS') return json({});
    if(p.startsWith('/auth/v1/user')) return json(user);
    if(p.startsWith('/auth/v1/')) return json(session);
    if(p.startsWith('/rest/v1/rpc/')){ const n=p.split('/').pop(); let bd={}; try{bd=JSON.parse(r.postData()||'{}')}catch{} const v=RPC[n]; return json(typeof v==='function'?v(bd):(n in RPC?v:null)); }
    if(p.startsWith('/functions/v1/')){ const n=p.split('/').pop(); let b={}; try{b=JSON.parse(r.postData()||'{}')}catch{} return json(FN[n]?FN[n](b):{ok:false,code:'not_deployed'}); }
    if(p.startsWith('/storage/v1/')) return json([]);
    if(p.startsWith('/rest/v1/')){
      const t=p.split('/').pop(); const rows=DB[t]||(DB[t]=[]);
      const accept=r.headers()['accept']||'';
      if(m==='GET'){ let out=rows; const id=u.searchParams.get('id'); if(id&&id.startsWith('eq.')) out=rows.filter(x=>String(x.id)===id.slice(3));
        if(accept.includes('vnd.pgrst.object')) return out.length?json(out[0]):json({code:'PGRST116',message:'none'},406);
        return json(out); }
      let body=[]; try{body=JSON.parse(r.postData()||'[]')}catch{} if(!Array.isArray(body)) body=[body];
      if(m==='POST'){ body.forEach(b=>{ if(!b.id) b.id=String(Math.random()).slice(2); if(!b.created_at) b.created_at=new Date().toISOString(); const i=rows.findIndex(x=>x.id===b.id); if(i>=0) rows[i]={...rows[i],...b}; else rows.unshift(b); });
        return accept.includes('vnd.pgrst.object')?json(body[0],201):json(body,201); }
      if(m==='PATCH'){ return json([],200); }
      if(m==='DELETE'){ return json([],200); }
    }
    return json({});
  });
}
async function start(opts={}){
  const b=await chromium.launch(); const ctx=await b.newContext({viewport:opts.viewport||{width:1440,height:960},deviceScaleFactor:opts.dsf||1, ...(opts.ctx||{})});
  if(!opts.noAuth) await mock(ctx); else await ctx.route(SB+'/**',r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:'[]'}));
  const p=await ctx.newPage(); p.on('pageerror',e=>console.log('PAGEERR',e.message));
  await p.goto('http://localhost:5174/'+(opts.hash||'#admin')); await p.waitForTimeout(2500);
  return {b,ctx,p};
}
async function open(p,group,sub){
  await p.click(`.adm-side button[data-g="${group}"]`); await p.waitForTimeout(350);
  if(sub){ await p.locator('#admSub .tabs button',{hasText:sub}).first().click(); await p.waitForTimeout(800);}
}
module.exports={start,open,DB,RPC};
