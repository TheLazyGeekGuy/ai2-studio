import {ai2Definition} from './definition'
import {validateProgram} from './codec'
import {semanticFields,writeField} from './parameters'
import {writeOscillatorOctave,writeOscillatorReference} from './oscillators'
/** Visible synthetic editing template; never presented as a read from hardware or a factory sound. */
export function initialAi2Program(model:string){const d=ai2Definition(model),data=Array(d.protocol.size).fill(0);data.splice(0,10,...[...'Init Local'].map(c=>c.charCodeAt(0)));for(const f of semanticFields(d.model))writeField(data,f,Math.max(f.min,Math.min(f.max,0)));for(const osc of [0,1]){writeOscillatorReference(data,model,osc,0);writeOscillatorOctave(data,model,osc,0)}return validateProgram({model,channel:1,index:0,data,original:[]})}
