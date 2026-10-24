/** Coordinate witness: 1727×1381 original image; chassis crop x=80,y=475,w=1560,h=505, no stretch. */
export const panel01w={width:1560,height:505,reference:{width:1727,height:1381,x:80,y:475,url:'/reference/korg-ai2/01W-original.jpg'},screen:{x:608,y:95,width:237,height:64},keyboard:{x:270,y:265,width:1230,height:215},
 keys:[
  {id:'combi',label:'COMBI',x:386,y:113,w:29,h:12},{id:'edit-combi',label:'EDIT COMBI',x:418,y:113,w:29,h:12},
  {id:'prog',label:'PROG',x:386,y:139,w:29,h:12},{id:'edit',label:'EDIT PROG',x:418,y:139,w:29,h:12},
  {id:'seq',label:'SEQ',x:386,y:166,w:29,h:12},{id:'global',label:'GLOBAL',x:418,y:166,w:29,h:12},
  {id:'int-card',label:'INT/CARD',x:386,y:194,w:29,h:12},{id:'bank',label:'BANK',x:418,y:194,w:29,h:12},
  {id:'value-up',label:'▲',x:523,y:119,w:25,h:12},{id:'value-down',label:'▼',x:523,y:143,w:25,h:12},
  {id:'cursor-next',label:'UP',x:562,y:119,w:25,h:12},{id:'cursor-prev',label:'DOWN',x:562,y:143,w:25,h:12},
  {id:'page-next',label:'PAGE +',x:866,y:119,w:24,h:12},{id:'page-prev',label:'PAGE −',x:866,y:143,w:24,h:12},
  ...Array.from({length:8},(_,i)=>({id:'field-'+i,label:String.fromCharCode(65+i),x:630+i*23,y:184,w:22,h:10})),
  ...Array.from({length:9},(_,i)=>({id:'number-'+(i+1),label:String(i+1),x:964+(i%3)*30,y:112+Math.floor(i/3)*26,w:29,h:12})),
  {id:'hold',label:"10’S HOLD −",x:964,y:190,w:29,h:12},{id:'number-0',label:'0',x:995,y:190,w:29,h:12},{id:'compare',label:'COMPARE',x:1026,y:190,w:29,h:12},
  {id:'rec',label:'REC/WRITE',x:1061,y:138,w:30,h:12},{id:'start',label:'START/STOP',x:1061,y:164,w:30,h:12},{id:'reset',label:'RESET',x:1061,y:190,w:30,h:12},
 ],landmarks:[{id:'volume',x:230,y:158},{id:'value',x:506,y:158},{id:'screen-top-left',x:608,y:95},{id:'screen-bottom-right',x:845,y:159},{id:'joystick',x:146,y:346}]} as const
