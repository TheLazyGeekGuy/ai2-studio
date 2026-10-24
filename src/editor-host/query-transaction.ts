import type {MidiLease,MidiAuthorization} from './midi-broker'
/** Single-flight read service. The model's broker whitelist, not this helper, authorizes packet semantics. */
export function createQueryTransactions(lease:MidiLease,authorize:()=>MidiAuthorization){
 let disposed=false,cancelActive:((reason:string)=>void)|null=null
 const offState=lease.onState(()=>cancelActive?.('MIDI binding changed'))
 return {
  request<T>(spec:{bytes:readonly number[];decode:(bytes:readonly number[])=>T|null;timeoutMs?:number;maxReplyBytes?:number;signal?:AbortSignal;sent?:()=>void}):Promise<T>{
   if(disposed||cancelActive)return Promise.reject(Error(disposed?'Query service disposed':'Another query is active'))
   const link=lease.getState(),timeout=spec.timeoutMs??3000,maxReply=spec.maxReplyBytes??4096
   if(!link.connected||!link.binding||!lease.supportsSysex?.())return Promise.reject(Error('Connected SysEx-enabled MIDI pair required'))
   if(!Number.isInteger(timeout)||timeout<10||timeout>30000||spec.bytes.length>4096||!Number.isInteger(maxReply)||maxReply<1||maxReply>1048576)return Promise.reject(Error('Invalid query budget'))
   if(spec.signal?.aborted)return Promise.reject(Error('Query cancelled'))
   return new Promise<T>((resolve,reject)=>{
    let finished=false,timer:ReturnType<typeof setTimeout>|undefined,off:()=>void=()=>{}
    const abort=()=>finish(Error('Query cancelled'))
    const finish=(error:Error|null,value?:T)=>{if(finished)return;finished=true;if(timer!==undefined)clearTimeout(timer);off();spec.signal?.removeEventListener('abort',abort);cancelActive=null;error?reject(error):resolve(value as T)}
    cancelActive=reason=>finish(Error(reason))
    try{off=lease.subscribe(packet=>{
     if(finished||packet.generation!==link.generation||packet.inputId!==link.binding!.inputId||packet.bytes.length>maxReply)return
     try{const value=spec.decode(packet.bytes);if(value!==null)finish(null,value)}catch{finish(Error('Invalid query reply'))}
    })}catch(e){finish(e instanceof Error?e:Error(String(e)));return}
    spec.signal?.addEventListener('abort',abort,{once:true})
    timer=setTimeout(()=>finish(Error('Query timed out; no automatic retry')),timeout)
    try{const grant=authorize();if(finished)return;if(lease.getState().generation!==link.generation){finish(Error('MIDI binding changed'));return}lease.send([spec.bytes],grant);spec.sent?.()}catch(e){finish(e instanceof Error?e:Error(String(e)))}
   })
  },
  cancel(){cancelActive?.('Query cancelled')},
  dispose(){if(disposed)return;disposed=true;cancelActive?.('Query service disposed');offState()},
 }
}
