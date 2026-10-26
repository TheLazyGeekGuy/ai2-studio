import {forwardRef,useRef,useState,type InputHTMLAttributes} from 'react'
import {translate,useLanguage} from '../i18n'
/** Localized page controls; the operating-system file dialog keeps its own language. */
export const FileInput=forwardRef<HTMLInputElement,Omit<InputHTMLAttributes<HTMLInputElement>,'type'>>(function FileInput({onChange,disabled,multiple,...props},forwarded){
 const language=useLanguage(),input=useRef<HTMLInputElement|null>(null),[names,setNames]=useState<string[]>([])
 return <span className="localized-file-input"><button type="button" disabled={disabled} onClick={()=>input.current?.click()}>{translate(multiple?'Choose files…':'Choose file…',language)}</button><span className="localized-file-names" title={names.join(', ')}>{names.length?names.length===1?names[0]:translate('{count} files selected',language).replace('{count}',String(names.length)):translate('No file chosen',language)}</span><input {...props} type="file" hidden multiple={multiple} disabled={disabled} ref={el=>{input.current=el;if(typeof forwarded==='function')return forwarded(el);else if(forwarded)forwarded.current=el}} onChange={e=>{setNames(Array.from(e.currentTarget.files??[],f=>f.name));onChange?.(e)}}/></span>
})
