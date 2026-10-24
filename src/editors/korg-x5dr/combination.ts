import {createAi2DumpCodec} from '../../instrument-families/korg-ai2/dump-codec'
import {protocols} from '../../instrument-families/korg-ai2/protocol-profiles'
import {readPackedField,writePackedField} from '../../instrument-families/packed-fields'
import {effectResolution,changedEffect,effectPairError,type EffectResolution} from './fx-rules'
/** X5DR OM E1 pp.166–171, tables 2/8 and notes 1/4/6/7/8/11. */
import {parameters,effectParameters,type Parameter,type X5State} from './model'
export interface CombinationState extends EffectResolution {format:'korg-x5dr-combination';version:1|2;channel:number;data:readonly number[];original:readonly number[]}
export interface CombiParameter extends Parameter {encoding?:'program'|'pan'|'send'|'channel'}
const combinationCodec=createAi2DumpCodec({modelId:protocols.X5.id,functionId:73,recordSize:136,label:'X5DR Combination (162 bytes, function 49h)'})
export function decodeCombination(b:readonly number[]):{channel:number;data:number[]} {const {channel,data}=combinationCodec.decode(b);return {channel,data}}
export function validateCombination(raw:unknown):CombinationState {const s=raw as CombinationState;if(!s||s.format!=='korg-x5dr-combination'||![1,2].includes(s.version)||s.version===1&&s.unresolvedEffects!==undefined||!Number.isInteger(s.channel)||s.channel<1||s.channel>16||!Array.isArray(s.data)||s.data.length!==136||s.data.some(v=>!Number.isInteger(v)||v<0||v>255)||!Array.isArray(s.original)||![0,162].includes(s.original.length)||s.original.some(v=>!Number.isInteger(v)||v<0||v>255))throw Error('Invalid X5DR Combination state');if(s.original.length)decodeCombination(s.original);return Object.freeze({format:s.format,version:s.version,channel:s.channel,data:Object.freeze([...s.data]),original:Object.freeze([...s.original]),...effectResolution(s)})}
export function initialCombination(channel=1):CombinationState {const data=Array(136).fill(0);[...'Init Combi'].forEach((c,i)=>data[i]=c.charCodeAt(0));for(let n=0;n<8;n++){const o=40+12*n;data[o+1]=n?0:100;data[o+4]=31;data[o+6]=127;data[o+8]=127;data[o+9]=1;data[o+10]=63;data[o+11]=n?16:0}return validateCombination({format:'korg-x5dr-combination',version:1,channel,data,original:[]})}
export function encodeCombination(s:CombinationState){const v=validateCombination(s);return combinationCodec.encode(v.channel,v.data)}
export const combinationName=(s:CombinationState)=>String.fromCharCode(...s.data.slice(0,10))
const definitions:CombiParameter[]=[]
const add=(offset:number,live:number|undefined,label:string,group:string,min:number,max:number,extra:Partial<CombiParameter>={})=>definitions.push({id:50000+definitions.length,offset,live,label,group,min,max,...extra})
export const programOptions=['Off',...Array.from({length:100},(_,i)=>'A'+String(i).padStart(2,'0')),...Array.from({length:136},(_,i)=>'G'+String(i+1).padStart(3,'0'))]
for(let n=0;n<8;n++){const o=40+12*n,g='Timbre '+(n+1)
 add(o,n,'Program',g,0,236,{encoding:'program',options:programOptions});add(o+1,8+n,'Level',g,0,127);add(o+11,16+n,'MIDI channel',g,1,16,{encoding:'channel',mask:15})
 add(o+6,24+n,'Key top',g,0,127);add(o+7,32+n,'Key bottom',g,0,127);add(o+8,40+n,'Velocity top',g,1,127);add(o+9,48+n,'Velocity bottom',g,1,127)
 add(o+2,56+n,'Transpose',g,-24,24);add(o+3,64+n,'Detune',g,-50,50)
 for(const [bit,label]of ['Program change','Damper','Aftertouch','Control change'].entries())add(o+10,72+8*bit+n,label+' filter',g,0,1,{mask:1<<bit,shift:bit,options:['DIS','ENA']})
 add(o+4,104+n,'Pan',g,0,32,{encoding:'pan',options:[...Array.from({length:31},(_,i)=>i===15?'Center':i<15?'A'+(15-i):'B'+(i-15)),'Program','Off']})
 add(o+5,112+n,'Send C',g,0,10,{encoding:'send',mask:240,shift:4,options:[...Array.from({length:10},(_,i)=>String(i)),'Program']});add(o+5,120+n,'Send D',g,0,10,{encoding:'send',mask:15,options:[...Array.from({length:10},(_,i)=>String(i)),'Program']})
}
// Effects share the documented 29-byte layout; live numbers differ by 19.
const mapped=(p:Parameter):CombiParameter=>({...p,id:100000+p.id,offset:p.offset-124,...(p.live!==undefined?{live:p.live-19}:{}),...(p.label==='Dynamic modulation source'?{max:13}:{})})
const base=parameters.filter(p=>p.offset>=135).map(mapped)
export const combinationParameters:readonly CombiParameter[]=Object.freeze([...definitions,...base].map(p=>Object.freeze(p)))
const fxImage=(s:CombinationState)=>({format:'korg-x5dr-program',version:1,channel:s.channel,data:[...Array(135).fill(0),...s.data.slice(11,40)],original:[]}) as X5State
export function combinationEffectParameters(s:CombinationState){return effectParameters(fxImage(s)).map(mapped)}
export function combiParameterById(id:number,s:CombinationState){const p=combinationParameters.find(p=>p.id===id)??combinationEffectParameters(s).find(p=>p.id===id);if(!p)throw Error('Unknown Combination parameter');return p}
export function combiValue(s:CombinationState,id:number){const p=combiParameterById(id,s),o=p.offset;let v=s.data[o];if(p.encoding==='program'){if(s.data[o+11]&16)return 0;const bank=s.data[o+10]&192;if((bank!==0&&bank!==128)||(bank===0&&v>99)||(bank===128&&v>135))return 237+v;return (bank===128?101:1)+v;}v=readPackedField(s.data,p);if(p.effectSwitch)return Number(v!==0);if(p.encoding==='channel')return v+1;if(p.encoding==='pan')return v===255?32:v<=31?v:33+v;if(p.encoding==='send')return v===15?10:v<=9?v:11+v;return v}
export function withCombiValue(s:CombinationState,id:number,value:number):CombinationState {const p=combiParameterById(id,s);if(!Number.isInteger(value)||value<p.min||value>p.max)throw Error('Invalid Combination parameter value');if(id===101135||id===101136){const pair=[s.data[11]&127,s.data[12]&127];pair[id-101135]=value;const reason=effectPairError(pair[0],pair[1]);if(reason)throw Error(reason)}if(id>=120000&&s.unresolvedEffects?.includes(Math.floor((p.offset-20)/10)))throw Error('Read FX defaults before editing algorithm parameters');const data=[...s.data],o=p.offset;if(p.encoding==='program'){if(value===0)data[o+11]|=16;else{data[o+11]&=~16;data[o+10]=(data[o+10]&63)|(value>100?128:0);data[o]=value>100?value-101:value-1}}else{const v=p.encoding==='channel'?value-1:p.encoding==='pan'&&value===32?255:p.encoding==='send'&&value===10?15:value;writePackedField(data,p,p.effectSwitch&&v?3:v)}return validateCombination({...s,data,...((id===101135||id===101136)&&combiValue(s,id)!==value?changedEffect(s,id-101135):{})})}
export function combiLiveValue(s:CombinationState,p:CombiParameter){const v=combiValue(s,p.id);return p.encoding==='send'&&v===10?15:p.encoding==='pan'&&v===32?255:p.encoding==='channel'?v-1:v}
export function applyCombiParameter(s:CombinationState,address:number,wire:number):CombinationState|null {const p=combinationParameters.find(p=>p.live===address);if(!p||!acceptsCombiParameter(address,wire))return null;try{return withCombiValue(s,p.id,p.encoding==='send'&&wire===15?10:p.encoding==='pan'&&wire===255?32:p.encoding==='channel'?wire+1:wire)}catch{return null}}
export function acceptsCombiParameter(address:number,wire:number){const p=combinationParameters.find(p=>p.live===address);if(!p||(p.encoding==='pan'&&wire!==255&&(wire<0||wire>31))||(p.encoding==='send'&&wire!==15&&(wire<0||wire>9)))return false;const v=p.encoding==='send'&&wire===15?10:p.encoding==='pan'&&wire===255?32:p.encoding==='channel'?wire+1:wire;return Number.isInteger(v)&&v>=p.min&&v<=p.max}
