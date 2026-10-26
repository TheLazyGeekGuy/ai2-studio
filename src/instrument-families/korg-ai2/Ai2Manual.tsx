import {useEffect,useId,useRef,useState} from 'react'
import {useLanguage,translate,LanguagePicker} from '../../i18n'
import {ai2Manual,type ManualSection} from './manual-content'
import './manual.css'
/** Owned by the view instance: no session, transport or persistent state is touched. */
export function Ai2Manual({model,onClose}:{model:string;onClose():void}){
 const language=useLanguage(),manual=ai2Manual(model,language),[section,setSection]=useState<ManualSection>('start'),dialog=useRef<HTMLDialogElement>(null),title=useId(),article=useRef<HTMLElement>(null)
 const part=manual.parts.find(p=>p.id===section)!
 useEffect(()=>{const d=dialog.current!;d.showModal();return()=>{if(d.open)d.close()}},[])
 useEffect(()=>{article.current?.scrollTo({top:0})},[model,section])
 return <dialog ref={dialog} className="ai2-manual" aria-labelledby={title} onClose={()=>{if(!dialog.current?.open)onClose()}} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><header><div><small>AI² STUDIO · {manual.model}</small><h2 id={title}>{manual.title}</h2></div><LanguagePicker/><button type="button" onClick={onClose} aria-label={translate('Close documentation',language)}>×</button></header><div className="ai2-manual-body"><nav aria-label={translate('Documentation sections',language)}>{manual.parts.map(p=><button key={p.id} type="button" aria-current={section===p.id?'page':undefined} onClick={()=>setSection(p.id)}>{p.title}</button>)}</nav><article ref={article} tabIndex={0}><h3>{part.title}</h3>{part.paragraphs.map((p,i)=><p key={i}>{p}</p>)}{section==='references'&&<ul><li><a href={manual.reference.href} target="_blank" rel="noopener noreferrer">{manual.reference.label}</a></li><li><a href="https://www.korg.com/us/support/download/" target="_blank" rel="noopener noreferrer">{translate('Korg support · exact-model documents',language)}</a></li></ul>}</article></div></dialog>
}
