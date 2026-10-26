import {deviceObjectStoreRequest,deviceObjectBankProfile,deviceObjectProfile,decodeDeviceObject,type Ai2ObjectKind} from './device-objects'
import {ai2Definition} from './definition'
import {decodeFrame,encodeProgram,type Ai2Program} from './codec'
import {combinationCodec,decodeAi2Combination,encodeAi2Combination,isAi2Combination,type Ai2Combination} from './combination'
export type Ai2PatchKind='program'|'combination'
export type Ai2Patch=Ai2Program|Ai2Combination
export function hardwareProfile(model:string){
 const d=ai2Definition(model),modern=d.protocol.checksum
 return Object.freeze({model,id:d.protocol.id,modern,programMode:modern?d.model.protocol==='N5'?6:2:3,combinationMode:modern?d.model.protocol==='N5'?5:3:1,modeRequest:modern?16:18,modeReply:modern?0:66,modeChange:modern?0:78,programRequest:modern?33:16,combinationRequest:modern?34:25,programBankRequest:modern?38:28,combinationBankRequest:modern?39:29})
}
const channel=(n:number)=>{if(!Number.isInteger(n)||n<1||n>16)throw Error('Canal MIDI invalide');return n}
export const hardwareHeader=(model:string,ch:number)=>[240,66,47+channel(ch),hardwareProfile(model).id]
export function isHardwareFrame(model:string,ch:number,b:readonly number[]){return b.length>=6&&b[0]===240&&b[1]===66&&b[2]===47+ch&&b[3]===hardwareProfile(model).id&&b.at(-1)===247&&b.slice(1,-1).every(v=>Number.isInteger(v)&&v>=0&&v<128)}
export function hardwareRequest(model:string,ch:number,kind:'mode'|Ai2PatchKind|'program-bank'|'combination-bank'){
 const p=hardwareProfile(model),op=kind==='mode'?p.modeRequest:kind==='program'?p.programRequest:kind==='combination'?p.combinationRequest:kind==='program-bank'?p.programBankRequest:p.combinationBankRequest
 return [...hardwareHeader(model,ch),op,...(!p.modern&&kind.endsWith('-bank')?[0]:[]),247]
}
export function hardwareModeChange(model:string,ch:number,kind:Ai2PatchKind,edit=true){const p=hardwareProfile(model);return [...hardwareHeader(model,ch),p.modeChange,edit?(kind==='program'?p.programMode:p.combinationMode):(kind==='program'?2:0),...(p.modern?[]:[0]),247]}
export function hardwareMode(model:string,ch:number,b:readonly number[]){const p=hardwareProfile(model);return isHardwareFrame(model,ch,b)&&b[4]===p.modeReply&&(p.modern?b.length===7:b.length===10)&&(p.id===48?(b[5]&~16)<=5:b[5]<=8)?(p.id===48?b[5]&15:b[5]):null}
export function hardwareAck(model:string,ch:number,command:number,b:readonly number[]){
 if(!isHardwareFrame(model,ch,b))return null
 const p=hardwareProfile(model)
 if(p.modern)return b.length===8&&b[4]===14&&b[6]===command?b[5]===0:null
 return b.length===6&&[35,36,38].includes(b[4])?b[4]===35:null
}
export function decodeHardwarePatch(model:string,ch:number,kind:Ai2PatchKind,b:readonly number[]):Ai2Patch|null{
 if(!isHardwareFrame(model,ch,b))return null
 const op=kind==='program'?ai2Definition(model).protocol.buffer:combinationCodec(model).definition.functionId
 if(b[4]!==op)return null
 try{return kind==='program'?decodeFrame(b,model)[0]:decodeAi2Combination(b,model)[0]}catch{return null}
}
export const encodeHardwarePatch=(p:Ai2Patch)=>isAi2Combination(p)?encodeAi2Combination(p):encodeProgram(p)
/** Whitelists are bound to one selected model; banks, STORE, Global and arbitrary parameter frames are never writable. */
export function acceptsHardwareQuery(model:string,b:readonly number[]){const ch=b[2]-47;if(ch<1||ch>16)return false;if(hardwareProfile(model).modern&&isHardwareFrame(model,ch,b)&&b.length===6&&[31,40,41,42].includes(b[4]))return true;if(isHardwareFrame(model,ch,b)&&(['effects','multi','multi-effects','global','drums'] as Ai2ObjectKind[]).some(k=>{const p=deviceObjectProfile(model,k);return p&&b.length===(hardwareProfile(model).modern?6:7)&&b[4]===p.request&&(hardwareProfile(model).modern||b[5]===0)}))return true;return (['mode','program','combination','program-bank','combination-bank'] as const).some(k=>hardwareRequest(model,ch,k).join(',')===b.join(','))}
export function acceptsHardwareWrite(model:string,b:readonly number[]){
 const ch=b[2]-47;if(ch<1||ch>16)return false
 if(hardwareProfile(model).modern&&isHardwareFrame(model,ch,b)){if(hardwareProfile(model).id===66&&b.length===10&&b[4]===8&&b[5]===0&&b[6]===0&&b[7]<32&&b[8]===0)return true;if(b[4]===18&&b[5]===1&&b[6]<(hardwareProfile(model).id===76?16:32)&&((b.length===12&&b[7]===0)||(b.length===10&&b[7]===10&&b[8]<=5)))return true}
 if(hardwareProfile(model).id===76&&isHardwareFrame(model,ch,b)&&b.length===8&&b[4]===126&&[4,7].includes(b[5])&&[0,1].includes(b[6]))return true
 if((['program','combination'] as const).some(k=>hardwareModeChange(model,ch,k).join(',')===b.join(',')||!hardwareProfile(model).modern&&hardwareModeChange(model,ch,k,false).join(',')===b.join(',')))return true
 if(!hardwareProfile(model).modern&&isHardwareFrame(model,ch,b)){if(b.length===8&&b[4]===78&&b[5]===(hardwareProfile(model).id===43?6:4)&&b[6]===0)return true;for(const kind of ['multi','multi-effects','drums'] as const){const p=deviceObjectProfile(model,kind);if(p&&!p.settings)try{decodeDeviceObject(model,kind,b);return true}catch{}}}
 if(hardwareProfile(model).modern&&isHardwareFrame(model,ch,b)){if(b.length===7&&b[4]===0&&[1,...(hardwareProfile(model).id===0x4c?[3]:[]),hardwareProfile(model).id===0x4c?8:5,hardwareProfile(model).id===0x4c?7:4].includes(b[5]))return true;for(const k of ['effects','multi','drums'] as const){try{if(decodeDeviceObject(model,k,b))return true}catch{}}}return (['program','combination'] as const).some(k=>!!decodeHardwarePatch(model,ch,k,b))
}
export function acceptsHardwareSelection(b:readonly number[]){return b.length===2&&b[0]>=192&&b[0]<=207&&Number.isInteger(b[1])&&b[1]>=0&&b[1]<128||b.length===3&&b[0]>=176&&b[0]<=191&&[0,7,10,11,32,91,93].includes(b[1])&&Number.isInteger(b[2])&&b[2]>=0&&b[2]<128}

