import {gmProgramNames} from './program-names'
import type {ReactNode} from 'react'
import {combinationParameters,combiValue,type CombinationState,type CombiParameter} from './combination'
export function CombiTimbres({state,renderField,onDetail,disabled}:{state:CombinationState;renderField:(p:CombiParameter)=>ReactNode;onDetail:(n:number)=>void;disabled:boolean}){
 const field=(n:number,label:string)=>combinationParameters.find(p=>p.group==='Timbre '+n&&p.label===label)!,value=(n:number,label:string)=>combiValue(state,field(n,label).id)
 return <div className="x5-timbre-table-scroll"><table className="x5-timbre-table"><caption>Combi · huit timbres</caption><thead><tr><th>Timbre</th><th>Program / preset</th><th>Niveau</th><th>Pan</th><th>Canal</th><th>Touches</th><th>Vélocité</th><th/></tr></thead><tbody>{Array.from({length:8},(_,i)=>{const n=i+1;return <tr key={n} data-timbre={n}><th scope="row">{n}</th>{['Program','Level','Pan','MIDI channel'].map(label=><td key={label}>{renderField(field(n,label))}</td>)}<td>{value(n,'Key bottom')}–{value(n,'Key top')}</td><td>{value(n,'Velocity bottom')}–{value(n,'Velocity top')}</td><td><button disabled={disabled} onClick={()=>onDetail(n)} aria-label={'Edit Timbre '+n+' details'}>Détails →</button></td></tr>})}</tbody></table></div>
}

/** Read-only Play view: assignments stay visible until the user explicitly presses EDIT. */
export function CombiPresets({state,knownNames={},pending=false}:{state:CombinationState;knownNames?:Readonly<Record<number,string>>;pending?:boolean}){
 return <section className="x5-play-presets" aria-label="Programmes du Combi"><h3>Programmes du Combi</h3>{pending?<p>Lecture des huit timbres…</p>:<ol>{Array.from({length:8},(_,i)=>{const p=combinationParameters.find(p=>p.group==='Timbre '+(i+1)&&p.label==='Program')!,v=combiValue(state,p.id),address=v===0?'Off':v<=100?'A'+String(v-1).padStart(2,'0'):'G'+String(v-100).padStart(3,'0'),name=v===0?'Désactivé':v<=100?knownNames[v-1]??'Nom A non lu':gmProgramNames[v-101];return <li key={i}><small>Timbre {i+1}</small><b>{address}</b><span>{name}</span></li>})}</ol>}</section>
}
