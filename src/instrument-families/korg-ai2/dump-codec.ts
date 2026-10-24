import {byteArray,pack7,unpack7} from './packing'
export interface Ai2DumpDefinition {
 readonly modelId:number;readonly functionId:number;readonly recordSize:number
 readonly minRecords?:number;readonly maxRecords?:number;readonly selector?:readonly number[];readonly checksum?:boolean;readonly label:string
}
/** One codec implementation, explicit immutable wire profile. File encoding grants no send permission. */
export function createAi2DumpCodec(raw:Ai2DumpDefinition){
 const definition=Object.freeze({...raw,minRecords:raw.minRecords??1,maxRecords:raw.maxRecords??1,selector:Object.freeze([...(raw.selector??[])])})
 const d=definition
 if(![d.modelId,d.functionId,...d.selector].every(v=>Number.isInteger(v)&&v>=0&&v<128)||!Number.isSafeInteger(d.recordSize)||d.recordSize<1||!Number.isSafeInteger(d.minRecords)||!Number.isSafeInteger(d.maxRecords)||d.minRecords<1||d.maxRecords<d.minRecords)throw Error('Invalid AI² dump definition')
 const count=(data:readonly number[])=>{const n=data.length/d.recordSize;if(!Number.isInteger(n)||n<d.minRecords||n>d.maxRecords)throw Error('Invalid '+d.label+' length');return n}
 return Object.freeze({definition,
  encode(channel:number,data:readonly number[]){if(!Number.isInteger(channel)||channel<1||channel>16)throw Error('Invalid MIDI channel');byteArray(data);count(data);const packed=pack7(data);return [240,66,47+channel,d.modelId,d.functionId,...d.selector,...packed,...(d.checksum?[(-packed.reduce((a,b)=>a+b,0))&127]:[]),247]},
  decode(bytes:readonly number[]){
   byteArray(bytes);const start=5+d.selector.length
   if(bytes.length<start+3||bytes[0]!==240||bytes[1]!==66||bytes[2]<48||bytes[2]>63||bytes[3]!==d.modelId||bytes[4]!==d.functionId||bytes.at(-1)!==247||bytes.slice(1,-1).some(v=>v>127)||d.selector.some((v,i)=>bytes[5+i]!==v))throw Error('Expected '+d.label+' dump; incompatible header/model/selector')
   if(d.checksum&&bytes.slice(start,-1).reduce((a,b)=>a+b,0)%128!==0)throw Error('Checksum invalide')
   const data=unpack7(bytes.slice(start,d.checksum?-2:-1));return {channel:bytes[2]-47,data,count:count(data)}
  },
 })
}