export function acceptsHardwareSettings(model:string,b:readonly number[]){if(!isHardwareFrame(model,b[2]-47,b))return false;for(const kind of ['global','drums'] as const){const p=deviceObjectProfile(model,kind);if(p?.settings)try{decodeDeviceObject(model,kind,b);return true}catch{}}return false}

/** Explicit persistent save; separate from every temporary-edit and settings permission. Internal user banks only. */
export function hardwareStoreRequest(model:string,ch:number,kind:Ai2PatchKind,slot:number,bank=0){const p=hardwareProfile(model),banks=p.modern?1:ai2Definition(model).protocol.maxPrograms/100,limit=p.modern?ai2Definition(model).protocol.maxPrograms:100;if(!Number.isInteger(slot)||slot<0||slot>=limit||!Number.isInteger(bank)||bank<0||bank>=banks)throw Error('Destination mémoire utilisateur invalide');return [...hardwareHeader(model,ch),p.modern?kind==='program'?65:66:kind==='program'?17:26,...(p.modern?[]:[bank]),slot,247]}
export function acceptsHardwareStore(model:string,b:readonly number[]){const p=hardwareProfile(model),ch=b[2]-47;if(!isHardwareFrame(model,ch,b)||b.length!==(p.modern?7:8))return false;for(const kind of ['program','combination'] as const)try{if(hardwareStoreRequest(model,ch,kind,b[p.modern?5:6],p.modern?0:b[5]).join(',')===b.join(','))return true}catch{}if(p.modern)for(const kind of ['drums','effects','multi'] as const)for(const bank of ['program','combination'] as const)try{if(deviceObjectBankProfile(model,kind,bank)&&deviceObjectStoreRequest(model,ch,kind,b[5],bank).join(',')===b.join(','))return true}catch{}return false}

export function hardwareStoreAck(model:string,ch:number,command:number,b:readonly number[]){if(hardwareProfile(model).modern)return hardwareAck(model,ch,command,b);return isHardwareFrame(model,ch,b)&&b.length===6&&[33,34].includes(b[4])?b[4]===33:null}
