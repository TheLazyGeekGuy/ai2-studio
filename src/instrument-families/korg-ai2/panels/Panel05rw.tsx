import {useState} from 'react'
import type {Ai2Program} from '../codec'
import {programName} from '../codec'
import {combinationValue,isAi2Combination} from '../combination'
import {Panel05X5} from './Panel05X5'
export function Panel05rw({midiActivity=0,program,editing,combination=false,live=false,disabled,onEdit,onSection,onStep}:{midiActivity?:number;program?:Ai2Program;editing:boolean;combination?:boolean;live?:boolean;disabled:boolean;onEdit:()=>void;onSection:(s:string)=>void;onStep:(n:number)=>void}){
 const [half,setHalf]=useState(0),p=program,first=p?String(p.index).padStart(2,'0')+':'+programName(p):'05R/W',second=p&&isAi2Combination(p)?Array.from({length:4},(_,i)=>'A'+String(combinationValue(p,i+half*4,'program')).padStart(2,'0')).join(' '):editing?'PROGRAM EDIT':'PROGRAM'
 return <figure className="ai2-panel"><Panel05X5 midiActivity={midiActivity} model="05R/W" snapshot={{locked:disabled,reading:false,pending:0,identified:!!program,mode:combination?0:2,panelMode:combination?editing?1:0:editing?3:2,rxCount:0,txCount:0}} lines={[first.slice(0,16).padEnd(16),second.slice(0,16).padEnd(16)]} editEnabled={!!program} onKey={id=>{if(id==='combi')onSection('Combi');else if(id==='prog')onSection('Programmes');else if(id==='edit')onEdit();else if(id==='global')onSection('Multi');else if(id==='value-up')onStep(1);else if(id==='value-down')onStep(-1);else if(id==='cursor-next')onStep(10);else if(id==='cursor-prev')onStep(-10);else if(combination&&!editing)setHalf(v=>1-v);else onSection(id==='page-prev'?'OSC 1':'OSC 2')}}/><figcaption>05R/W · {live?'édition MIDI':'édition locale'}</figcaption></figure>
}
