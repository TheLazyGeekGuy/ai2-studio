import {useEffect,useMemo,useRef,useState} from 'react'
import type {EditorViewContext} from '../../editor-host/view-contract'
import {openMidiBinding} from '../../editor-host/open-midi-binding'
import {PerformanceInputs} from '../../editor-host/PerformanceInputs'
import {usePerformanceInputs} from '../../editor-host/use-performance-inputs'
import {ai2MidiPair,ai2MidiPreferences,resolveMidiChoice} from './midi-discovery'

/** Family transport and performance only. File codecs do not grant a hardware edit driver. */
export function Ai2MidiConnection({context,model,active,locked,portsRevision}:{context:EditorViewContext;model:string;active:boolean;locked:boolean;portsRevision:number}){
 const prefs=useMemo(()=>{let storage:Storage|undefined;try{storage=localStorage}catch{}return ai2MidiPreferences(storage,'midi-studio:ai2:midi:v1:'+context.id+':'+model)},[context.id,model])
 const [automatic,setAutomatic]=useState(prefs.get().enabled),[channel,setChannel]=useState(prefs.get().channel),[input,setInput]=useState(''),[output,setOutput]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState(''),[link,setLink]=useState(context.lease.getState)
 const pending=useRef<AbortController|null>(null),alive=useRef(false),performance=usePerformanceInputs(context)
 useEffect(()=>{alive.current=true;const off=context.lease.onState(setLink);return()=>{alive.current=false;pending.current?.abort();performance.stop();off()}},[context,performance])
 const remember=(inputId:string,outputId:string)=>{const i=context.access.inputs.get(inputId),o=context.access.outputs.get(outputId);if(i&&o)prefs.update({input:{id:i.id,name:i.name??''},output:{id:o.id,name:o.name??''},channel})}
 useEffect(()=>{if(!active||locked){performance.stop();setBusy(false);return}const i=resolveMidiChoice(context.access.inputs,prefs.get().input,()=>true),o=resolveMidiChoice(context.access.outputs,prefs.get().output,()=>true);if(i)setInput(i.id);if(o)setOutput(o.id)
  if(!automatic||context.lease.getState().connected){setBusy(false);return}
  const pair=ai2MidiPair(context.access,model,(d,id)=>context.broker.available(d,id,context.id),prefs.get())
  if(!pair){setStatus(context.access.sysexEnabled?'Aucune paire '+model+' unique disponible · choisir les ports':'Autoriser MIDI pour retrouver les ports');return}
  let live=true;const controller=new AbortController();pending.current=controller;setBusy(true);setStatus('Connexion automatique '+model+'…')
  void openMidiBinding(context.lease,context.access,pair,controller.signal).then(()=>{if(!live)return;setInput(pair.inputId);setOutput(pair.outputId);remember(pair.inputId,pair.outputId);setStatus('Route '+model+' connectée · édition des fichiers locale')}).catch(e=>{if(live)setStatus(String(e))}).finally(()=>{if(live)setBusy(false);if(pending.current===controller)pending.current=null})
  return()=>{live=false;controller.abort()}
 },[context,model,prefs,active,locked,automatic,portsRevision])
 return <section className="ai2-midi-connection" aria-label={'Connexion MIDI '+model}><h3>MIDI · {model}</h3><div className="ai2-toolbar">
  <label><input type="checkbox" checked={automatic} onChange={e=>{setAutomatic(e.target.checked);prefs.update({enabled:e.target.checked})}}/>Connexion automatique</label>
  <button disabled={busy} onClick={()=>void context.request().catch(e=>setStatus(String(e)))}>Autoriser / actualiser MIDI</button>
  <label>Entrée<select aria-label={'Entrée MIDI '+model} value={input} disabled={busy} onChange={e=>setInput(e.target.value)}><option value="">Choisir…</option>{[...context.access.inputs.values()].filter(p=>p.state==='connected').map(p=><option key={p.id} value={p.id}>{p.name||p.id}</option>)}</select></label>
  <label>Sortie<select aria-label={'Sortie MIDI '+model} value={output} disabled={busy} onChange={e=>setOutput(e.target.value)}><option value="">Choisir…</option>{[...context.access.outputs.values()].filter(p=>p.state==='connected').map(p=><option key={p.id} value={p.id}>{p.name||p.id}</option>)}</select></label>
  <label>Canal<input aria-label={'Canal MIDI '+model} type="number" min="1" max="16" disabled={busy} value={channel} onChange={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=1&&n<=16){setChannel(n);prefs.update({channel:n})}}}/></label>
  <button disabled={busy||locked||!active||!input||!output} onClick={()=>{pending.current?.abort();const controller=new AbortController();pending.current=controller;setBusy(true);performance.stop();void openMidiBinding(context.lease,context.access,{inputId:input,outputId:output},controller.signal).then(()=>{remember(input,output);if(alive.current)setStatus('Route '+model+' connectée')}).catch(e=>{if(alive.current)setStatus(String(e))}).finally(()=>{if(alive.current)setBusy(false)})}}>Connecter</button>
  <button disabled={!link.connected&&!busy} onClick={()=>{setAutomatic(false);prefs.update({enabled:false});pending.current?.abort();performance.stop();context.lease.release()}}>Déconnecter</button>
 </div><p role="status">{status}</p><small>Transport clavier/contrôleur disponible. Lecture SysEx et édition matérielle de ce modèle non activées ; l’édition des presets reste locale.</small>
 <PerformanceInputs routing={performance} access={context.access} lease={context.lease} disabled={!active||locked||!link.connected} channel={channel} portsRevision={portsRevision} instrumentLabel={model} preferenceKey={'midi-studio:ai2:performance:v1:'+context.id+':'+model}/></section>
}
