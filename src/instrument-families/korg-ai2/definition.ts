import {ai2Model,protocols} from './models'
import {ai2Member} from './family'
import {createAi2DumpCodec} from './dump-codec'

/** Small immutable leaf definition. No catalogue, rule table, view, workspace or connection is constructed. */
export function defineAi2Model(id:string){
 const model=ai2Model(id),protocol=protocols[model.protocol],legacy=!['NS5R','N5'].includes(model.protocol)
 const layout=Object.freeze({legacy,referenceEncoding:model.protocol==='01W'?'one-based':model.protocol==='03RW'?'legacy-bank':legacy?'little-endian':'big-endian',octaveEncoding:legacy?'octaves':model.protocol==='N5'?'enum':'semitones',
  oscillators:Object.freeze([0,1].map(osc=>{const base=legacy?(model.protocol==='01W'?51:47)*osc:(model.protocol==='N5'?22+78*osc:14+72*osc);return Object.freeze({base,reference:legacy?osc?15:12:base,octave:legacy?osc?17:14:base+2,coarse:legacy?osc?18:undefined:base+4,fine:legacy?osc?19:undefined:base+5})})),
 })
 const dump=(bank:boolean)=>createAi2DumpCodec({modelId:protocol.id,functionId:bank?protocol.bank:protocol.buffer,recordSize:protocol.size,maxRecords:bank?protocol.maxPrograms:1,selector:bank&&!protocol.checksum?[0]:[],checksum:protocol.checksum,label:id+' Program'+(bank?' bank':'')})
 return Object.freeze({model,protocol,layout,member:ai2Member(id),program:dump(false),bank:dump(true)})
}
export type Ai2Definition=ReturnType<typeof defineAi2Model>
// Bounded immutable definitions may be shared. Mutable workspaces/sessions are never cached here.
const definitions=new Map<string,Ai2Definition>()
export function ai2Definition(id:string){const existing=definitions.get(id);if(existing)return existing;const definition=defineAi2Model(id);definitions.set(id,definition);return definition}
