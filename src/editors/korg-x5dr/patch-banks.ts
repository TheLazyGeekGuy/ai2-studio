import {createAi2DumpCodec} from '../../instrument-families/korg-ai2/dump-codec'
import {protocols} from '../../instrument-families/korg-ai2/protocol-profiles'
import {decodeDeviceData} from './device-data'
/** OM E1 tables 1/2, all-data functions 4Ch/4Dh. File projection only: no STORE. */
import {validateState,type X5State} from './model'
import {validateCombination,type CombinationState} from './combination'
export function decodeBank(b:readonly number[]):(X5State|CombinationState)[]{
 const combi=b[4]===77,size=combi?136:164
 const {channel,data}=createAi2DumpCodec({modelId:protocols.X5.id,functionId:combi?77:76,recordSize:size,minRecords:100,maxRecords:100,selector:[0],label:'X5DR complete bank'}).decode(b)
 return Array.from({length:100},(_,i)=>{const state={version:1,channel,data:data.slice(i*size,(i+1)*size),original:[]};return combi?validateCombination({...state,format:'korg-x5dr-combination'}):validateState({...state,format:'korg-x5dr-program'})})
}

/** Projections from the original continuous All Data image; they are not original single-buffer dumps. */
export function allDataPatches(bytes:readonly number[]){const s=decodeDeviceData(bytes,'all');return Array.from({length:200},(_,i)=>{const combi=i<100,index=combi?i:i-100,size=combi?136:164,offset=(combi?868:14468)+index*size,base={version:1,channel:s.channel,data:s.data.slice(offset,offset+size),original:[]};return combi?validateCombination({...base,format:'korg-x5dr-combination'}):validateState({...base,format:'korg-x5dr-program'})})}
