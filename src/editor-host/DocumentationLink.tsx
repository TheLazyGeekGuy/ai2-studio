import {translate as uiTranslate,useLanguage as useUiLanguage} from '../i18n'
import {createContext,useContext} from 'react'

/** Instance-local manual action; other hosts retain the static documentation portal. */
const DocumentationContext=createContext<(()=>void)|undefined>(undefined)
export const DocumentationProvider=DocumentationContext.Provider
export function DocumentationLink(){const uiLanguage=useUiLanguage();
 const open=useContext(DocumentationContext)
 return open?<button className="documentation-link" onClick={open}>{uiTranslate("Documentation",uiLanguage)}</button>:<a className="documentation-link" href="./docs/" target="_blank" rel="noopener noreferrer">{uiTranslate("Documentation",uiLanguage)}</a>
}
