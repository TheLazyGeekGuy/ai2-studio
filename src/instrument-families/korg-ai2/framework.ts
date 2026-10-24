import {readAi2FamilyFile} from './read-family-file'
import {ai2Definition} from './definition'
import {encodeProgram,validateProgram,type Ai2Program} from './codec'
import {loadResources,loadRules} from './data'
import {convertProgram,type ConversionOptions,type ConversionResult} from './conversion'
import {createAi2Workspace} from './workspace'
import type {ResourceRules} from './models'

export interface Ai2FileServices {
 readonly resources:typeof loadResources;readonly rules:(target:string)=>Promise<ResourceRules>
 readonly yieldBatch:()=>Promise<void>
}
const defaults:Ai2FileServices={resources:loadResources,rules:loadRules,yieldBatch:()=>new Promise(resolve=>setTimeout(resolve,0))}
export interface Ai2BatchResult {results:ConversionResult[];failures:{index:number;reason:string;original:Ai2Program}[]}

/** Family composition root, not another Studio host. Every call owns a fresh workspace and cancellation scope. */
export function createAi2FileFramework(services:Partial<Ai2FileServices>={}){
 const supplied={...defaults,...services},workspace=createAi2Workspace(),jobs=new Set<AbortController>();let disposed=false
 const ensure=()=>{if(disposed)throw Error('Atelier AI² fermé')}
 return Object.freeze({workspace,
  model(id:string){ensure();return ai2Definition(id)},
  resources(id:string){ensure();ai2Definition(id);return supplied.resources(id)},
  read(bytes:readonly number[],model:string,decoded=false){ensure();return readAi2FamilyFile(bytes,model,decoded)},
  importFile(name:string,bytes:readonly number[],model:string,decoded=false){ensure();const read=readAi2FamilyFile(bytes,model,decoded);workspace.dispatch({type:'ingest',file:{name,bytes},model,programs:read.programs,combinations:read.combinations});return read},
  exportProgram(program:Ai2Program){ensure();return encodeProgram(program)},
  async convert(programs:readonly Ai2Program[],template:Ai2Program,options:ConversionOptions={},signal?:AbortSignal):Promise<Ai2BatchResult>{
   ensure();signal?.throwIfAborted();validateProgram(template);if(programs.length>512)throw Error('Conversion limitée à 512 programmes');const controller=new AbortController(),abort=()=>controller.abort(signal?.reason);jobs.add(controller);signal?.addEventListener('abort',abort,{once:true})
   try{const rules=await supplied.rules(template.model);controller.signal.throwIfAborted();ensure();const result:Ai2BatchResult={results:[],failures:[]}
    for(let i=0;i<programs.length;i++){
     controller.signal.throwIfAborted();ensure();const original=programs[i]
     try{result.results.push(convertProgram(original,template,rules,options))}catch(e){result.failures.push({index:original.index,reason:String(e),original})}
     if(i%16===15){await supplied.yieldBatch();controller.signal.throwIfAborted();ensure()}
    }
    return result
   }finally{signal?.removeEventListener('abort',abort);jobs.delete(controller)}
  },
  cancel(){for(const controller of jobs)controller.abort()},
  dispose(){if(disposed)return;disposed=true;for(const controller of jobs)controller.abort();jobs.clear();workspace.dispose()},
 })
}
