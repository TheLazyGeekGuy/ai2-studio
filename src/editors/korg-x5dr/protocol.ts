import {decodeDeviceData} from './device-data'
import {effectPairError} from './fx-rules'
import {decodeCombination,acceptsCombiParameter} from './combination'
import {parameters,parameterValue,withParameter,fieldLiveValue,decodeProgram,type X5State,type Parameter} from './model'
const integer=(n:number,a:number,b:number)=>Number.isInteger(n)&&n>=a&&n<=b
const channel=(n:number)=>{if(!integer(n,1,16))throw Error('Invalid MIDI channel');return n}
export const header=(ch:number)=>[240,66,47+channel(ch),54]
export const identityRequest=(ch?:number)=>[240,126,ch===undefined?127:channel(ch)-1,6,1,247]
export const modeRequest=(ch:number)=>[...header(ch),18,247]
export const combinationRequest=(ch:number)=>[...header(ch),25,247]
export const modeChange=(ch:number,mode:number)=>{if(!integer(mode,0,4))throw Error('Unsupported X5DR mode');return [...header(ch),78,mode,0,247]}
export const programRequest=(ch:number)=>[...header(ch),16,247]
export const programEditMode=(ch:number)=>[...header(ch),78,3,0,247]
export function familyMessage(b:readonly number[],ch:number){return b.length>=6&&b[0]===240&&b[1]===66&&b[2]===47+ch&&b[3]===54&&b.at(-1)===247&&b.slice(1,-1).every(v=>integer(v,0,127))}
export function acceptsQuery(b:readonly number[]){
 if(b.length===7&&b[5]===0&&[6,13,14,15,28,29,51].includes(b[4])&&integer(b[2],48,63)&&familyMessage(b,b[2]-47))return true
 if(b.length!==6)return false
 if(b[0]===240&&b[1]===126&&(integer(b[2],0,15)||b[2]===127)&&b[3]===6&&b[4]===1&&b[5]===247)return true
 return integer(b[2],48,63)&&familyMessage(b,b[2]-47)&&[16,18,25].includes(b[4])
}
export function decodeIdentity(b:readonly number[],ch?:number):{model:'X5DR';revision:string;channel:number}|null{
 if(b.length!==15||b[0]!==240||b[1]!==126||!integer(b[2],0,15)||(ch!==undefined&&b[2]!==ch-1)||b[3]!==6||b[4]!==2||b[5]!==66||b[6]!==54||b[7]!==0||b[8]!==20||b[9]!==0||b[14]!==247||b.slice(1,-1).some(v=>!integer(v,0,127)))return null
 return {model:'X5DR',channel:b[2]+1,revision:[...b.slice(10,14)].join('.')}
}
export function decodeMode(b:readonly number[],ch:number):number|null{return familyMessage(b,ch)&&b.length===10&&b[4]===66&&integer(b[5],0,5)&&b[6]===0&&b[7]===0&&b[8]===4?b[5]:null}
export function acknowledgement(b:readonly number[],ch:number):boolean|null{
 if(!familyMessage(b,ch)||b.length!==6||![33,34,35,36,38].includes(b[4]))return null
 if(b[4]===33||b[4]===34)return null // Persistent STORE ACK is never used by this module.
 return b[4]===35
}
export function parameterMessage(ch:number,address:number,value:number):number[]{
 if(!integer(address,0,187)||!integer(value,-8192,8191))throw Error('Invalid parameter packet')
 const encoded=value&16383
 return [...header(ch),65,address&127,address>>7,encoded&127,encoded>>7,247]
}
export function decodeParameter(b:readonly number[],ch:number):{address:number;value:number}|null {
 if(b.length!==10||!familyMessage(b,ch)||b[4]!==65)return null
 const address=b[5]|b[6]<<7,v=b[7]|b[8]<<7
 return {address,value:v&8192?v-16384:v}
}
export function liveValueFor(s:X5State,p:Parameter){return fieldLiveValue(s,p)}
export function acceptsEditBuffer(b:readonly number[]):boolean {
 if(!integer(b[2],48,63)||!familyMessage(b,b[2]-47))return false
 if(b.length===8&&b[4]===78&&integer(b[5],0,4)&&b[6]===0)return true
 if(b.length===162){try{const {data}=decodeCombination(b);return !effectPairError(data[11]&127,data[12]&127)}catch{return false}}
 if((b.length===244&&b[4]===104)||(b.length===41&&b[4]===85)){try{const image=decodeDeviceData(b);return image.kind==='multi'||image.kind==='multi-effects'&&!effectPairError(image.data[0]&127,image.data[1]&127)}catch{return false}}
 if(b.length===194){try{const {data}=decodeProgram(b);return !effectPairError(data[135]&127,data[136]&127)}catch{return false}}
 const p=decodeParameter(b,b[2]-47);if(!p)return false
 return acceptsCombiParameter(p.address,p.value)||parameters.some(d=>d.live===p.address&&(d.id>=2000?[-1,0,1].includes(p.value):integer(p.value,d.min,d.max)))
}
export function applyParameter(s:X5State,address:number,value:number):X5State|null {
 const matches=parameters.filter(p=>p.live===address);if(!matches.length)return null
 let next=s
 try{for(const p of matches){const v=p.id>=2000?(p.shift!>=4?Number(value<0):Number(value!==0)):value;next=withParameter(next,p.id,v)}}catch{return null}
 return next
}
export function programReply(b:readonly number[],ch:number){if(!familyMessage(b,ch)||b[4]!==64)return null;try{return decodeProgram(b)}catch{return null}}

