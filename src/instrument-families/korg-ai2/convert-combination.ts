import {ai2Model,type ResourceRules} from './models'
import {validateProgram,type Ai2Program} from './codec'
import {convertProgram,type ConversionEvent,type ConversionOptions,type ConversionResult} from './conversion'
import {combinationFields,combinationValue,initialAi2Combination,validateAi2Combination,withCombinationField,type Ai2Combination} from './combination'
export interface CombiDependency {timbre:number;sourceProgram:number;targetSlot:number|null;status:'converted'|'external'|'missing'|'disabled';detail:string}
export interface CombiConversionResult {combination:Ai2Combination;source:Ai2Combination;programs:readonly Ai2Program[];programReports:readonly ConversionResult[];dependencies:readonly CombiDependency[];events:readonly ConversionEvent[];status:'PARTIEL_ADAPTE'|'PARTIEL_PARAMETRES_MANQUANTS';hardwareValidated:false;requiresProgramInstallation:true}
/** Offline graph conversion. Bindings are explicit: a shared numeric program index does not identify its bank. */
export function convertCombination(source:Ai2Combination,targetModel:string,bindings:Readonly<Record<number,Ai2Program>>,rules:ResourceRules,options:ConversionOptions={},template=initialAi2Combination(targetModel),programTemplate?:Ai2Program):CombiConversionResult{
 const s=validateAi2Combination(source),tm=ai2Model(targetModel);if(template.model!==targetModel)throw Error('Template Combi du mauvais modèle')
 const events:ConversionEvent[]=[],dependencies:CombiDependency[]=[],programReports:ConversionResult[]=[],programs:Ai2Program[]=[],slots=new Map<string,number>()
 let combination=validateAi2Combination({...template,channel:s.channel,data:[...s.data.slice(0,10),...template.data.slice(10)],original:[]})
 const log=(field:string,status:string,detail:string,from?:unknown,to?:unknown)=>events.push({field,status,detail,source:from,target:to})
 for(let t=0;t<8;t++){
  const from=combinationFields(s.model,t),to=combinationFields(targetModel,t),number=combinationValue(s,t,'program'),enabled=combinationValue(s,t,'enabled')!==0,external=from.some(f=>f.key==='external')&&combinationValue(s,t,'external')!==0
  // Start with a broad window; otherwise valid final ranges can fail because of an intermediate template boundary.
  for(const [k,v]of [['bottom',0],['top',127],['velocityLow',1],['velocityHigh',127]] as const)combination=withCombinationField(combination,t,k,v)
  for(const f of to){if(['program','bank','bankMSB','bankLSB','enabled','external'].includes(f.key))continue
   const sf=from.find(x=>x.key===f.key);if(!sf){log('timbre'+(t+1)+'.'+f.key,'REPLI_TEMPLATE','Champ absent du modèle source ; template conservé.');continue}
   const value=combinationValue(s,t,f.key)
   // Pan/send encodings differ radically; preserve only when their native formats match.
   if(['pan','sendC','sendD'].includes(f.key)&&ai2Model(s.model).protocol!==tm.protocol){log('timbre'+(t+1)+'.'+f.key,'REPLI_TEMPLATE','Courbe / routage intermodèle non établi.',value);continue}
   if(value<f.min||value>f.max){log('timbre'+(t+1)+'.'+f.key,'REPLI_TEMPLATE','Valeur hors domaine cible.',value);continue}
   try{combination=withCombinationField(combination,t,f.key,value)}catch{log('timbre'+(t+1)+'.'+f.key,'REPLI_TEMPLATE','Encodage non représentable sans approximation.',value)}
  }
  if(!enabled||external){combination=withCombinationField(combination,t,'enabled',0);dependencies.push({timbre:t,sourceProgram:number,targetSlot:null,status:external?'external':'disabled',detail:external?'Destination externe conservée dans la source, couche cible désactivée.':'Couche source inactive.'});continue}
  const bound=bindings[t]
  if(!bound){combination=withCombinationField(combination,t,'enabled',0);dependencies.push({timbre:t,sourceProgram:number,targetSlot:null,status:'missing',detail:'Program source non lié : couche cible désactivée, aucune substitution silencieuse.'});continue}
  const p=validateProgram(bound);if(p.model!==s.model)throw Error('Le Program lié au timbre '+(t+1)+' appartient à un autre modèle')
  const key=p.model+':'+p.data.join(',');let slot=slots.get(key)
  if(slot===undefined){if(!programTemplate||programTemplate.model!==targetModel)throw Error('Fournir un template Program cible pour convertir les dépendances');let out:ConversionResult;try{out=convertProgram(p,programTemplate,rules,options)}catch(e){combination=withCombinationField(combination,t,'enabled',0);dependencies.push({timbre:t,sourceProgram:number,targetSlot:null,status:'missing',detail:'Dépendance non convertible : '+String(e)});continue}slot=programs.length;slots.set(key,slot);programReports.push(out);programs.push(validateProgram({...out.program,origin:undefined,index:slot,original:[]}))}
  combination=withCombinationField(combination,t,'program',slot)
  // Explicit user bank for converted dependency files. Modern Korg maps use LSB 0 and MSB 58h for CmbU / 50h for PrgU (manual bank map).
  for(const [k,v]of [['bank',0],['bankMSB',0x50],['bankLSB',0],['external',0]] as const)if(to.some(f=>f.key===k))combination=withCombinationField(combination,t,k,v)
  combination=withCombinationField(combination,t,'enabled',1)
  dependencies.push({timbre:t,sourceProgram:number,targetSlot:slot,status:'converted',detail:'Program converti dans le paquet local ; installation dans la banque cible encore requise.'})
 }
 log('effects','DEPENDANCE','Bloc effets du template cible conservé. Références et algorithmes source joints, sans équivalence DSP inventée.')
 log('installation','DEPENDANCE','Paquet hors ligne uniquement : les Programs doivent être installés aux emplacements indiqués avant audition de la Combi. Aucun STORE automatique.')
 const missing=dependencies.some(d=>d.status==='missing'||d.status==='external')||programReports.some(r=>r.status==='PARTIEL_PARAMETRES_MANQUANTS')
 return {combination,source:s,programs,programReports,dependencies,events,status:missing?'PARTIEL_PARAMETRES_MANQUANTS':'PARTIEL_ADAPTE',hardwareValidated:false,requiresProgramInstallation:true}
}
