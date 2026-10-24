/** Technical field mechanics shared by proven callers. Units, IDs, ranges and validity remain adapter-owned. */
export interface PackedField {offset:number;width?:number;mask?:number;shift?:number;min:number;signed?:boolean}
export const signedByte=(value:number)=>value>127?value-256:value
export function readPackedField(data:readonly number[],field:PackedField){let value=data[field.offset];if(field.width===2)value|=data[field.offset+1]<<8;return field.mask!==undefined?(value&field.mask)>>(field.shift??0):(field.signed??field.min<0)?signedByte(value):value}
/** Mutates only the caller's fresh draft; validate semantic value before calling (encoded enums can exceed UI range). */
export function writePackedField(data:number[],field:PackedField,value:number){if(field.mask!==undefined)data[field.offset]=(data[field.offset]&~field.mask)|((value<<(field.shift??0))&field.mask);else{data[field.offset]=value&255;if(field.width===2)data[field.offset+1]=(value>>8)&255}}
