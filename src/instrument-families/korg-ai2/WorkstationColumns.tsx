import {translate as uiTranslate,useLanguage as useUiLanguage} from '../../i18n'
import type {ReactNode} from 'react'
import './workstation.css'

export interface WorkstationCard {key:string;title:string;hint?:string;envelope?:ReactNode;children:ReactNode}
export interface WorkstationCell {col:1|2|3;row:1|2|3;cards:readonly WorkstationCard[]}

/** Three aligned columns shared by every AI² editor (validated mockup of 24/10/2026): an oscillator reads Source /
 * VDF / VDA on the first row and their envelopes on the second, so VDF and VDA, then VDF EG and VDA EG, start on the
 * same line. Cards are numbered in reading order. Below 1050 px the cells stack in the same order. */
export function WorkstationColumns({cells,label}:{cells:readonly WorkstationCell[];label:string}){const uiLanguage=useUiLanguage();
 let n=0
 return <div className="ai2-columns" role="group" aria-label={uiTranslate(label,uiLanguage)}>{cells.map(c=><div key={c.col+'-'+c.row} className="ai2-columns-cell" data-col={c.col} data-row={c.row}>{c.cards.map(card=>{n++
  return <section key={card.key} className="ai2-columns-card" aria-label={uiTranslate(card.title,uiLanguage)}><h3><span>{String(n).padStart(2,'0')}</span>{uiTranslate(card.title,uiLanguage)}{card.hint&&<small>{uiTranslate(card.hint,uiLanguage)}</small>}</h3>{card.envelope&&<div className="ai2-columns-envelope">{card.envelope}</div>}<div className="ai2-columns-fields">{card.children}</div></section>})}</div>)}</div>
}
