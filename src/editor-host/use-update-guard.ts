import {useEffect,useRef} from 'react'
import {registerUpdateGuard} from '../update-safety'
export function useUpdateGuard(guard:(build:string)=>boolean|Promise<boolean>){const latest=useRef(guard);latest.current=guard;useEffect(()=>registerUpdateGuard(build=>latest.current(build)),[])}
