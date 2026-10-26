import {ai2Model,ai2Models} from './models'
/** File compatibility is directional and never grants MIDI or acoustic equivalence. */
export function modelCompatibility(source:string,target:string){
 const a=ai2Model(source),b=ai2Model(target)
 if(source===target)return {level:'native' as const,label:'Même modèle',detail:'Structure conservée ; aucun changement de moteur.'}
 if(a.protocol===b.protocol&&a.rom===b.rom)return {level:'shared' as const,label:'Structure et catalogue communs',detail:'Program : disposition et références PCM communes. Révisions, effets et dépendances de Combi restent à vérifier.'}
 if(a.protocol===b.protocol)return {level:'partial' as const,label:'Structure commune · ROM différente',detail:'Program : adaptation des multisamples nécessaire. Les ressources absentes restent signalées.'}
 return {level:'partial' as const,label:'Conversion Program partielle',detail:'Template cible et correspondances orientées ; modulations, effets et kits peuvent être perdus. Aucune identité sonore promise.'}
}
export const modelVariants=Object.freeze([
 {from:'01/W',to:'01/Wfd',label:'Variante avec lecteur de disquette'},
 {from:'01/W',to:'01R/W',label:'Variante module'},
 {from:'01/W',to:'01/Wpro',label:'Variante 76 touches, ROM étendue'},
 {from:'01/Wpro',to:'01/WproX',label:'Variante 88 touches'},
 {from:'X3',to:'X2',label:'Variante 76 touches, multisample supplémentaire'},
 {from:'X3',to:'X3R',label:'Variante module'},
 {from:'X5',to:'X5D',label:'ROM étendue'},
 {from:'X5D',to:'X5DR',label:'Variante module'},
 {from:'N364',to:'N264',label:'Variante 76 touches'},
 {from:'NS5R',to:'NX5R',label:'Module avec moteur XG additionnel ; seul le moteur AI² est couvert'},
 {from:'N5',to:'N5EX',label:'Version étendue'},
 {from:'N1',to:'N1R',label:'Variante module'},
].map(r=>Object.freeze(r)))
export const modelFamilies=Object.freeze([...new Set(ai2Models.map(m=>m.protocol))])
