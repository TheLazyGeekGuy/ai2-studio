import {readPackedField,writePackedField,signedByte} from '../packed-fields'
import type {Ai2Model} from './models'
import {ai2Definition} from './definition'
export {oscillatorInfo} from './oscillators'
import type {Ai2Program} from './codec'
export interface SemanticField {key:string;label:string;offset:number;min:number;max:number;signed?:boolean;mask?:number;shift?:number;unit:string}
export const signed8=signedByte
/** Dump offsets, not live Parameter Change addresses. See manufacturer ledger. */
export function semanticFields(model:Ai2Model):SemanticField[]{
 const layout=ai2Definition(model.id).layout,old=layout.legacy,fields:SemanticField[]=[]
 const add=(key:string,label:string,offset:number,min:number,max:number,unit:string,mask?:number,shift?:number)=>fields.push({key,label,offset,min,max,signed:min<0,unit,mask,shift})
 for(let osc=0;osc<2;osc++){
  const k='osc'+(osc+1)+'.',o=layout.oscillators[osc].base
  if(old){
   if(osc===1){add(k+'coarse','Coarse tune',18,-12,12,'semitones');add(k+'fine','Fine tune',19,-50,50,'cents')}
   add(k+'level','OSC level',65+o,0,99,'level');add(k+'cutoff','VDF cutoff',50+o,0,99,'cutoff');add(k+'vdf.key','VDF tracking key',51+o,0,127,'midi-key');add(k+'vda.key','VDA tracking key',66+o,0,127,'midi-key')
   for(const [name,offset,min,max]of [['pitch.egIntensity',40,-99,99],['pitch.lfoFrequency',42,0,99],['pitch.lfoDelay',43,0,99],['pitch.lfoFade',44,0,99],['pitch.lfoIntensity',45,0,99],['vdf.trackFc',52,-99,99],['vdf.egIntensity',53,-99,99],['vdf.trackTime',54,-99,99],['vdf.velocityTime',55,0,99],['vdf.velocityIntensity',56,-99,99],['vda.trackAmp',67,-99,99],['vda.velocityLevel',68,-99,99],['vda.trackTime',69,-99,99],['vda.velocityTime',70,0,99]] as const)add(k+name,name,offset+o,min,max,name.includes('Frequency')?'lfo-frequency99':name.includes('Delay')||name.includes('Fade')?'time99':'depth')
   for(const [j,name]of ['attackTime','attackLevel','decayTime','breakLevel','slopeTime','sustainLevel','releaseTime','releaseLevel'].entries())add(k+'vdf.'+name,'VDF '+name,57+o+j,j%2?-99:0,99,j%2?'level':'eg-time99')
   for(const [j,name]of ['attackTime','attackLevel','decayTime','breakLevel','slopeTime','sustainLevel','releaseTime'].entries())add(k+'vda.'+name,'VDA '+name,71+o+j,0,99,j%2?'level':'eg-time99')
   for(const [offset,label]of [[78,'vdf.keySwitch'],[79,'vdf.velSwitch'],[80,'vda.keySwitch'],[81,'vda.velSwitch']] as const)add(k+label,label,offset+o,0,255,'switch-bits')
   for(const [j,name]of ['startLevel','attackTime','attackLevel','decayTime','releaseTime','releaseLevel','timeVelocity','levelVelocity'].entries())add(k+'pitch.'+name,'Pitch '+name,21+j,j===1||j===3||j===4?0:-99,99,j===1||j===3||j===4?'eg-time99':'depth')
  }else{
   add(k+'level','OSC level',o+3,0,127,'level');add(k+'coarse','Coarse tune',o+4,-12,12,'semitones');add(k+'fine','Fine tune',o+5,-99,99,'cents');add(k+'cutoff','VDF cutoff',o+29,0,127,'cutoff');add(k+'vdf.key','VDF tracking key',o+30,0,127,'midi-key');add(k+'vda.key','VDA tracking key',o+54,0,127,'midi-key');add(k+'velocityLow','Velocity bottom',o+7,1,127,'midi-velocity');add(k+'velocityHigh','Velocity top',o+8,1,127,'midi-velocity')
   for(const [name,relative,min,max]of [['pitch.egIntensity',15,-128,127],['pitch.lfoFrequency',11,0,127],['pitch.lfoDelay',12,0,127],['pitch.lfoFade',13,0,127],['pitch.lfoIntensity',14,0,127],['vdf.trackFc',32,-128,127],['vdf.trackTime',33,0,127],['vdf.egIntensity',37,0,127],['vdf.velocityIntensity',38,-128,127],['vdf.velocityTime',39,0,127],['vda.trackAmp',56,-128,127],['vda.trackTime',57,0,127],['vda.velocityLevel',59,-128,127],['vda.velocityTime',60,0,127]] as const)add(k+name,name,o+relative,[33,37,57,60].includes(relative)||model.protocol==='N5'&&relative===14?-128:min,max,name.includes('Frequency')?'lfo-frequency127':name.includes('Delay')||name.includes('Fade')?'time127':'depth')
   for(const [j,name]of ['attackTime','attackLevel','decayTime','breakLevel','slopeTime','sustainLevel','releaseTime','releaseLevel'].entries())add(k+'vdf.'+name,'VDF '+name,o+41+j,j%2?-128:0,127,j%2?'level':'eg-time127')
   for(const [j,name]of ['attackTime','attackLevel','decayTime','breakLevel','slopeTime','sustainLevel','releaseTime'].entries())add(k+'vda.'+name,'VDA '+name,o+62+j,0,127,j%2?'level':'eg-time127')
   for(const [relative,label]of [[34,'vdf.keySwitch'],[40,'vdf.velSwitch'],[58,'vda.keySwitch'],[61,'vda.velSwitch']] as const)add(k+label,label,o+relative,0,255,'switch-bits')
   for(const [relative,name]of [[18,'startLevel'],[19,'attackTime'],[20,'attackLevel'],[21,'decayTime'],[22,'releaseTime'],[23,'releaseLevel'],[17,'timeVelocity'],[16,'levelVelocity']] as const)add(k+'pitch.'+name,'Pitch '+name,o+relative,[19,21,22].includes(relative)?0:-128,127,[19,21,22].includes(relative)?'eg-time127':'depth')
  }
 }
 return fields
}
export const readField=(p:Ai2Program,f:SemanticField)=>readPackedField(p.data,f)
export function writeField(data:number[],f:SemanticField,value:number){if(!Number.isInteger(value)||value<f.min||value>f.max)throw Error('Valeur hors plage : '+f.label);writePackedField(data,f,value)}
