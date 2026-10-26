import {translate as uiTranslate,useLanguage as useUiLanguage} from '../../i18n'
import {useEffect,useRef,useState,type ComponentProps} from 'react'
import {Ai2Library} from './Ai2Library'
import './ai2.css'

export function Ai2LibraryDialog({onClose,onOpen,connectionLabel,...props}:ComponentProps<typeof Ai2Library>&{onClose:()=>void;connectionLabel?:string}){const uiLanguage=useUiLanguage();
 const dialog=useRef<HTMLDialogElement>(null),[closeAfter,setCloseAfter]=useState(()=>{try{return localStorage.getItem('midi-studio:ai2:library:close')!=='false'}catch{return true}})
 useEffect(()=>{const d=dialog.current;if(!d)return;d.showModal();return()=>{if(d.open)d.close()}},[])
 return <dialog ref={dialog} className="ai2-library-dialog" aria-label={uiTranslate('Bibliothèque de presets ',uiLanguage)+props.model} onCancel={e=>{e.preventDefault();onClose()}}>
  <div className="ai2-library-dialog-bar"><div><small>{uiTranslate("KORG AI² · BIBLIOTHÈQUE",uiLanguage)}</small><h2>{uiTranslate("Presets · ",uiLanguage)}{props.model}</h2>{connectionLabel&&<output aria-live="polite">{connectionLabel}</output>}</div><label><input type="checkbox" checked={closeAfter} onChange={e=>{setCloseAfter(e.target.checked);try{localStorage.setItem('midi-studio:ai2:library:close',String(e.target.checked))}catch{}}}/>{uiTranslate("Fermer après chargement",uiLanguage)}</label><button aria-label={uiTranslate("Fermer la bibliothèque AI²",uiLanguage)} onClick={onClose}>{uiTranslate("Fermer ×",uiLanguage)}</button></div>
  <Ai2Library {...props} onOpen={program=>{onOpen(program);if(closeAfter)onClose()}}/>
 </dialog>
}
