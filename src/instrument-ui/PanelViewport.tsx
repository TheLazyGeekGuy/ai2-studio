import {translate as uiTranslate,useLanguage as useUiLanguage} from '../i18n'
import {useState,type ReactNode} from 'react'
import './panel-viewport.css'
/** The same native-panel viewport for rack and keyboard editors. No MIDI dependency. */
export function PanelViewport({keyboard=false,preferenceKey='midi-studio:ai2:controls-zoom',children}:{keyboard?:boolean;preferenceKey?:string;children:(controlsOnly:boolean)=>ReactNode}){const uiLanguage=useUiLanguage();
 const [controlsOnly,setControlsOnly]=useState(()=>{try{return typeof window==='undefined'||localStorage.getItem(preferenceKey)!=='false'}catch{return true}}),[scale,setScale]=useState(1)
 return <div className="ai2-panel-viewport" data-controls-zoom={keyboard&&controlsOnly}><div className="ai2-panel-canvas" style={{overflowX:'auto'}}><div style={{width:(scale*100)+'%'}}>{children(keyboard&&controlsOnly)}</div></div><div className="ai2-panel-view-tools">{keyboard&&<label><input type="checkbox" checked={controlsOnly} onChange={e=>{const enabled=e.target.checked;setControlsOnly(enabled);try{localStorage.setItem(preferenceKey,String(enabled))}catch{}}}/>{uiTranslate("Zoom commandes",uiLanguage)}</label>}<label>{uiTranslate("Zoom",uiLanguage)}<input aria-label={uiTranslate("Zoom de façade",uiLanguage)} type="range" min="1" max="2.5" step="0.1" value={scale} onChange={e=>setScale(Number(e.target.value))}/><output>{Math.round(scale*100)} {"%"}</output></label></div></div>
}
