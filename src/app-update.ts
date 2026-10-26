export interface AppVersion {format:'ai2-studio-version';version:1;build:string;assets:readonly {url:string;integrity:string}[]}
export interface UpdateState {phase:'idle'|'checking'|'preparing'|'waiting'|'reloading'|'error';build:string|null;message:string}
export function parseAppVersion(raw:unknown):AppVersion{
 const v=raw as AppVersion
 if(!v||v.format!=='ai2-studio-version'||v.version!==1||!/^([a-f0-9]{24})$/.test(v.build)||!Array.isArray(v.assets)||!v.assets.length||v.assets.length>512||!v.assets.some(a=>a.url==='index.html'))throw Error('Version invalide')
 const ids=new Set<string>();for(const a of v.assets){if(!a||!/^[-a-zA-Z0-9_./]+$/.test(a.url)||a.url.startsWith('/')||a.url.split('/').some((x:string)=>!x||x==='.'||x==='..')||!/^sha256-[A-Za-z0-9+/]{43}=$/.test(a.integrity)||ids.has(a.url))throw Error('Inventaire de version invalide');ids.add(a.url)}
 return v
}
export async function verifyAppVersion(version:AppVersion,base:URL,request:typeof fetch=fetch){
 for(let i=0;i<version.assets.length;i+=6)await Promise.all(version.assets.slice(i,i+6).map(async asset=>{
  const response=await request((()=>{const url=new URL(asset.url,base);url.searchParams.set('__update',version.build);return url})(),{cache:'reload',credentials:'same-origin',integrity:asset.integrity});if(!response.ok)throw Error('Déploiement incomplet')
  const bytes=await response.arrayBuffer(),digest=await crypto.subtle.digest('SHA-256',bytes),actual='sha256-'+btoa(String.fromCharCode(...new Uint8Array(digest)))
  if(actual!==asset.integrity)throw Error('Fichier de version incomplet')
  if(asset.url==='index.html'&&!new TextDecoder().decode(bytes).includes('<meta name="ai2-build" content="'+version.build+'">'))throw Error('Déploiement en cours')
 }))
}
export function createAppUpdater(options:{current:string;load:()=>Promise<AppVersion>;verify:(v:AppVersion)=>Promise<void>;safe:(build:string)=>Promise<boolean>;activate:(v:AppVersion)=>Promise<boolean>;needsActivation?:(v:AppVersion)=>Promise<boolean>;reload:(build:string)=>void}){
 let state:UpdateState={phase:'idle',build:null,message:''},busy=false,stopped=false,reloading=false,candidate:AppVersion|undefined,verified='';const listeners=new Set<()=>void>(),publish=(patch:Partial<UpdateState>)=>{state={...state,...patch};for(const fn of listeners)fn()}
 return {getSnapshot:()=>state,subscribe(fn:()=>void){listeners.add(fn);return()=>{listeners.delete(fn)}},stop(){stopped=true;listeners.clear()},async check(refresh=true){
  if(busy||stopped||reloading)return;busy=true
  try{
   const target=!refresh&&candidate?candidate:parseAppVersion(await options.load());candidate=target
   if(stopped)return
   if(target.build===options.current&&!await options.needsActivation?.(target)){publish({phase:'idle',build:null,message:''});return}
   publish({phase:'preparing',build:target.build,message:'Nouvelle version · préparation…'})
   if(verified!==target.build){await options.verify(target);verified=target.build}
   if(stopped)return
   publish({phase:'waiting',message:'Mise à jour prête · attente de la fin de l’édition…'})
   if(!await options.safe(target.build)||stopped)return
   if(!await options.activate(target)||stopped)return
   if(!await options.safe(target.build)||stopped)return
   if(target.build===options.current){publish({phase:'idle',build:null,message:''});return}
   reloading=true;publish({phase:'reloading',message:'Brouillons sauvegardés · mise à jour…'});options.reload(target.build)
  }catch{if(!stopped)publish({phase:'error',message:'Mise à jour différée · nouvel essai automatique'})}finally{busy=false}
 }}
}
