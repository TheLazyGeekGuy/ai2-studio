/** Standard ZIP32, UTF-8 names, DEFLATE (or STORE fallback). No filesystem extraction. */
import {relativeLibraryPath} from './occurrences'
export const zipLimits={compressed:256*1024*1024,expanded:512*1024*1024,members:10002,manifest:64*1024*1024,file:32*1024*1024}
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true}),table=Uint32Array.from({length:256},(_,i)=>{let c=i;for(let n=0;n<8;n++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0})
export function zipCrc32(bytes:Uint8Array){let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return (c^0xffffffff)>>>0}
async function transform(bytes:Uint8Array,inflate:boolean,limit:number){
 const stream=inflate?new DecompressionStream('deflate-raw'):new CompressionStream('deflate-raw'),reader=new Blob([new Uint8Array(bytes).buffer]).stream().pipeThrough(stream).getReader(),chunks:Uint8Array[]=[];let size=0
 try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit)throw Error('ZIP expanded size limit');chunks.push(value)}}catch(e){await reader.cancel().catch(()=>{});throw e}
 const out=new Uint8Array(size);let at=0;for(const chunk of chunks){out.set(chunk,at);at+=chunk.length}return out
}
export interface ZipMember {name:string;bytes:Uint8Array}
export async function writeLibraryZip(members:readonly ZipMember[]):Promise<Uint8Array>{
 if(members.length>zipLimits.members)throw Error('ZIP member limit')
 const cache=new WeakMap<Uint8Array,{method:number;compressed:Uint8Array;crc:number}>(),names=new Set<string>(),parts:Uint8Array[]=[],central:Uint8Array[]=[];let offset=0,expanded=0
 for(const member of members){
  relativeLibraryPath(member.name);if(names.has(member.name))throw Error('Duplicate ZIP member');names.add(member.name)
  const name=encoder.encode(member.name);if(name.length>65535||(expanded+=member.bytes.length)>zipLimits.expanded)throw Error('ZIP size limit')
  let cached=cache.get(member.bytes);if(!cached){let method=8,compressed:Uint8Array;try{compressed=await transform(member.bytes,false,zipLimits.compressed)}catch(e){if(e instanceof TypeError||e instanceof ReferenceError){method=0;compressed=member.bytes}else throw e}if(compressed.length>=member.bytes.length){method=0;compressed=member.bytes}cached={method,compressed,crc:zipCrc32(member.bytes)};cache.set(member.bytes,cached)}
  const {method,compressed,crc}=cached,local=new Uint8Array(30+name.length),lv=new DataView(local.buffer);lv.setUint32(0,0x04034b50,true);lv.setUint16(4,20,true);lv.setUint16(6,0x800,true);lv.setUint16(8,method,true);lv.setUint16(12,33,true);lv.setUint32(14,crc,true);lv.setUint32(18,compressed.length,true);lv.setUint32(22,member.bytes.length,true);lv.setUint16(26,name.length,true);local.set(name,30)
  const directory=new Uint8Array(46+name.length),cv=new DataView(directory.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(10,method,true);cv.setUint16(14,33,true);cv.setUint32(16,crc,true);cv.setUint32(20,compressed.length,true);cv.setUint32(24,member.bytes.length,true);cv.setUint16(28,name.length,true);cv.setUint32(42,offset,true);directory.set(name,46)
  parts.push(local,compressed);central.push(directory);offset+=local.length+compressed.length;if(offset>zipLimits.compressed)throw Error('ZIP compressed size limit')
 }
 const start=offset;for(const entry of central){parts.push(entry);offset+=entry.length}const end=new Uint8Array(22),ev=new DataView(end.buffer);ev.setUint32(0,0x06054b50,true);ev.setUint16(8,members.length,true);ev.setUint16(10,members.length,true);ev.setUint32(12,offset-start,true);ev.setUint32(16,start,true);parts.push(end);offset+=22;if(offset>zipLimits.compressed)throw Error('ZIP compressed size limit')
 const output=new Uint8Array(offset);let at=0;for(const part of parts){output.set(part,at);at+=part.length}return output
}
export const isLibraryZip=(bytes:Uint8Array)=>bytes.length>=4&&bytes[0]===80&&bytes[1]===75&&bytes[2]===3&&bytes[3]===4
export async function readLibraryZipMembers(bytes:Uint8Array){
 if(bytes.length<22||bytes.length>zipLimits.compressed)throw Error('Invalid ZIP size')
 const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),u16=(p:number)=>v.getUint16(p,true),u32=(p:number)=>v.getUint32(p,true)
 let end=-1;for(let p=bytes.length-22;p>=Math.max(0,bytes.length-65557);p--)if(u32(p)===0x06054b50&&p+22+u16(p+20)===bytes.length){end=p;break}
 if(end<0||u16(end+4)||u16(end+6)||u16(end+8)!==u16(end+10))throw Error('Invalid ZIP directory')
 const count=u16(end+10),size=u32(end+12),start=u32(end+16);if(count>zipLimits.members||start+size!==end)throw Error('Invalid ZIP directory bounds')
 const members=new Map<string,Uint8Array>(),ranges:{start:number;end:number}[]=[];let cursor=start,expanded=0
 for(let i=0;i<count;i++){
  if(cursor+46>end||u32(cursor)!==0x02014b50)throw Error('Invalid ZIP entry')
  const flags=u16(cursor+8),method=u16(cursor+10),crc=u32(cursor+16),packed=u32(cursor+20),length=u32(cursor+24),nl=u16(cursor+28),el=u16(cursor+30),cl=u16(cursor+32),offset=u32(cursor+42)
  if(flags&~0x800||![0,8].includes(method)||u16(cursor+34)||cursor+46+nl+el+cl>end||offset+30>start||(u32(cursor+38)>>>16&0xf000)===0xa000)throw Error('Unsupported ZIP entry')
  const name=decoder.decode(bytes.subarray(cursor+46,cursor+46+nl));relativeLibraryPath(name);if(members.has(name))throw Error('Duplicate ZIP path')
  if(length>(name==='manifest.json'?zipLimits.manifest:zipLimits.file)||(expanded+=length)>zipLimits.expanded)throw Error('ZIP expanded size limit')
  if(u32(offset)!==0x04034b50||u16(offset+6)!==flags||u16(offset+8)!==method||u32(offset+14)!==crc||u32(offset+18)!==packed||u32(offset+22)!==length)throw Error('ZIP local header mismatch')
  const lnl=u16(offset+26),lel=u16(offset+28),data=offset+30+lnl+lel,stop=data+packed
  if(stop>start||decoder.decode(bytes.subarray(offset+30,offset+30+lnl))!==name||ranges.some(r=>offset<r.end&&stop>r.start))throw Error('Invalid ZIP member bounds')
  ranges.push({start:offset,end:stop});const payload=bytes.subarray(data,stop),original=method===0?payload.slice():await transform(payload,true,length)
  if(original.length!==length||zipCrc32(original)!==crc)throw Error('ZIP CRC or size mismatch')
  members.set(name,original);cursor+=46+nl+el+cl
 }
 if(cursor!==end)throw Error('ZIP directory size mismatch');return members
}
