import {translate as uiTranslate,useLanguage as useUiLanguage} from './i18n'
import {useSyncExternalStore} from 'react'
import {getAppUpdate,subscribeAppUpdate,retryAppUpdate} from './app-update-client'
export function AppUpdateStatus(){const uiLanguage=useUiLanguage();const state=useSyncExternalStore(subscribeAppUpdate,getAppUpdate,getAppUpdate);return state.phase==='idle'?null:<span className="app-update-status" role="status">{uiTranslate(state.message,uiLanguage)}{state.phase==='error'&&<button onClick={retryAppUpdate}>{uiTranslate("Réessayer",uiLanguage)}</button>}</span>}
