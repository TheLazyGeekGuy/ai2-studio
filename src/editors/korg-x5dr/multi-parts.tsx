import {translate as uiTranslate,useLanguage as useUiLanguage} from '../../i18n'
import {useState} from 'react'
import {ChoiceBrowser} from './choice-browser'
import {deviceValue,type DeviceField,type DeviceImage} from './device-data'
import {gmProgramNames} from './program-names'
import {noteName} from './combi-zones'

/** The 16 Multi parts at once, one row each, every part parameter editable in place (OM table 6 fields). */
const columns=[['MIDI channel','Can.'],['Level','Niveau'],['Pan','Pan'],['Send C','C'],['Send D','D'],['Transpose','Transp.'],['Detune','Désacc.'],['Key bottom','Touche bas'],['Key top','Touche haut'],['Velocity bottom','Vél. bas'],['Velocity top','Vél. haut'],['Pitch bend range','PB']] as const
const filters=[['Program change filter','PC'],['Damper filter','Dmp'],['Aftertouch filter','AT'],['Control change filter','CC']] as const
export function MultiPartsTable({image,fields,disabled,names,selected,onSelect,onChange}:{image:DeviceImage;fields:readonly DeviceField[];disabled:boolean;names:Readonly<Record<number,string>>;selected:number;onSelect:(part:number)=>void;onChange:(id:number,value:number)=>void}){const uiLanguage=useUiLanguage();
 const [browse,setBrowse]=useState<{part:number;request:number}|null>(null)
 const field=(part:number,label:string)=>fields.find(f=>f.group==='Part '+part&&f.label===label)
 const programName=(v:number)=>v===0?'Off':v<=100?'A'+String(v-1).padStart(2,'0')+' · '+(names[v-1]??'Nom A non lu'):'G'+String(v-100).padStart(3,'0')+' · '+(gmProgramNames[v-101]??'?')
 const cell=(part:number,label:string)=>{const f=field(part,label);if(!f)return <td key={label}/>;const v=deviceValue(image,f),name='Partie '+part+' '+label
  if(f.options)return <td key={label}><select aria-label={name} value={v>=f.min&&v<=f.max?v:''} disabled={disabled} onFocus={()=>onSelect(part)} onChange={e=>onChange(f.id,Number(e.target.value))}>{(v<f.min||v>f.max)&&<option value="">{"? "}{v}</option>}{f.options.map((o,i)=><option key={i} value={i}>{o}</option>)}</select></td>
  if(label==='Level')return <td key={label} className="x5-multi-level"><input type="range" aria-label={name} min={f.min} max={f.max} value={v} disabled={disabled} onFocus={()=>onSelect(part)} onChange={e=>onChange(f.id,Number(e.target.value))}/><output>{v}</output></td>
  return <td key={label}><input type="number" aria-label={name} title={label.startsWith('Key')?noteName(v):undefined} min={f.min} max={f.max} value={v} disabled={disabled} onFocus={()=>onSelect(part)} onChange={e=>{if(e.target.value!=='')onChange(f.id,Number(e.target.value))}}/></td>}
 const program=browse&&field(browse.part,'Program')
 return <div className="x5-multi-table-scroll"><table className="x5-multi-table"><caption>{uiTranslate("Multi · 16 parties",uiLanguage)}</caption><thead><tr><th scope="col">{uiTranslate("Partie",uiLanguage)}</th><th scope="col">{uiTranslate("Program",uiLanguage)}</th>{columns.map(([,short])=><th key={short} scope="col">{short}</th>)}<th scope="col">{uiTranslate("Filtres",uiLanguage)}</th></tr></thead>
  <tbody>{Array.from({length:16},(_,i)=>{const part=i+1,p=field(part,'Program'),v=p?deviceValue(image,p):0
   return <tr key={part} data-selected={selected===part||undefined} data-off={v===0||undefined} onClick={()=>onSelect(part)}><th scope="row">{part}</th>
    <td><button type="button" className="x5-multi-program" disabled={disabled||!p} aria-label={uiTranslate('Choisir le Program de la partie ',uiLanguage)+part} onClick={()=>setBrowse({part,request:(browse?.request??0)+1})}>{programName(v)}</button></td>
    {columns.map(([label])=>cell(part,label))}
    <td className="x5-multi-filters">{filters.map(([label,short])=>{const f=field(part,label);if(!f)return null;const on=deviceValue(image,f)===1;return <button key={label} type="button" aria-pressed={on} aria-label={uiTranslate('Partie ',uiLanguage)+part+' '+label} disabled={disabled} onClick={()=>onChange(f.id,on?0:1)}>{short}</button>})}</td></tr>})}</tbody></table>
  {program&&<ChoiceBrowser key={browse!.part} launcher={false} openRequest={browse!.request} onClose={()=>setBrowse(null)} label={program.group+' '+program.label} value={deviceValue(image,program)} options={program.options!} disabled={disabled} programs knownNames={names} onFocus={()=>{}} onChange={v=>onChange(program.id,v)}/>}</div>
}
