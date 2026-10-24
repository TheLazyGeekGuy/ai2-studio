/** Korg X5DR OM E1 p.129: Symphonic Ensemble allocation, independent of bypass. */
const restricted=new Set([19,20,21,22,23,24,25,26,27,32,33,34,35,36,38,39,42,43,46,47])
export function effectPairError(first:number,second:number):string|null {
 return first===24&&restricted.has(second)||second===24&&restricted.has(first)?'Symphonic ensemble (24) cannot share DSP with effects 19–27, 32–36, 38–39, 42–43 or 46–47 (Korg p.129).':null
}
export interface EffectResolution {unresolvedEffects?:readonly number[]}
export function effectResolution(raw:EffectResolution):EffectResolution {
 const v=raw.unresolvedEffects
 if(v===undefined||Array.isArray(v)&&v.length===0)return {}
 if(!Array.isArray(v)||v.length>2||new Set(v).size!==v.length||v.some(n=>n!==0&&n!==1))throw Error('Invalid unresolved FX state')
 return {unresolvedEffects:Object.freeze([...v])}
}
export function changedEffect(s:EffectResolution,fx:number):EffectResolution&{version:2}{return {version:2,unresolvedEffects:Object.freeze([...new Set([...(s.unresolvedEffects??[]),fx])].sort())}}
export function assertEffectsReady(s:EffectResolution&{data:readonly number[]},offset:number){
 if([s.data[offset]&127,s.data[offset+1]&127].some(n=>n>47))throw Error('Unknown FX algorithm; original data retained, output blocked')
 const error=effectPairError(s.data[offset]&127,s.data[offset+1]&127)
 if(error)throw Error(error)
 if(s.unresolvedEffects?.length)throw Error('FX defaults unresolved: read the device after changing algorithm. JSON draft preserves the previous bytes; buffer output is blocked.')
}
