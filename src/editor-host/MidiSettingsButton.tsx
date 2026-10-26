import {translate as uiTranslate,useLanguage as useUiLanguage} from '../i18n'
import {Icon} from '../Icon'
import {translate,useLanguage} from '../i18n'

/** Beside the host's connection status: opens the editor's own MIDI settings, when its view offers them. */
export function MidiSettingsButton({open}:{open?:()=>void}){const uiLanguage=useUiLanguage();
  const language=useLanguage()
  if(!open)return null
  const label=translate('MIDI settings',language)
  return <button type="button" className="ew-icon midi-settings-button" title={uiTranslate(label,uiLanguage)} aria-label={uiTranslate(label,uiLanguage)} onClick={open}><Icon name="midi" /></button>
}
