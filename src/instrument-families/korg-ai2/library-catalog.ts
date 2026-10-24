/** File identity and offline projections. Never opens ports or sends imported packets. */
import {builtinFileAdapters,createFileAdapters,entryMessage,type FileAdapter,type FileInventory} from '../../library/adapters'
import type {LibrarySource,LibraryStorage} from '../../library/storage'
import {entryKey,type LibraryMetadata} from '../../library/metadata'
import {readEditorPreset} from '../../library/editor-preset'
import {ai2Models,protocols} from './models'
import {decodeFrame,encodeProgram,programName,validateProgram,type Ai2Program} from './codec'
import {decodeAi2Combination,encodeAi2Combination,isAi2Combination,validateAi2Combination} from './combination'

export interface PatchIdentity {manufacturer:string;family:string;models:readonly string[];type:string;certainty:'model'|'family'|'unknown';detail:string}
export interface CatalogRow {source:LibrarySource;index:number;name:string;identity:PatchIdentity;program?:Ai2Program;message?:readonly number[]}
export function identifyAi2Message(message:readonly number[]):PatchIdentity{
 const hex=(v:number)=>v.toString(16).toUpperCase().padStart(2,'0')
 // N264/N364 Reference Guide, printed p.214: identity reply includes member ID.
 if(message.length===15&&message[0]===0xf0&&message[1]===0x7e&&message[3]===6&&message[4]===2&&message[5]===0x42&&message[6]===0x35&&message[7]===0&&message[9]===0&&message[14]===0xf7){
  const model=['X3','X3R','X2','N364','N264'][message[8]]
  if(model)return {manufacturer:'Korg',family:'Korg AI² / X3',models:[model],type:'Identification',certainty:'model',detail:'Variante '+model+' déclarée par la réponse d’identité universelle, code membre '+message[8]+'.'}
 }
 const manufacturer=message[1]===66?'Korg':message[1]===65?'Roland':message[1]===67?'Yamaha':message[1]===0?'Fabricant 00 '+hex(message[2]??0)+' '+hex(message[3]??0):'Fabricant '+hex(message[1]??0)
 const family=message[1]===66?Object.entries(protocols).find(([,p])=>p.id===message[3])?.[0]:undefined
 const models=family?ai2Models.filter(m=>m.protocol===family).map(m=>m.id):[]
 // Prefer the protocol's base model for offline decoding, never the current editor.
 const base=family==='01W'?'01/W':family==='03RW'?'03R/W':family
 if(base&&models.includes(base))models.sort((a,b)=>a===base?-1:b===base?1:0)
 const profile=family?protocols[family as keyof typeof protocols]:undefined,fn=message[4]
 const type=profile?(fn===profile.buffer?'Program':fn===profile.bank?'Banque Program':fn===73||fn===50?'Combi':fn===77||fn===55?'Banque Combi':'SysEx non décodé'):'SysEx non décodé'
 return {manufacturer,family:family?'Korg AI² / '+family:'Famille non identifiée',models,type,certainty:models.length===1?'model':models.length?'family':'unknown',detail:family?'Model ID 0x'+hex(message[3])+' ; '+(models.length>1?'format détecté automatiquement ; plusieurs variantes partagent cet en-tête. La variante exacte peut être précisée facultativement.':'modèle reconnu par le profil.'):'L’en-tête ne suffit pas à associer un éditeur pris en charge.'}
}
/** A wire-format label is not a claim about the originating physical variant. */
export function catalogIdentityLabel(identity:PatchIdentity){
 return identity.certainty==='model'?identity.models[0]:identity.models.length?(identity.family.split(' / ')[1]+' · format SysEx'):identity.manufacturer
}
export function decodeCatalogMessage(message:readonly number[],model:string){
 if(!identifyAi2Message(message).models.includes(model))throw Error('Modèle source incompatible avec cet en-tête')
 try{return decodeFrame(message,model)}catch(programError){try{return decodeAi2Combination(message,model)}catch{throw programError}}
}
function inventoryIdentities(inventory:FileInventory){return inventory.entries.flatMap(e=>{const packet=entryMessage(inventory,e.index);if(!packet)return [];const id=identifyAi2Message(packet);return id.type==='Identification'?[id]:[]})}
function withRecordedIdentity(identity:PatchIdentity,evidence:PatchIdentity[]):PatchIdentity{
 if(identity.certainty!=='family')return identity
 const candidates=evidence.filter(id=>id.family===identity.family&&identity.models.includes(id.models[0]))
 const models=[...new Set(candidates.flatMap(id=>id.models))]
 return models.length===1?{...identity,models,certainty:'model',detail:'Variante déclarée par la réponse d’identité présente dans ce fichier. '+identity.detail}:identity
}
/** Expand validated banks into stable source-local entries, retaining every duplicate. */
export function projectAi2Inventory(inventory:FileInventory):FileInventory{
 const evidence=inventoryIdentities(inventory)
 const entries=inventory.entries.flatMap((entry,index)=>{
  const message=entryMessage(inventory,index);if(!message)return [entry]
  const identity=withRecordedIdentity(identifyAi2Message(message),evidence);if(!identity.models.length)return [{...entry,instrumentName:identity.manufacturer+' · '+entry.instrumentName}]
  try{const patches=decodeCatalogMessage(message,identity.models[0]);return patches.map(p=>({...entry,name:programName(p)||entry.name,location:entry.location||String(p.index),comment:entry.comment==='X5DR bank projection'?entry.comment:[entry.comment,patches.length>1?'AI² bank projection':'',identity.detail].filter(Boolean).join(' · '),instrumentId:'korg-ai2:wire:'+identity.family.split(' / ')[1],instrumentName:identity.models.join(' / '),opaque:false,message:isAi2Combination(p)?encodeAi2Combination(p):encodeProgram(p)}))}
  catch(e){return [{...entry,instrumentId:'korg-ai2:wire:'+identity.family.split(' / ')[1],instrumentName:identity.models.join(' / '),comment:identity.detail+' · '+String(e),opaque:true}]}
 })
 if(entries.length>50000)throw Error('Limite de 50 000 entrées de librairie')
 return {...inventory,entries:entries.map((e,index)=>({...e,index}))}
}
/** Fallback is deliberately opaque, never a claimed PCG decoder or a device command. */
export function universalAi2Adapters(base:readonly FileAdapter[]=builtinFileAdapters):readonly FileAdapter[]{
 const adapters=base.map(a=>({...a,read:(bytes:Uint8Array)=>projectAi2Inventory(a.read(bytes))}))
 return [...adapters,{id:'opaque-library-file',extensions:['.pcg','.pgc','.bin','.dat'],detect:bytes=>!base.some(a=>a.detect(bytes)),read:bytes=>({format:'opaque-library-file',version:1,endian:'big',layout:'contained',chunks:[],warnings:['Format non décodé ; original conservé, conversion indisponible.'],entries:[{index:0,offset:0,size:bytes.length,name:'Fichier non décodé',location:'',comment:'Format non décodé ; aucune attribution de synthé supposée.',module:null,model:null,instrumentId:'file:unidentified',instrumentName:'Instrument non identifié',blocks:[],opaque:true}]})}]
}
export const ai2FileAdapters=universalAi2Adapters()
export const readUniversalAi2File=createFileAdapters(ai2FileAdapters).read
function exactIdentity(p:Ai2Program):PatchIdentity{return {manufacturer:'Korg',family:'Korg AI² / '+ai2Models.find(m=>m.id===p.model)!.protocol,models:[p.model],type:isAi2Combination(p)?'Combi':'Program',certainty:'model',detail:'Modèle déclaré dans le brouillon local ; état validé.'}}
export async function catalogLibraryEntries(storage:LibraryStorage,sources:readonly LibrarySource[]):Promise<CatalogRow[]>{
 const rows:CatalogRow[]=[]
 for(const source of sources){
  const evidence=inventoryIdentities(source.inventory)
  let local:Ai2Program|undefined
  if(source.inventory.format==='midi-studio-editor-preset'||source.inventory.format==='korg-x5dr-draft'){
   try{const bytes=await storage.original(source.id),document=source.inventory.format==='midi-studio-editor-preset'?readEditorPreset(bytes):null,raw=(document?.state??JSON.parse(new TextDecoder().decode(bytes))) as Record<string,unknown>
    if(!document||document.stateVersion===1){
     if(document?.moduleId==='korg-ai2-file')local=isAi2Combination(raw as unknown as Ai2Program)?validateAi2Combination(raw as unknown as import('./combination').Ai2Combination):validateProgram(raw as unknown as Ai2Program)
     else if(!document||document.moduleId==='korg-x5dr-editor'){const p={model:'X5DR',channel:raw.channel,data:raw.data,original:raw.original,index:0};if(raw.format==='korg-x5dr-program')local=validateProgram(p as Ai2Program);else if(raw.format==='korg-x5dr-combination')local=validateAi2Combination({...p,kind:'combination'} as import('./combination').Ai2Combination)}
    }
   }catch{/* Remains inspectable as an opaque file entry. */}
  }
  for(const entry of source.inventory.entries){
   if(local){rows.push({source,index:entry.index,name:programName(local),identity:exactIdentity(local),program:local});continue}
   const message=entryMessage(source.inventory,entry.index)
   if(message){const identity=withRecordedIdentity(identifyAi2Message(message),evidence);let program:Ai2Program|undefined;try{program=decodeCatalogMessage(message,identity.models[0])[0]}catch{/* Identity alone never proves decodability. */}if(program&&entry.comment.includes('bank projection'))program={...program,original:[]};rows.push({source,index:entry.index,name:program?programName(program):entry.name,identity,program,message})}
   else rows.push({source,index:entry.index,name:source.inventory.format==='opaque-library-file'?source.name:entry.name,identity:{manufacturer:entry.instrumentName,family:'Famille non identifiée',models:[],type:source.inventory.format==='opaque-library-file'?'Fichier non décodé':'Entrée non décodée',certainty:'unknown',detail:entry.comment||'Métadonnées de fichier ; aucun décodeur de patch disponible.'}})
  }
  if(!source.inventory.entries.length)rows.push({source,index:-1,name:source.name,identity:{manufacturer:'Non identifié',family:'Famille non identifiée',models:[],type:'Fichier sans patch décodé',certainty:'unknown',detail:source.inventory.warnings.join(' · ')||'Original conservé.'}})
 }
 return rows
}
/** User-confirmed source model is local classification, never a mutation of the original header. */
export function classifiedCatalogRows(rows:CatalogRow[],metadata:LibraryMetadata){
 const notes=new Map(metadata.annotations.map(a=>[entryKey(a.ref),a.revisions.at(-1)]))
 return rows.map(row=>{if(!row.message||!row.program||row.identity.certainty!=='family')return row;const models=notes.get(entryKey({sourceId:row.source.id,index:row.index}))?.tags.filter(t=>t.startsWith('source-model:')).map(t=>t.slice(13)).filter(id=>row.identity.models.includes(id))??[];if(models.length!==1)return row;try{const decoded=decodeCatalogMessage(row.message,models[0])[0],program={...decoded,original:row.program.original};return {...row,program,identity:{...row.identity,models:[models[0]],certainty:'model' as const,detail:'Modèle source confirmé par l’utilisateur dans la classification locale. '+row.identity.detail}}}catch{return row}})
}
