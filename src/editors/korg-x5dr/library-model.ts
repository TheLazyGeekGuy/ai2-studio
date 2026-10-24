import {universalAi2Adapters} from '../../instrument-families/korg-ai2/library-catalog'
import {isAi2Combination,validateAi2Combination} from '../../instrument-families/korg-ai2/combination'
import {validateProgram,type Ai2Program} from '../../instrument-families/korg-ai2/codec'
import {validateCombiPackage} from './dependencies'
/** Local librarian projection. Original bytes, metadata and archives use Studio services. */
import {builtinFileAdapters,createFileAdapters,entryMessage,type FileAdapter,type FileInventory} from '../../library/adapters'
import {readEditorPreset,writeEditorPreset} from '../../library/editor-preset'
import {entryKey,type Annotation,type EntryRef,type LibraryMetadata} from '../../library/metadata'
import type {LibrarySource,LibraryStorage} from '../../library/storage'
import {decodeProgram,encodeProgram,parameterById,parameterValue,programName,validateState,type X5State} from './model'
import {decodeCombination,encodeCombination,validateCombination,combinationName,combiValue,combiParameterById,type CombinationState} from './combination'
import {decodeBank,allDataPatches} from './patch-banks'
export type LibraryPatch=X5State|CombinationState
export const validateLibraryPatch=(s:unknown):LibraryPatch=>(s as LibraryPatch)?.format==='korg-x5dr-combination'?validateCombination(s):validateState(s)
export const encodeLibraryPatch=(s:LibraryPatch)=>s.format==='korg-x5dr-combination'?encodeCombination(s):encodeProgram(s)
export const libraryModuleId='korg-x5dr-editor'
const text=(s:string)=>s.replace(/[\u0000-\u001f\u007f-\u009f]/g,' ').trim()
export const presetLabel=(s:LibraryPatch)=>text(s.format==='korg-x5dr-combination'?combinationName(s):programName(s))||'Untitled X5DR'
const json=(b:Uint8Array)=>JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(b))
const draftAdapter:FileAdapter={id:'korg-x5dr-draft',extensions:['.json'],detect(bytes){if(bytes.length>65536)return false;try{return ['korg-x5dr-program','korg-x5dr-combination','korg-x5dr-combi-package'].includes(json(bytes)?.format)}catch{return false}},read(bytes){const value=json(bytes);if(value?.format==='korg-x5dr-combi-package'){const bundle=validateCombiPackage(value),patches=[bundle.combination,...bundle.programs.map(p=>p.state)];return {format:'korg-x5dr-combi-package',version:1,endian:'big',layout:'contained',chunks:[],warnings:bundle.missing.map(n=>'Missing RAM Program A'+String(n%100).padStart(2,'0')),entries:patches.map((state,index)=>({index,offset:0,size:bytes.length,name:presetLabel(state),location:index?'A'+String(bundle.programs[index-1].slot).padStart(2,'0'):'Combi',comment:'X5DR dependency package',module:null,model:null,instrumentId:'editor:'+libraryModuleId,instrumentName:'Korg X5DR',blocks:[],opaque:false}))}}const state=validateLibraryPatch(value);return {format:'korg-x5dr-draft',version:1,endian:'big',layout:'contained',chunks:[],warnings:[],entries:[{index:0,offset:0,size:bytes.length,name:presetLabel(state),location:libraryModuleId,comment:'X5DR local draft',module:null,model:null,instrumentId:'editor:'+libraryModuleId,instrumentName:'Korg X5DR',blocks:[],opaque:false}]}}}
export const x5drLibraryAdapters:readonly FileAdapter[]=Object.freeze(universalAi2Adapters([...builtinFileAdapters.map(adapter=>adapter.id!=='editor-preset-json'?(adapter.id==='midi-syx'||adapter.id==='midi-smf'?{...adapter,read(bytes:Uint8Array){const inventory=adapter.read(bytes);const entries=inventory.entries.flatMap((entry,index)=>{const message=entryMessage(inventory,index);if(!message||message[1]!==66||message[3]!==54||![76,77,80].includes(message[4]))return [entry];const bank=message[4]===80?allDataPatches(message):decodeBank(message);return bank.map((state,n)=>({...entry,comment:'X5DR bank projection',name:presetLabel(state),location:(state.format==='korg-x5dr-program'?'A':'C')+String(n%100).padStart(2,'0'),message:encodeLibraryPatch(state)}))});return {...inventory,entries:entries.map((e,index)=>({...e,index}))}}}:adapter):{...adapter,read(bytes:Uint8Array){const document=readEditorPreset(bytes);if(document.moduleId===libraryModuleId){if(document.stateVersion!==1)throw Error('Unsupported X5DR preset schema');validateLibraryPatch(document.state)}return adapter.read(bytes)}}),draftAdapter]))
export const readLibraryFile=createFileAdapters(x5drLibraryAdapters).read
export function captureLibraryProgram(state:LibraryPatch){return writeEditorPreset({format:'midi-studio-editor-preset',version:1,moduleId:libraryModuleId,stateVersion:1,name:presetLabel(state),editorName:'Korg X5DR',state:validateLibraryPatch(state)})}
export interface ProgramRow {ref:EntryRef;id:string;source:LibrarySource;state:LibraryPatch;name:string;mode:string;effects:string[];content:string;note?:Annotation;bankIndex?:number;key:string}
function row(source:LibrarySource,index:number,state:LibraryPatch,name=presetLabel(state)):ProgramRow{
 const ref={sourceId:source.id,index},id=entryKey(ref),combi=state.format==='korg-x5dr-combination',mode=combi?'Combi':parameterById(10).options?.[parameterValue(state,10)]??'Unknown',effects=[1135,1136].map(id=>{const p=combi?combiParameterById(100000+id,state):parameterById(id),value=combi?combiValue(state,100000+id):parameterValue(state,id);return p.options?.[value]??'Unknown '+value}).filter((v,i,a)=>a.indexOf(v)===i)
 return {ref,id,key:id,source,state,name,mode,effects,content:state.format+':'+state.data.map(v=>v.toString(16).padStart(2,'0')).join('')}
}
export async function libraryPrograms(storage:LibraryStorage,sources:readonly LibrarySource[],signal?:AbortSignal,cache?:Map<string,ProgramRow[]>):Promise<ProgramRow[]>{
 const rows:ProgramRow[]=[]
 for(const source of sources){
  signal?.throwIfAborted()
  const cached=cache?.get(source.id);if(cached){rows.push(...cached);continue}
  const projected:ProgramRow[]=[]
  if(source.inventory.format==='korg-x5dr-combi-package'){const bundle=validateCombiPackage(json(await storage.original(source.id)));signal?.throwIfAborted();projected.push(...[bundle.combination,...bundle.programs.map(p=>p.state)].map((s,i)=>row(source,i,s)))}
  else if(source.inventory.format==='korg-x5dr-draft'){const state=validateLibraryPatch(json(await storage.original(source.id)));signal?.throwIfAborted();projected.push(row(source,0,state))}
  else if(source.inventory.format==='midi-studio-editor-preset'&&source.inventory.entries[0]?.instrumentId==='editor:korg-ai2-file'){const document=readEditorPreset(await storage.original(source.id));signal?.throwIfAborted();const raw=document.state as Ai2Program;if(raw.model==='X5DR'){const p=isAi2Combination(raw)?validateAi2Combination(raw):validateProgram(raw),state=validateLibraryPatch({format:isAi2Combination(p)?'korg-x5dr-combination':'korg-x5dr-program',version:1,channel:p.channel,data:p.data,original:[]});projected.push(row(source,0,state,document.name))}}
  else if(source.inventory.format==='midi-studio-editor-preset'&&source.inventory.entries[0]?.instrumentId==='editor:'+libraryModuleId){const document=readEditorPreset(await storage.original(source.id));signal?.throwIfAborted();if(document.moduleId!==libraryModuleId||document.stateVersion!==1)throw Error('Unsupported X5DR preset schema');projected.push(row(source,0,validateLibraryPatch(document.state),document.name))}
  else source.inventory.entries.forEach((entry,index)=>{const message=entryMessage(source.inventory,index);if(!message)return;try{const original=entry.comment==='X5DR bank projection'?[]:message,state=message[4]===73?validateCombination({format:'korg-x5dr-combination',version:1,...decodeCombination(message),original}):validateState({format:'korg-x5dr-program',version:1,...decodeProgram(message),original});projected.push(row(source,index,state))}catch{/* Other models/functions remain opaque in their original source. */}})
  cache?.set(source.id,projected);rows.push(...projected)
 }
 return rows
}
export function namedProgramRows(rows:readonly ProgramRow[],metadata:LibraryMetadata){const notes=new Map(metadata.annotations.map(a=>[entryKey(a.ref),a.revisions.at(-1)!]));return rows.map(r=>({...r,note:notes.get(r.id)}))}
export const rowName=(row:ProgramRow)=>row.note?.name||row.name
const normalize=(s:string)=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLocaleLowerCase()
export interface ProgramFilters {query:string;source:string;tag:string;effect:string;mode:string;favorites:boolean;bank:string;sort:'original'|'name'|'source'|'recent';duplicates:'show'|'name'|'content'}
export const emptyProgramFilters=():ProgramFilters=>({query:'',source:'',tag:'',effect:'',mode:'',favorites:false,bank:'',sort:'original',duplicates:'show'})
export function browsePrograms(rows:readonly ProgramRow[],metadata:LibraryMetadata,filter:ProgramFilters){
 const byId=new Map(rows.map(r=>[r.id,r])),bank=metadata.banks.find(b=>b.id===filter.bank),q=normalize(filter.query.trim()),seen=new Set<string>()
 let result=filter.bank?(bank?.entries.flatMap((ref,bankIndex)=>{const row=byId.get(entryKey(ref));return row?[{...row,bankIndex,key:row.id+':bank:'+bankIndex}]:[]})??[]):[...rows]
 result=result.filter(r=>(!filter.source||r.source.id===filter.source)&&(!filter.tag||r.note?.tags.includes(filter.tag))&&(!filter.effect||r.effects.includes(filter.effect))&&(!filter.mode||r.mode===filter.mode)&&(!filter.favorites||r.note?.favorite)&&(!q||normalize([rowName(r),r.name,r.source.name,r.mode,...r.effects,...r.note?.tags??[]].join(' ')).includes(q)))
 result=result.filter(r=>{const key=filter.duplicates==='content'?r.content:filter.duplicates==='name'?normalize(rowName(r)):'';if(!key)return true;if(seen.has(key))return false;seen.add(key);return true})
 if(filter.sort!=='original')result.sort((a,b)=>(filter.sort==='recent'?b.source.importedAt.localeCompare(a.source.importedAt):filter.sort==='source'?a.source.name.localeCompare(b.source.name):rowName(a).localeCompare(rowName(b)))||a.key.localeCompare(b.key))
 return result
}
export const libraryDragType='application/x-midi-studio-preset'
export function parseProgramDrag(raw:string,rows:readonly ProgramRow[]){const value=JSON.parse(raw) as EntryRef&{bankId?:string;bankIndex?:number};if(!value||typeof value.sourceId!=='string'||!Number.isInteger(value.index)||!rows.some(r=>r.id===entryKey(value))||value.bankId!==undefined&&(typeof value.bankId!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(value.bankId))||value.bankIndex!==undefined&&(!Number.isInteger(value.bankIndex)||value.bankIndex<0))throw Error('Unknown Program reference');return value}
export function reorderProgramBank(entries:readonly EntryRef[],from:number,to:number,ref:EntryRef){if(!Number.isInteger(from)||!Number.isInteger(to)||from<0||to<0||from>=entries.length||to>=entries.length||entryKey(entries[from])!==entryKey(ref))throw Error('Bank changed; select the Program again');const next=entries.slice(),[item]=next.splice(from,1);next.splice(to,0,item);return next}
export function exportPrograms(rows:readonly ProgramRow[]){if(!rows.length||rows.length>50000)throw Error('Choose at least one Program (maximum 50,000)');const messages=rows.map(r=>encodeLibraryPatch(r.state)),out=new Uint8Array(messages.reduce((n,b)=>n+b.length,0));let offset=0;for(const b of messages){out.set(b,offset);offset+=b.length}return out}
export function inventoryHasPrograms(inventory:FileInventory){return inventory.entries.some((_,i)=>{const message=entryMessage(inventory,i);if(!message)return false;try{if(message[4]===73)decodeCombination(message);else decodeProgram(message);return true}catch{return false}})||inventory.entries.some(e=>e.instrumentId==='editor:'+libraryModuleId||e.instrumentId==='editor:korg-ai2-file')}
