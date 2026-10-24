export type ProtocolFamily='01W'|'03RW'|'X3'|'X5'|'NS5R'|'N5'
export const protocols:Readonly<Record<ProtocolFamily,{id:number;size:number;buffer:number;bank:number;maxPrograms:number;checksum:boolean}>>=Object.freeze({
 '01W':{id:0x2b,size:172,buffer:0x40,bank:0x4c,maxPrograms:200,checksum:false},
 '03RW':{id:0x30,size:164,buffer:0x40,bank:0x4c,maxPrograms:100,checksum:false},
 X3:{id:0x35,size:164,buffer:0x40,bank:0x4c,maxPrograms:200,checksum:false},
 X5:{id:0x36,size:164,buffer:0x40,bank:0x4c,maxPrograms:100,checksum:false},
 NS5R:{id:0x42,size:158,buffer:0x31,bank:0x36,maxPrograms:128,checksum:true},
 N5:{id:0x4c,size:178,buffer:0x31,bank:0x36,maxPrograms:100,checksum:true},
})

for(const profile of Object.values(protocols))Object.freeze(profile)
