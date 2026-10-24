import {validateAi2Combination,withCombinationField,withCombinationMix,type Ai2Combination} from './combination'
import {ai2Model} from './models'
import {validateProgram,byteArray,type Ai2Program} from './codec'
import {semanticFields,writeField} from './parameters'
import {writeOscillatorReference,writeOscillatorOctave} from './oscillators'
export interface Ai2SourceFile {name:string;bytes:readonly number[]}
export interface Ai2Workspace {sources?:readonly Ai2SourceFile[];format:'korg-ai2-workspace';version:1|2;combinations?:Readonly<Record<string,readonly Ai2Combination[]>>;selectedCombinations?:Readonly<Record<string,number>>;programs:Readonly<Record<string,readonly Ai2Program[]>>;selected:Readonly<Record<string,number>>}
export function validateWorkspace(raw:unknown):Ai2Workspace{
 const v=raw as Ai2Workspace;if(!v||v.format!=='korg-ai2-workspace'||![1,2].includes(v.version)||!v.programs||!v.selected||typeof v.programs!=='object'||typeof v.selected!=='object')throw Error('Projet AI² invalide')
 let count=0;const programs:Record<string,readonly Ai2Program[]>={},selected:Record<string,number>={}
 for(const [id,items]of Object.entries(v.programs)){
  ai2Model(id);if(!Array.isArray(items)||!items.length||(count+=items.length)>512)throw Error('Projet limité à 512 programmes')
  programs[id]=Object.freeze(items.map(p=>{if(p.model!==id)throw Error('Programme classé sous un autre modèle');return validateProgram(p)}));const i=v.selected[id]??0;if(!Number.isInteger(i)||i<0||i>=items.length)throw Error('Sélection invalide');selected[id]=i
 }
 const combinations:Record<string,readonly Ai2Combination[]>={},selectedCombinations:Record<string,number>={}
 for(const [id,items]of Object.entries(v.combinations??{})){ai2Model(id);if(v.version!==2||!Array.isArray(items)||!items.length||(count+=items.length)>512)throw Error('Invalid AI² combinations');combinations[id]=Object.freeze(items.map(p=>{if(p.model!==id)throw Error('Combination model mismatch');return validateAi2Combination(p)}));const index=v.selectedCombinations?.[id]??0;if(!Number.isInteger(index)||index<0||index>=items.length)throw Error('Invalid Combi selection');selectedCombinations[id]=index}
 let bytes=0;const sources=v.sources??[];if(!Array.isArray(sources)||sources.length>8)throw Error('Projet limité à 8 fichiers source');const files=sources.map(f=>{if(typeof f.name!=='string'||f.name.length>255||byteArray(f.bytes).length>4_000_000||(bytes+=f.bytes.length)>8_000_000)throw Error('Sources limitées à 8 Mo');return Object.freeze({name:f.name,bytes:Object.isFrozen(f.bytes)?f.bytes:Object.freeze([...f.bytes])})})
 return Object.freeze({sources:Object.freeze(files),format:v.format,version:v.version,...(v.version===2?{combinations:Object.freeze(combinations),selectedCombinations:Object.freeze(selectedCombinations)}:{}),programs:Object.freeze(programs),selected:Object.freeze(selected)})
}
type CombinationAction={type:'combi-import';model:string;combinations:readonly Ai2Combination[]}|{type:'combi-select';model:string;index:number}|{type:'combi-field';model:string;timbre:number;key:string;value:number}|{type:'combi-name';model:string;value:string}|{type:'combi-mix';model:string;operation:'mute'|'solo'|'restore';timbre?:number}
export type Ai2WorkspaceAction=CombinationAction|{type:'ingest';file:Ai2SourceFile;model:string;programs:readonly Ai2Program[];combinations?:readonly Ai2Combination[]}|{type:'source';file:Ai2SourceFile}|{type:'import';model:string;programs:readonly Ai2Program[]}|{type:'select';model:string;index:number}|{type:'field';model:string;key:string;value:number}|{type:'waveform';model:string;osc:number;value:number}|{type:'octave';model:string;osc:number;value:number}|{type:'name';model:string;value:string}|{type:'mode';model:string;value:number}|{type:'replace';state:unknown}|{type:'undo'}|{type:'redo'}
export function createAi2Workspace(){
 let state=validateWorkspace({format:'korg-ai2-workspace',version:1,programs:{},selected:{}}),locked=false,disposed=false,undo:Ai2Workspace[]=[],redo:Ai2Workspace[]=[]
 const listeners=new Set<()=>void>(),notify=()=>{snapshot=Object.freeze({state,locked,undo:undo.length,redo:redo.length});for(const fn of listeners)fn()};let snapshot:Readonly<{state:Ai2Workspace;locked:boolean;undo:number;redo:number}>=Object.freeze({state,locked,undo:0,redo:0})
 return {getSnapshot:()=>snapshot,subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn)}},serialize:()=>state,setLocked(v:boolean){locked=v;notify()},dispose(){disposed=true;listeners.clear()},dispatch(a:Ai2WorkspaceAction){
  if(disposed)throw Error('Projet fermé');if(locked)throw Error('Édition verrouillée')
  if(a.type==='undo'||a.type==='redo'){const from=a.type==='undo'?undo:redo,to=a.type==='undo'?redo:undo,next=from.pop();if(next){to.push(state);state=next;notify()}return}
  let next:Ai2Workspace
  if(a.type==='combi-select'){if(!Number.isInteger(a.index)||!state.combinations?.[a.model]?.[a.index])throw Error('Unknown Combination');state=Object.freeze({...state,selectedCombinations:Object.freeze({...state.selectedCombinations,[a.model]:a.index})});notify();return}
  if(a.type==='combi-import')next=validateWorkspace({...state,version:2,combinations:{...state.combinations,[a.model]:a.combinations},selectedCombinations:{...state.selectedCombinations,[a.model]:0}})
  else if(a.type==='combi-field'||a.type==='combi-name'||a.type==='combi-mix'){
   const index=state.selectedCombinations?.[a.model]??0,current=state.combinations?.[a.model]?.[index];if(!current)throw Error('Import a Combination first');let combination:Ai2Combination
   if(a.type==='combi-field')combination=withCombinationField(current,a.timbre,a.key,a.value)
   else if(a.type==='combi-mix')combination=withCombinationMix(current,a.operation,a.timbre)
   else {if(!/^[ -~]{0,10}$/.test(a.value))throw Error('Nom : dix caractères ASCII maximum');combination=validateAi2Combination({...current,data:[...[...a.value.padEnd(10)].map(c=>c.charCodeAt(0)),...current.data.slice(10)]})}
   const items=[...state.combinations![a.model]];items[index]=combination;next=Object.freeze({...state,combinations:Object.freeze({...state.combinations,[a.model]:Object.freeze(items)})})
  }
  else if(a.type==='replace')next=validateWorkspace(a.state)
  else if(a.type==='ingest'){ai2Model(a.model);next=validateWorkspace({...state,...(a.combinations?.length?{version:2,combinations:{...state.combinations,[a.model]:a.combinations},selectedCombinations:{...state.selectedCombinations,[a.model]:0}}:{}),sources:[...(state.sources??[]),a.file],...(a.programs.length?{programs:{...state.programs,[a.model]:a.programs},selected:{...state.selected,[a.model]:0}}:{})})}
  else if(a.type==='source')next=validateWorkspace({...state,sources:[...(state.sources??[]),a.file]})
  else if(a.type==='import'){
   ai2Model(a.model);next=validateWorkspace({...state,programs:{...state.programs,[a.model]:a.programs},selected:{...state.selected,[a.model]:0}})
  }else if(a.type==='select'){
   if(!state.programs[a.model]?.[a.index]||!Number.isInteger(a.index))throw Error('Programme inconnu');state=Object.freeze({...state,selected:Object.freeze({...state.selected,[a.model]:a.index})});notify();return
  }else{
   const model=ai2Model(a.model),index=state.selected[a.model]??0,current=state.programs[a.model]?.[index];if(!current)throw Error('Importer un programme avant de l’éditer');const data=[...current.data]
   if(a.type==='name'){if(typeof a.value!=='string'||!/^[ -~]{0,10}$/.test(a.value))throw Error('Nom : dix caractères ASCII maximum');data.splice(0,10,...[...a.value.padEnd(10)].map(c=>c.charCodeAt(0)))}
   else if(a.type==='mode'){if(!Number.isInteger(a.value)||a.value<0||a.value>1)throw Error('Modes locaux Single/Double seulement');data[10]=a.value}
   else if(a.type==='field'){const f=semanticFields(model).find(f=>f.key===a.key);if(!f)throw Error('Paramètre inconnu');writeField(data,f,a.value)}
   else if(a.type==='octave')writeOscillatorOctave(data,a.model,a.osc,a.value)
   else if(a.type==='waveform'){
    if(data[10]===2)throw Error('Références Drums : kit dépendant, pas une waveform mélodique')
    writeOscillatorReference(data,a.model,a.osc,a.value)
   }else throw Error('Action AI² inconnue')
   const items=[...state.programs[a.model]];items[index]=validateProgram({...current,data});next=Object.freeze({...state,programs:Object.freeze({...state.programs,[a.model]:Object.freeze(items)})})
  }
  undo=[...undo.slice(-19),state];redo=[];state=next;notify()
 }}
}
