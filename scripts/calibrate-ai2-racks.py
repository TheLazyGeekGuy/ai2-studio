"""Project manually observed reference points onto a native SVG chassis plane.
No raster transformation and no fidelity percentage is calculated.
"""
import json
from pathlib import Path
panels={
'X3R':{'quad':[[42,109],[1534,62],[1522,329],[50,373]],'height':330,'size':[1575,403],'points':{'lcd':[[659,157],[921,146],[919,247],[661,259]],'bezel':[[600,128],[980,114],[979,274],[601,291]],'volume':[[183,259]],'phones':[[190,325]],'pages':[[202+i*49,169-i*1.5]for i in range(8)],'reset':[[260,232]],'rec':[[307,231]],'start':[[386,229]],'value':[[480,228]],'up':[[545,203]],'down':[[545,242]],'modes':[[628+i*47,322-i*1.2]for i in range(8)],'digits':[[1147+(i%3)*48,139+(i//3)*36-(i%3)*1.5]for i in range(12)],'nav':[[1054,157],[1016,193],[1093,190],[1055,232]],'disk':[[260,272],[555,309]],'pcm':[[1014,299],[1200,316]],'data':[[1244,291],[1434,308]],'power':[[1380,218]],'logo':[[1440,143]]}},
'01R/W':{'quad':[[148,468],[1633,597],[1627,916],[170,736]],'height':320,'size':[1920,1280],'points':{'lcd':[[467,559],[838,592],[840,719],[472,677]],'bezel':[[420,532],[890,574],[892,747],[424,705]],'volume':[[256,617]],'phones':[[261,712]],'left':[[306+i*4,550+i*39]for i in range(5)],'right':[[353+i*3.5,556+i*38.5]for i in range(5)],'soft':[[487+i*47,742+i*5]for i in range(8)],'nav':[[931,644],[933,697],[968,648],[968,704]],'value':[[1013,627],[1013,750]],'digits':[[1076+(i%3)*54,624+(i//3)*40+(i%3)*6]for i in range(12)],'rec':[[1238,680]],'start':[[1239,721]],'reset':[[1239,761]],'pcm':[[1014,790],[1200,816]],'data':[[1260,819],[1460,848]],'power':[[1417,762]],'logo':[[1480,662]]}}}
panels['N1R']={'quad':[[52,805],[1822,834],[1810,982],[50,976]],'height':180,'size':[1824,1368],'points':{'lcd':[[405,849],[721,857],[722,937],[403,937]],'bezel':[[379,830],[742,837],[742,949],[379,949]],'volume':[[250,862]],'phones':[[251,929]],'value':[[800,905]],'up':[[858,871]],'down':[[860,931]],'page0':[[906,869]],'page1':[[948,869]],'left':[[903,931]],'right':[[947,931]],'functions':[[1015,869],[1058,869],[1124,870],[1163,870],[1206,871]],'modes':[[1015,931],[1058,931],[1123,932],[1165,933],[1207,933]],'knobs':[[1310+i*79,943]for i in range(4)],'logo':[[1770,921]],'power':[[1615,900]]}}
def solve(a,v):
 a=[row[:]+[value]for row,value in zip(a,v)]
 for col in range(len(v)):
  row=max(range(col,len(v)),key=lambda i:abs(a[i][col]));a[col],a[row]=a[row],a[col]
  pivot=a[col][col];a[col]=[x/pivot for x in a[col]]
  for i in range(len(v)):
   if i!=col:
    factor=a[i][col];a[i]=[x-factor*y for x,y in zip(a[i],a[col])]
 return [row[-1]for row in a]
for model,r in panels.items():
 a=[];v=[]
 for (x,y),(u,w) in zip(r['quad'],[[0,0],[1800,0],[1800,r['height']],[0,r['height']]]):a.extend([[x,y,1,0,0,0,-u*x,-u*y],[0,0,0,x,y,1,-w*x,-w*y]]);v.extend([u,w])
 h=solve(a,v)+[1];r['homography']=h;r['mapped']={}
 for key,points in r['points'].items():
  r['mapped'][key]=[]
  for x,y in points:
   z=h[6]*x+h[7]*y+1;r['mapped'][key].append([round((h[0]*x+h[1]*y+h[2])/z,1),round((h[3]*x+h[4]*y+h[5])/z,1)])
 print(model,json.dumps(r['mapped']))
Path('output/research/expansion-20261025/panels/manual-landmarks.json').write_text(json.dumps({'note':'Manual landmarks from reference images; no measured fidelity score. 01RW witness coordinates refer to displayed 1920x1280 from the 3908x2605 original.','panels':panels},indent=2))
