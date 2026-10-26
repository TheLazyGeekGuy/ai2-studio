import React,{StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {StandaloneEditorApp} from '../../src/editor-host/StandaloneEditorApp'
import {x5drModule} from '../../src/editors/korg-x5dr/module'
import {x5drView} from '../../src/editors/korg-x5dr/registration'
import {startAppUpdates,getAppUpdate} from '../../src/app-update-client'
import {AppUpdateStatus} from '../../src/AppUpdateStatus'
import '../../src/styles.css'
declare const __PROOF_RUN__:string
const base=new URL('./',location.href),kind=base.pathname.includes('worker')?'worker':'local',id='update-proof-'+__PROOF_RUN__+'-'+kind,edition=document.querySelector<HTMLMetaElement>('meta[name=proof-edition]')!.content,build=document.querySelector<HTMLMetaElement>('meta[name=ai2-build]')!.content
Object.defineProperty(navigator,'requestMIDIAccess',{value:()=>{throw Error('Physical MIDI forbidden')}})
if(edition==='A')localStorage.setItem('bcr-studio.last-instance.'+x5drModule.manifest.modelId,id);localStorage.setItem('midi-studio:ai2:selected:'+id,'X5DR')
const name=kind==='worker'?'KEEPWORKER':'KEEPLOCAL',sentinel='bank-original-'+kind,db=await new Promise<IDBDatabase>((resolve,reject)=>{const r=indexedDB.open('ai2-update-proof-'+__PROOF_RUN__,1);r.onupgradeneeded=()=>r.result.createObjectStore('banks');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})
if(edition==='A')await new Promise<void>((resolve,reject)=>{const t=db.transaction('banks','readwrite');t.objectStore('banks').put(sentinel,kind);t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error)})
if(kind==='worker'){await navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname,updateViaCache:'none'});await navigator.serviceWorker.ready;if(!navigator.serviceWorker.controller)await new Promise<void>(resolve=>navigator.serviceWorker.addEventListener('controllerchange',()=>resolve(),{once:true}))}
const installation={module:x5drModule,view:x5drView};createRoot(document.getElementById('root')!).render(<StrictMode><StandaloneEditorApp installation={installation} automaticMidi={false} tools={<AppUpdateStatus/>}/></StrictMode>);startAppUpdates(base,true)
const frame=()=>new Promise<void>(r=>requestAnimationFrame(()=>r())),until=performance.now()+20000;let field:HTMLInputElement|null=null
while(performance.now()<until){field=document.querySelector<HTMLInputElement>('.x5-current-patch label input');if(field)break;await frame()}
let pass=false,error='';try{if(!field)throw Error('Program name missing');if(edition==='A'){/* Enter EDIT and edit the name through native browser UI before switching the test deployment. */}else if(field.value!==name)throw Error('Edited Program lost after automatic reload: '+field.value)
 const original=await new Promise<unknown>((resolve,reject)=>{const r=db.transaction('banks').objectStore('banks').get(kind);r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)});if(original!==sentinel)throw Error('Library original lost');pass=true}catch(e){error=String(e)}
db.close();const report={time:new Date().toISOString(),kind,edition,build,pass:edition==='A'?null:pass,ready:true,error,name:field?.value,expectedName:name,controlled:!!navigator.serviceWorker.controller,phase:getAppUpdate().phase,hardware:false};document.title='AI2 update proof '+kind+' '+edition;document.getElementById('proof-result')!.textContent=JSON.stringify(report);await fetch('/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)})
