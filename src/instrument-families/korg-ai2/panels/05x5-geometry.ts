/** Front-plane coordinates; Polynominal 1295×522 image, quadrilateral
 * (38,309) (1274,306) (1260,511) (43,517), normalized to 1240×216.
 * Manual E1 p.iii is the authority for legends/control meaning.
 */
export const panelGeometry=Object.freeze({width:1240,height:216,lcd:{x:229,y:51,width:340,height:89},volume:{x:64,y:58,r:26},phones:{x:64,y:145,r:18},power:{x:1156,y:150,width:88,height:38},midi:{x:650,y:95},modeLeds:[{x:711,y:14},{x:784,y:12}]})
export type PanelKey='combi'|'prog'|'page-next'|'cursor-next'|'value-up'|'edit'|'global'|'page-prev'|'cursor-prev'|'value-down'
export const panelKeys:readonly {id:PanelKey;x:number;y:number;label:string;secondary?:string;blue?:boolean}[]=Object.freeze([
 {id:'combi',x:741,y:35,label:'COMBI'}, {id:'prog',x:811,y:35,label:'PROG'},
 {id:'page-next',x:882,y:35,label:'BANK',secondary:'PAGE+'},
 {id:'cursor-next',x:952,y:35,label:'+10',secondary:'▶'}, {id:'value-up',x:1023,y:35,label:'+1',secondary:'▲'},
 {id:'edit',x:741,y:144,label:'EDIT',blue:true}, {id:'global',x:811,y:144,label:'GLOBAL',secondary:'MULTI',blue:true},
 {id:'page-prev',x:882,y:144,label:'PAGE−',blue:true},
 {id:'cursor-prev',x:952,y:144,label:'◀',secondary:'−10',blue:true}, {id:'value-down',x:1023,y:144,label:'▼',secondary:'−1',blue:true},
])
export const keyWidth=54,keyHeight=20
