import {combiLayers} from './combi-zones'
import type {CombinationState} from './combination'

/** The effective levels are patch edits. Restore values remain session-local. */
export interface CombiMix {base:readonly number[];levels:readonly number[];muted:readonly number[];solo:readonly number[]}
export function planCombiMix(state:CombinationState,previous:CombiMix|null,kind:'mute'|'solo'|'reset',timbre:number){
 const layers=combiLayers(state),levels=layers.map(l=>l.level)
 if(!Number.isInteger(timbre)||timbre<1||timbre>8)throw Error('Invalid timbre')
 if(kind!=='reset'&&!layers[timbre-1].enabled)throw Error('Timbre is Off')
 const current=previous&&previous.levels.every((v,i)=>v===levels[i])?previous:null
 const base=current?.base??levels,muted=new Set(current?.muted??[]),solo=new Set(current?.solo??[])
 if(kind==='reset'){muted.clear();solo.clear()}
 else {const selected=kind==='mute'?muted:solo;selected.has(timbre)?selected.delete(timbre):selected.add(timbre)}
 const next=base.map((v,i)=>muted.has(i+1)||solo.size>0&&!solo.has(i+1)?0:v)
 return {mix:muted.size||solo.size?{base,levels:next,muted:[...muted],solo:[...solo]}:null,values:layers.filter((l,i)=>l.level!==next[i]).map(l=>({id:l.ids.Level,value:next[l.timbre-1]}))}
}
