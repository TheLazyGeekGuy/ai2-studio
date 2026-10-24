// The lazy loader refuses an editor whose exported manifest / presentation differ from src/editor-catalog.json
// ("Lazy editor metadata/export mismatch", editor unavailable). This checks the same parity offline.
import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
const r=await build({stdin:{contents:"export {x5drModule} from './src/editors/korg-x5dr/module';export {x5drView} from './src/editors/korg-x5dr/registration'",resolveDir:process.cwd(),loader:'ts'},bundle:true,write:false,format:'cjs',platform:'node',jsx:'automatic',loader:{'.css':'empty','.svg':'empty'},external:['react','react/jsx-runtime','react-dom','toolcool-range-slider','*?url'],logLevel:'silent'})
const mod={exports:{}};const real=createRequire(import.meta.url);new Function('require','module','exports',r.outputFiles[0].text)(id=>/\?url$/.test(id)?{default:'asset.css'}:real(id),mod,mod.exports);const m=mod.exports
const catalog=JSON.parse(readFileSync('src/editor-catalog.json','utf8'))['korg-x5dr-editor']
const plain=v=>JSON.parse(JSON.stringify(v))
assert.deepEqual(plain(m.x5drModule.manifest),catalog.manifest,'Catalog manifest differs from the module export')
assert.deepEqual(plain(m.x5drView.presentation),catalog.presentation,'Catalog presentation differs from the view export')
console.log('PASS catalog parity: '+catalog.manifest.name+' · '+catalog.presentation.model)
