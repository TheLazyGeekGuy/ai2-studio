import {EnvelopeGraph} from '../../instrument-ui/EnvelopeGraph'
import {parameterValue,type X5State} from './model'
export function Envelope({state,kind,osc=0,disabled,onChange}:{state:X5State;kind:'VDF'|'VDA'|'Pitch';osc?:number;disabled:boolean;onChange:(id:number,value:number)=>void}){
 const delta=osc*47,filter=kind==='VDF',pitch=kind==='Pitch'
 const time=pitch?[22,24,25]:filter?[57,59,61,63].map(n=>n+delta):[71,73,75,77].map(n=>n+delta)
 const level=pitch?[21,23,null,26]:filter?[null,58,60,62,64].map(n=>n===null?null:n+delta):[null,72,74,76,null].map(n=>n===null?null:n+delta)
 return <EnvelopeGraph time={time} level={level} getValue={id=>parameterValue(state,id)} onChange={onChange} min={filter||pitch?-99:0} pitch={pitch} title={pitch?'Pitch EG':'OSC '+(osc+1)+' · '+kind+' EG'} label={pitch?'Pitch':'OSC '+(osc+1)+' '+kind} disabled={disabled}/>
}
