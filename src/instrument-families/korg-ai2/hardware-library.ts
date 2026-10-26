import {decodeFrame,programName} from './codec'
import {createFileAdapters} from '../../library/adapters'
import {annotate,entryKey} from '../../library/metadata'
import {openLibraryStorage,importLibraryFile,type LibraryStorage} from '../../library/storage'
import {ai2FileAdapters} from './library-catalog'
import {type Ai2Patch,isHardwareFrame} from './hardware-protocol'
/** Keep the original complete reply and annotate the explicitly selected variant, without rewriting the source header. */
export async function saveHardwareBank(patches:readonly Ai2Patch[],storageFactory:()=>Promise<LibraryStorage>=openLibraryStorage){
 const first=patches[0];if(!first||patches.some(p=>p.model!==first.model)||!isHardwareFrame(first.model,first.channel,first.original))throw Error('Banque MIDI invalide')
 const db=await storageFactory();try{const kind='kind'in first?'combi':'program',saved=await importLibraryFile(db,first.model.replaceAll('/','')+'-'+kind+'-bank.syx',new Uint8Array(first.original),createFileAdapters(ai2FileAdapters).read),sources=await db.list();let notes=await db.metadata?.();if(notes&&db.setMetadata){for(let i=0;i<patches.length;i++){const ref={sourceId:saved.source.id,index:i},previous=notes.annotations.find(a=>entryKey(a.ref)===entryKey(ref))?.revisions.at(-1);notes=annotate(notes,sources,ref,{tags:[...new Set([...(previous?.tags??[]),'source-model:'+first.model,'capture-midi'])],name:previous?.name??'',favorite:previous?.favorite??false})}await db.setMetadata(notes)}return patches.length+' '+kind+' conservés dans la librairie · original complet conservé'}finally{db.close()}
}

/** Saved bank labels remain local provenance, never device-memory confirmation. */
export async function readSavedBankNames(model:string,storageFactory:()=>Promise<LibraryStorage>=openLibraryStorage):Promise<{names:Record<number,string>;source:string}|null>{
 const name=(model.replaceAll('/','')+'-program-bank.syx').toLowerCase();let db:LibraryStorage|undefined
 try{db=await storageFactory();const aliases=new Set((await db.occurrences?.()??[]).filter(o=>o.name.toLowerCase()===name).map(o=>o.sourceId)),sources=(await db.list()).filter(s=>s.name.toLowerCase()===name||aliases.has(s.id)).sort((a,b)=>b.importedAt.localeCompare(a.importedAt));for(const source of sources)try{const programs=decodeFrame([...await db.original(source.id)],model);if(programs.length<100)continue;return {names:Object.fromEntries(programs.map(p=>[p.index,programName(p).trim()])),source:source.name}}catch{/* Preserve malformed/foreign originals without assigning their labels. */}}catch{/* Offline library can be unavailable. */}finally{db?.close()}
 return null
}
