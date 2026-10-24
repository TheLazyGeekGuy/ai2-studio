import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {readFileSync} from 'node:fs'
const r=await build({entryPoints:['src/editors/korg-x5dr/appearance.ts'],bundle:true,write:false,platform:'node',format:'esm',metafile:true})
assert.ok(Object.keys(r.metafile.inputs).every(p=>p==='src/editors/korg-x5dr/appearance.ts'),'Appearance has no session, transport or view dependency')
const m=await import('data:text/javascript;base64,'+Buffer.from(r.outputFiles[0].text).toString('base64'))
assert.deepEqual(m.localAppearance,JSON.parse(readFileSync('src/editor-catalog.json'))['korg-x5dr-editor']?.presentation.localAppearance)
for(const t of m.localAppearance.themes){
 assert.ok(m.validColors(t.colors),t.id+' base contrast')
 const tokens=m.material(t.colors,t.scheme)
 for(const back of ['raised','sunken'])for(let i=0;i<=100;i++)for(const ink of ['text','muted','accent'])assert.ok(m.contrast(t.colors[ink],m.mixHex(t.colors.surface,tokens[back],i/100))>=4.5,t.id+' '+back+' '+ink)
 assert.equal(m.appearanceStyle({...m.normalizeAppearance(null),theme:t.id}).colorScheme,t.scheme)
}
assert.deepEqual(m.normalizeAppearance({theme:'unknown',layout:'no',surface:'javascript:',render:'invalid',colors:{}}),m.normalizeAppearance(null))
for(const value of [null,[],{},'bad',{text:'#ffffff'},{...m.localAppearance.themes[0].colors,accent:'#1c2029'},{...m.localAppearance.themes[0].colors,background:'url(secret)'}])assert.equal(m.validColors(value),false)
const colors={...m.localAppearance.themes[0].colors,extra:'ignored'},v=m.normalizeAppearance({colors});assert.equal(Object.keys(v.colors).length,6);colors.text='#000000';assert.notEqual(v.colors.text,colors.text)
assert.notEqual(m.appearanceKey('a'),m.appearanceKey('b'));assert.notEqual(m.appearanceKey('a:b'),m.appearanceKey('a%3Ab'))
console.log('PASS X5DR appearance: 5 palettes, validated custom colors, gradient contrast >=4.5:1, detached normalization, isolated keys, inert model, catalog parity')
