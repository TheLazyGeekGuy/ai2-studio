import {ai2Definition} from './definition'
import {signedByte} from '../packed-fields'
import type {Ai2Program} from './codec'
function descriptor(model:string,osc:number){if(osc!==0&&osc!==1)throw Error('Oscillateur AI² inconnu');const definition=ai2Definition(model);return {definition,oscillator:definition.layout.oscillators[osc]}}
export function oscillatorInfo(p:Ai2Program,osc:number){
 const {definition:d,oscillator:o}=descriptor(p.model,osc),offset=o.reference,bank=d.layout.legacy?p.data[offset+1]:0
 const raw=d.layout.legacy?p.data[offset]+256*bank:p.data[offset]*256+p.data[offset+1]
 const index=d.layout.referenceEncoding==='one-based'?p.data[offset]-1:d.layout.referenceEncoding==='legacy-bank'?p.data[offset]:raw
 const internal=d.layout.referenceEncoding==='one-based'?bank===0:d.layout.referenceEncoding==='legacy-bank'?bank<16:true
 const octave=d.layout.octaveEncoding==='octaves'?signedByte(p.data[o.octave])*12:d.layout.octaveEncoding==='enum'?-24+12*p.data[o.octave]:signedByte(p.data[o.octave])
 return {offset,index,bank,internal,octave,coarse:o.coarse===undefined?0:signedByte(p.data[o.coarse]),fine:o.fine===undefined?0:signedByte(p.data[o.fine])}
}
export function writeOscillatorReference(data:number[],model:string,osc:number,index:number){
 const {definition:d,oscillator:o}=descriptor(model,osc),encoding=d.layout.referenceEncoding
 if(!Number.isInteger(index)||index<0||index>=d.model.multisamples||encoding==='one-based'&&index>=255)throw Error('Référence multisample hors plage ou encodage non confirmé')
 if(encoding==='big-endian'){data[o.reference]=index>>8;data[o.reference+1]=index&255}
 else {data[o.reference]=encoding==='one-based'?index+1:index&255;data[o.reference+1]=encoding==='little-endian'?index>>8:0}
}
export function writeOscillatorOctave(data:number[],model:string,osc:number,semitones:number){
 const {definition:d,oscillator:o}=descriptor(model,osc)
 if(![-24,-12,0,12].includes(semitones))throw Error('Octave non représentable')
 data[o.octave]=d.layout.octaveEncoding==='octaves'?(semitones/12)&255:d.layout.octaveEncoding==='enum'?(semitones+24)/12:semitones&255
}
