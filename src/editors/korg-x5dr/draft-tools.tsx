import {translate as uiTranslate,useLanguage as useUiLanguage} from '../../i18n'
import {useUpdateGuard} from '../../editor-host/use-update-guard'
import {updateSessionKey} from '../../update-safety'
import {useEffect,useRef,useState} from 'react'
import {saveRecoverableDraft} from '../../editor-host/draft-storage'
import {validateSessionState} from './workspace-state'
import type {X5Session} from './module'
export const x5DraftKey=(id:string)=>'midi-studio:x5dr:recoverable-draft:v1:'+id
/** `onPending` reports whether a previous draft awaits the restore / keep choice, so a host can announce it. */
export function DraftTools({session,id,disabled,stop,onError,onPending}:{session:X5Session;id:string;disabled:boolean;stop:()=>void;onError:(s:string)=>void;onPending?:(pending:boolean)=>void}){const uiLanguage=useUiLanguage();
 useUpdateGuard(build=>{const snapshot=session.getSnapshot();if(snapshot.pending||snapshot.reading)return false;const state=session.serialize();validateSessionState(state);const raw=JSON.stringify({version:1,build,state});sessionStorage.setItem(updateSessionKey(id),raw);if(sessionStorage.getItem(updateSessionKey(id))!==raw)throw Error('Update checkpoint failed');return true})
 const key=x5DraftKey(id),[pending,setPending]=useState<string|null>(null),[status,setStatus]=useState(''),[enabled,setEnabled]=useState(true),original=useRef<string|null>(null),ready=useRef(false)
 useEffect(()=>{ready.current=false;try{original.current=localStorage.getItem(key);setPending(original.current);ready.current=true}catch(e){setStatus('Draft storage unavailable: '+String(e))}},[key])
 useEffect(()=>{if(!enabled||pending!==null||!ready.current)return;let timer:ReturnType<typeof setTimeout>|undefined,last=JSON.stringify(session.serialize()),disposed=false
 const save=()=>{if(disposed)return;try{const next=JSON.stringify(session.serialize());if(next===last)return;const recovery=saveRecoverableDraft(localStorage,key,next,validateSessionState,Date.now,original.current);original.current=next;last=next;setStatus(recovery?'Invalid previous draft backed up at '+recovery:'Draft saved locally · '+new Date().toLocaleTimeString())}catch(e){setStatus('Autosave stopped: '+String(e));setEnabled(false)}}
 const off=session.subscribe(()=>{clearTimeout(timer);timer=setTimeout(save,600)});return()=>{clearTimeout(timer);save();disposed=true;off()}
 },[session,key,enabled,pending])
 useEffect(()=>{onPending?.(pending!==null)},[pending,onPending])
 const choose=(restore:boolean)=>{try{if(disabled)throw Error('Editor busy or locked');if(restore){const state=validateSessionState(JSON.parse(pending!));stop();session.dispatch({type:'replace',state});setStatus('Saved draft restored locally · output disabled')}else{const next=JSON.stringify(session.serialize()),recovery=saveRecoverableDraft(localStorage,key,next,validateSessionState,Date.now,original.current);original.current=next;setStatus(recovery?'Previous invalid draft retained at '+recovery:'Current draft selected for autosave')}setPending(null);onError('')}catch(e){onError(String(e))}}
 return <div className="x5-draft-tools"><label><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>{uiTranslate("Autosave local draft",uiLanguage)}</label>{pending!==null&&<><span>{uiTranslate("Previous local draft available · preserved until you choose",uiLanguage)}</span><button disabled={disabled} onClick={()=>choose(true)}>{uiTranslate("Restore saved draft",uiLanguage)}</button><button disabled={disabled} onClick={()=>choose(false)}>{uiTranslate("Keep current draft",uiLanguage)}</button></>}<output role="status">{uiTranslate(status,uiLanguage)}</output></div>
}
