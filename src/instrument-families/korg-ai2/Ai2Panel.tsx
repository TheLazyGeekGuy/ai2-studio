import {translate as uiTranslate,useLanguage as useUiLanguage} from '../../i18n'
import {PanelViewport} from '../../instrument-ui/PanelViewport'
import type {Ai2Lcd} from './lcd-bitmap'
import type {Ai2Model} from './models'
import type {Ai2Program} from './codec'
import {Panel05rw} from './panels/Panel05rw'
import {NativePanel} from './panels/NativePanel'
import {nativePanelInventories} from './panels/native-inventory'
import {Panel01w} from './panels/Panel01w'
import {PanelNS5R} from './panels/PanelNS5R'
import {Panel03rw} from './panels/Panel03rw'
type PanelProps={midiActivity?:number;controlsOnly?:boolean;lcd?:Ai2Lcd;model:Ai2Model;program?:Ai2Program;editing:boolean;onEdit:()=>void;onStep:(n:number)=>void;onSection:(s:string)=>void;onCommand?:(id:string)=>void;disabled:boolean;combination?:boolean;live?:boolean}
function PanelBody(props:PanelProps){const uiLanguage=useUiLanguage();
 const {model,onSection,onEdit,onStep}=props,inventory=nativePanelInventories[model.id]
 if(model.id==='05R/W')return <Panel05rw {...props}/>
 if(inventory)return <NativePanel {...props} inventory={inventory} combination={!!props.combination}/>
 if(['01/W','01/Wfd','01/Wpro','01/WproX'].includes(model.id))return <Panel01w {...props} model={model.id} onControl={id=>{if(id.startsWith('number-'))props.onCommand?.('digit:'+id.slice(7));else if(id==='hold')props.onCommand?.('hold');else if(id==='seq')onSection('Multi');else if(id==='global')onSection('Global');else if(id==='edit-combi')onSection('Edit Combi');else if(id==='edit')onEdit();else if(id==='combi')onSection('Combi');else if(id==='prog')onSection('Programmes');else if(id==='value-up'||id==='cursor-next')onStep(1);else if(id==='value-down'||id==='cursor-prev')onStep(-1);else onSection(id==='page-prev'?'OSC 1':'OSC 2')}}/>
 if(['NS5R','NX5R'].includes(model.id))return <PanelNS5R {...props} model={model.id}/>
 if(model.id==='03R/W')return <Panel03rw {...props}/>
 return <p>{uiTranslate("La façade X5DR est fournie par son éditeur natif.",uiLanguage)}</p>
}

export function Ai2Panel(props:PanelProps){return <PanelViewport keyboard={!!props.model.keys}>{controlsOnly=><PanelBody {...props} controlsOnly={controlsOnly}/>}</PanelViewport>}
