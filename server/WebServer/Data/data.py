
with open('','r',encoding='utf-8') as f:
    j=f.read().split()
from collections import defaultdict
p=defaultdict(int)
for i in j:
    p[i[0]]+=1
    # if i[0]!=duem(i[0]):
    #     p[duem(i[0])]+=1
p=dict(sorted(p.items(),key=lambda x:(x[1])))
import json
with open('','w',encoding='utf-8') as jf:
    json.dump(p,jf,ensure_ascii=False)