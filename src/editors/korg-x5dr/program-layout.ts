/** Program pages of the X5DR editor and their aligned-column plan (validated mockup of 24/10/2026). Common gathers
 * the former Overview's Common group and the former Modulation page; each oscillator reads Source / VDF / VDA on the
 * first row, Color + Pitch MG / VDF EG / VDA EG on the second, and the VDF / VDA keyboard and velocity switches on the
 * third, under their own column. */
export const programTabs=['Common','OSC 1','OSC 2','Effects'] as const
export type ProgramTab=typeof programTabs[number]
export const programTabLabels:Readonly<Record<ProgramTab,string>>={Common:'Commun','OSC 1':'OSC 1','OSC 2':'OSC 2',Effects:'Effets'}
export const isProgramTab=(tab:string):tab is ProgramTab=>(programTabs as readonly string[]).includes(tab)
export function programTabOf(group:string):ProgramTab{
 if(group.startsWith('OSC 1'))return 'OSC 1'
 if(group.startsWith('OSC 2'))return 'OSC 2'
 if(group==='Effects'||group.startsWith('FX '))return 'Effects'
 return 'Common'
}
export interface ProgramCell {col:1|2|3;row:1|2|3;groups:readonly string[]}
function plan(tab:ProgramTab):ProgramCell[]{
 if(tab==='Common')return [{col:1,row:1,groups:['Common','Joystick']},{col:2,row:1,groups:['Pitch EG']},{col:3,row:1,groups:['Cutoff MG','Aftertouch']}]
 if(tab==='Effects')return []
 const g=tab
 return [{col:1,row:1,groups:[g]},{col:2,row:1,groups:[g+' VDF']},{col:3,row:1,groups:[g+' VDA']},{col:1,row:2,groups:[g+' Color',g+' Pitch MG']},{col:2,row:2,groups:[g+' VDF EG']},{col:3,row:2,groups:[g+' VDA EG']},
  {col:2,row:3,groups:[g+' VDF keyboard switches',g+' VDF velocity switches']},{col:3,row:3,groups:[g+' VDA keyboard switches',g+' VDA velocity switches']}]
}
/** Cells holding exactly the given groups of `tab`, each once: planned groups in plan order, any group the plan does
 * not know appended to the first cell's column so no parameter is ever hidden. Effects keeps the flat list (empty). */
export function programCells(tab:ProgramTab,groups:readonly string[]):ProgramCell[]{
 const present=groups.filter(g=>programTabOf(g)===tab),cells=plan(tab).map(c=>({...c,groups:c.groups.filter(g=>present.includes(g))}))
 if(!cells.length)return []
 const placed=new Set(cells.flatMap(c=>c.groups)),rest=present.filter(g=>!placed.has(g))
 if(rest.length){const last=cells.filter(c=>c.col===(tab==='Common'?3:1)).at(-1)!;last.groups=[...last.groups,...rest]}
 return cells.filter(c=>c.groups.length)
}
