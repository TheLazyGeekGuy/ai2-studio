import {createAi2DumpCodec} from '../../instrument-families/korg-ai2/dump-codec'
import {protocols} from '../../instrument-families/korg-ai2/protocol-profiles'
import {readPackedField,writePackedField} from '../../instrument-families/packed-fields'
import {effectResolution,changedEffect,effectPairError,type EffectResolution} from './fx-rules'
import {multisoundNames} from './multisounds'
/** Manufacturer authority: X5DR OM E1, pp.168-171, tables 1/7. Dump offsets and live addresses are separate. */
export interface Parameter {id:number;offset:number;live?:number;label:string;group:string;min:number;max:number;mask?:number;shift?:number;width?:number;effectSwitch?:boolean;options?:readonly string[]}
const defs:Parameter[]=[]
const add=(offset:number,live:number|undefined,label:string,group:string,min=0,max=99,extra:Partial<Parameter>={})=>defs.push({id:offset,offset,live,label,group,min,max,...extra})
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
const effects=['Off','Hall 1','Hall 2','Hall 3','Room 1','Room 2','Live stage','Wet plate','Dry plate','Spring','Early reflection 1','Early reflection 2','Early reflection 3','Stereo delay','Cross delay','Dual delay','Multi tap delay 1','Multi tap delay 2','Multi tap delay 3','Stereo chorus 1','Stereo chorus 2','Quadrature chorus','Crossover chorus','Harmonic chorus','Symphonic ensemble','Flanger 1','Flanger 2','Crossover flanger','Exciter','Enhancer','Distortion','Overdrive','Phaser 1','Phaser 2','Rotary speaker','Auto pan','Tremolo','Parametric EQ','Chorus / delay','Flanger / delay','Delay / hall','Delay / room','Delay / chorus','Delay / flanger','Delay / distortion','Delay / overdrive','Delay / phaser','Delay / rotary speaker']
for(let fx=0;fx<2;fx++){
 add(135+fx,155+fx,'Algorithm','FX '+(fx+1),0,47,{id:1135+fx,mask:127,options:effects});add(143,157+fx,'Enabled','FX '+(fx+1),0,1,{id:1137+fx,mask:3<<(fx*2),shift:fx*2,effectSwitch:true,options:['Off','On']});for(let side=0;side<2;side++)add(143,undefined,side?'Right enabled':'Left enabled','FX '+(fx+1),0,1,{id:1150+fx*2+side,mask:1<<(fx*2+side),shift:fx*2+side,options:['Off','On']})
 add(137+fx*2,175+fx*11,'Left balance','FX '+(fx+1),0,100);add(138+fx*2,undefined,'Right balance','FX '+(fx+1),0,100)
 add(152+fx*10,166+fx*11,'Dynamic modulation source','FX '+(fx+1),0,6);add(153+fx*10,167+fx*11,'Dynamic modulation amount','FX '+(fx+1),-15,15)
}
add(143,165,'Routing','Effects',0,3,{id:1143,mask:48,shift:4,options:['Serial','Parallel 1','Parallel 2','Parallel 3']})
add(141,159,'Output 3 pan','Effects',0,101);add(142,160,'Output 4 pan','Effects',0,101)
export const parameters:readonly Parameter[]=Object.freeze(defs.map(p=>Object.freeze(p)))
/** Packed EG switch and polarity are one wire value, not independent writes. */
export function fieldLiveValue(s:X5State,p:Parameter){
 if(p.id>=2000&&p.mask!==undefined){const phase=p.shift!%4,b=s.data[p.offset];return ((b>>phase)&1)?((b>>(phase+4))&1?-1:1):0}
 return parameterValue(s,p.id)
}
export interface X5State extends EffectResolution {format:'korg-x5dr-program';version:1|2;channel:number;data:readonly number[];original:readonly number[]}
export function validateState(raw:unknown):X5State {
 const s=raw as X5State
 const bytes=(v:unknown,n:number)=>Array.isArray(v)&&v.length===n&&v.every(b=>Number.isInteger(b)&&b>=0&&b<=255)
 if(!s||s.format!=='korg-x5dr-program'||![1,2].includes(s.version)||s.version===1&&s.unresolvedEffects!==undefined||!Number.isInteger(s.channel)||s.channel<1||s.channel>16||!bytes(s.data,164)||!Array.isArray(s.original)||![0,194].includes(s.original.length)||s.original.some(b=>!Number.isInteger(b)||b<0||b>255))throw Error('Invalid X5DR program state')
 if(s.original.length)decodeProgram(s.original)
 return Object.freeze({format:s.format,version:s.version,channel:s.channel,data:Object.freeze([...s.data]),original:Object.freeze([...s.original]),...effectResolution(s)})
}
export function initialState():X5State {
 const data=Array(164).fill(0);[...'Init POC  '].forEach((s,i)=>data[i]=s.charCodeAt(0));data[50]=99;data[65]=99;data[76]=99
 return validateState({format:'korg-x5dr-program',version:1,channel:1,data,original:[]})
}
export const programName=(s:X5State)=>String.fromCharCode(...s.data.slice(0,10))
export function parameterValue(s:X5State,id:number){const p=parameterById(id,s),value=readPackedField(s.data,p);return p.effectSwitch?Number(value!==0):value}
export function parameterById(id:number,state?:X5State){const p=parameters.find(p=>p.id===id)??(state?effectParameters(state).find(p=>p.id===id):undefined);if(!p)throw Error('Unknown parameter');return p}
export function withParameter(s:X5State,id:number,value:number):X5State {
 const p=parameterById(id,s);if(id===12&&s.data[10]===2&&![0,1,8,9,10,11,12,13,14,15].includes(value))throw Error('Drums mode supports drum kits 0, 1 and 8–15');if(!Number.isInteger(value)||value<p.min||value>p.max)throw Error('Invalid parameter value')
 if(id===1135||id===1136){const pair=[s.data[135]&127,s.data[136]&127];pair[id-1135]=value;const reason=effectPairError(pair[0],pair[1]);if(reason)throw Error(reason)}
 if(id>=20000&&s.unresolvedEffects?.includes(Math.floor((p.offset-144)/10)))throw Error('Read FX defaults before editing algorithm parameters')
 const data=[...s.data];writePackedField(data,p,p.effectSwitch&&value?3:value)
 return validateState({...s,data,...((id===1135||id===1136)&&parameterValue(s,id)!==value?changedEffect(s,id-1135):{})})
}
const programCodec=createAi2DumpCodec({modelId:protocols.X5.id,functionId:protocols.X5.buffer,recordSize:protocols.X5.size,label:'X5DR-family Program (194 bytes, function 40h)'})
export function decodeProgram(bytes:readonly number[]):{channel:number;data:number[]} {const {channel,data}=programCodec.decode(bytes);return {channel,data}}
export function encodeProgram(s:X5State):number[]{const valid=validateState(s);return programCodec.encode(valid.channel,valid.data)}

