import {ai2Model} from './models'
import {validateProgram,type Ai2Program} from './codec'
import {isAi2Combination,validateAi2Combination} from './combination'
import {readPackedField,writePackedField} from '../packed-fields'
import {ai2EffectParameters,type Ai2EffectField} from './effect-parameters'
export function patchEffectFields(p:Ai2Program):Ai2EffectField[]{
 const model=ai2Model(p.model);if(['N5','NS5R'].includes(model.protocol))return []
 const base=isAi2Combination(p)?11:model.protocol==='01W'?143:135,out:Ai2EffectField[]=[]
 for(let fx=0;fx<2;fx++){
  out.push({id:3000+fx,offset:base+fx,label:'Algorithm',group:'FX '+(fx+1),min:0,max:47},{id:3010+fx,offset:base+2+fx*2,label:'Left balance',group:'FX '+(fx+1),min:0,max:100},{id:3020+fx,offset:base+3+fx*2,label:'Right balance',group:'FX '+(fx+1),min:0,max:100})
  for(let side=0;side<2;side++)out.push({id:3030+fx*2+side,offset:base+8,label:side?'Right enabled':'Left enabled',group:'FX '+(fx+1),mask:1<<(fx*2+side),shift:fx*2+side,min:0,max:1,options:['Off','On']})
  out.push({id:3040+fx,offset:base+17+fx*10,label:'Dynamic modulation source',group:'FX '+(fx+1),min:0,max:6},{id:3050+fx,offset:base+18+fx*10,label:'Dynamic modulation amount',group:'FX '+(fx+1),min:-15,max:15})
 }
 out.push({id:3060,offset:base+8,label:'Routing',group:'Routing',min:0,max:3,mask:48,shift:4,options:['Serial','Parallel 1','Parallel 2','Parallel 3']})
 return [...out,...ai2EffectParameters(p.data.slice(base,base+2),[base+9,base+19])]
}
export const patchEffectValue=(p:Ai2Program,f:Ai2EffectField)=>readPackedField(p.data,f)
export function withPatchEffect(p:Ai2Program,id:number,value:number):Ai2Program{
 const fields=patchEffectFields(p),f=fields.find(f=>f.id===id);if(!f||!Number.isInteger(value)||value<f.min||value>f.max)throw Error('Paramètre FX invalide')
 const data=[...p.data];writePackedField(data,f,value)
 if(id===3000||id===3001){const fx=id-3000,base=f.offset-fx;data.fill(0,base+9+fx*10,base+17+fx*10);for(const field of ai2EffectParameters(data.slice(base,base+2),[base+9,base+19]).filter(f=>f.group==='FX '+(fx+1)))writePackedField(data,field,Math.max(field.min,0))}
 return isAi2Combination(p)?validateAi2Combination({...p,data}):validateProgram({...p,data})
}
