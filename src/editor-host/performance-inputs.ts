import type {MidiAccess,MidiPort} from '../web-midi'
import {validVoiceMessage} from '../bcontrol-voice'
import type {MidiAuthorization,MidiBroker,MidiLease} from './midi-broker'

/** Optional performance inputs borrow their owner's value grant, never its SysEx path.
 * Construction is inert. Explicit start opens inputs and captures the current output generation.
 */
export function createPerformanceInputs({id,access,broker,lease}:{id:string;access:MidiAccess;broker:MidiBroker;lease:MidiLease}){
 let state={armed:false,opening:false,status:'Clavier et contrôleur non routés'},epoch=0,token:MidiAuthorization|undefined,route:ReturnType<MidiBroker['createRoutingClient']>|undefined,off:()=>void=()=>{},cancel:AbortController|undefined,disposed=false
 const listeners=new Set<()=>void>(),sustain=new Set<string>(),channels=new Set<number>()
 let noteSnapshot:readonly {channel:number;note:number;velocity:number}[]=Object.freeze([])
 const held=new Map<string,{channel:number;note:number;velocity:number}>(),noteListeners=new Set<()=>void>(),publishNotes=()=>{noteSnapshot=Object.freeze([...held.values()]);for(const fn of noteListeners)fn()},clearNotes=()=>{if(held.size){held.clear();publishNotes()}},noteActivity={getSnapshot:()=>noteSnapshot,subscribe(fn:()=>void){noteListeners.add(fn);return()=>{noteListeners.delete(fn)}}}
 const publish=(patch:Partial<typeof state>)=>{state={...state,...patch};for(const fn of listeners)fn()}
 const flush=(panic=false)=>{const messages:number[][]=[...held.values()].map(n=>[0x80|(n.channel-1),n.note,0]);for(const key of sustain){const [ch,cc]=key.split(':').map(Number);messages.push([0xb0|ch,cc,0])}if(panic)for(const ch of channels)messages.push([0xb0|ch,123,0]);sustain.clear();channels.clear();clearNotes();if(token)for(let i=0;i<messages.length;i+=512)lease.send(messages.slice(i,i+512),token)}
 const stop=(status='Routage arrêté')=>{epoch++;cancel?.abort();cancel=undefined;off();off=()=>{};const previous=route;route=undefined;previous?.close();try{flush()}catch{/* A stale grant must never send note-offs to a replacement destination. */}if(token)broker.revoke(token);token=undefined;publish({armed:false,opening:false,status})}
 async function open(port:MidiPort,signal:AbortSignal){await new Promise<void>((resolve,reject)=>{const done=(error?:unknown)=>{clearTimeout(timer);signal.removeEventListener('abort',abort);error?reject(error):resolve()},abort=()=>done(Error('Ouverture annulée')),timer=setTimeout(()=>done(Error('Entrée MIDI sans réponse après 5 secondes')),5000);signal.addEventListener('abort',abort,{once:true});Promise.resolve().then(()=>{if(signal.aborted)throw Error('Ouverture annulée');return port.open?.()}).then(()=>done(),done)})}
 return {
  notes:noteActivity,getSnapshot:()=>state,subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn)}},stop,
  panic(){try{flush(true);publish({status:state.armed?'Notes coupées · routage actif':'Notes coupées'})}catch(e){stop(String(e))}},
  async start(inputIds:readonly string[],channel:number|null){
   if(disposed)throw Error('Routage fermé');if(typeof broker.createRoutingClient!=='function')throw Error('Routage d’entrées supplémentaires indisponible sur cet hôte');stop();const run=epoch,link=lease.getState(),ids=[...inputIds]
   if(!link.connected||!link.binding)throw Error('Connecter la sortie de l’instrument avant le clavier')
   if(!ids.length||ids.length>2||new Set(ids).size!==ids.length||ids.includes(link.binding.inputId))throw Error('Choisir une ou deux entrées distinctes du retour de l’instrument')
   if(channel!==null&&(!Number.isInteger(channel)||channel<1||channel>16))throw Error('Canal MIDI invalide')
   const inputs=ids.map(inputId=>{const p=access.inputs.get(inputId);if(!p||p.state!=='connected')throw Error('Entrée MIDI indisponible');return p}),controller=new AbortController();cancel=controller
   publish({opening:true,status:'Ouverture du clavier / contrôleur…'})
   try{
    await Promise.all(inputs.map(p=>open(p,controller.signal)))
    if(run!==epoch||disposed||controller.signal.aborted||lease.getState().generation!==link.generation||inputs.some(p=>access.inputs.get(p.id)!==p||p.state!=='connected'||p.connection&&p.connection!=='open'))throw Error('Connexion MIDI modifiée pendant l’ouverture')
    token=broker.authorize(id,'value')
    route=broker.createRoutingClient(id+'-performance',message=>{if(route)stop(message)})
    off=lease.onState(()=>stop('Sortie modifiée · réactiver le clavier / contrôleur'))
    route.arm(ids,[],false,(inputId,bytes)=>{
     // Performance only: no Program Change, System Exclusive, clock or system commands.
     if(bytes.length>3||!validVoiceMessage(bytes)||(bytes[0]&0xf0)===0xc0)return
     const data=[...bytes];if(channel!==null)data[0]=(data[0]&0xf0)|(channel-1)
     try{
      lease.send([data],token!)
      const ch=data[0]&15,kind=data[0]&0xf0,key=ch+':'+data[1];channels.add(ch)
      const sourceKey=inputId+':'+(bytes[0]&15)+':'+key
      if(kind===0x90&&data[2]>0){held.set(sourceKey,{channel:ch+1,note:data[1],velocity:data[2]});publishNotes()}else if(kind===0x80||kind===0x90){if(held.delete(sourceKey))publishNotes()}
      if(kind===0xb0&&[120,123].includes(data[1])){for(const [key,n]of held)if(n.channel===ch+1)held.delete(key);publishNotes()}
      if(kind===0xb0&&[64,66,69].includes(data[1])){if(data[2]>=64)sustain.add(key);else sustain.delete(key)}
     }catch(e){stop(String(e))}
    })
    cancel=undefined;publish({armed:true,opening:false,status:'Clavier / contrôleur → sortie de l’instrument'})
   }catch(e){if(run===epoch)stop(String(e));throw e}
  },
  dispose(){if(disposed)return;stop();disposed=true;listeners.clear();noteListeners.clear()},
 }
}