export function combinationReply(b:readonly number[],ch:number){if(!familyMessage(b,ch)||b[4]!==73)return null;try{return decodeCombination(b)}catch{return null}}
export function decodeModeChange(b:readonly number[],ch:number){return familyMessage(b,ch)&&b.length===8&&b[4]===78&&integer(b[5],0,5)&&b[6]===0?b[5]:null}
/** OM E1 pp.163–164. Exact channel-voice selector, not an arbitrary CC sender. */
export function acceptsPatchSelection(b:readonly number[]){if(!integer(b[0],176,207)||b.some(v=>!Number.isInteger(v)))return false;const type=b[0]&240;return type===192?b.length===2&&integer(b[1],0,127):type===176&&b.length===3&&((b[1]===0&&[0,56,62].includes(b[2]))||(b[1]===32&&b[2]===0))}
export function patchSelectionMessages(ch:number,kind:'program'|'combi',bank:'A'|'G',index:number):number[][] {channel(ch);if(!integer(index,0,kind==='combi'||bank==='A'?99:135))throw Error('Invalid patch number');const n=ch-1;if(kind==='combi')return [[192+n,index]];const drums=[0,16,25,32,40,64,24,48],drum=bank==='G'&&index>=128;return [[176+n,0,bank==='A'?0:drum?62:56],[176+n,32,0],[192+n,drum?drums[index-128]:index]]}

/** Incoming front-panel/keyboard Program Changes, OM E1 p.164 receive map. */
export function decodePatchSelection(bytes:readonly number[],ch:number,kind:'program'|'combi',bankMsb:number|null):{bank:'A'|'G';index:number}|null {if(bytes.length!==2||bytes[0]!==191+ch||!integer(bytes[1],0,127))return null;const n=bytes[1];if(kind==='combi')return {bank:'A',index:n%100};if(bankMsb===0)return {bank:'A',index:n%100};if(bankMsb===56||bankMsb===57)return {bank:'G',index:n};if(bankMsb===62){const kit=n<16?0:n<24?1:n===24?6:n===25?2:n<32?6:n<40?3:n<48?4:n<56?7:n<64?0:n<72?5:0;return {bank:'G',index:128+kit}}return null}

export const bankRequest=(ch:number,kind:'program'|'combi')=>[...header(ch),kind==='program'?28:29,0,247]
