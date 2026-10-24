import {combinationParameters,combiValue,type CombinationState} from './combination'
import {gmProgramNames} from './program-names'
import {deviceFields,deviceValue,type DeviceImage} from './device-data'
export interface PlayedNote {channel:number;note:number;velocity:number}
const labels=['Program','Level','MIDI channel','Key bottom','Key top','Velocity bottom','Velocity top','Transpose','Detune'] as const
const fields=Array.from({length:8},(_,i)=>Object.fromEntries(labels.map(label=>[label,combinationParameters.find(p=>p.group==='Timbre '+(i+1)&&p.label===label)!.id])) as Record<typeof labels[number],number>)
/** Display convention is explicit: C4 = MIDI 60, independent of manufacturer octave labels. */
export const noteName=(n:number)=>['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'][((n%12)+12)%12]+String(Math.floor(n/12)-1).replace('-','−')
export const isBlackKey=(n:number)=>[1,3,6,8,10].includes(((n%12)+12)%12)
export function combiLayers(state:CombinationState,names:Readonly<Record<number,string>>={}){
 return fields.map((ids,i)=>layerOf(i,ids,name=>combiValue(state,ids[name]),names))
}
/** The 16 Multi parts share the Combi timbre fields (OM table 6): same layer shape, ids are device-field ids. */
export function multiLayers(image:DeviceImage,names:Readonly<Record<number,string>>={}){
 const all=deviceFields(image)
 return Array.from({length:16},(_,i)=>{const ids=Object.fromEntries(labels.map(label=>[label,all.find(f=>f.group==='Part '+(i+1)&&f.label===label)!.id])) as Record<typeof labels[number],number>;return layerOf(i,ids,name=>deviceValue(image,all.find(f=>f.id===ids[name])!),names)})
}
function layerOf(i:number,ids:Record<typeof labels[number],number>,get:(name:typeof labels[number])=>number,names:Readonly<Record<number,string>>){
 const program=get('Program'),low=get('Key bottom'),high=get('Key top'),velocityLow=get('Velocity bottom'),velocityHigh=get('Velocity top'),level=get('Level'),transpose=get('Transpose'),channel=get('MIDI channel'),enabled=program>0&&program<=236,valid=low>=0&&high<=127&&low<=high&&velocityLow>=1&&velocityHigh<=127&&velocityLow<=velocityHigh
  return {timbre:i+1,program,address:program===0?'Off':program<=100?'A'+String(program-1).padStart(2,'0'):program<=236?'G'+String(program-100).padStart(3,'0'):'?',name:program===0?'Désactivé':program<=100?names[program-1]??'Nom A non lu':gmProgramNames[program-101]??'Programme inconnu',low,high,velocityLow,velocityHigh,level,transpose,channel,detune:get('Detune'),enabled,valid,ids}
}
export type CombiLayer=ReturnType<typeof combiLayers>[number]
export const layerResponds=(layer:CombiLayer,note:PlayedNote)=>layer.enabled&&layer.valid&&layer.level>0&&note.channel===layer.channel&&note.note>=layer.low&&note.note<=layer.high&&note.velocity>=layer.velocityLow&&note.velocity<=layer.velocityHigh
/** White keys share a width; black keys sit between the corresponding white keys. */
export function keyboardGeometry(low:number,high:number){
 const notes=Array.from({length:high-low+1},(_,i)=>low+i),whiteCount=notes.filter(n=>!isBlackKey(n)).length;let white=0
 const keys=notes.map(note=>{const black=isBlackKey(note),center=black?white:white+.5,key={note,black,x:black?white-.31:white,width:black?.62:1,center};if(!black)white++;return key})
 const bounds=(note:number)=>{if(note<=low)return 0;if(note>high)return whiteCount;const i=note-low;return (keys[i-1].center+keys[i].center)/2}
 return {keys,whiteCount,bounds,zone:(bottom:number,top:number)=>{const left=bounds(bottom),right=bounds(top+1);return {left,width:Math.max(0,right-left),clippedLow:bottom<low,clippedHigh:top>high}}}
}
