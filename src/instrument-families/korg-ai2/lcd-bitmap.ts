import {createAi2DumpCodec} from './dump-codec'
import {hardwareProfile,hardwareHeader} from './hardware-protocol'
export interface Ai2Lcd {width:144;height:40;bytes:readonly number[]}
export function lcdRequest(model:string,channel:number){if(!hardwareProfile(model).modern)throw Error('Capture LCD non documentée sur ce modèle');return [...hardwareHeader(model,channel),31,247]}
export function lcdCodec(model:string){if(!hardwareProfile(model).modern)throw Error('Capture LCD absente');return createAi2DumpCodec({modelId:hardwareProfile(model).id,functionId:127,recordSize:720,checksum:true,label:model+' LCD'})}
export function decodeLcd(model:string,bytes:readonly number[]):Ai2Lcd{const s=lcdCodec(model).decode(bytes);return {width:144,height:40,bytes:s.data}}
export function lcdPath(screen:Ai2Lcd){let path='';for(let y=0;y<40;y++)for(let x=0;x<144;x++)if(screen.bytes[y*18+(x>>3)]&(128>>(x%8)))path+=`M${x} ${y}h1v1h-1Z`;return path}
