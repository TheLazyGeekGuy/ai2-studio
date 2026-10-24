import {validateWorkspace,type Ai2Workspace} from './workspace'
/** Per-instance family snapshot repository. Shared browser storage, no globals or MIDI; transaction checks stale tabs. */
export function openAi2BrowserState(id:string,factory=globalThis.indexedDB):Promise<{load:()=>Promise<Ai2Workspace|null>;save:(state:Ai2Workspace)=>Promise<void>;close:()=>void}>{
 return new Promise((resolve,reject)=>{
  if(!factory){reject(Error('IndexedDB unavailable'));return}const request=factory.open('midi-studio.ai2-workspaces.v1',1);let abandoned=false
  request.onupgradeneeded=()=>request.result.createObjectStore('snapshots')
  request.onerror=()=>reject(request.error);request.onblocked=()=>{abandoned=true;reject(Error('AI² storage blocked'))}
  request.onsuccess=()=>{const db=request.result;if(abandoned){db.close();return}let revision:number|undefined,pending=Promise.resolve(),closing=false
   db.onversionchange=()=>db.close()
   resolve({
    load:()=>new Promise((ok,no)=>{const tx=db.transaction('snapshots','readonly'),read=tx.objectStore('snapshots').get(id);tx.oncomplete=()=>{try{const row=read.result;if(row){if(!Number.isSafeInteger(row.revision)||row.revision<1)throw Error('Invalid AI² stored revision');const state=validateWorkspace(row.state);revision=row.revision;ok(state)}else{revision=0;ok(null)}}catch(e){no(e)}};tx.onabort=()=>no(tx.error)}),
    save(state){if(closing||revision===undefined)return Promise.reject(Error('Read AI² state successfully before saving'));const valid=validateWorkspace(state),write=()=>new Promise<void>((ok,no)=>{const tx=db.transaction('snapshots','readwrite'),store=tx.objectStore('snapshots'),read=store.get(id);let error:unknown,next=revision!+1;read.onsuccess=()=>{try{if((read.result?.revision??0)!==revision)throw Error('État modifié dans un autre onglet : exporter ce brouillon avant de recharger');store.put({revision:next,state:valid},id)}catch(e){error=e;tx.abort()}};tx.oncomplete=()=>{revision=next;ok()};tx.onabort=()=>no(error??tx.error)});const result=pending.then(write);pending=result.catch(()=>{});return result},
    close(){closing=true;void pending.finally(()=>db.close())},
   })
  }
 })
}
