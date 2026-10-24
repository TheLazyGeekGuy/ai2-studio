import {defineDeviceFamily} from '../../editor-host/device-family'
import {ai2Model} from './models'
const family=defineDeviceFamily('korg-ai2',1,{
 'program-file-codec':true,'local-program-edit':true,'partial-program-conversion':true,
 'combination-file-codec':false,'hardware-midi':false,'persistent-store':false,
})
/** Descriptive capabilities only. A leaf must still supply its validated driver and grants. */
export function ai2Member(modelId:string,overrides:Parameters<typeof family.member>[1]={}){
 const model=ai2Model(modelId)
 return family.member('korg-'+model.id.toLowerCase().replace(/[^a-z0-9]/g,''),{'combination-file-codec':true,...overrides})
}
