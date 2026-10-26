import {translate as uiTranslate,useLanguage as useUiLanguage} from '../../i18n'
import {useId,useState} from 'react'
import {ai2Models} from './models'
import {ai2ModelYears} from './model-years'
import {modelCompatibility,modelFamilies,modelVariants} from './model-relations'

/** Timeline coordinates are presentation only; variant arrows and conversion relations stay distinct. */
export function Ai2ModelRelations({value,onChange,disabled=false}:{value:string;onChange:(id:string)=>void;disabled?:boolean}){const uiLanguage=useUiLanguage();
 const marker=useId().replace(/:/g,''),[open,setOpen]=useState(false),[target,setTarget]=useState<string|null>(null)
 const width=1420,header=48,lanes=modelFamilies.map(f=>({family:f,height:Math.max(...Array.from({length:9},(_,i)=>ai2Models.filter(m=>m.protocol===f&&ai2ModelYears[m.id]===1991+i).length))*32+18}))
 const laneY=(family:typeof modelFamilies[number])=>header+lanes.slice(0,modelFamilies.indexOf(family)).reduce((sum,l)=>sum+l.height,0),height=header+lanes.reduce((sum,l)=>sum+l.height,0)
 const pos=new Map(ai2Models.map(m=>{const peers=ai2Models.filter(p=>p.protocol===m.protocol&&ai2ModelYears[p.id]===ai2ModelYears[m.id]),i=peers.findIndex(p=>p.id===m.id);return [m.id,{x:142+(ai2ModelYears[m.id]-1991)*139,y:laneY(m.protocol)+7+i*32}]}))
 const relation=target?modelCompatibility(value,target):null
 return <details className="ai2-relations" open={open} onToggle={e=>setOpen(e.currentTarget.open)}><summary>{uiTranslate("Filiation et compatibilité ",uiLanguage)}<small>{uiTranslate("21 modèles · variantes, ROM et conversions",uiLanguage)}</small></summary>{open&&<>
  <p>{uiTranslate("Flèches pleines : variantes et extensions identifiées. Les lignes représentent les familles de fichier, pas une compatibilité sonore universelle. Choisis un modèle pour ouvrir son éditeur ; survole ou focalise un autre pour comparer.",uiLanguage)}</p>
  <div className="ai2-relations-scroll"><svg viewBox={`0 0 ${width} ${height}`} role="group" aria-label="Frise des variantes Korg AI² et familles de fichiers">
   <defs><marker id={marker} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="currentColor"/></marker></defs>
   {Array.from({length:9},(_,i)=><g key={i} className="ai2-relation-year"><text x={142+i*139} y="24">{1991+i}</text><path d={`M${142+i*139} 34V${height-10}`}/></g>)}
   {modelFamilies.map((family,i)=><g key={family} className="ai2-relation-lane"><rect x="2" y={laneY(family)-5} width={width-4} height={lanes[i].height-6} rx="7"/><text x="16" y={laneY(family)+20}>{family}</text></g>)}
   {modelVariants.map(r=>{const a=pos.get(r.from)!,b=pos.get(r.to)!,selected=r.from===value||r.to===value;return <path key={r.from+r.to} className="ai2-relation-edge" data-active={selected} d={a.x===b.x?`M${a.x+94} ${a.y+12} C${a.x+124} ${a.y+12},${b.x+124} ${b.y+12},${b.x+99} ${b.y+12}`:`M${a.x+94} ${a.y+12} C${a.x+124} ${a.y+12},${b.x-24} ${b.y+12},${b.x-5} ${b.y+12}`} markerEnd={`url(#${marker})`}><title>{r.from} → {r.to} : {uiTranslate(r.label,uiLanguage)}</title></path>})}
   {ai2Models.map(m=>{const p=pos.get(m.id)!,c=modelCompatibility(value,m.id);return <foreignObject key={m.id} x={p.x} y={p.y} width="94" height="29"><button disabled={disabled} className="ai2-relation-node" data-level={c.level} aria-pressed={value===m.id} title={m.id+' · '+uiTranslate(c.label,uiLanguage)+' · '+uiTranslate(c.detail,uiLanguage)} onFocus={()=>setTarget(m.id)} onMouseEnter={()=>setTarget(m.id)} onClick={()=>onChange(m.id)}>{m.id}</button></foreignObject>})}
  </svg></div>
  <div className="ai2-relations-legend"><span data-level="native">{uiTranslate("Modèle actif",uiLanguage)}</span><span data-level="shared">{uiTranslate("Structure + catalogue communs",uiLanguage)}</span><span data-level="partial">{uiTranslate("Adaptation partielle",uiLanguage)}</span></div>
  <p className="ai2-relation-detail" aria-live="polite">{target&&relation?<><strong>{value} {"→ "}{target} {"· "}{uiTranslate(relation.label,uiLanguage)}</strong> {uiTranslate(relation.detail,uiLanguage)}</>:uiTranslate('Les conversions de Combi nécessitent aussi les Programs référencés ; une flèche de variante ne garantit pas leur allocation.',uiLanguage)}</p>
 </>}</details>
}
