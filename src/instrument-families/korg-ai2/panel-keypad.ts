export interface PanelKeypad {entry:string;hold:boolean}
export function panelKeypad(state:PanelKeypad,command:string,current:number|null,maximum=100):PanelKeypad&{slot?:number}{
 if(command==='hold')return {entry:'',hold:!state.hold}
 if(command==='enter'){if(!state.entry)return state;const slot=Number(state.entry);if(slot>=maximum)throw Error('Numéro de preset hors banque');return {...state,entry:'',slot}}
 if(!/^digit:[0-9]$/.test(command))return state
 const digit=Number(command.slice(-1));if(state.hold){if(current===null)throw Error('Choisir d’abord un numéro avant 10’s Hold');const slot=Math.floor(current/10)*10+digit;if(slot>=maximum)throw Error('Numéro hors banque');return {...state,entry:'',slot}}
 const count=maximum>100?3:2,entry=(state.entry.length>=count?'':state.entry)+digit;if(entry.length===count){const slot=Number(entry);if(slot>=maximum)throw Error('Numéro hors banque');return {...state,entry:'',slot}}return {...state,entry}
}
