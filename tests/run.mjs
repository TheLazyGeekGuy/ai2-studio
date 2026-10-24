// Offline suites of AI² Studio: the editor's own test scripts, listed by the assembler in tests/suites.json, then the
// project type check. No physical MIDI port is used.
import {spawnSync} from 'node:child_process'
import {readFileSync} from 'node:fs'
import {createRequire} from 'node:module'
const suites=JSON.parse(readFileSync(new URL('./suites.json',import.meta.url),'utf8'))
let passed=0
for(const file of suites){
 const result=spawnSync(process.execPath,['scripts/'+file],{stdio:'inherit'})
 console.log(`${result.status===0?'PASS':'FAIL'} ${file}`)
 if(result.status!==0){console.log(`${passed}/${suites.length} suites passed; stopped at ${file}`);process.exit(result.status??1)}
 passed++
}
const tsc=spawnSync(process.execPath,[createRequire(import.meta.url).resolve('typescript/bin/tsc'),'-b','--noEmit'],{stdio:'inherit'})
console.log(`${passed}/${suites.length} suites passed; ${tsc.status===0?'PASS':'FAIL'} tsc -b --noEmit`)
process.exit(tsc.status??1)
