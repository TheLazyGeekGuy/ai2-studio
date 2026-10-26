import type {ReactNode} from 'react'
import type {X5Snapshot} from './module'
import type {PanelKey} from './geometry'
import {Panel05X5} from '../../instrument-families/korg-ai2/panels/Panel05X5'
import {screenLines} from './screen'
export function Panel(props:{midiActivity?:number;snapshot:X5Snapshot;onKey?:(id:PanelKey)=>void;editEnabled?:boolean;interactive?:boolean;patchNumber?:ReactNode}){return <Panel05X5 {...props} lines={screenLines(props.snapshot)}/>}
