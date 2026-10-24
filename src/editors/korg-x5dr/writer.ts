import type {MidiLease,MidiAuthorization} from '../../editor-host/midi-broker'
import {acknowledgement} from './protocol'
/** One in-flight ACK at a time. Pending same-address edits coalesce; never retry a timed-out write. */
export function createBufferWriter(lease:MidiLease,options:{channel:()=>number;sent:(bytes:readonly number[])=>void;changed:()=>void;failed:(e:Error)=>void;now:()=>number}){
 type Job={key:string;bytes:readonly number[];grant:MidiAuthorization;guard:()=>void;time:number;resolve:()=>void;reject:(e:Error)=>void}
 let queue:Job[]=[],busy:Job|null=null,timer:ReturnType<typeof setTimeout>|undefined,pacing:ReturnType<typeof setTimeout>|undefined,closed=false
 const clear=()=>{clearTimeout(timer);clearTimeout(pacing);timer=pacing=undefined}
 const cancel=(reason='Writes cancelled')=>{clear();const jobs=[...(busy?[busy]:[]),...queue];busy=null;queue=[];for(const j of jobs)j.reject(Error(reason));options.changed()}
 const fail=(e:Error)=>{cancel(e.message);options.failed(e)}
 const pump=()=>{
  pacing=undefined;if(closed||busy||!queue.length)return
  const job=queue.shift()!;busy=job
  try{job.guard();if(options.now()-job.time>10000)throw Error('Edit queue expired');timer=setTimeout(()=>fail(Error('Edit ACK timed out; output disabled, no retry')),1500);lease.send([job.bytes],job.grant);options.sent(job.bytes);options.changed()}catch(e){fail(e instanceof Error?e:Error(String(e)))}
 }
 const off=lease.subscribe(packet=>{if(!busy||packet.generation!==lease.getState().generation)return;const ack=acknowledgement(packet.bytes,options.channel());if(ack===null)return;if(!ack){fail(Error('X5DR rejected edit (NAK / format error)'));return}clearTimeout(timer);timer=undefined;const done=busy;busy=null;done.resolve();options.changed();pacing=setTimeout(pump,20)})
 return {offer(key:string,bytes:readonly number[],grant:MidiAuthorization,guard:()=>void){
  if(closed)return Promise.reject(Error('Writer disposed'))
  if(grant.operation!=='edit-buffer')return Promise.reject(Error('Edit-buffer authorization required'))
  if(queue.length>=128&&!queue.some(j=>j.key===key))return Promise.reject(Error('Edit queue limit reached'))
  return new Promise<void>((resolve,reject)=>{const old=queue.findIndex(j=>j.key===key);if(old>=0){queue[old].resolve();queue.splice(old,1)}queue.push({key,bytes:[...bytes],grant,guard,time:options.now(),resolve,reject});options.changed();if(!busy&&pacing===undefined)pump()})
 },cancel,pending:()=>queue.length+(busy?1:0),dispose(){if(closed)return;closed=true;cancel('Writer disposed');off()}}
}
