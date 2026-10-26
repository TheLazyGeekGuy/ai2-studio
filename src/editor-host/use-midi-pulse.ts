import {useEffect,useState} from 'react'
import type {MidiLease} from './midi-broker'
/** Receive and send activity, including routed keyboard/controller messages, capped to animation frames. */
export function useMidiPulse(lease:MidiLease,active=true){
 const [pulse,setPulse]=useState(0)
 useEffect(()=>{if(!active)return;let frame:number|undefined;const off=lease.onActivity(()=>{if(frame===undefined)frame=requestAnimationFrame(()=>{frame=undefined;setPulse(n=>n+1)})});return()=>{off();if(frame!==undefined)cancelAnimationFrame(frame)}},[lease,active])
 return pulse
}
