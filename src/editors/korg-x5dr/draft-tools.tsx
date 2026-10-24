import {useEffect,useRef,useState} from 'react'
import {saveRecoverableDraft} from '../../editor-host/draft-storage'
import {validateSessionState} from './workspace-state'
import type {X5Session} from './module'
export const x5DraftKey=(id:string)=>'midi-studio:x5dr:recoverable-draft:v1:'+id
export function DraftTools({session,id,disabled,stop,onError}:{session:X5Session;id:string;disabled:boolean;stop:()=>void;onError:(s:string)=>void}){
 const key=x5DraftKey(id),[pending,setPending]=useState<string|null>(null),[status,setStatus]=useState(''),[enabled,setEnabled]=useState(true),original=useRef<string|null>(null),ready=useRef(false)
 useEffect(()=>{ready.current=false;try{original.current=localStorage.getItem(key);setPending(original.current);ready.current=true}catch(e){setStatus('Draft storage unavailable: '+String(e))}},[key])
 useEffect(()=>{if(!enabled||pending!==null||!ready.current)return;let timer:ReturnType<typeof setTimeout>|undefined,last=JSON.stringify(session.serialize()),disposed=false
 const save=()=>{if(disposed)return;try{const next=JSON.stringify(session.serialize());if(next===last)return;const recovery=saveRecoverableDraft(localStorage,key,next,validateSessionState,Date.now,original.current);original.current=next;last=next;setStatus(recovery?'Invalid previous draft backed up at '+recovery:'Draft saved locally · '+new Date().toLocaleTimeString())}catch(e){setStatus('Autosave stopped: '+String(e));setEnabled(false)}}
 const off=session.subscribe(()=>{clearTimeout(timer);timer=setTimeout(save,600)});return()=>{clearTimeout(timer);save();disposed=true;off()}
 },[session,key,enabled,pending])
 const choose=(restore:boolean)=>{try{if(disabled)throw Error('Editor busy or locked');if(restore){const state=validateSessionState(JSON.parse(pending!));stop();session.dispatch({type:'replace',state});setStatus('Saved draft restored locally · output disabled')}else{const next=JSON.stringify(session.serialize()),recovery=saveRecoverableDraft(localStorage,key,next,validateSessionState,Date.now,original.current);original.current=next;setStatus(recovery?'Previous invalid draft retained at '+recovery:'Current draft selected for autosave')}setPending(null);onError('')}catch(e){onError(String(e))}}
 return <div className="x5-draft-tools"><label><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>Autosave local draft</label>{pending!==null&&<><span>Previous local draft available · preserved until you choose</span><button disabled={disabled} onClick={()=>choose(true)}>Restore saved draft</button><button disabled={disabled} onClick={()=>choose(false)}>Keep current draft</button></>}<output role="status">{status}</output></div>
}
