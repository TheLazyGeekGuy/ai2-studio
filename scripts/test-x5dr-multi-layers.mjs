// The Multi page shows its 16 parts with the Combi layer map: same layer shape, built from the Multi device image.
import assert from 'node:assert/strict'
import {build} from 'esbuild'
const r=await build({stdin:{contents:"export * from './src/editors/korg-x5dr/combi-zones';export * from './src/editors/korg-x5dr/device-data'",resolveDir:process.cwd()},bundle:true,write:false,format:'esm',platform:'node'})
const m=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))
let image=m.validateDeviceImage({format:'korg-x5dr-device-data',version:1,kind:'multi',channel:1,data:Array(208).fill(0),original:[]})
const fields=m.deviceFields(image),set=(part,label,value)=>{const f=fields.find(f=>f.group==='Part '+part&&f.label===label);image=m.withDeviceValue(image,f,value)}
set(3,'Program',133);set(1,'Program',0);set(3,'Key bottom',36);set(3,'Key top',59);set(3,'MIDI channel',2);set(3,'Level',100);set(3,'Velocity bottom',1);set(3,'Velocity top',127)
const layers=m.multiLayers(image,{})
assert.equal(layers.length,16)
assert.deepEqual(layers.map(l=>l.timbre),Array.from({length:16},(_,i)=>i+1))
const p3=layers[2]
assert.equal(p3.address,'G033');assert.equal(p3.name,'Jazz Bass');assert.equal(p3.low,36);assert.equal(p3.high,59);assert.equal(p3.level,100)
assert.equal(p3.enabled,true);assert.equal(p3.valid,true)
assert.equal(layers[0].address,'Off');assert.equal(layers[0].enabled,false)
for(const l of layers)for(const label of ['Program','Key bottom','Key top','Level'])assert.ok(fields.some(f=>f.id===l.ids[label]&&f.group==='Part '+l.timbre),'Part '+l.timbre+' '+label+' id points to its own field')
assert.equal(m.layerResponds(p3,{channel:p3.channel,note:48,velocity:64}),true)
assert.equal(m.layerResponds(p3,{channel:p3.channel,note:60,velocity:64}),false)
console.log('PASS Multi layers: 16 parts, program / zone / channel / level from the Multi image, field ids per part, note matching')
