import assert from 'node:assert/strict'
import {build} from 'esbuild'
const bundle=await build({stdin:{contents:"export * from './src/instrument-families/korg-ai2/midi-discovery';export * from './src/instrument-families/korg-ai2/models'",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'})
const m=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'))
for(const model of m.ai2Models)assert.equal(m.ai2PortModel('Network KoRg '+model.id+' MIDI IN'),model.id,model.id)
for(const name of ['KORG x5 (mioXL) dR','x5___DR','Network X5DR'])assert.equal(m.ai2PortModel(name),'X5DR')
for(const [name,expected]of [['Korg264','N264'],['mio364','N364'],['n-264','N264'],['n_364','N364'],['264 IN','N264'],['Network 364 OUT','N364'],['N 264','N264'],['n / 364','N364']])assert.equal(m.ai2PortModel(name),expected,name)
for(const name of ['FireworX','N12','01/W123','x5\nDR',''])assert.equal(m.ai2PortModel(name),null,name)
const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)},prefs=m.ai2MidiPreferences(storage,'first')
assert.deepEqual(prefs.get(),{version:1,channel:1,enabled:true,autoLive:true,autoEdit:true})
const port=(id,name)=>({id,name,state:'connected'}),input=port('i','Network X5DR IN'),output=port('o','Network X5DR OUT'),access={inputs:new Map([[input.id,input]]),outputs:new Map([[output.id,output]])}
assert.deepEqual(m.ai2MidiPair(access,'X5DR',()=>true),{inputId:'i',outputId:'o'})
prefs.update({input:{id:'i',name:input.name},output:{id:'o',name:output.name},channel:7,enabled:false,autoLive:false})
const restored=m.ai2MidiPreferences(storage,'first');assert.equal(restored.get().channel,7);assert.equal(restored.get().enabled,false);assert.equal(m.ai2MidiPreferences(storage,'other-model').get().channel,1)
access.inputs.delete('i');input.id='new-i';access.inputs.set(input.id,input);assert.deepEqual(m.ai2MidiPair(access,'X5DR',()=>true,restored.get()),{inputId:'new-i',outputId:'o'})
access.inputs.set('duplicate',port('duplicate',input.name));assert.equal(m.ai2MidiPair(access,'X5DR',()=>true,restored.get()),null,'Ambiguous names must not select an arbitrary new ID')
access.inputs.delete('duplicate');assert.equal(m.ai2MidiPair(access,'X5DR',d=>d!=='output',restored.get()),null,'A peer reservation must be respected')
access.outputs.clear();access.outputs.set('other',port('other','Another X5DR OUT'));assert.equal(m.ai2MidiPair(access,'X5DR',()=>true,restored.get()),null,'Do not replace a missing remembered destination')
memory.set('corrupt','{"version":1,"channel":99,"input":{"id":12}}');assert.equal(m.ai2MidiPreferences(storage,'corrupt').get().channel,1)
const blocked=m.ai2MidiPreferences({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}},'x');blocked.update({channel:5});assert.equal(blocked.get().channel,5)
console.log('PASS AI² MIDI: 21 model names, X5 wildcard DR, exact/renamed routes, ambiguity, reservations, isolated preferences and storage failure; no MIDI')

assert.equal(m.resolveMidiChoice(new Map([['new',port('new','Network n-264 IN')]]),{id:'old',name:'Network N264 IN'},()=>true)?.id,'new','Remembered route tolerates model punctuation without changing instruments')
