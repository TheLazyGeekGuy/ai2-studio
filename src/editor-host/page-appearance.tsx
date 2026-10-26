import {createContext,useContext,useLayoutEffect,useRef} from 'react'
import type {LocalTheme} from './local-appearance'

export interface PageAppearance {
 theme:string
 themes:readonly LocalTheme[]
 style:Record<string,string>
 select:(theme:string)=>void
}
/** The active editor may supply the page palette; other modules retain host themes. */
export const PageAppearanceContext=createContext<((value:PageAppearance|null)=>void)|null>(null)
export function usePageAppearance(value:PageAppearance,active:boolean){
 const publish=useContext(PageAppearanceContext),latest=useRef(value);latest.current=value
 const signature=JSON.stringify(value.style)
 useLayoutEffect(()=>{
  if(!publish||!active)return
  publish({...latest.current,select:theme=>latest.current.select(theme)})
  return()=>publish(null)
 },[publish,active,value.theme,value.themes,signature])
}
/** Own only the properties we set, restoring the previous page on unmount. */
export function useDocumentAppearance(style:Record<string,string>|undefined){
 const signature=JSON.stringify(style)
 useLayoutEffect(()=>{
  if(!style)return
  const root=document.documentElement,saved=Object.keys(style).map(key=>{const name=key==='colorScheme'?'color-scheme':key;return {name,value:root.style.getPropertyValue(name),priority:root.style.getPropertyPriority(name)}})
  for(const [key,value]of Object.entries(style))root.style.setProperty(key==='colorScheme'?'color-scheme':key,value)
  return()=>{for(const p of saved)if(p.value)root.style.setProperty(p.name,p.value,p.priority);else root.style.removeProperty(p.name)}
 },[signature])
}
