import sys,re,json
sys.path.insert(0,'.')
from pypdf import PdfReader
from content import DOC
r=PdfReader('manual.pdf'); T=[re.sub(r'\s+',' ',(p.extract_text() or '')) for p in r.pages]
start=next(i for i,t in enumerate(T) if 'How to use this manual' in t)
cur=start; pages={}; chn=0; secn=0; miss=[]
for it in DOC:
  if it[0] not in('ch','sec'): continue
  if it[0]=='ch': chn+=1; secn=0; mid=f'c{chn}'
  else: secn+=1; mid=f'c{chn}s{secn}'
  title=re.sub(r'<[^>]+>','',it[1]).replace('&amp;','&')
  j=cur
  while j<len(T) and title not in T[j]: j+=1
  if j>=len(T): miss.append(title); continue
  pages[mid]=j+1; cur=j
print(len(r.pages),'missing',miss); json.dump(pages,open('pages.json','w'))
