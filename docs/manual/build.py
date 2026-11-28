import sys, re, json, subprocess, html
sys.path.insert(0, '.')
from content import DOC
pages = json.load(open('pages.json')) if len(sys.argv) > 1 and sys.argv[1] == 'final' else {}
out = []; toc = []; chn = 0; secn = 0
def esc(s): return s
for item in DOC:
    k = item[0]
    if k == 'ch':
        chn += 1; secn = 0; mid = f'c{chn}'
        toc.append((1, item[1], mid))
        num = '' if item[1] in ('Quick start','Glossary') or item[1].startswith('Appendix') or item[1].startswith('What needs') else f'<span class="chnum">Chapter {chn-1}</span>'
        out.append(f'<section class="chapter" id="{mid}"><span class="mk">@@{mid}@@</span>{num}<h1>{item[1]}</h1>' + (f'<p class="intro">{item[2]}</p>' if item[2] else '') + '</section>')
    elif k == 'sec':
        secn += 1; mid = f'c{chn}s{secn}'
        toc.append((2, item[1], mid))
        out.append(f'<h2 id="{mid}"><span class="mk">@@{mid}@@</span>{item[1]}</h2>')
    elif k == 'sub': out.append(f'<h3>{item[1]}</h3>')
    elif k == 'p': out.append(f'<p>{item[1]}</p>')
    elif k == 'where': out.append(f'<p class="where"><span>WHERE</span>{item[1]}</p>')
    elif k == 'steps': out.append('<ol class="steps">' + ''.join(f'<li><span class="n">{i+1}</span><div>{s}</div></li>' for i, s in enumerate(item[1])) + '</ol>')
    elif k == 'bullets': out.append('<ul class="bul">' + ''.join(f'<li>{s}</li>' for s in item[1]) + '</ul>')
    elif k == 'tip': out.append(f'<div class="call tip"><b class="lab">TIP</b><div>{item[1]}</div></div>')
    elif k == 'warn': out.append(f'<div class="call warn"><b class="lab">IMPORTANT</b><div>{item[1]}</div></div>')
    elif k == 'fig':
        _, img, cap, legend, w = item
        leg = ''
        if legend:
            leg = '<ol class="legend">' + ''.join(f'<li><span class="dot">{i+1}</span><div>{l}</div></li>' for i, l in enumerate(legend)) + '</ol>'
        out.append(f'<figure style="--w:{w}%"><div class="fimg"><img src="img/{img}.jpg"><figcaption>{cap}</figcaption></div>{leg}</figure>')
    elif k == 'table':
        rows, head = item[1], item[2]
        t = '<table>' + ('<tr>' + ''.join(f'<th>{h}</th>' for h in head) + '</tr>' if head else '')
        t += ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in r) + '</tr>' for r in rows) + '</table>'
        out.append(t)
    elif k == 'gloss':
        out.append('<dl class="gloss">' + ''.join(f'<div><dt>{a}</dt><dd>{b}</dd></div>' for a, b in item[1]) + '</dl>')
    elif k == 'brk': out.append('<div class="pb"></div>')

tocrows = []
for lvl, title, mid in toc:
    pg = pages.get(mid, '')
    tocrows.append(f'<a class="t{lvl}" href="#{mid}"><span class="tt">{title}</span><span class="lead"></span><span class="pg">{pg}</span></a>')

cover = f'''<section class="cover">
<div class="cbar"><i style="background:#ED0677"></i><i style="background:#FFCB08"></i><i style="background:#00AEEF"></i></div>
<img class="clogo" src="img/dorma-logo.png">
<p class="ckicker">Admin manual</p>
<h1 class="ctitle">The Dorma<br>Studio</h1>
<p class="csub">An illustrated, step-by-step guide to every feature of the website studio.</p>
<img class="cshot" src="img/02-overview.jpg">
<p class="cdate">Edition of 28 November 2026 · covers the studio as of this date</p>
</section>'''
howto = '''<section class="howto"><h2 class="noline">How to use this manual</h2>
<div class="hgrid">
<div><span class="n">1</span><p><b>Numbered steps</b> tell you what to press, in order.</p></div>
<div><span class="dot big">1</span><p><b>Pink numbered markers</b> on the pictures match the numbered list under each picture.</p></div>
<div class="call tip"><b class="lab">TIP</b><div>Yellow boxes are tips that save time.</div></div>
<div class="call warn"><b class="lab">IMPORTANT</b><div>Pink boxes are things to be careful about.</div></div>
</div>
<p class="where"><span>WHERE</span>Grey labels like this one tell you which tab and sub-tab to open.</p>
<p>Names in <b>bold</b> are the exact words you see on a button or setting in the studio. The pictures show sample content; your studio shows your own pages, pictures and messages.</p></section>'''
doc = f'''<!doctype html><html><head><meta charset="utf-8"><title>Dorma Studio admin manual</title>
<link rel="stylesheet" href="manual.css"></head><body>
{cover}
<section class="tocp"><h1 class="toch">Contents</h1><nav class="toc">{''.join(tocrows)}</nav></section>
{howto}
{''.join(out)}
</body></html>'''
open('manual.html', 'w').write(doc)
print('toc entries', len(toc))
