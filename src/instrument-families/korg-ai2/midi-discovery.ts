import {ai2Models} from './models'
import type {MidiAccess,MidiPort} from '../../web-midi'
import type {EndpointBinding} from '../../editor-host/midi-broker'

const compact=(name:string)=>name.normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g,'')
/** Longest model first, so X5DR is never mistaken for X5, N5EX for N5, or proX for pro. */
export function ai2PortModel(name:string|null|undefined):string|null{
 const raw=name??'';if(/[\r\n]/.test(raw))return null
 const text=compact(raw)
 const exact=[...ai2Models].sort((a,b)=>compact(b.id).length-compact(a.id).length).find(m=>{
  const id=compact(m.id),index=text.indexOf(id);return index>=0&&!/[0-9]/.test(text[index-1]??'')&&!/[0-9]/.test(text[index+id.length]??'')
 })
 if(/x5[^\r\n]*dr/i.test(raw))return 'X5DR'
 return exact?.id??null
}
export interface PortChoice {id:string;name:string}
export interface Ai2MidiPreferences {version:1;input?:PortChoice;output?:PortChoice;channel:number;enabled:boolean;autoLive:boolean;autoEdit:boolean}
export interface PreferenceStorage {getItem(key:string):string|null;setItem(key:string,value:string):void}
export function ai2MidiPreferences(storage:PreferenceStorage|undefined,key:string){
 const defaults:Ai2MidiPreferences={version:1,channel:1,enabled:true,autoLive:true,autoEdit:true}
 const read=():Ai2MidiPreferences=>{try{const p=JSON.parse(storage?.getItem(key)??'null');if(!p||p.version!==1)return defaults;const port=(v:unknown):PortChoice|undefined=>{const p=v as PortChoice;return p&&typeof p.id==='string'&&typeof p.name==='string'?{id:p.id,name:p.name}:undefined};return {...defaults,input:port(p.input),output:port(p.output),channel:Number.isInteger(p.channel)&&p.channel>=1&&p.channel<=16?p.channel:1,enabled:p.enabled!==false,autoLive:p.autoLive!==false,autoEdit:p.autoEdit!==false}}catch{return defaults}}
 let current=read()
 return {get:()=>current,update(patch:Partial<Ai2MidiPreferences>){current={...current,...patch,version:1};try{storage?.setItem(key,JSON.stringify(current))}catch{/* preferences never grant or block MIDI */}}}
}
export function resolveMidiChoice(ports:Map<string,MidiPort>,choice:PortChoice|undefined,available:(id:string)=>boolean){
 if(!choice)return null
 const candidates=[...ports.values()].filter(p=>p.state==='connected'&&available(p.id))
 const sameName=(name:string|null|undefined)=>(name??'').normalize('NFKC').trim().toLowerCase()===choice.name.normalize('NFKC').trim().toLowerCase()
 const byId=candidates.find(p=>p.id===choice.id&&sameName(p.name));if(byId)return byId
 const byName=candidates.filter(p=>sameName(p.name));return byName.length===1?byName[0]:null
}
export function ai2MidiPair(access:MidiAccess,model:string,available:(direction:'input'|'output',id:string)=>boolean,remembered?:Ai2MidiPreferences):EndpointBinding|null{
 const input=resolveMidiChoice(access.inputs,remembered?.input,id=>available('input',id)),output=resolveMidiChoice(access.outputs,remembered?.output,id=>available('output',id))
 if(input&&output)return {inputId:input.id,outputId:output.id}
 // An unavailable remembered route must not be replaced by a different instrument.
 if(remembered?.input||remembered?.output)return null
 const inputs=[...access.inputs.values()].filter(p=>p.state==='connected'&&ai2PortModel(p.name)===model&&available('input',p.id)),outputs=[...access.outputs.values()].filter(p=>p.state==='connected'&&ai2PortModel(p.name)===model&&available('output',p.id))
 const canonical=(name:string|null|undefined)=>compact((name??'').replace(/\b(input|output|in|out)\b/gi,''))
 const pairs=inputs.flatMap(i=>outputs.filter(o=>canonical(i.name)===canonical(o.name)).map(o=>({inputId:i.id,outputId:o.id})))
 return pairs.length===1?pairs[0]:inputs.length===1&&outputs.length===1?{inputId:inputs[0].id,outputId:outputs[0].id}:null
}
