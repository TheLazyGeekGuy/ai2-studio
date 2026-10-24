import {createFileAdapters,validateFileInventory,type FileAdapter,type FileInventory} from './adapters'
import {sourceHash,readLibraryArchive,type ArchivedRecords} from './archive'
import {emptyMetadata,validateMetadata,type LibraryMetadata} from './metadata'
import {legacyOccurrence,validateOccurrences,type LibraryOccurrence} from './occurrences'
import {libraryLimits,type LibraryStorage,type LibrarySource} from './storage'
import {writeLibraryZip,readLibraryZipMembers,isLibraryZip,type ZipMember} from './zip'
export {isLibraryZip}
export interface LibraryBackup {format:'zip'|'json-v1';createdAt:string|null;records:ArchivedRecords;metadata:LibraryMetadata;occurrences:LibraryOccurrence[];warnings:string[]}
export const libraryBackupName=()=>`midi-studio-libraries-${new Date().toISOString().replace(/[:.]/g,'-')}.zip`
const text=(s:string)=>new TextEncoder().encode(s)
const snapshot=(inventory:FileInventory):FileInventory=>({...inventory,entries:inventory.entries.map(e=>({index:e.index,offset:e.offset,size:e.size,name:e.name,location:e.location,comment:e.comment,module:e.module,model:e.model,instrumentId:e.instrumentId,instrumentName:e.instrumentName,blocks:[],opaque:true})),chunks:[]})
const opaqueSnapshot=(inventory:FileInventory):FileInventory=>({...snapshot(inventory),format:'archived-library-file',entries:snapshot(inventory).entries.map(e=>({...e,comment:'Archived file metadata, decoder unavailable. '+e.comment})),warnings:[...inventory.warnings,'Read-only archived inventory; no device operation or decoded patch is implied.']})
export async function exportLibraryBackup(storage:LibraryStorage){
 const sources=await storage.list();if(sources.length>libraryLimits.sources)throw Error('Library source limit')
 const stored=storage.occurrences?await storage.occurrences():[],occurrences=validateOccurrences([...stored,...sources.filter(s=>!stored.some(o=>o.sourceId===s.id)).map(legacyOccurrence)],sources),metadata=validateMetadata(await storage.metadata?.()??emptyMetadata(),sources),originals=new Map<string,Uint8Array>();let size=0
 for(const source of sources){const bytes=await storage.original(source.id);if((size+=bytes.length)>libraryLimits.bytes||bytes.length!==source.size||await sourceHash(bytes)!==source.id)throw Error('Library original hash/size mismatch');originals.set(source.id,bytes)}
 const files=occurrences.map(o=>({...o,file:`files/${o.id}/${o.path}`})),manifest={format:'midi-studio-library-backup',version:1,createdAt:new Date().toISOString(),sources:sources.map(s=>({id:s.id,name:s.name,importedAt:s.importedAt,size:s.size,inventory:snapshot(s.inventory)})),metadata,occurrences:files}
 const members:ZipMember[]=[{name:'manifest.json',bytes:text(JSON.stringify(manifest,null,2))},{name:'README.txt',bytes:text('MIDI Studio library backup — standard ZIP archive\n\nfiles/ contains every recorded file occurrence, with its relative path and exact original bytes. Identical contents may appear under several occurrence folders; all copies are intentional.\n\nmanifest.json records source SHA-256 values, original names, relative paths, import dates, instrument metadata, tags, favorites, annotation revisions and ordered banks.\n\nExtract files/ using any standard ZIP application; no MIDI Studio editor is needed to recover the original files. To restore classification and banks, open this ZIP with MIDI Studio library Backup / Open backup. A preview is read-only until Restore is selected. Reopening the same backup does not duplicate its occurrence IDs.\n\nNo MIDI ports, live grants, device STORE, editor workspace or unsaved edit buffers are included. Browsers do not reveal absolute disk paths. Older libraries provide only their previously retained filenames, not past duplicate imports.\n')}]
 for(const file of files)members.push({name:file.file,bytes:originals.get(file.sourceId)!})
 return writeLibraryZip(members)
}
function exactKeys(value:unknown,names:string[]):asserts value is Record<string,unknown>{if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==names.length||names.some(n=>!Object.hasOwn(value,n)))throw Error('Invalid backup fields')}
const date=(v:unknown)=>typeof v==='string'&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString()===v
export async function readLibraryBackup(bytes:Uint8Array,adapters?:readonly FileAdapter[]):Promise<LibraryBackup>{
 if(!isLibraryZip(bytes)){const records=await readLibraryArchive(new TextDecoder('utf-8',{fatal:true}).decode(bytes),adapters);return {format:'json-v1',createdAt:null,records,metadata:records.metadata??emptyMetadata(),occurrences:records.map(r=>legacyOccurrence(r.source)),warnings:['Legacy JSON archive: past duplicate file imports and directory paths were not recorded.']}}
 const members=await readLibraryZipMembers(bytes),raw=members.get('manifest.json');if(!raw)throw Error('ZIP has no MIDI Studio manifest.json')
 const manifest:unknown=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(raw));exactKeys(manifest,['format','version','createdAt','sources','metadata','occurrences'])
 if(manifest.format!=='midi-studio-library-backup'||manifest.version!==1||!date(manifest.createdAt)||!Array.isArray(manifest.sources)||manifest.sources.length>libraryLimits.sources||!Array.isArray(manifest.occurrences))throw Error('Invalid library backup manifest')
 const declared=manifest.sources.map(row=>{exactKeys(row,['id','name','importedAt','size','inventory']);if(typeof row.id!=='string'||!/^[0-9a-f]{64}$/.test(row.id)||typeof row.name!=='string'||!row.name.trim()||row.name.length>255||/[\u0000-\u001f\u007f]/.test(row.name)||!date(row.importedAt)||!Number.isInteger(row.size)||Number(row.size)<1||Number(row.size)>32*1024*1024)throw Error('Invalid backup source');return {id:row.id,name:row.name,importedAt:row.importedAt as string,size:row.size as number,inventory:validateFileInventory(row.inventory as FileInventory,row.size as number)} as LibrarySource})
 if(new Set(declared.map(s=>s.id)).size!==declared.length||declared.reduce((n,s)=>n+s.size,0)>libraryLimits.bytes||declared.reduce((n,s)=>n+s.inventory.entries.length,0)>libraryLimits.entries)throw Error('Backup source limit/duplicate')
 const paths=new Map<string,string>(),copies=manifest.occurrences.map(row=>{exactKeys(row,['id','sourceId','name','path','importedAt','file']);const {file,...occurrence}=row;if(typeof file!=='string'||file!==`files/${row.id}/${row.path}`||paths.has(file))throw Error('Invalid backup occurrence path');paths.set(file,String(row.sourceId));return occurrence}),occurrences=validateOccurrences(copies,declared)
 if(declared.some(s=>!occurrences.some(o=>o.sourceId===s.id)))throw Error('Backup source has no file occurrence')
 const originals=new Map<string,Uint8Array>()
 for(const [path,id] of paths){const original=members.get(path),source=declared.find(s=>s.id===id)!;if(!original||original.length!==source.size||await sourceHash(original)!==id)throw Error('Backup original SHA-256 mismatch');if(!originals.has(id))originals.set(id,original)}
 if([...members.keys()].some(path=>path!=='manifest.json'&&path!=='README.txt'&&!paths.has(path)))throw Error('Unreferenced ZIP member')
 const warnings:string[]=[],parser=createFileAdapters(adapters),records:ArchivedRecords=[]
 for(const source of declared){const original=originals.get(source.id)!;let inventory:FileInventory;try{inventory=parser.read(original);if(inventory.entries.length!==source.inventory.entries.length||inventory.entries.some((e,i)=>e.instrumentId!==source.inventory.entries[i].instrumentId))throw Error('Adapter inventory differs')}catch{inventory=opaqueSnapshot(source.inventory);warnings.push(source.name+': preserved with read-only file metadata; original decoder unavailable.')}
  records.push({source:{...source,inventory},bytes:original})
 }
 const metadata=validateMetadata(manifest.metadata,records.map(r=>r.source));records.metadata=metadata
 return {format:'zip',createdAt:manifest.createdAt as string,records,metadata,occurrences,warnings}
}
export async function restoreLibraryBackup(storage:LibraryStorage,backup:LibraryBackup){
 if(!storage.merge||!storage.occurrences)throw Error('This storage adapter cannot atomically restore file occurrences')
 return storage.merge(backup.records,backup.metadata,backup.occurrences)
}
