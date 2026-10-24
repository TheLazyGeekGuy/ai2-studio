import {EnvelopeGraph} from '../../instrument-ui/EnvelopeGraph'
import {ai2Model} from './models'
import {semanticFields,readField} from './parameters'
import type {Ai2Program} from './codec'
export type Ai2EnvelopeKind='vdf'|'vda'|'pitch'
/** `kinds` limits the graphs, so each one can sit in its own card of the aligned columns. */
export function Ai2Envelopes({program,osc,disabled,onChange,kinds=['vdf','vda','pitch']}:{program:Ai2Program;osc:number;disabled:boolean;onChange:(key:string,value:number)=>void;kinds?:readonly Ai2EnvelopeKind[]}){
 const fields=semanticFields(ai2Model(program.model)),byKey=new Map(fields.map(f=>[f.key,f])),prefix='osc'+(osc+1)+'.',get=(key:string)=>readField(program,byKey.get(key)!),max=byKey.get(prefix+'vdf.attackTime')!.max
 return <div className="ai2-envelope-row">{kinds.map(kind=>{const pitch=kind==='pitch',times=pitch?['attackTime','decayTime','releaseTime']:['attackTime','decayTime','slopeTime','releaseTime'],levels=pitch?['startLevel','attackLevel',null,'releaseLevel']:[null,'attackLevel','breakLevel','sustainLevel',kind==='vdf'?'releaseLevel':null],key=(name:string)=>prefix+kind+'.'+name;return <EnvelopeGraph key={kind} time={times.map(key)} level={levels.map(name=>name===null?null:key(name))} getValue={get} onChange={onChange} min={kind==='vda'?0:byKey.get(key('attackLevel'))!.min} max={max} pitch={pitch} title={'OSC '+(osc+1)+' · '+kind.toUpperCase()+' EG'} label={program.model+' OSC '+(osc+1)+' '+kind.toUpperCase()} disabled={disabled}/>})}</div>
}
