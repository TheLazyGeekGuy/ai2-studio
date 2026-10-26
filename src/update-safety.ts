type UpdateGuard=(build:string)=>boolean|Promise<boolean>
const guards=new Set<UpdateGuard>()
export function registerUpdateGuard(guard:UpdateGuard){guards.add(guard);return()=>{guards.delete(guard)}}
export async function checkpointForUpdate(build:string){for(const guard of guards)if(!await guard(build))return false;return true}
export const updateSessionKey=(id:string)=>'midi-studio:update-session:v1:'+id

export function readUpdateSession(storage:Pick<Storage,'getItem'>,id:string,build:string|null,target:string|null):unknown{
 try{const raw=JSON.parse(storage.getItem(updateSessionKey(id))??'null');if(raw?.version===1&&/^[a-f0-9]{24}$/.test(build??'')&&raw.build===target&&/^[a-f0-9]{24}$/.test(raw.build))return raw.state}catch{}
 return undefined
}

const instanceKey=(module:string,scope:string)=>'midi-studio:update-instance:v1:'+module+':'+encodeURIComponent(scope)
export function rememberUpdateInstance(storage:Pick<Storage,'setItem'>,module:string,scope:string,id:string,build:string){storage.setItem(instanceKey(module,scope),JSON.stringify({id,build}))}
export function readUpdateInstance(storage:Pick<Storage,'getItem'>,module:string,scope:string,target:string|null){try{const v=JSON.parse(storage.getItem(instanceKey(module,scope))??'null');if(v?.build===target&&/^[a-f0-9]{24}$/.test(v.build)&&typeof v.id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v.id))return v.id as string}catch{}return undefined}
