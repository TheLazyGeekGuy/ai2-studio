import type {LibrarySource} from './storage'
export interface LibraryOccurrence {id:string;sourceId:string;name:string;path:string;importedAt:string}
export const occurrenceLimit=10000
export function relativeLibraryPath(value:string){
 if(!value||value.length>1024||/[\u0000-\u001f\u007f\\]/.test(value)||value.startsWith('/')||/^[a-z]:/i.test(value)||value.split('/').some(p=>!p||p==='.'||p==='..'))throw Error('Invalid library relative path')
 return value
}
export const occurrenceName=(name:string)=>name.replace(/[\\/]/g,'_').replace(/^\.{1,2}$/,'library.bin')
export function legacyOccurrence(source:LibrarySource):LibraryOccurrence{let hash=2166136261;for(const c of source.name)hash=Math.imul(hash^c.charCodeAt(0),16777619);const suffix=source.importedAt.replace(/[^0-9]/g,'')+'-'+(hash>>>0).toString(16).padStart(8,'0');return {id:'legacy-'+source.id+'-'+suffix,sourceId:source.id,name:occurrenceName(source.name),path:occurrenceName(source.name),importedAt:source.importedAt}}
export function validateOccurrences(value:unknown,sources:readonly LibrarySource[]):LibraryOccurrence[]{
 if(!Array.isArray(value)||value.length>occurrenceLimit)throw Error('Library occurrence limit')
 const known=new Set(sources.map(s=>s.id)),ids=new Set<string>()
 for(const o of value){if(!o||typeof o!=='object'||Object.keys(o).sort().join(',')!=='id,importedAt,name,path,sourceId'||typeof o.id!=='string'||!/^[a-zA-Z0-9_-]{1,100}$/.test(o.id)||ids.has(o.id)||!known.has(o.sourceId)||typeof o.name!=='string'||!o.name.trim()||o.name.length>255||/[\u0000-\u001f\u007f/\\]/.test(o.name)||typeof o.path!=='string'||typeof o.importedAt!=='string'||!Number.isFinite(Date.parse(o.importedAt))||new Date(o.importedAt).toISOString()!==o.importedAt)throw Error('Invalid library occurrence');relativeLibraryPath(o.path);ids.add(o.id)}
 return structuredClone(value)
}
export function mergeOccurrences(existing:readonly LibraryOccurrence[],incoming:readonly LibraryOccurrence[],sources:readonly LibrarySource[]){
 const byId=new Map(existing.map(o=>[o.id,o]));for(const o of incoming){const old=byId.get(o.id);if(old&&(['sourceId','name','path','importedAt'] as const).some(key=>old[key]!==o[key]))throw Error('Conflicting library occurrence');byId.set(o.id,o)}return validateOccurrences([...byId.values()],sources)
}
