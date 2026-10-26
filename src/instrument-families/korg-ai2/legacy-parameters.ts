import {ai2EffectNames} from './effect-parameters'
/** X5 Table 1/7 inventory. Other legacy layouts explicitly override reserved fields, ranges and offsets. */
export interface LegacyParameter {id:number;offset:number;live?:number;label:string;group:string;min:number;max:number;mask?:number;shift?:number;width?:number;effectSwitch?:boolean;options?:readonly string[]}
export function legacyParameters(multisoundNames:readonly string[]){
const defs:LegacyParameter[]=[]
const add=(offset:number,live:number|undefined,label:string,group:string,min=0,max=99,extra:Partial<LegacyParameter>={})=>defs.push({id:offset,offset,live,label,group,min,max,...extra})
add(10,0,'Oscillator mode','Common',0,2,{options:['Single','Double','Drums']})
add(11,1,'Voice assignment','Common',0,1,{id:1001,mask:1,options:['Poly','Mono']})
add(11,2,'Hold','Common',0,1,{id:1002,mask:2,shift:1,options:['Off','On']})
add(18,88,'Interval','Common',-12,12);add(19,89,'Detune','Common',-50,50);add(20,90,'Delay start','Common')
for(const [offset,live,label,min,max] of [[21,3,'Start level',-99,99],[22,4,'Attack time',0,99],[23,5,'Attack level',-99,99],[24,6,'Decay time',0,99],[25,7,'Release time',0,99],[26,8,'Release level',-99,99],[27,10,'Time velocity sensitivity',-99,99],[28,9,'Level velocity sensitivity',-99,99]] as const)add(offset,live,label,'Pitch EG',min,max)
const waves=['Triangle','Up saw','Down saw','Square 1','Random','Square 2']
add(29,11,'Waveform','Cutoff MG',0,5,{id:1029,mask:7,options:waves});add(29,15,'Oscillator select','Cutoff MG',0,3,{id:1030,mask:96,shift:5,options:['Neither','OSC 1','OSC 2','Both']});add(29,16,'Key sync','Cutoff MG',0,1,{id:1031,mask:128,shift:7,options:['Off','On']})
add(30,12,'Frequency','Cutoff MG');add(31,14,'Delay','Cutoff MG');add(32,13,'Intensity','Cutoff MG')
add(33,17,'Pitch bend range','Aftertouch',-12,12);add(34,18,'VDF cutoff','Aftertouch',-99,99);add(35,19,'VDF MG intensity','Aftertouch');add(36,20,'VDA amplitude','Aftertouch',-99,99)
add(37,22,'Pitch bend range','Joystick',-12,12);add(38,23,'VDF sweep intensity','Joystick',-99,99);add(39,21,'VDF MG intensity','Joystick')
for(let osc=0;osc<2;osc++){
 const delta=osc*47,wire=osc*67,g='OSC '+(osc+1)
 add(osc?15:12,24+wire,'Multisound',g,0,429,{width:2,options:multisoundNames})
 add(osc?17:14,26+wire,'Octave',g,-2,1,{options:undefined})
 const rows:[number,number,string,string,number,number][]=[
 [40,27,'Pitch EG intensity',g,-99,99],
 [42,79,'Frequency',g+' Pitch MG',0,99],[43,81,'Delay',g+' Pitch MG',0,99],[44,82,'Fade in',g+' Pitch MG',0,99],[45,80,'Intensity',g+' Pitch MG',0,99],[46,84,'Frequency by keyboard',g+' Pitch MG',-99,99],[47,86,'Intensity by aftertouch',g+' Pitch MG',-99,99],[48,87,'Intensity by joystick',g+' Pitch MG',-99,99],[49,85,'Frequency by AT + JS',g+' Pitch MG',0,9],
 [50,31,'Cutoff',g+' VDF',0,99],[51,49,'Keyboard track key',g+' VDF',0,127],[52,51,'Cutoff keyboard track',g+' VDF',-99,99],[53,32,'EG intensity',g+' VDF',-99,99],[54,52,'EG time keyboard track',g+' VDF',-99,99],[55,44,'EG time velocity',g+' VDF',0,99],[56,43,'EG intensity velocity',g+' VDF',-99,99],
 [57,35,'Attack time',g+' VDF EG',0,99],[58,36,'Attack level',g+' VDF EG',-99,99],[59,37,'Decay time',g+' VDF EG',0,99],[60,38,'Break point',g+' VDF EG',-99,99],[61,39,'Slope time',g+' VDF EG',0,99],[62,40,'Sustain level',g+' VDF EG',-99,99],[63,41,'Release time',g+' VDF EG',0,99],[64,42,'Release level',g+' VDF EG',-99,99],
 [65,25,'Oscillator level',g+' VDA',0,99],[66,70,'Keyboard track key',g+' VDA',0,127],[67,72,'Amplitude keyboard track',g+' VDA',-99,99],[68,64,'Amplitude velocity',g+' VDA',-99,99],[69,73,'EG time keyboard track',g+' VDA',-99,99],[70,65,'EG time velocity',g+' VDA',0,99],
 [71,57,'Attack time',g+' VDA EG',0,99],[72,58,'Attack level',g+' VDA EG',0,99],[73,59,'Decay time',g+' VDA EG',0,99],[74,60,'Break point',g+' VDA EG',0,99],[75,61,'Slope time',g+' VDA EG',0,99],[76,62,'Sustain level',g+' VDA EG',0,99],[77,63,'Release time',g+' VDA EG',0,99],
 [83,33,'Intensity',g+' Color',0,99],[84,34,'Velocity sensitivity',g+' Color',-99,99],[86,28,'Pan',g,0,31]]
 for(const [offset,live,label,group,min,max] of rows)add(offset+delta,live+wire,label,group,min,max)
 add(41+delta,78+wire,'Waveform',g+' Pitch MG',0,5,{id:1041+delta,mask:7,options:waves});add(41+delta,83+wire,'Key sync',g+' Pitch MG',0,1,{id:1042+delta,mask:128,shift:7,options:['Off','On']})
 add(82+delta,30+wire,'Send D',g,0,9,{id:1082+delta,mask:15});add(82+delta,29+wire,'Send C',g,0,9,{id:1083+delta,mask:240,shift:4})
 add(85+delta,50+wire,'Keyboard track mode',g+' VDF',0,3,{id:1085+delta,mask:3,options:['Off','Low','High','All']});add(85+delta,71+wire,'Keyboard track mode',g+' VDA',0,3,{id:1086+delta,mask:48,shift:4,options:['Off','Low','High','All']})
 // Each packed time switch/polarity bit is a distinct live parameter (table 7).
 for(const [offset,base,label] of [[78,53,'VDF keyboard'],[79,45,'VDF velocity'],[80,74,'VDA keyboard'],[81,66,'VDA velocity']] as const)
  for(let phase=0;phase<4;phase++)for(let polarity=0;polarity<2;polarity++){
   const bit=phase+polarity*4
   // Wire value combines enable in bit 0 and polarity in bit 1; emitted by fieldLiveValue.
   add(offset+delta,base+phase+wire,['Attack','Decay','Slope','Release'][phase]+' '+(polarity?'polarity':'enable'),g+' '+label+' switches',0,1,{id:2000+(offset+delta)*8+bit,mask:1<<bit,shift:bit,options:polarity?['+','−']:['Off','On']})
  }
}
const effects=ai2EffectNames
for(let fx=0;fx<2;fx++){
 add(135+fx,155+fx,'Algorithm','FX '+(fx+1),0,47,{id:1135+fx,mask:127,options:effects});add(143,157+fx,'Enabled','FX '+(fx+1),0,1,{id:1137+fx,mask:3<<(fx*2),shift:fx*2,effectSwitch:true,options:['Off','On']});for(let side=0;side<2;side++)add(143,undefined,side?'Right enabled':'Left enabled','FX '+(fx+1),0,1,{id:1150+fx*2+side,mask:1<<(fx*2+side),shift:fx*2+side,options:['Off','On']})
 add(137+fx*2,175+fx*11,'Left balance','FX '+(fx+1),0,100);add(138+fx*2,undefined,'Right balance','FX '+(fx+1),0,100)
 add(152+fx*10,166+fx*11,'Dynamic modulation source','FX '+(fx+1),0,6);add(153+fx*10,167+fx*11,'Dynamic modulation amount','FX '+(fx+1),-15,15)
}
add(143,165,'Routing','Effects',0,3,{id:1143,mask:48,shift:4,options:['Serial','Parallel 1','Parallel 2','Parallel 3']})
add(141,159,'Output 3 pan','Effects',0,101);add(142,160,'Output 4 pan','Effects',0,101)
return Object.freeze(defs.map(p=>Object.freeze(p)))
}
