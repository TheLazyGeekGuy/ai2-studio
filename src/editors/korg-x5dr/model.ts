import {ai2EffectParameters,ai2EffectNames} from '../../instrument-families/korg-ai2/effect-parameters'
import {createAi2DumpCodec} from '../../instrument-families/korg-ai2/dump-codec'
import {protocols} from '../../instrument-families/korg-ai2/protocol-profiles'
import {readPackedField,writePackedField} from '../../instrument-families/packed-fields'
import {effectResolution,changedEffect,effectPairError,type EffectResolution} from './fx-rules'
import {multisoundNames} from './multisounds'
/** Manufacturer authority: X5DR OM E1, pp.168-171, tables 1/7. Dump offsets and live addresses are separate. */
export type {LegacyParameter as Parameter} from '../../instrument-families/korg-ai2/legacy-parameters'
import {legacyParameters,type LegacyParameter as Parameter} from '../../instrument-families/korg-ai2/legacy-parameters'
export const parameters=legacyParameters(multisoundNames)
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
export function effectParameters(s:X5State):Parameter[]{return ai2EffectParameters(s.data.slice(135,137),[144,154])}
