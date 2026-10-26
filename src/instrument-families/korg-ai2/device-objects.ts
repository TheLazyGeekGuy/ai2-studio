import {ai2Model,protocols} from './models'
import {createAi2DumpCodec} from './dump-codec'
export type Ai2ObjectKind='effects'|'multi'|'global'|'drums'|'multi-effects'
export interface Ai2DeviceObject {model:string;kind:Ai2ObjectKind;channel:number;data:readonly number[];original:readonly number[]}
export function deviceObjectProfile(model:string,kind:Ai2ObjectKind){
 const p=protocols[ai2Model(model).protocol],modern=p.checksum,n5=ai2Model(model).protocol==='N5'
 if(kind==='multi-effects')return modern?null:!['03RW','X5'].includes(ai2Model(model).protocol)?null:{request:6,reply:85,size:29,mode:null,writable:true,selector:true,settings:false}
 if(!modern&&kind==='multi'&&ai2Model(model).protocol==='X5')return {request:51,reply:104,size:208,mode:4,writable:true,selector:false,settings:false}
 if(modern)return {request:({effects:36,multi:37,global:32,drums:35})[kind],reply:({effects:52,multi:53,global:48,drums:51})[kind],size:({effects:38,multi:n5?1534:8566,global:n5?164:10,drums:1358})[kind],mode:kind==='effects'?(n5?8:5):kind==='multi'?1:kind==='drums'?(n5?7:4):null,writable:true,selector:false,settings:kind==='global'}
 if(kind==='multi'||kind==='effects')return null
 return {request:kind==='global'?14:13,reply:kind==='global'?81:82,size:kind==='global'?(['01W','03RW'].includes(ai2Model(model).protocol)?21:28):(['01W','X3'].includes(ai2Model(model).protocol)?1680:840),mode:null,writable:true,selector:kind!=='drums'||ai2Model(model).protocol!=='03RW',settings:kind==='global'||kind==='drums'}
}
export function deviceObjectCodec(model:string,kind:Ai2ObjectKind){const p=deviceObjectProfile(model,kind);if(!p)throw Error('Objet séparé non documenté dans ce profil');return createAi2DumpCodec({modelId:protocols[ai2Model(model).protocol].id,functionId:p.reply,recordSize:p.size,checksum:protocols[ai2Model(model).protocol].checksum,selector:p.selector?[0]:[],label:model+' '+kind})}
export function decodeDeviceObject(model:string,kind:Ai2ObjectKind,b:readonly number[]):Ai2DeviceObject{const p=deviceObjectCodec(model,kind).decode(b);return {model,kind,channel:p.channel,data:p.data,original:[...b]}}
export function encodeDeviceObject(p:Ai2DeviceObject){return deviceObjectCodec(p.model,p.kind).encode(p.channel,p.data)}

export function deviceObjectBankProfile(model:string,kind:Ai2ObjectKind,effectBank:'program'|'combination'='program'){
 const n5=ai2Model(model).protocol==='N5',modern=n5||ai2Model(model).protocol==='NS5R';if(!modern||!['drums','effects','multi'].includes(kind))return null;const size=deviceObjectProfile(model,kind)!.size,limit=kind==='drums'?2:kind==='effects'?n5?100:128:n5?32:4;return {request:kind==='drums'?40:kind==='effects'?41:42,reply:kind==='drums'?56:kind==='effects'?57:58,size,limit,count:kind==='effects'&&n5?200:limit,command:kind==='drums'?67:kind==='effects'?n5&&effectBank==='combination'?69:68:n5?70:69,base:kind==='effects'&&n5&&effectBank==='combination'?100:0}}
export function deviceObjectBankCodec(model:string,kind:Ai2ObjectKind){const p=deviceObjectBankProfile(model,kind);if(!p)throw Error('Banque d’objets absente');return createAi2DumpCodec({modelId:protocols[ai2Model(model).protocol].id,functionId:p.reply,recordSize:p.size,minRecords:p.count,maxRecords:p.count,checksum:true,label:model+' '+kind+' user bank'})}
export function deviceObjectStoreRequest(model:string,ch:number,kind:Ai2ObjectKind,slot:number,effectBank:'program'|'combination'='program'){const p=deviceObjectBankProfile(model,kind,effectBank);if(!p||!Number.isInteger(slot)||slot<0||slot>=p.limit||!Number.isInteger(ch)||ch<1||ch>16)throw Error('Destination d’objet invalide');return [240,66,47+ch,protocols[ai2Model(model).protocol].id,p.command,slot,247]}
