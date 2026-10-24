import {ai2Model,protocols} from './models'
import {byteArray} from './packing'
import {ai2Definition} from './definition'
export {byteArray,pack7,unpack7} from './packing'
export interface Ai2Program {model:string;channel:number;data:readonly number[];original:readonly number[];index:number}
export interface UnconvertedFrame {offset:number;original:readonly number[];reason:string}
export const programName=(p:Ai2Program)=>String.fromCharCode(...p.data.slice(0,10)).replace(/[^\x20-\x7e]/g,'?').trimEnd()
export function validateProgram(raw:Ai2Program):Ai2Program{
 const p=protocols[ai2Model(raw.model).protocol];if(!Number.isInteger(raw.channel)||raw.channel<1||raw.channel>16||byteArray(raw.data).length!==p.size||!Number.isInteger(raw.index)||raw.index<0||raw.index>=p.maxPrograms)throw Error('Programme AI² invalide')
 byteArray(raw.original);return Object.freeze({...raw,data:Object.freeze([...raw.data]),original:Object.isFrozen(raw.original)?raw.original:Object.freeze([...raw.original])})
}
/** Bound codec definition reused by offline file adapters and native leaf adapters. */
export function programDumpCodec(model:string,bank=false){const d=ai2Definition(model);return bank?d.bank:d.program}
export function encodeProgram(raw:Ai2Program){const s=validateProgram(raw);return programDumpCodec(s.model).encode(s.channel,s.data)}
export function decodeFrame(bytes:readonly number[],model:string):Ai2Program[]{
 const p=protocols[ai2Model(model).protocol],original=Object.freeze([...bytes]),decoded=programDumpCodec(model,bytes[4]===p.bank).decode(bytes)
 return Array.from({length:decoded.count},(_,index)=>validateProgram({model,channel:decoded.channel,data:decoded.data.slice(index*p.size,(index+1)*p.size),original,index}))
}
export function readFile(bytes:readonly number[],model:string,decoded=false){
 byteArray(bytes);if(bytes.length>4_000_000)throw Error('Fichier supérieur à 4 Mo');if(!bytes.length)throw Error('Fichier vide')
 if(decoded){const program=validateProgram({model,channel:1,index:0,data:bytes,original:[]});return {programs:[program],unconverted:[] as UnconvertedFrame[]}}
 if(bytes.slice(0,4).join(',')==='77,84,104,100')throw Error('Exporter le MIDI en SysEx brut .syx ; le conteneur SMF n’est pas encore pris en charge')
 const programs:Ai2Program[]=[],unconverted:UnconvertedFrame[]=[];let i=0
 while(i<bytes.length){const start=i;if(bytes[i]!==240){while(i<bytes.length&&bytes[i]!==240)i++;unconverted.push({offset:start,original:bytes.slice(start,i),reason:'Données hors trame conservées'});continue}
  i++;while(i<bytes.length&&bytes[i]!==247&&bytes[i]!==240)i++
  if(bytes[i]!==247){unconverted.push({offset:start,original:bytes.slice(start,i),reason:'Trame incomplète conservée'});continue}
  const frame=bytes.slice(start,++i);try{const decoded=decodeFrame(frame,model);if(programs.length+decoded.length>512)throw Error('Limite de 512 programmes dépassée');programs.push(...decoded)}catch(e){unconverted.push({offset:start,original:frame,reason:String(e)})}
 }
 return {programs,unconverted}
}
