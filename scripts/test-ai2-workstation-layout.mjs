// Aligned workstation of the Korg AI² editors (validated mockup of 24/10/2026, forge #98–#103): for the native X5DR and
// for all 21 file models, every parameter lands in exactly one card, VDF / VDA and their envelopes share a row, and the
// model slider can carry every model id. Pure layout: no DOM, no MIDI.
import assert from 'node:assert/strict'
import {build} from 'esbuild'
const r=await build({stdin:{contents:`export * from './src/instrument-families/korg-ai2/models';export * from './src/instrument-families/korg-ai2/parameters';export * from './src/instrument-families/korg-ai2/oscillator-layout';export * from './src/editors/korg-x5dr/program-layout';export {parameters,effectParameters,initialState} from './src/editors/korg-x5dr/model'`,resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node',metafile:true})
assert.ok(!Object.keys(r.metafile.inputs).some(p=>p.endsWith('.tsx')||p.includes('node_modules')),'Layout stays free of view code')
const m=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))

// Model slider: 21 distinct ids, usable as toolcool-range-slider data (comma separated) and as option values.
assert.equal(m.ai2Models.length,21)
assert.equal(new Set(m.ai2Models.map(x=>x.id)).size,21)
for(const x of m.ai2Models)assert.ok(!x.id.includes(','),'Slider label must not contain a comma: '+x.id)
assert.ok(m.ai2Models.some(x=>x.id==='X5DR'))

// File models: both dump layouts, both oscillators.
const where=cells=>Object.fromEntries(cells.flatMap(c=>c.cards.map(k=>[k.card,[c.col,c.row]])))
const report=[]
for(const model of m.ai2Models){
 const fields=m.semanticFields(model)
 for(const osc of [0,1]){
  const own=fields.filter(f=>f.key.startsWith('osc'+(osc+1)+'.')),cells=m.oscillatorCells(fields,osc),placed=cells.flatMap(c=>c.cards.flatMap(k=>k.fields.map(f=>f.key)))
  assert.deepEqual([...placed].sort(),own.map(f=>f.key).sort(),model.id+' OSC '+(osc+1)+': every field exactly once')
  const at=where(cells)
  assert.deepEqual(at['Source'],[1,1],model.id);assert.deepEqual(at['VDF'],[2,1],model.id);assert.deepEqual(at['VDA'],[3,1],model.id)
  assert.deepEqual(at['VDF EG'],[2,2],model.id);assert.deepEqual(at['VDA EG'],[3,2],model.id);assert.deepEqual(at['Pitch EG'],[1,2],model.id)
  // The envelope graph of each EG card finds its keys in that card.
  const card=name=>cells.flatMap(c=>c.cards).find(k=>k.card===name).fields.map(f=>f.key)
  for(const t of ['attackTime','decayTime','slopeTime','releaseTime','attackLevel','breakLevel','sustainLevel'])for(const kind of ['vdf','vda'])assert.ok(card(kind.toUpperCase()+' EG').includes('osc'+(osc+1)+'.'+kind+'.'+t),model.id+' '+kind+' '+t)
  for(const t of ['startLevel','attackTime','attackLevel','decayTime','releaseTime','releaseLevel'])assert.ok(card('Pitch EG').includes('osc'+(osc+1)+'.pitch.'+t),model.id+' pitch '+t)
  const p='osc'+(osc+1)+'.'
  assert.ok(card('VDF').includes(p+'cutoff')&&card('VDF').includes(p+'vdf.egIntensity'),model.id+' cutoff and VDF EG intensity in VDF')
  assert.ok(card('VDA').includes(p+'level')&&card('VDA').includes(p+'vda.velocityLevel'),model.id+' level and velocity in VDA')
  assert.ok(card('Source').includes(p+'pitch.egIntensity'),model.id+' pitch EG intensity with the source')
  assert.ok(['lfoFrequency','lfoDelay','lfoFade','lfoIntensity'].every(t=>card('Pitch MG').includes(p+'pitch.'+t)),model.id+' pitch MG')
  if(own.some(f=>f.key.endsWith('Switch'))){assert.deepEqual(at['VDF switches'],[2,3],model.id);assert.deepEqual(at['VDA switches'],[3,3],model.id)}
  for(const f of own){const label=m.oscillatorFieldLabel(f);assert.ok(!label.includes('.')&&/^[A-Z]/.test(label),model.id+' readable label for '+f.key+': '+label)}
  if(osc===0)report.push(model.id+':'+own.length)
 }
}

// Native X5DR: the four pages cover every Program group once, in the aligned plan.
const groups=[...new Set([...m.parameters,...m.effectParameters(m.initialState())].map(p=>p.group))]
assert.deepEqual([...m.programTabs],['Common','OSC 1','OSC 2','Effects'])
const covered=[]
for(const tab of m.programTabs){
 const cells=m.programCells(tab,groups),inTab=groups.filter(g=>m.programTabOf(g)===tab)
 if(tab==='Effects'){assert.equal(cells.length,0,'Effects keeps its flat list');covered.push(...inTab);continue}
 const placed=cells.flatMap(c=>c.groups)
 assert.deepEqual([...placed].sort(),[...inTab].sort(),tab+': every group exactly once');covered.push(...placed)
 const cell=g=>cells.find(c=>c.groups.includes(g))
 if(tab==='Common'){assert.equal(cell('Pitch EG').col,2);assert.equal(cell('Common').col,1)}
 else{
  for(const [g,col,row] of [[tab,1,1],[tab+' VDF',2,1],[tab+' VDA',3,1],[tab+' VDF EG',2,2],[tab+' VDA EG',3,2],[tab+' Color',1,2],[tab+' Pitch MG',1,2],[tab+' VDF keyboard switches',2,3],[tab+' VDA velocity switches',3,3]]){const c=cell(g);assert.ok(c,tab+' has '+g);assert.deepEqual([c.col,c.row],[col,row],g)}
 }
}
assert.deepEqual([...covered].sort(),[...groups].sort(),'The four pages show every X5DR Program group')
assert.equal(m.programCells('Common',[...groups,'Unknown group']).flatMap(c=>c.groups).includes('Unknown group'),true,'An unplanned group is never hidden')
console.log('PASS AI² workstation layout: 21 models × 2 oscillators placed ('+report.join(' ')+'), X5DR '+groups.length+' groups on 4 pages')
