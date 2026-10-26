import {createContext,useContext,useLayoutEffect,useRef,type Dispatch,type SetStateAction} from 'react'
import type {MidiLease} from './midi-broker'
export interface ActiveMidi {owner:symbol;lease:MidiLease}
/** Display-only lease selection; it grants no MIDI capability or port ownership. */
export const ActiveMidiContext=createContext<Dispatch<SetStateAction<ActiveMidi|null>>|null>(null)
export function useActiveMidi(lease:MidiLease,active:boolean){
 const publish=useContext(ActiveMidiContext),owner=useRef(Symbol()).current
 useLayoutEffect(()=>{if(!publish||!active)return;publish({owner,lease});return()=>publish(previous=>previous?.owner===owner?null:previous)},[publish,owner,lease,active])
}
