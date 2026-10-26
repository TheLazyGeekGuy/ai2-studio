import {createAppUpdater,parseAppVersion,verifyAppVersion,type AppVersion,type UpdateState} from './app-update'
import {checkpointForUpdate} from './update-safety'
const idle:UpdateState={phase:'idle',build:null,message:''},listeners=new Set<()=>void>();let updater:ReturnType<typeof createAppUpdater>|undefined
export const getAppUpdate=()=>updater?.getSnapshot()??idle
export const subscribeAppUpdate=(fn:()=>void)=>{listeners.add(fn);return()=>{listeners.delete(fn)}}
export const retryAppUpdate=()=>void updater?.check()
function workerMessage(worker:ServiceWorker,message:unknown){return new Promise<any>((resolve,reject)=>{const channel=new MessageChannel(),timer=setTimeout(()=>{channel.port1.close();reject(Error('Worker update timeout'))},12000);channel.port1.onmessage=event=>{clearTimeout(timer);channel.port1.close();resolve(event.data)};try{worker.postMessage(message,[channel.port2])}catch(e){clearTimeout(timer);channel.port1.close();channel.port2.close();reject(e)}})}
/** Production only, including local preview; development keeps Vite's hot reload. */
export function startAppUpdates(base:URL,enabled:boolean){
 if(!enabled||updater)return
 const current=document.querySelector<HTMLMetaElement>('meta[name="ai2-build"]')?.content;if(!current||!/^[a-f0-9]{24}$/.test(current))return
 let lastInput=Date.now();const input=()=>{lastInput=Date.now()},scope=base.href,local=['localhost','127.0.0.1','[::1]'].includes(base.hostname),registration=async()=>{if(!('serviceWorker'in navigator))return;const reg=await navigator.serviceWorker.getRegistration(scope);return reg?.scope===scope?reg:undefined}
 const request:typeof fetch=(url,options)=>fetch(url,{...options,signal:AbortSignal.timeout(20000)})
 const ack=()=>navigator.serviceWorker?.controller?.postMessage({type:'BUILD_ACTIVE',build:current})
 const activate=async(target:AppVersion)=>{
  if(!('serviceWorker'in navigator)||local&&!navigator.serviceWorker.controller)return true
  let reg=await registration();if(!reg){reg=await navigator.serviceWorker.register(new URL('sw.js',base),{scope:base.pathname,updateViaCache:'none'});return false}
  if(reg.waiting){const status=await workerMessage(reg.waiting,{type:'PREPARE',used:[...new Set([...target.assets.map(a=>new URL(a.url,base).href),...performance.getEntriesByType('resource').map(e=>e.name).filter(url=>url.startsWith(base.href))])].slice(0,512)});if(!status.ready||status.build!==target.build){await reg.update();return false}const reply=await workerMessage(reg.waiting,{type:'ACTIVATE_UPDATE',build:target.build});if(reply.type!=='UPDATE_ACTIVATING'||reply.build!==target.build)return false;return new Promise<boolean>(resolve=>{let done=false;const finish=(ok:boolean)=>{if(done)return;done=true;clearTimeout(timer);navigator.serviceWorker.removeEventListener('controllerchange',check);resolve(ok)},check=()=>{const controller=navigator.serviceWorker.controller;if(controller)void workerMessage(controller,{type:'STATUS'}).then(s=>{if(s.build===target.build&&s.ready)finish(true)}).catch(()=>{})},timer=setTimeout(()=>finish(false),15000);navigator.serviceWorker.addEventListener('controllerchange',check);check()})}
  if(reg.active){const status=await workerMessage(reg.active,{type:'STATUS'});if(status.build===target.build&&status.ready)return true}
  await reg.update();return false
 }
 updater=createAppUpdater({current,load:async()=>{const url=new URL('app-version.json',base);url.searchParams.set('t',String(Date.now()));const r=await request(url,{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw Error('Version unavailable');return parseAppVersion(await r.json())},verify:async target=>{try{const recent=JSON.parse(sessionStorage.getItem('ai2:update-attempt:'+scope)??'null');if(recent?.build===target.build&&Date.now()-recent.at<60000)throw Error('Reload deferred')}catch(e){if(e instanceof Error&&e.message==='Reload deferred')throw e}await verifyAppVersion(target,base,request)},safe:async build=>{
  const field=document.activeElement,typing=field instanceof HTMLTextAreaElement||field instanceof HTMLInputElement&&!['checkbox','radio','range','button','submit','file'].includes(field.type)
  if(Date.now()-lastInput<2000||typing||document.querySelector('dialog[open],[role=dialog][aria-modal=true]'))return false
  return checkpointForUpdate(build)
 },activate,needsActivation:async()=>!!(await registration())?.waiting,reload:build=>{sessionStorage.setItem('ai2:update-attempt:'+scope,JSON.stringify({build,at:Date.now()}));const url=new URL(location.href);url.searchParams.set('__build',build);location.replace(url.href)}})
 updater.subscribe(()=>{for(const fn of listeners)fn()})
 for(const event of ['input','keydown','pointerdown','pointerup'])window.addEventListener(event,input,{passive:true})
 let lastCheck=Date.now();window.setInterval(()=>{const full=Date.now()-lastCheck>=30000;if(full){lastCheck=Date.now();void updater?.check()}else if(updater?.getSnapshot().phase==='waiting')void updater.check(false)},2000)
 const check=()=>{if(document.visibilityState==='visible')void updater?.check()}
 window.addEventListener('online',check);window.addEventListener('focus',check);document.addEventListener('visibilitychange',check)
 navigator.serviceWorker?.addEventListener('controllerchange',()=>{ack();void updater?.check()});ack();void updater.check()
}
