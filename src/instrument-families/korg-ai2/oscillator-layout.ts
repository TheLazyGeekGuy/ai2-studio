import type {SemanticField} from './parameters'

/** Oscillator page of the file editors, in the same aligned columns as the native X5DR (validated mockup of
 * 24/10/2026): Source / VDF / VDA, then Pitch EG + Pitch MG / VDF EG / VDA EG. Fields are sorted by their semantic
 * key, so both dump layouts (legacy 01/W…X5DR and N5/NS5R) land in the same cards; keyboard / velocity switches, when
 * the layout has them, sit on a third row under their column. */
export type OscillatorCard='Source'|'Pitch EG'|'Pitch MG'|'VDF'|'VDF EG'|'VDF switches'|'VDA'|'VDA EG'|'VDA switches'
const EG=/^(attack|decay|break|slope|sustain|release)/
export function oscillatorCardOf(key:string):OscillatorCard{
 const k=key.replace(/^osc[12]\./,'')
 if(k.startsWith('pitch.lfo'))return 'Pitch MG'
 if(k==='pitch.egIntensity')return 'Source'
 if(k.startsWith('pitch.'))return 'Pitch EG'
 if(k.startsWith('vdf.'))return EG.test(k.slice(4))?'VDF EG':k.endsWith('Switch')?'VDF switches':'VDF'
 if(k.startsWith('vda.'))return EG.test(k.slice(4))?'VDA EG':k.endsWith('Switch')?'VDA switches':'VDA'
 if(k==='cutoff')return 'VDF'
 if(k==='level')return 'VDA'
 return 'Source'
}
export interface OscillatorCell {col:1|2|3;row:1|2|3;cards:readonly {card:OscillatorCard;fields:readonly SemanticField[]}[]}
const PLAN:readonly {col:1|2|3;row:1|2|3;cards:readonly OscillatorCard[]}[]=[
 {col:1,row:1,cards:['Source']},{col:2,row:1,cards:['VDF']},{col:3,row:1,cards:['VDA']},
 {col:1,row:2,cards:['Pitch EG','Pitch MG']},{col:2,row:2,cards:['VDF EG']},{col:3,row:2,cards:['VDA EG']},
 {col:2,row:3,cards:['VDF switches']},{col:3,row:3,cards:['VDA switches']}]
/** Every field of oscillator `osc` (0 or 1) appears in exactly one card; empty cards and cells are dropped. */
export function oscillatorCells(fields:readonly SemanticField[],osc:number):OscillatorCell[]{
 const own=fields.filter(f=>f.key.startsWith('osc'+(osc+1)+'.'))
 return PLAN.map(c=>({col:c.col,row:c.row,cards:c.cards.map(card=>({card,fields:own.filter(f=>oscillatorCardOf(f.key)===card)})).filter(c=>c.fields.length)})).filter(c=>c.cards.length)
}
const NAMES:Readonly<Record<string,string>>={coarse:'Coarse tune',fine:'Fine tune',level:'Oscillator level',cutoff:'Cutoff',velocityLow:'Velocity low',velocityHigh:'Velocity high',
 'pitch.egIntensity':'Pitch EG intensity','pitch.lfoFrequency':'Frequency','pitch.lfoDelay':'Delay','pitch.lfoFade':'Fade in','pitch.lfoIntensity':'Intensity','pitch.timeVelocity':'Time velocity sensitivity','pitch.levelVelocity':'Level velocity sensitivity',
 'vdf.key':'Keyboard track key','vdf.trackFc':'Cutoff keyboard track','vdf.egIntensity':'EG intensity','vdf.trackTime':'EG time keyboard track','vdf.velocityTime':'EG time velocity','vdf.velocityIntensity':'EG intensity velocity',
 'vda.key':'Keyboard track key','vda.trackAmp':'Amplitude keyboard track','vda.velocityLevel':'Amplitude velocity','vda.trackTime':'EG time keyboard track','vda.velocityTime':'EG time velocity'}
const EG_NAMES:Readonly<Record<string,string>>={startLevel:'Start level',attackTime:'Attack time',attackLevel:'Attack level',decayTime:'Decay time',breakLevel:'Break point',slopeTime:'Slope time',sustainLevel:'Sustain level',releaseTime:'Release time',releaseLevel:'Release level',keySwitch:'Keyboard switches',velSwitch:'Velocity switches'}
/** Label shown in a card, in the X5DR editor's wording (the card already names VDF / VDA / Pitch). */
export function oscillatorFieldLabel(field:SemanticField):string{
 const k=field.key.replace(/^osc[12]\./,'')
 return NAMES[k]??EG_NAMES[k.slice(k.indexOf('.')+1)]??field.label
}
