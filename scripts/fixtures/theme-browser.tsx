import {I18nContext} from '../../src/i18n'
import React,{StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {StandaloneEditorApp} from '../../src/editor-host/StandaloneEditorApp'
import {x5drView} from '../../src/editors/korg-x5dr/registration'
import {x5drModule} from '../../src/editors/korg-x5dr/module'
import {localAppearance,appearanceKey,normalizeAppearance} from '../../src/editors/korg-x5dr/appearance'
import {themeStorageKey} from '../../src/themes'
import '../../src/styles.css'
let requests=0;Object.defineProperty(navigator,'requestMIDIAccess',{configurable:true,value:()=>{requests++;return Promise.reject(Error('Physical MIDI forbidden by test'))}})
const id='page-theme-browser-20261025';for(const key of Object.keys(localStorage))if(key.includes(id))localStorage.removeItem(key)
localStorage.setItem('bcr-studio.last-instance.'+x5drModule.manifest.modelId,id)
localStorage.setItem('midi-studio:ai2:selected:'+id,'X5DR')
localStorage.setItem(themeStorageKey,'silver')
const installation={module:x5drModule,view:x5drView},root=createRoot(document.getElementById('root')!);root.render(<StrictMode><I18nContext.Provider value={{language:'fr',choice:'fr',setChoice(){}}}><StandaloneEditorApp installation={installation} automaticMidi={false}/></I18nContext.Provider></StrictMode>)
let count=0;const frame=()=>new Promise<void>(r=>{if(++count%100===0){setTimeout(r,25);return}const ch=new MessageChannel();ch.port1.onmessage=()=>{ch.port1.close();ch.port2.close();r()};ch.port2.postMessage(0)}),wait=async(fn:()=>unknown)=>{const until=performance.now()+15000;while(performance.now()<until){if(fn())return;await frame()}throw Error('Timeout: '+document.body.textContent?.slice(0,500))},assert=(v:unknown,s:string)=>{if(!v)throw Error(s)},change=async(el:HTMLSelectElement,value:string)=>{Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype,'value')!.set!.call(el,value);el.dispatchEvent(new Event('change',{bubbles:true}));await frame()},click=(s:string)=>{const b=[...document.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent?.trim()===s);if(!b)throw Error('Missing '+s);b.click()},rgb=(hex:string)=>'rgb('+[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)).join(', ')+')'
const report:any={time:new Date().toISOString(),hardware:false,pass:false,cases:[]}
try{
 await wait(()=>document.querySelector('.x5dr-editor')&&document.querySelector('.standalone-theme select option[value="porcelain"]'))
 assert(document.querySelector<HTMLSelectElement>('.standalone-theme select')!.value==='porcelain','Default is not porcelain');report.cases.push('New instance defaults to porcelain/cobalt')
 for(const theme of localAppearance.themes){
  const before=requests;await change(document.querySelector<HTMLSelectElement>('.standalone-theme select')!,theme.id)
  await wait(()=>document.querySelector('.x5dr-editor')?.getAttribute('data-local-theme')===theme.id&&getComputedStyle(document.body).backgroundColor===rgb(theme.colors.background))
  assert(getComputedStyle(document.documentElement).color===rgb(theme.colors.text),'Root text '+theme.id)
  assert(getComputedStyle(document.querySelector('.standalone-editor')!).backgroundColor===rgb(theme.colors.background),'Host background '+theme.id)
  assert(getComputedStyle(document.querySelector('.standalone-editor>header')!).color===rgb(theme.colors.text),'Header text '+theme.id)
  assert(requests===before,'Theme requested MIDI');report.cases.push('Whole-page '+theme.id)
 }
 click('⚙ Réglages');await wait(()=>document.querySelector('.x5-config-dialog[open]'));click('Apparence +');await frame();click('Porcelaine / Cobalt')
 await wait(()=>document.querySelector<HTMLSelectElement>('.standalone-theme select')!.value==='porcelain'&&getComputedStyle(document.body).backgroundColor===rgb(localAppearance.themes[1].colors.background))
 document.querySelector<HTMLButtonElement>('[aria-label="Fermer les réglages"]')!.click();click('Librairie');await wait(()=>document.querySelector('.x5-library[open]'));assert(getComputedStyle(document.querySelector('.x5-library')!).backgroundColor===rgb(localAppearance.themes[1].colors.background),'Library palette')
 report.cases.push('Editor palette updates global picker, body and library dialog');document.querySelector<HTMLButtonElement>('[aria-label="Close Program library"]')!.click()
 const saved=normalizeAppearance(JSON.parse(localStorage.getItem(appearanceKey(id))!));assert(saved.theme==='porcelain','Preference not saved')
 for(const model of ['05R/W','01/WproX','N264','X5DR']){await change(document.querySelector<HTMLSelectElement>('[aria-label="Modèle Korg AI²"]')!,model);await wait(()=>document.querySelector<HTMLSelectElement>('.standalone-theme select')?.value==='porcelain');assert(document.querySelector('.x5dr-editor')?.getAttribute('data-local-theme')==='porcelain','Palette lost on '+model);if(model!=='X5DR'){await wait(()=>document.querySelector('.ai2-workbench')?.getAttribute('aria-label')==='Éditeur Korg '+model);assert(!document.querySelector('.ai2-workbench .ai2-heading'),'Duplicate heading '+model);assert(!document.querySelector('.ai2-midi-dialog')?.hasAttribute('open'),'MIDI settings cover the facade');assert(!!document.querySelector('.ai2-workbench .x5-toolbar'),'Shared toolbar missing');if(model==='01/WproX'||model==='N264'){assert(document.querySelector('.ai2-panel-viewport')?.getAttribute('data-controls-zoom')==='true','Keyboard controls not zoomed by default')}}}report.cases.push('Shared porcelain palette across X5DR/05RW/01WproX/N264, same facade-first toolbar and default keyboard control crop')
 root.unmount();await frame();assert(!document.documentElement.style.getPropertyValue('--theme-bg'),'Page palette not released on unmount');report.cases.push('Persistence and page cleanup');report.pass=true
}catch(e){report.error=String(e);report.debug={body:getComputedStyle(document.body).backgroundColor,root:getComputedStyle(document.documentElement).getPropertyValue('--theme-bg'),host:getComputedStyle(document.querySelector('.standalone-editor')!).backgroundColor,theme:document.querySelector('.x5dr-editor')?.getAttribute('data-local-theme'),selected:document.querySelector<HTMLSelectElement>('.standalone-theme select')?.value,inline:document.documentElement.style.cssText}}
report.blockedNativeRequests=requests;document.getElementById('result')!.textContent=(report.pass?'PASS ':'FAIL ')+JSON.stringify(report,null,2);await fetch('/result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)})
