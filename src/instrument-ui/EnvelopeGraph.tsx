import type {PointerEvent} from 'react'
export function EnvelopeGraph<Key extends number|string>({time,level,getValue,onChange,min,max=99,pitch=false,title,label,disabled,className='x5-envelope'}:{time:readonly Key[];level:readonly (Key|null)[];getValue:(id:Key)=>number;onChange:(id:Key,value:number)=>void;min:number;max?:number;pitch?:boolean;title:string;label:string;disabled:boolean;className?:string}){
 const get=(id:Key|null)=>id===null?0:getValue(id)
 const y=(v:number)=>132-(v-min)/(max-min)*112
 const rawWidths=time.map(id=>12+Math.max(0,Math.min(max,get(id)))*(.48*99/max)),scale=300/rawWidths.reduce((a,b)=>a+b,0)
 const xs=[24];for(const w of rawWidths)xs.push(xs.at(-1)!+w*scale)
 if(pitch)xs.splice(3,0,280)
 // Fixed hold segment separates sustain from key release; geometry visualizes normalized parameter values, not seconds.
 const points=level.map((id,i)=>[i===level.length-1?380:xs[i],y(get(id))])
 const move=(event:PointerEvent<SVGCircleElement>,index:number)=>{
  if(disabled||event.buttons!==1)return
  const svg=event.currentTarget.ownerSVGElement!,pt=svg.createSVGPoint();pt.x=event.clientX;pt.y=event.clientY;const matrix=svg.getScreenCTM();if(!matrix)return;const pos=pt.matrixTransform(matrix.inverse()),id=level[index]
  if(id!==null)onChange(id,Math.max(min,Math.min(max,Math.round(min+(132-pos.y)/112*(max-min)))))
  const t=time[Math.min(index-1,time.length-1)];if(index>0&&t!==undefined){const previous=points[index-1][0],value=Math.round(((pos.x-previous)/scale-12)/(.48*99/max));onChange(t,Math.max(0,Math.min(max,value)))}
 }
 return <div className={className}><div><strong>{title}</strong><small>Drag nodes · normalized time</small></div><svg viewBox="0 0 410 160" aria-label={label+' envelope'}>
 {[20,48,76,104,132].map(v=><path key={v} d={'M24 '+v+'H386'} stroke="currentColor" opacity=".1"/>)}<path d={'M24 '+y(0)+'H386'} stroke="currentColor" opacity=".35"/>
 <polyline points={points.map(p=>p.join(',')).join(' ')} fill="none" stroke="var(--x5-accent)" strokeWidth="2"/>
 {points.map(([x,y],i)=>level[i]===null?null:<circle key={i} cx={x} cy={y} r="5" tabIndex={disabled?-1:0} role="slider" aria-label={label+' envelope node '+i} aria-valuemin={min} aria-valuemax={max} aria-valuenow={get(level[i])} fill="var(--x5-accent)" onPointerDown={e=>{if(disabled)return;e.currentTarget.setPointerCapture(e.pointerId);move(e,i)}} onPointerMove={e=>move(e,i)} onKeyDown={e=>{if(disabled)return;const id=level[i];if(id!==null&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();onChange(id,Math.max(min,Math.min(max,get(id)+(e.key==='ArrowUp'?1:-1))))}}}/>)}
 <text x="24" y="153">Key on</text><text x="340" y="153">Release</text></svg></div>
}
