import {useId,type ReactNode} from 'react'
import type {X5Snapshot} from './module'
import {panelGeometry as g,panelKeys,keyWidth,keyHeight,type PanelKey} from './geometry'
import {screenLines,screenPath} from './screen'
const keyNames:Record<PanelKey,string>={combi:'COMBI · Combination Play / sound selection',prog:'PROG · Program Play (Single)',edit:'EDIT · Edit current Program or Combination',global:'GLOBAL/MULTI · Local Multi, Drums and Global editors','page-next':'BANK/PAGE+ · Next parameter page','page-prev':'PAGE− · Previous parameter page','cursor-next':'+10/▶ · Next parameter','cursor-prev':'−10/◀ · Previous parameter','value-up':'+1/▲ · Increase selected value','value-down':'−1/▼ · Decrease selected value'}
export function Panel({snapshot,onKey,editEnabled=false,interactive=true,patchNumber}:{snapshot:X5Snapshot;onKey?:(id:PanelKey)=>void;editEnabled?:boolean;interactive?:boolean;patchNumber?:ReactNode}){
 const uid='x5-'+useId().replace(/:/g,''),busy=snapshot.locked||snapshot.reading,lines=screenLines(snapshot)
 return <svg xmlns="http://www.w3.org/2000/svg" className="x5dr-panel" viewBox={`0 0 ${g.width} ${g.height}`} role="group" aria-label="Korg X5DR front panel" data-panel-width={g.width}>
 <title>KORG X5DR · Program editor front panel</title><desc>Native vector reconstruction. The LCD projects the current editor draft. Volume, phones and power are physical hardware controls.</desc>
 <defs>
  <linearGradient id={uid+'metal'} x2="0" y2="1"><stop stopColor="#303335"/><stop offset=".22" stopColor="#25282a"/><stop offset=".64" stopColor="#202325"/><stop offset="1" stopColor="#303234"/></linearGradient>
  <linearGradient id={uid+'edge'} x2="0" y2="1"><stop stopColor="#696b6b"/><stop offset=".18" stopColor="#202326"/><stop offset=".8" stopColor="#111417"/><stop offset="1" stopColor="#505352"/></linearGradient>
  <linearGradient id={uid+'glass'} x2="0" y2="1"><stop stopColor="#151a1b"/><stop offset=".5" stopColor="#0c1012"/><stop offset="1" stopColor="#262e30"/></linearGradient>
  <linearGradient id={uid+'key'} x2="0" y2="1"><stop stopColor="#666a6a"/><stop offset=".24" stopColor="#343a3c"/><stop offset=".6" stopColor="#181d20"/><stop offset="1" stopColor="#424748"/></linearGradient>
  <radialGradient id={uid+'knob'} cx=".35" cy=".25"><stop stopColor="#535859"/><stop offset=".65" stopColor="#23292a"/><stop offset="1" stopColor="#080c0e"/></radialGradient>
  <linearGradient id={uid+'lcd'} x2="0" y2="1"><stop stopColor="#55bfe9"/><stop offset=".25" stopColor="#83d9f2"/><stop offset="1" stopColor="#4abde8"/></linearGradient>
 </defs>
 <g className="x5-chassis" aria-hidden="true">
  <rect x="1" y="1" width="1238" height="214" rx="16" fill={`url(#${uid}edge)`} stroke="#5a5f60" strokeWidth="1.5"/>
  <rect x="3" y="12" width="1234" height="193" rx="10" fill={`url(#${uid}metal)`}/>
  <path d="M10 13H1230M12 203H1228" stroke="#838888" opacity=".35"/><path d="M4 100H1236" stroke="#0a0d0f" strokeWidth="3"/><path d="M4 103H1236" stroke="#575b5a" opacity=".35"/>
  <path d="M127 48Q391 4 672 47Q683 49 685 63V156Q683 169 670 172Q392 215 128 173Q117 171 116 157V65Q116 52 127 48Z" fill={`url(#${uid}glass)`} stroke="#838782" strokeWidth="2.4"/>
  <path d="M127 51Q393 9 672 50" stroke="#a8aaa0" opacity=".4" fill="none"/>
  <rect x={g.lcd.x-5} y={g.lcd.y-5} width={g.lcd.width+10} height={g.lcd.height+10} rx="2" fill="#080d0c" stroke="#3b4239"/>
 </g>
 <g className="x5-silkscreen" aria-hidden="true" fill="#d1d4cd" fontFamily="Arial, sans-serif">
  <text x="64" y="19" textAnchor="middle" fontSize="11">VOLUME</text><text x="64" y="111" textAnchor="middle" fontSize="11">PHONES</text>
  <text x="34" y="88" fontSize="9" fill="#aab8d2">0</text><text x="87" y="88" fontSize="9" fill="#aab8d2">10</text>
  <path d="M36 79Q63 96 91 79" stroke="#aab8d2" strokeWidth=".7" fill="none"/>
  <text x="171" y="85" textAnchor="middle" fontSize="8" letterSpacing=".7">GENERAL</text><text x="171" y="109" textAnchor="middle" fontSize="24" fontWeight="900" letterSpacing="-3">MIDI</text><path d="M149 113H194V92M149 92V113" fill="none" stroke="#c8cec5" strokeWidth="1"/>
  <text x="611" y="99" fontSize="10" fontWeight="700">MIDI</text>
  <text x="1198" y="70" textAnchor="end" fontSize="37" fontStyle="italic" letterSpacing="-2">X5DR</text>
  <path d="M1084 81H1198V90H1084Z" fill="#c8cecc"/><path d="M1172 81H1198V90H1172Z" fill="#a4b9e3"/>
  <text x={g.power.x} y="120" textAnchor="middle" fontSize="11">POWER</text>
 </g>
 <g aria-hidden="true"><circle cx={g.volume.x} cy={g.volume.y} r={g.volume.r+2} fill="#111719" stroke="#485051"/>
  {Array.from({length:16},(_,i)=><path key={i} d={`M${g.volume.x-2} ${g.volume.y-25}h4v5h-4Z`} transform={`rotate(${i*22.5} ${g.volume.x} ${g.volume.y})`} fill="#52595b"/>)}
  <circle cx={g.volume.x} cy={g.volume.y} r="22" fill={`url(#${uid}knob)`}/><path d={`M${g.volume.x} ${g.volume.y-17}v10`} stroke="#bec5c4" strokeWidth="2.4" strokeLinecap="round"/>
  <circle cx={g.phones.x} cy={g.phones.y} r="20" fill="#303738" stroke="#171d20"/><circle cx={g.phones.x} cy={g.phones.y} r="14" fill="#101719" stroke="#747c7b" strokeWidth="2"/><circle cx={g.phones.x} cy={g.phones.y} r="8" fill="#020708"/>
  <rect x={g.power.x-g.power.width/2} y={g.power.y-g.power.height/2} width={g.power.width} height={g.power.height} rx="18" fill="#080c0e" stroke="#555f60" strokeWidth="1.5"/><rect x={g.power.x-36} y={g.power.y-12} width="72" height="24" rx="12" fill={`url(#${uid}key)`}/><rect x={g.power.x-12} y={g.power.y-9} width="24" height="19" rx="4" fill="#202628"/>
  {g.modeLeds.map(({x,y},i)=><g key={x}><rect x={x-4} y={y-6} width="8" height="13" rx="3" fill="#0e1213" stroke="#454c4b"/><rect x={x-2} y={y-4} width="4" height="9" rx="2" fill={snapshot.identified&&((i===0&&[0,1].includes(snapshot.mode??-1))||(i===1&&[2,3].includes(snapshot.mode??-1)))?'#ee5d4b':'#543d3a'}/></g>)}
  <rect x={g.midi.x-3} y={g.midi.y-3} width="6" height="7" fill="#252f28" stroke="#636e5a"/><rect key={snapshot.rxCount+':'+snapshot.txCount} x={g.midi.x-2} y={g.midi.y-2} width="4" height="5" className={snapshot.rxCount+snapshot.txCount?'x5-midi-flash':''} fill="#b8ce78" opacity="0"/>
 </g>
 <g role="img" aria-label={`LCD projection: ${lines[0].trim()}, ${lines[1].trim()}`}>
  <rect {...{x:g.lcd.x,y:g.lcd.y,width:g.lcd.width,height:g.lcd.height}} fill={`url(#${uid}lcd)`}/>
  <svg x={g.lcd.x} y={g.lcd.y} width={g.lcd.width} height={g.lcd.height} viewBox="0 0 320 80" preserveAspectRatio="none"><path d={screenPath(lines)} fill="#1d5778"/></svg>
 </g>
 {interactive&&patchNumber&&(snapshot.panelMode===0||snapshot.panelMode===2)&&<foreignObject x={g.lcd.x+6} y={g.lcd.y+8} width="95" height="30">{patchNumber}</foreignObject>}
 {panelKeys.map(k=>{const unavailable=false,disabled=unavailable||busy||snapshot.pending>0||(k.id==='edit'&&!editEnabled)||(snapshot.panelMode===2&&k.id==='page-prev'),upper=k.y<100,labelY=upper?74:113;return <g key={k.id} className="x5-key" data-key={k.id}>
  <g aria-hidden="true"><rect x={k.x-keyWidth/2-3} y={k.y-3} width={keyWidth+6} height={keyHeight+6} rx="12" fill="#080d10" stroke="#41494b"/><rect className="x5-key-cap" x={k.x-keyWidth/2} y={k.y} width={keyWidth} height={keyHeight} rx="9" fill={`url(#${uid}key)`}/><path d={`M${k.x-19} ${k.y+4}h38`} stroke="#858c8b" opacity=".45"/>
   <text x={k.x} y={labelY} textAnchor="middle" fill={k.blue?'#a1b5dc':'#d0d3cc'} fontFamily="Arial, sans-serif" fontSize="11" fontWeight={k.blue?'700':'400'}>{k.label}</text>
   {k.secondary&&<text x={k.x} y={labelY+14} textAnchor="middle" fill={upper?'#a1b5dc':k.blue&&k.id==='global'?'#a1b5dc':'#c4c9c5'} fontFamily="Arial, sans-serif" fontSize="11" fontWeight={k.id==='page-next'||k.id==='global'?'700':'400'}>{k.secondary}</text>}
  </g>
  {interactive&&<foreignObject x={k.x-31} y={k.y-9} width="62" height="40"><button className="x5-panel-hit" aria-label={snapshot.panelMode===0||snapshot.panelMode===2?({'cursor-next':'+10 · Next ten patches','cursor-prev':'−10 · Previous ten patches','value-up':'+1 · Next patch','value-down':'−1 · Previous patch','page-next':snapshot.panelMode===0?'PAGE+ · Timbres suivants · 4 par page':'BANK · Select Program bank','page-prev':'PAGE− · Timbres précédents · 4 par page'} as Partial<Record<PanelKey,string>>)[k.id]??keyNames[k.id]:keyNames[k.id]} title={snapshot.panelMode===0||snapshot.panelMode===2?({'cursor-next':'+10 · Next ten patches','cursor-prev':'−10 · Previous ten patches','value-up':'+1 · Next patch','value-down':'−1 · Previous patch','page-next':snapshot.panelMode===0?'PAGE+ · Timbres suivants · 4 par page':'BANK · Select Program bank','page-prev':'PAGE− · Timbres précédents · 4 par page'} as Partial<Record<PanelKey,string>>)[k.id]??keyNames[k.id]:keyNames[k.id]} disabled={disabled} onClick={e=>{e.currentTarget.focus();onKey?.(k.id)}} onKeyDown={e=>{const id=({ArrowUp:'value-up',ArrowDown:'value-down',ArrowRight:'cursor-next',ArrowLeft:'cursor-prev'} as const)[e.key as 'ArrowUp'];if(id){e.preventDefault();onKey?.(id)}}}/></foreignObject>}
 </g>})}
 </svg>
}
