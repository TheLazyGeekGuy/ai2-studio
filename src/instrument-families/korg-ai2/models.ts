import definitions from './data/models.json'
import type {ProtocolFamily} from './protocol-profiles'
export {protocols,type ProtocolFamily} from './protocol-profiles'
export interface Ai2Model {id:string;protocol:ProtocolFamily;rom:string;multisamples:number;drums:number;status:string;sources:string;note:string;keys:number}
export const ai2Models:readonly Ai2Model[]=Object.freeze(definitions.map(m=>Object.freeze({...m,protocol:m.protocol as ProtocolFamily})))
export function ai2Model(id:string):Ai2Model {const m=ai2Models.find(m=>m.id===id);if(!m)throw Error('Modèle AI² inconnu : '+id);return m}
export interface ResourceCandidate {target_index:number;relation:string;reason?:string;rule_id?:string;alternatives?:number}
export type ResourceRules=Readonly<Record<string,ResourceCandidate>>
export interface Resources {multi:readonly string[];drum:readonly string[]}

