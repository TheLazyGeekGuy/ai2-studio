import {useMemo} from 'react'
import {DeviceSlider} from '../../editors/tc-m3000/device-slider'
import {ai2Model,ai2Models} from './models'
import './model-slider.css'

/** Model selector of the AI² editors: the M3000 / M2000 device slider over the 21 models, in data/models.json order,
 * with a mark where the protocol family changes. The card states what this phase supports for the chosen model;
 * only the X5DR has hardware editing. The select is kept for direct keyboard choice among 21 positions. */
export function Ai2ModelSlider({value,onChange,disabled}:{value:string;onChange:(id:string)=>void;disabled?:boolean}){
 const choices=useMemo(()=>ai2Models.map(m=>({id:m.id,label:m.id,detail:'Korg '+m.id+' · '+(m.keys?m.keys+' touches':'module')+' · famille '+m.protocol,group:m.protocol})),[])
 const m=ai2Model(value),qualified=!/PROVISOIRE|non vérifié/i.test(m.status),native=m.id==='X5DR'
 const caps:[boolean,string][]=[[true,'Program'],[true,'Combi'],[native,native?'MIDI matériel : lecture / envoi':'MIDI matériel : non activé'],[true,'Clavier / contrôleur'],[qualified,qualified?'Données relevées':'Données à qualifier']]
 return <section className="ai2-model-slider" aria-label="Modèle édité">
  <DeviceSlider title="Modèle" ariaLabel="Curseur du modèle Korg AI²" compact choices={choices} value={value} disabled={disabled} onChange={onChange}/>
  <div className="ai2-model-card">
   <label>Korg<select aria-label="Modèle Korg AI²" value={value} disabled={disabled} onChange={e=>onChange(e.target.value)}>{ai2Models.map(x=><option key={x.id}>{x.id}</option>)}</select></label>
   <small>{m.keys?m.keys+' touches':'Module'} · famille {m.protocol} · ROM {m.rom} · {m.status}</small>
   <ul aria-label={'Compatibilité '+m.id}>{caps.map(([ok,label])=><li key={label} data-ok={ok}>{label}</li>)}</ul>
  </div>
 </section>
}
