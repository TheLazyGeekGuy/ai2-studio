import {ai2Model} from './models'
import {legacyParameters} from './legacy-parameters'
import {readPackedField,writePackedField} from '../packed-fields'
import {validateProgram,type Ai2Program} from './codec'
export interface ProgramField {id:string;offset:number;label:string;group:string;min:number;max:number;mask?:number;shift?:number;width?:number;bigEndian?:boolean;options?:readonly string[]}
/** Dump offsets from 01/W Table 1; 03R/W Table 1; X3/X5 Table 1; NS5R/N5 Program Edit tables. */
function buildInventory(model:string):ProgramField[]{
 const m=ai2Model(model),modern=['N5','NS5R'].includes(m.protocol),out:ProgramField[]=[]
 const add=(offset:number,label:string,group:string,min:number,max:number,extra:Partial<ProgramField>={})=>out.push({id:'p'+offset+(extra.mask===undefined?'':'.'+extra.mask),offset,label,group,min,max,...extra})
 if(!modern){for(const f of legacyParameters([]).filter(f=>f.offset<135)){
  let offset=f.offset,relative=offset>=87?offset-47:offset;const osc2=f.group.startsWith('OSC 2')
  if(m.protocol==='01W'&&offset>=40){if(osc2)offset+=4;if(relative>=83)offset+=4;if(relative===82)continue}
  if(m.protocol==='03RW'&&relative===82)continue
  const max=['01W','03RW'].includes(m.protocol)&&f.label==='Waveform'?4:['01W','03RW'].includes(m.protocol)&&f.label==='Pan'?14:f.label==='Multisound'?m.protocol==='01W'?255:m.multisamples-1:f.max
  if(f.label==='Multisound'&&m.protocol==='03RW'){add(f.offset,'Multisound number',f.group,0,254);add(f.offset+1,'Multisound bank',f.group,0,255);continue}
  if(f.label==='Multisound'&&m.protocol==='01W'){add(f.offset,'Multisound number (0 = Off)',f.group,0,255);add(f.offset+1,'Multisound bank',f.group,0,255);continue}
  add(offset,f.label,m.protocol==='01W'||m.protocol==='03RW'?f.group.replace('Color','Emphasis'):f.group,f.min,max,{mask:f.mask,shift:f.shift,width:f.width,options:f.options?.length?f.options:undefined})
 }
 if(m.protocol==='01W')for(let osc=0;osc<2;osc++){const b=osc*51,g='OSC '+(osc+1)+' Waveshaping';add(82+b,'Table',g,0,59,{mask:63});add(82+b,'Bypass',g,0,1,{mask:128,shift:7,options:['On','Off']});add(83+b,'EG start level',g,0,99);add(84+b,'EG decay time',g,0,99);add(85+b,'EG sustain level',g,0,99);add(86+b,'Velocity sensitivity',g,0,99)}
 return out
 }
 const n5=m.protocol==='N5';add(10,'Oscillator mode','Common',0,2,{options:['Single','Double','Drums']})
 for(const [offset,label,min,max]of (n5?[[11,'Effect bank',0,8],[12,'Effect number',0,127],[13,'Mono / Poly',0,1],[14,'Portamento switch',0,1],[15,'Portamento time',0,127],[16,'VDF by bender',-128,127],[17,'VDF LFO by modulation',0,127],[18,'Bender by aftertouch',-24,24],[19,'VDA by aftertouch',-128,127],[20,'VDF by aftertouch',-128,127],[21,'VDF LFO by aftertouch',0,127]]:[[11,'Own FX bank MSB',0,127],[12,'Own FX bank LSB',0,127],[13,'Own FX number',0,127]]) as [number,string,number,number][])add(offset,label,'Common / controllers',min,max)
 for(let osc=0;osc<2;osc++){const b=(n5?22:14)+(n5?78:72)*osc,g='OSC '+(osc+1)
 add(b,'Multisound',g,0,m.multisamples-1,{width:2,bigEndian:true});add(b+2,'Octave',g,0,3,{options:['−24 st','−12 st','0 st','+12 st']})
 for(const [rel,label,min,max]of [[3,'Level',0,127],[4,'Coarse tune',-12,12],[5,'Fine tune',-99,99],[6,'Pitch slope',-10,20],[7,'Velocity bottom',1,127],[8,'Velocity top',1,127],[9,'Delay start',0,127]] as const)add(b+rel,label,g,min,max)
 for(const [rel,label,min,max]of [[10,'Waveform',0,5],[11,'Frequency',0,127],[12,'Delay',0,127],[13,'Fade in',0,127],[14,'Intensity',n5?-128:0,127]] as const)add(b+rel,label,g+' Pitch MG',min,max)
 for(const [rel,label,min,max]of [[15,'Intensity',-128,127],[16,'Level velocity',-128,127],[17,'Time velocity',-128,127],[18,'Start level',-128,127],[19,'Attack time',0,127],[20,'Attack level',-128,127],[21,'Decay time',0,127],[22,'Release time',0,127],[23,'Release level',-128,127]] as const)add(b+rel,label,g+' Pitch EG',min,max)
 for(const [rel,label,min,max]of [[24,'Waveform',0,5],[25,'Frequency',0,127],[26,'Delay',0,127],[27,'Fade in',0,127],[28,'Intensity',n5?-128:0,127]] as const)add(b+rel,label,g+' VDF MG',min,max)
 for(const [rel,label,min,max]of [[29,'Cutoff',0,127],[30,'Tracking center key',0,127],[31,'Tracking mode',0,3],[32,'Cutoff tracking',-128,127],[33,'EG time tracking',-128,127],[35,'Color',0,127],[36,'Color velocity',-128,127],[37,'EG intensity',-128,127],[38,'EG intensity velocity',-128,127],[39,'EG time velocity',0,127]] as const)add(b+rel,label,g+' VDF',min,max)
 for(const [rel,label]of [[34,'VDF keyboard'],[40,'VDF velocity'],[58,'VDA keyboard'],[61,'VDA velocity']] as const)for(let bit=0;bit<8;bit++)add(b+rel,['Attack','Decay','Slope','Release'][bit%4]+(bit<4?' enable':' polarity'),g+' '+label,0,1,{mask:1<<bit,shift:bit,options:bit<4?['Off','On']:['+','−']})
 for(let j=0;j<8;j++)add(b+41+j,['Attack time','Attack level','Decay time','Break level','Slope time','Sustain level','Release time','Release level'][j],g+' VDF EG',j%2?-128:0,127)
 for(const [rel,label,min,max]of [[49,'Waveform',0,5],[50,'Frequency',0,127],[51,'Delay',0,127],[52,'Fade in',0,127],[53,'Intensity',n5?-128:0,127],[54,'Tracking center key',0,127],[55,'Tracking mode',0,3],[56,'Amplitude tracking',-128,127],[57,'EG time tracking',-128,127],[59,'Level velocity',-128,127],[60,'Time velocity',-128,127]] as const)add(b+rel,label,g+' VDA',min,max)
 for(let j=0;j<7;j++)add(b+62+j,['Attack time','Attack level','Decay time','Break level','Slope time','Sustain level','Release time'][j],g+' VDA EG',0,127)
 add(b+69,'Pan',g+' Sends',n5?0:1,n5?128:127);add(b+70,'Send C',g+' Sends',0,127);add(b+71,'Send D',g+' Sends',0,127)
 if(n5)for(const [rel,label,min,max]of [[72,'Pitch bend',-24,24],[74,'Pitch LFO modulation',0,127],[75,'Pitch LFO rate modulation',0,127],[76,'Pitch LFO aftertouch',0,127],[77,'Pitch LFO rate aftertouch',0,127]] as const)add(b+rel,label,g+' Controllers',min,max)
 }
 return out
}
const inventories=new Map<string,readonly ProgramField[]>()
export function programInventory(model:string){let fields=inventories.get(model);if(!fields){fields=Object.freeze(buildInventory(model).map(f=>Object.freeze(f)));inventories.set(model,fields)}return fields}
export const programFieldValue=(p:Ai2Program,f:ProgramField)=>f.bigEndian?p.data[f.offset]*256+p.data[f.offset+1]:readPackedField(p.data,f)
export function withProgramField(p:Ai2Program,id:string,value:number){const f=programInventory(p.model).find(f=>f.id===id);if(!f||!Number.isInteger(value)||value<f.min||value>f.max)throw Error('Paramètre hors domaine');const data=[...p.data];if(f.bigEndian){data[f.offset]=value>>8;data[f.offset+1]=value&255}else writePackedField(data,f,value);return validateProgram({...p,data})}
