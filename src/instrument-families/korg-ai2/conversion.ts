import {writeOscillatorReference,writeOscillatorOctave} from './oscillators'
import {ai2Definition} from './definition'
import {ai2Model,type ResourceRules} from './models'
import {validateProgram,type Ai2Program} from './codec'
import {oscillatorInfo,semanticFields,readField,writeField,signed8} from './parameters'
export interface ConversionEvent {field:string;status:string;source?:unknown;target?:unknown;detail:string}
export interface ConversionResult {program:Ai2Program;source:Ai2Program;events:readonly ConversionEvent[];status:'STRUCTURE_PRESERVEE'|'PARTIEL_ADAPTE'|'PARTIEL_PARAMETRES_MANQUANTS';hardwareValidated:false;pcmIdentityClaimed:false}
export interface ConversionOptions {approximateScales?:boolean;adaptEmphasis?:boolean;recoverAux?:boolean}
const old=(id:string)=>ai2Definition(id).layout.legacy
const maxResources=(id:string)=>ai2Model(id).multisamples

/** All conversions are offline. No transport, store command or implicit template. */
export function convertProgram(source:Ai2Program,template:Ai2Program,rules:ResourceRules,options:ConversionOptions={}):ConversionResult{
 const s=validateProgram(source),t=validateProgram(template),sm=ai2Model(s.model),tm=ai2Model(t.model),events:ConversionEvent[]=[],same=s.model===t.model,sameLayout=sm.protocol===tm.protocol
 if(same)return {program:validateProgram({...s,channel:t.channel,original:[]}),source:s,events:[{field:'program',status:'STRUCTURE_PRESERVEE',detail:'Données décodées conservées octet pour octet ; canal cible explicite.'}],status:'STRUCTURE_PRESERVEE',hardwareValidated:false,pcmIdentityClaimed:false}
 const newRoute=sm.protocol==='NS5R'&&tm.protocol==='N5'||sm.protocol==='N5'&&tm.protocol==='NS5R'
 const priorRoute=['01W','03RW'].includes(sm.protocol)&&['X5','X3'].includes(tm.protocol)
 const log=(field:string,status:string,from:unknown,to:unknown,detail:string)=>events.push({field,status,source:from,target:to,detail})
 if(s.data[10]>2||sm.protocol==='NS5R'&&s.data[10]>1)throw Error('Mode source inconnu')
 if(s.data[10]===2&&!same)throw Error('Programme Drums : convertir et lier le kit avant une conversion intermodèle')
 // Same layout preserves the source's opaque bytes. Cross-layout conversion starts
 // with an explicit target template; unimplemented fields remain valid target data.
 const data=[...(sameLayout?s.data:t.data)];data.splice(0,10,...s.data.slice(0,10));data[10]=s.data[10]
 if(!sameLayout&&!priorRoute&&!newRoute){
  const from=new Map(semanticFields(sm).map(f=>[f.key,f])),written=new Set<number>()
  for(const f of semanticFields(tm)){
   if(f.key.endsWith('.coarse')||f.key.endsWith('.fine'))continue // Physical tuning units are handled below, without normalized scaling.
   const sf=from.get(f.key);if(!sf){log(f.key,'REPLI_TEMPLATE',null,readField(t,f),'Paramètre sans adaptateur source ; template conservé.');continue}
   const v=readField(s,sf);if(v<sf.min||v>sf.max){log(f.key,'NON_RESOLU',v,readField(t,f),'Valeur source hors domaine documenté ; template conservé.');continue}
   if(written.has(f.offset)){if(data[f.offset]!==((v)&255))log(f.key,'MANQUANT',v,data[f.offset],'Deux paramètres source convergent vers un paramètre commun ; OSC1 retenu.');continue}
   if(f.unit!==sf.unit){log(f.key,'REPLI_TEMPLATE',v,readField(t,f),'Courbe de temps/fréquence non établie ; aucune mise à l’échelle uniforme.');continue}
   let value=v,status='COPIE_SEMANTIQUE'
   if(sf.min!==f.min||sf.max!==f.max){
    if(!options.approximateScales){log(f.key,'REPLI_TEMPLATE',v,readField(t,f),'Domaines différents. Adaptation numérique approximative disponible, désactivée.');continue}
    value=Math.round(v>=0?v*f.max/sf.max:sf.min<0&&f.min<0?v*f.min/sf.min:v)
    const unclipped=value;value=Math.max(f.min,Math.min(f.max,value));status=unclipped!==value?'SATURATION':'APPROXIMATION'
   }
   if(value<f.min||value>f.max){log(f.key,'REPLI_TEMPLATE',v,readField(t,f),'Valeur non représentable ; template conservé.');continue}
   writeField(data,f,value);written.add(f.offset);log(f.key,status,v,value,status==='COPIE_SEMANTIQUE'?'Champ documenté commun ; identité acoustique non prouvée.':'Échelle numérique seulement ; courbe DSP non prouvée.')
  }
  log('effects','DEPENDANCE',old(s.model)?s.data.slice(sm.protocol==='01W'?143:135):s.data.slice(11,sm.protocol==='N5'?13:14),old(t.model)?t.data.slice(tm.protocol==='01W'?143:135):t.data.slice(11,tm.protocol==='N5'?13:14),'Effets ou références d’effets du template conservés ; dépendances non allouées.')
  log('unmapped-controls','MANQUANT',null,null,'Modulations, routages, contrôleurs et blocs non couverts restent ceux du template. Original source joint au rapport.')
 }
 // Exact port of the documented prior 01W/03RW→X5 recovery branch. This branch
 // keeps its opt-in Emphasis approximation separate from general scaling.
 if(priorRoute){
  log('core_osc_vdf_vda','COPIE_STRUCTURELLE',null,null,'Port du chemin de récupération antérieur 01W/03RW vers X5.');log('effects','DEPENDANCE',null,null,'Effets du template conservés ; bloc source conservé dans le rapport.')
  data.splice(0,82,...s.data.slice(0,82));data[29]=(s.data[29]&248)|((s.data[29]&7)===4?5:s.data[29]&7)
  for(let osc=0;osc<2;osc++){
   const sb=osc*(sm.protocol==='01W'?51:47),db=osc*47
   data.splice(40+db,42,...s.data.slice(40+sb,82+sb));data[41+db]=(s.data[41+sb]&248)|((s.data[41+sb]&7)===4?5:s.data[41+sb]&7);data[85+db]=s.data[(sm.protocol==='01W'?89:85)+sb]
   const pv=s.data[(sm.protocol==='01W'?90:86)+sb],pan=pv<=10?[pv*3,0,0]:({11:[255,9,0],12:[255,9,9],13:[255,0,9],14:[15,9,9]} as Record<number,number[]>)[pv]
   if(pan){data[86+db]=options.recoverAux!==false&&pan[0]===255?15:pan[0];data[82+db]=pan[1]*16+pan[2];log('osc'+(osc+1)+'.pan','ADAPTE',pv,data[86+db],'Routage A/B/C/D adapté ; courbes acoustiques non mesurées.')}
   const emphasis=s.data[(sm.protocol==='01W'?87:83)+sb],velocity=s.data[(sm.protocol==='01W'?88:84)+sb]
   if(options.adaptEmphasis){data[83+db]=Math.min(99,emphasis);data[84+db]=Math.max(-99,Math.min(99,signed8(velocity)))&255;log('osc'+(osc+1)+'.emphasis','APPROXIMATION',emphasis,data[83+db],'Approximation Emphasis→Color ; pas une équivalence DSP.')}
   else if(emphasis||velocity)log('osc'+(osc+1)+'.emphasis','MANQUANT',[emphasis,velocity],null,'Color du template conservé.')
  }
  data[134]=0
 }
 if(newRoute){
  data.splice(0,11,...s.data.slice(0,11))
  for(let osc=0;osc<2;osc++){
   const sb=sm.protocol==='NS5R'?14+72*osc:22+78*osc,db=tm.protocol==='NS5R'?14+72*osc:22+78*osc
   data.splice(db,72,...s.data.slice(sb,sb+72))
   if(tm.protocol==='NS5R'){
    for(const rel of [14,28,53,57,33,37])if(signed8(s.data[sb+rel])<0){data[db+rel]=0;log('osc'+(osc+1)+'.byte'+rel,'SATURATION',signed8(s.data[sb+rel]),0,'Modulation signée N5 non représentable dans le dump NS5R.')}
    if(s.data[sb+69]===128){data[db+69]=64;data[db+3]=0;log('osc'+(osc+1)+'.panOff','ADAPTE',128,0,'Pan Off N5 rendu silencieux ; pas de confusion avec Random.')}
   }
  }
  log('core72','COPIE_STRUCTURELLE',sm.id,tm.id,'Port du noyau OSC 72 octets de la récupération antérieure ; octave et références adaptées séparément.')
  log('controllers','DEPENDANCE',null,null,'Contrôleurs supplémentaires N5 conservés dans la source ; template conservé pour les champs absents.')
  log('effects','DEPENDANCE',null,null,'Références FX du template conservées ; objets séparés non alloués.')
 }
 for(let osc=0;osc<2;osc++){
  const info=oscillatorInfo(s,osc),targetInfo=oscillatorInfo(t,osc),field='osc'+(osc+1),candidate=rules[sm.rom+'|multi|'+info.index],none=sm.protocol==='01W'&&info.index===-1&&info.bank===0
  let index=same?info.index:candidate?.target_index
  if(!info.internal||none||!Number.isInteger(index)||index!<0||index!>=maxResources(t.model)||tm.protocol==='01W'&&index!>=255){
   // Restore the target reference even in a structural copy to a smaller ROM.
   data[targetInfo.offset]=t.data[targetInfo.offset];data[targetInfo.offset+1]=t.data[targetInfo.offset+1]
   if(none){const level=semanticFields(tm).find(f=>f.key===field+'.level')!;writeField(data,level,0)}
   log(field+'.waveform',none?'ADAPTE':'REPLI_TEMPLATE',{index:info.index,bank:info.bank},targetInfo.index,none?'No Assign rendu silencieux.':'Référence externe, absente ou encodage pro non confirmé ; waveform du template conservée.')
  }else{
   index=index!;writeOscillatorReference(data,t.model,osc,index)
   log(field+'.waveform',same?'REFERENCE_PRESERVEE':candidate!.relation,info.index,index,(candidate?.reason??'Table statique orientée ; identité PCM non prouvée.')+(candidate?.alternatives?' Alternatives non choisies : '+candidate.alternatives:'')+(candidate?.rule_id?' Règle '+candidate.rule_id:''))
  }
  if(!sameLayout){
   const semis=info.octave;if([-24,-12,0,12].includes(semis)){writeOscillatorOctave(data,t.model,osc,semis);log(field+'.octave','ADAPTE',semis,semis,'Demi-tons, enum N5 et octave legacy distingués.')}
   else {const offset=ai2Definition(t.model).layout.oscillators[osc].octave;data[offset]=t.data[offset];log(field+'.octave','REPLI_TEMPLATE',semis,targetInfo.octave,'Octave source non représentable.')}
   for(const [key,value]of [['coarse',info.coarse],['fine',info.fine]] as const){
    if(old(t.model)){if(osc===1){const limit=key==='coarse'?12:50,offset=key==='coarse'?18:19;data[offset]=Math.max(-limit,Math.min(limit,value))&255;log(field+'.'+key,Math.abs(value)>limit?'SATURATION':'COPIE_SEMANTIQUE',value,signed8(data[offset]),'Accordage en unités physiques ; domaine cible appliqué.')}
     else if(value)log(field+'.'+key,'MANQUANT',value,null,'Pas de réglage OSC1 indépendant dans ce codec legacy.')
    }else{const offset=targetInfo.offset+(key==='coarse'?4:5),limit=key==='coarse'?12:99;data[offset]=Math.max(-limit,Math.min(limit,value))&255;log(field+'.'+key,Math.abs(value)>limit?'SATURATION':'COPIE_SEMANTIQUE',value,signed8(data[offset]),'Accordage en unités physiques ; aucune mise à l’échelle proportionnelle.')}
   }
  }
 }
 if(sm.protocol==='01W'&&tm.protocol!=='01W')for(let osc=0;osc<2;osc++)if(!(s.data[82+osc*51]&128))log('osc'+(osc+1)+'.waveshaping','MANQUANT',s.data.slice(82+osc*51,87+osc*51),null,'WaveShaping 01/W non conservé ; original intact dans le rapport.')
 if(sameLayout&&!same)log('same-family','PARTIEL',sm.id,tm.id,'Disposition commune conservée ; différences de ROM, variantes et paramètres propres restent à valider.')
 if(tm.status.includes('PROVISOIRE')||tm.status.includes('confirmer'))log('catalogue','NON_RESOLU',sm.status,tm.status,'Catalogue de la variante inféré ; validation indépendante manquante.')
 const program=validateProgram({model:tm.id,channel:t.channel,index:0,data,original:[]})
 const missing=events.some(e=>['MANQUANT','NON_RESOLU','REPLI_TEMPLATE','DEPENDANCE','SATURATION'].includes(e.status))
 return {program,source:s,events,status:same?'STRUCTURE_PRESERVEE':missing?'PARTIEL_PARAMETRES_MANQUANTS':'PARTIEL_ADAPTE',hardwareValidated:false,pcmIdentityClaimed:false}
}
