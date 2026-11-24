
/* ---------- procedural placeholder imagery ---------- */
function rng(seed){ let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function noise(seed){
  const r = rng(seed), p = new Uint16Array(512), g = new Float32Array(256), perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--){ const j = Math.floor(r()*(i+1)); [perm[i],perm[j]] = [perm[j],perm[i]]; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  for (let i = 0; i < 256; i++) g[i] = r();
  const f = t => t*t*(3-2*t);
  const v = (x,y) => g[p[(x & 255) + p[y & 255]]];
  const n2 = (x,y) => { const xi=Math.floor(x), yi=Math.floor(y), xf=x-xi, yf=y-yi, u=f(xf), w=f(yf);
    const a=v(xi,yi), b=v(xi+1,yi), c=v(xi,yi+1), d=v(xi+1,yi+1);
    return a+(b-a)*u+(c-a)*w+(a-b-c+d)*u*w; };
  const fbm = (x,y,o=5) => { let s=0, a=.5, fr=1, n=0; for (let i=0;i<o;i++){ s+=a*n2(x*fr,y*fr); n+=a; a*=.5; fr*=2.03; } return s/n; };
  return { n2, fbm };
}
const W = 1920, H = 1080;
function canvas(w=W,h=H){ const c=document.createElement("canvas"); c.width=w; c.height=h; return c; }
function stars(ctx, r, count, maxY, alpha=1){
  for (let i=0;i<count;i++){ const x=r()*W, y=r()*maxY, s=r(); ctx.fillStyle=`rgba(230,236,255,${(.15+s*.75)*alpha})`; ctx.fillRect(x,y,s>.97?2:1,s>.97?2:1); }
}

const scenes = {
  nebula(){
    const c=canvas(), ctx=c.getContext("2d"), r=rng(7), N=noise(11), M=noise(29);
    const w=640, h=360, lo=canvas(w,h), lx=lo.getContext("2d"), img=lx.createImageData(w,h), d=img.data;
    for (let y=0;y<h;y++) for (let x=0;x<w;x++){
      const nx=x/w*3.2, ny=y/h*1.8;
      const q=N.fbm(nx,ny,4);
      const n=N.fbm(nx+q*2.2, ny+q*1.4+3.1, 5);
      const m=M.fbm(nx*1.3+q, ny*1.3-q, 4);
      const band=Math.exp(-Math.pow((y/h-.55+(x/w-.5)*.35)*3.2,2));
      const a=Math.pow(Math.max(0,n-.34)*2.4,1.6)*band, b=Math.pow(Math.max(0,m-.42)*2.6,2.2)*band;
      const i=(y*w+x)*4;
      d[i]=8+ 70*a+260*b; d[i+1]=10+190*a+100*b; d[i+2]=26+250*a+210*b; d[i+3]=255;
    }
    lx.putImageData(img,0,0);
    ctx.imageSmoothingQuality="high"; ctx.drawImage(lo,0,0,W,H);
    stars(ctx,r,2600,H);
    for (let i=0;i<14;i++){ const x=r()*W, y=r()*H, R=6+r()*16, gr=ctx.createRadialGradient(x,y,0,x,y,R);
      gr.addColorStop(0,"rgba(255,255,255,.95)"); gr.addColorStop(.15,"rgba(190,215,255,.4)"); gr.addColorStop(1,"rgba(190,215,255,0)");
      ctx.fillStyle=gr; ctx.fillRect(x-R,y-R,R*2,R*2); }
    const core=ctx.createRadialGradient(W*.62,H*.5,0,W*.62,H*.5,W*.35);
    core.addColorStop(0,"rgba(255,180,140,.18)"); core.addColorStop(1,"rgba(255,180,140,0)");
    ctx.fillStyle=core; ctx.fillRect(0,0,W,H);
    return c;
  },
  ridges(){
    const c=canvas(), ctx=c.getContext("2d"), r=rng(3), N=noise(5);
    const sky=ctx.createLinearGradient(0,0,0,H*.62);
    sky.addColorStop(0,"#080b1c"); sky.addColorStop(.45,"#2b2346"); sky.addColorStop(.8,"#9a5a5c"); sky.addColorStop(1,"#f0a06a");
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    stars(ctx,r,700,H*.35,.6);
    const sx=W*.64, sy=H*.56, sun=ctx.createRadialGradient(sx,sy,0,sx,sy,H*.55);
    sun.addColorStop(0,"rgba(255,226,180,1)"); sun.addColorStop(.04,"rgba(255,200,150,.9)"); sun.addColorStop(.2,"rgba(255,150,100,.35)"); sun.addColorStop(1,"rgba(255,140,90,0)");
    ctx.fillStyle=sun; ctx.fillRect(0,0,W,H);
    const L=7;
    for (let i=0;i<L;i++){
      const t=i/(L-1), base=H*(.5+t*.42), amp=H*(.07+.16*t), fr=.0016+.0009*(1-t);
      const col=[ [150,96,110],[7,8,14] ], k=Math.pow(t,.7);
      const rr=Math.round(col[0][0]+(col[1][0]-col[0][0])*k), gg=Math.round(col[0][1]+(col[1][1]-col[0][1])*k), bb=Math.round(col[0][2]+(col[1][2]-col[0][2])*k);
      ctx.beginPath(); ctx.moveTo(0,H);
      for (let x=0;x<=W;x+=4){ const n=N.fbm(x*fr,i*7.3,6), ridge=1-Math.abs(2*n-1); ctx.lineTo(x, base-amp*(ridge*.85+n*.4)); }
      ctx.lineTo(W,H); ctx.closePath(); ctx.fillStyle=`rgb(${rr},${gg},${bb})`; ctx.fill();
      const fog=ctx.createLinearGradient(0,base-amp*.2,0,base+H*.06);
      fog.addColorStop(0,"rgba(220,150,130,0)"); fog.addColorStop(1,`rgba(220,150,130,${.22*(1-t)})`);
      ctx.fillStyle=fog; ctx.fillRect(0,base-amp*.2,W,H*.12+amp);
    }
    return c;
  },
  city(){
    const c=canvas(), ctx=c.getContext("2d"), r=rng(19);
    const sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,"#04060e"); sky.addColorStop(.5,"#111833"); sky.addColorStop(.78,"#2c2a4e"); sky.addColorStop(1,"#3e3354");
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    stars(ctx,r,500,H*.4,.5);
    const rows=[{wmin:24,wmax:70,hmin:120,hmax:360,col:"#151a33",lit:.12,a:.35},{wmin:50,wmax:120,hmin:220,hmax:600,col:"#0b0e1f",lit:.2,a:.6},{wmin:90,wmax:210,hmin:320,hmax:860,col:"#04050b",lit:.28,a:.9}];
    rows.forEach((row,ri)=>{
      let x=-40;
      while (x<W){
        const bw=row.wmin+r()*(row.wmax-row.wmin), bh=row.hmin+r()*(row.hmax-row.hmin)*(.5+.5*Math.sin(x/W*Math.PI)+.2), top=H-bh;
        ctx.fillStyle=row.col; ctx.fillRect(x,top,bw,bh);
        if (r()>.6){ ctx.fillRect(x+bw*.45,top-30-r()*60,2,90); ctx.fillStyle=`rgba(255,80,70,${row.a})`; ctx.fillRect(x+bw*.45-1,top-34-r()*50,4,4); }
        const sx=5+ri*2, sy=8+ri*3, ww=2+ri, wh=3+ri;
        for (let wy=top+10; wy<H-6; wy+=sy) for (let wx=x+6; wx<x+bw-6; wx+=sx){
          if (r()<row.lit){ const warm=r()>.35; ctx.fillStyle=warm?`rgba(255,210,150,${row.a*(.4+r()*.6)})`:`rgba(160,210,255,${row.a*(.4+r()*.6)})`; ctx.fillRect(wx,wy,ww,wh); }
        }
        x+=bw+(ri===2?r()*30:r()*8);
      }
      const haze=ctx.createLinearGradient(0,H*.45,0,H);
      haze.addColorStop(0,"rgba(80,70,120,0)"); haze.addColorStop(1,`rgba(80,70,120,${.25-.07*ri})`);
      ctx.fillStyle=haze; ctx.fillRect(0,0,W,H);
    });
    for (let i=0;i<3;i++){ const y=H*(.86+i*.04); const gr=ctx.createLinearGradient(0,y,W,y);
      gr.addColorStop(0,"rgba(255,150,90,0)"); gr.addColorStop(.5,"rgba(255,150,90,.5)"); gr.addColorStop(1,"rgba(255,150,90,0)");
      ctx.fillStyle=gr; ctx.fillRect(0,y,W,2); }
    return c;
  },
  ocean(){
    const c=canvas(), ctx=c.getContext("2d"), r=rng(41), hz=H*.58, sx=W*.58;
    const sky=ctx.createLinearGradient(0,0,0,hz);
    sky.addColorStop(0,"#081230"); sky.addColorStop(.5,"#2a3b6a"); sky.addColorStop(.85,"#b9787a"); sky.addColorStop(1,"#f6b27a");
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,hz);
    stars(ctx,r,300,H*.25,.4);
    const glow=ctx.createRadialGradient(sx,hz,0,sx,hz,W*.45);
    glow.addColorStop(0,"rgba(255,225,180,1)"); glow.addColorStop(.03,"rgba(255,205,150,.9)"); glow.addColorStop(.18,"rgba(255,160,110,.35)"); glow.addColorStop(1,"rgba(255,160,110,0)");
    ctx.fillStyle=glow; ctx.fillRect(0,0,W,hz);
    const sea=ctx.createLinearGradient(0,hz,0,H);
    sea.addColorStop(0,"#3a3a58"); sea.addColorStop(.25,"#161d36"); sea.addColorStop(1,"#03050b");
    ctx.fillStyle=sea; ctx.fillRect(0,hz,W,H-hz);
    for (let y=hz; y<H; y+=1.5){
      const t=(y-hz)/(H-hz);
      for (let k=0;k<4;k++){ const x=r()*W, w=20+r()*200*(.3+t); ctx.fillStyle=`rgba(170,180,230,${.05*(1-t)})`; ctx.fillRect(x,y,w,1); }
      const spread=40+t*420, n=3+Math.floor(t*6);
      for (let k=0;k<n;k++){ const x=sx+(r()-.5)*2*spread*Math.pow(r(),.7), w=6+r()*80*(.4+t), a=(.75-.6*t)*(.4+r()*.6);
        ctx.fillStyle=`rgba(255,${190+Math.floor(r()*40)},${130+Math.floor(r()*40)},${a})`; ctx.fillRect(x-w/2,y,w,1+t*1.5); }
    }
    ctx.fillStyle="rgba(255,230,190,.9)"; ctx.fillRect(0,hz-1,W,1.2);
    return c;
  }
};

export { rng, noise, W, H, canvas, stars, scenes };
