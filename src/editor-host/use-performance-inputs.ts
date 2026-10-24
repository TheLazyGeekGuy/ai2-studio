import {useEffect,useMemo} from 'react'
import {createPerformanceInputs} from './performance-inputs'

/** Own one inert router per binding context; React effect replay must not close it. */
export function usePerformanceInputs(options:Parameters<typeof createPerformanceInputs>[0]){
 const {id,access,broker,lease}=options
 const resource=useMemo(()=>({routing:createPerformanceInputs({id,access,broker,lease}),mounted:false}),[id,access,broker,lease])
 useEffect(()=>{
  resource.mounted=true
  return()=>{
   resource.mounted=false
   resource.routing.stop()
   queueMicrotask(()=>{if(!resource.mounted)resource.routing.dispose()})
  }
 },[resource])
 return resource.routing
}
