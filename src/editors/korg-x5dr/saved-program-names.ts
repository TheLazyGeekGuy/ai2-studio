import {openLibraryStorage,type LibraryStorage} from '../../library/storage'
import {readSavedBankNames} from '../../instrument-families/korg-ai2/hardware-library'
export interface SavedProgramNames {names:Record<number,string>;source:string}
const key=(id:string)=>'midi-studio:x5dr:program-names:v1:'+encodeURIComponent(id)
export function validProgramNames(value:unknown):Record<number,string>{
 if(!value||typeof value!=='object'||Array.isArray(value))return {}
 return Object.fromEntries(Object.entries(value).filter(([slot,name])=>/^(?:0|[1-9]\d?)$/.test(slot)&&Number(slot)<100&&typeof name==='string'&&name.length<=10&&!/[\x00-\x1f\x7f]/.test(name)))
}
export function saveProgramNames(id:string,names:Record<number,string>,source:string){if(typeof window==='undefined')return;try{localStorage.setItem(key(id),JSON.stringify({names:validProgramNames(names),source:source.slice(0,160)}))}catch{/* The captured library original remains available. */}}
/** Names are local bank labels, never evidence that its slots still match hardware. */
export async function loadProgramNames(id:string,storageFactory:()=>Promise<LibraryStorage>=openLibraryStorage):Promise<SavedProgramNames|null>{
 try{const saved=typeof window==='undefined'?null:JSON.parse(localStorage.getItem(key(id))??'null'),names=validProgramNames(saved?.names);if(Object.keys(names).length===100)return {names,source:typeof saved.source==='string'?saved.source.slice(0,160):'banque sauvegardée'}}catch{}
 const saved=await readSavedBankNames('X5DR',storageFactory);if(saved){saveProgramNames(id,saved.names,saved.source);return saved}
 return null
}