/** Effect field offsets/ranges: OM E1 pp.169-170, note 11-3. Live addresses for these packed algorithm fields are not inferred. */
export function effectParameters(s:X5State):Parameter[]{
 const out:Parameter[]=[]
 for(let fx=0;fx<2;fx++){
 const type=s.data[135+fx]&127,group='FX '+(fx+1),base=144+fx*10
 const add=(n:number,label:string,min=0,max=99,width=1)=>out.push({id:20000+fx*100+n,offset:base+n,label,group,min,max,width})
 const eq=()=>{add(6,'EQ high',-12,12);add(7,'EQ low',-12,12)}
 const flag=(n:number,bit:number,label:string,options:readonly string[])=>out.push({id:21000+fx*100+n*8+bit,offset:base+n,label,group,min:0,max:1,mask:1<<bit,shift:bit,options})
 if(type>=1&&type<=6){add(0,'Reverb time',0,type<=3?61:47);add(2,'High damp');add(3,'Pre-delay',0,200);add(4,'Early reflection level');eq()}
 else if(type>=7&&type<=9){add(0,'Pre-delay',0,200,2);add(2,'Early reflection level',1,10);add(3,'Reverb time');add(4,'High damp');eq()}
 else if(type>=10&&type<=12){add(0,'Early reflection time',0,70);add(1,'Pre-delay',0,200);eq()}
 else if(type===13||type===14){add(0,'Delay left',0,500,2);add(2,'Feedback',-99,99);add(3,'High damp');add(4,'Delay right',0,500,2);eq()}
 else if(type===15){add(0,'Delay left',0,500,2);add(2,'Feedback left',-99,99);add(3,'High damp left');add(4,'Delay right',0,500,2);add(6,'Feedback right',-99,99);add(7,'High damp right')}
 else if(type>=16&&type<=18){add(0,'Tap 1 delay',0,500,2);add(2,'Tap 2 delay',0,500,2);add(4,'Feedback',-99,99);eq()}
 else if(type===19||type===20){add(0,'Mod depth');add(1,'Mod speed',0,216);add(3,'Delay time',0,200);eq()}
 else if(type===21||type===22){add(0,'Delay left',0,250);add(1,'Delay right',0,250);add(2,'Mod speed',1,99);add(3,'Mod depth');add(4,'Mod waveform',-21,20);add(5,'EQ low',-12,12);add(6,'EQ high',-12,12)}
 else if(type===23){add(0,'Delay left',0,500,2);add(2,'Delay right',0,500,2);add(4,'Mod speed',1,99);add(5,'Mod depth');add(6,'EQ split point',0,12)}
 else if(type===24){add(0,'Mod depth');add(1,'Mod speed',0,216);eq()}
 else if(type>=25&&type<=27){add(0,'Delay time',0,200);add(1,'Mod depth');add(2,'Mod speed',1,99);add(3,'Resonance',-99,99);eq()}
 else if(type===28){add(0,'Blend',-99,99);add(1,'Emphatic point',1,10);eq()}
 else if(type===29){add(0,'Harmonic density',1,99);add(1,'Hot spot',1,20);add(2,'Stereo width');add(3,'Delay',1,99);eq()}
 else if(type===30||type===31){add(0,'Drive',1,111);add(1,'Hot spot');add(2,'Resonance');add(3,'Output level');eq()}
 else if(type===32||type===33){add(0,'Mod depth',1,99);add(1,'Mod speed',0,216);add(3,'Feedback',-99,99);add(4,'Manual')}
 else if(type===34){add(0,'Vibrato depth',0,15);add(1,'Acceleration',1,15);add(2,'Slow speed',1,99);add(3,'Fast speed',1,99)}
 else if(type===35||type===36){add(0,'Depth');add(1,'Speed',0,216);add(3,'Shape',-99,99);eq()}
 else if(type===37){add(0,'Low frequency',0,29);add(1,'Low gain',-12,12);add(2,'Mid frequency');add(3,'Mid gain',-12,12);add(4,'Mid width');add(5,'High frequency',0,29);add(6,'High gain',-12,12)}
 else if(type===38||type===39){add(0,'Delay 1',0,50);add(1,'Mod speed',1,99);add(2,'Mod depth');add(3,'Feedback 1',-99,99);add(4,'Delay 2',0,450,2);add(6,'Feedback 2',-99,99)}
 else if(type>=40&&type<=47){add(0,'Delay time',0,500,2);add(2,'Feedback',-99,99);add(3,type===40||type===41?'High damp':type>=44&&type<=45?'Drive':type===47?'Acceleration':'Depth',type>=44&&type<=45||type===47?1:0,type>=44&&type<=45?111:type===47?15:99);
 if(type===40||type===41){add(4,'Reverb time',0,type===40?61:47);add(6,'High damp');add(7,'Pre-delay',0,150)}
 else if(type===42||type===43){add(4,'Depth');add(5,'Speed',0,216);add(7,'Feedback',-99,99)}
 else if(type===44||type===45){add(4,'Hot spot');add(5,'Resonance');add(6,'Output level',1,99)}
 else if(type===46){add(4,'Depth');add(5,'Speed',0,216);add(6,'Feedback',-99,99)}
 else {add(4,'Slow speed',1,99);add(5,'Fast speed',1,99)}}
 if([19,20,24,32,33,35,36].includes(type))flag(2,0,'Mod waveform',['Sine','Triangle'])
 if([19,20,24].includes(type))flag(2,1,'Mod phase',['0°','180°'])
 if([42,43].includes(type))flag(6,0,'Mod waveform',['Sine','Triangle'])
 }
 return out
}
