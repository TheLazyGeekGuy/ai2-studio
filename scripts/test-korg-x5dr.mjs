import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {mkdirSync,writeFileSync} from 'node:fs'
import os from 'node:os'
const bundle=await build({stdin:{contents:"export * from './src/editors/korg-x5dr/model';export * from './src/editors/korg-x5dr/protocol';export * from './src/editors/korg-x5dr/module';export * from './src/editor-host/midi-broker';export * from './src/editor-host/workspace';export * from './src/editor-host/registry'",resolveDir:process.cwd()},bundle:true,write:false,platform:'node',format:'esm',metafile:true})
assert.ok(!Object.keys(bundle.metafile.inputs).some(p=>p.endsWith('.tsx')||p.includes('node_modules')))
const m=await import('data:text/javascript;base64,'+Buffer.from(bundle.outputFiles[0].text).toString('base64'))
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))
const data=Array.from({length:164},(_,i)=>i),packed=[]
for(let i=0;i<164;i+=7){let mask=0,low=[];for(let n=0;n<7&&i+n<164;n++){mask+=data[i+n]>=128?2**n:0;low.push(data[i+n]%128)}packed.push(mask,...low)}
const wire=[240,66,48,54,64,...packed,247];assert.equal(wire.length,194);assert.deepEqual(m.decodeProgram(wire).data,data)
const state=m.validateState({...m.initialState(),data,original:wire});assert.deepEqual(m.encodeProgram(state),wire)
for(const wrong of [wire.slice(1),[...wire,247],wire.map((v,i)=>i===3?55:v),wire.map((v,i)=>i===4?76:v),wire.map((v,i)=>i===5?128:v),wire.map((v,i)=>i===189?64:v)])assert.throws(()=>m.decodeProgram(wrong))
assert.throws(()=>m.validateState({...state,data:Array(164).fill(NaN)}))
assert.deepEqual(m.parameterMessage(1,31,99),[240,66,48,54,65,31,0,99,0,247])
assert.deepEqual(m.parameterMessage(16,32,-99),[240,66,63,54,65,32,0,29,127,247])
assert.equal(m.parameterById(50).live,31);assert.equal(m.parameterById(97).live,98);assert.equal(m.parameterById(12).live,24)
assert.equal(new Set(m.parameters.map(p=>p.id)).size,m.parameters.length)
let check=m.withParameter(m.initialState(),1002,1);assert.equal(check.data[11],2);check=m.withParameter(check,1001,1);assert.equal(check.data[11],3)
check=m.withParameter(check,12,429);assert.equal(check.data[12],173);assert.equal(check.data[13],1);assert.equal(m.parameterValue(check,12),429)
check=m.withParameter(check,1135,47);check=m.withParameter(check,1137,1);assert.equal(check.data[135],47);assert.equal(check.data[143]&3,3);assert.equal(m.parameterValue(check,1137),1)
for(let fx=1;fx<=47;fx++){check=m.validateState({...m.withParameter(check,1135,fx),unresolvedEffects:undefined});const fields=m.effectParameters(check);assert.equal(new Set(fields.map(p=>p.id)).size,fields.length);for(const p of fields){assert.ok(p.offset>=144&&p.offset+(p.width??1)<=164);check=m.withParameter(check,p.id,p.min);assert.equal(m.parameterValue(check,p.id),p.min);check=m.withParameter(check,p.id,p.max);assert.equal(m.parameterValue(check,p.id),p.max)}}
assert.equal(m.decodeMode([240,66,48,54,66,0,0,0,4,247],1),0);assert.equal(m.decodeMode([240,66,48,54,66,0,0,4,247],1),null);assert.equal(m.decodeIdentity([240,126,0,6,2,66,54,0,20,0,14,0,1,0,247]).channel,1);assert.equal(m.decodeIdentity([240,126,0,6,2,66,54,0,0,0,14,0,1,0,247]),null);
assert.equal(m.acceptsQuery(m.identityRequest()),true);assert.equal(m.acceptsQuery(m.programRequest(1)),true);assert.equal(m.acceptsQuery(m.modeRequest(16)),true);assert.equal(m.acceptsQuery(m.identityRequest(1)),true)
for(const opcode of [17,26,78,64,76,81,82,80])assert.equal(m.acceptsQuery([240,66,48,54,opcode,247]),false)
for(const packet of [[240,66,48,54,17,0,0,247],[240,66,48,54,81,0,0,247],[240,66,48,54,78,5,0,247],[240,66,48,54,76,...Array(188).fill(0),247],m.parameterMessage(1,31,128),[240,66,48,54,65,60,1,0,0,247]])assert.equal(m.acceptsEditBuffer(packet),false)
assert.equal(m.acceptsEditBuffer(m.programEditMode(1)),true);assert.equal(m.acceptsEditBuffer(m.encodeProgram(m.initialState())),true)
const sent=[];let hardware=m.initialState(),mode=2,reply=true,nak=false,rejectSend=false
const input={id:'in',name:'fake X5DR input',state:'connected',onmidimessage:null},output={id:'out',name:'fake X5DR output',state:'connected',send(bytes){if(rejectSend)throw Error('Fake cable unplugged');sent.push([...bytes]);if(!reply)return;const emit=b=>input.onmidimessage?.({data:new Uint8Array(b)});if(bytes[1]===126){emit([240,126,hardware.channel-1,6,2,66,54,0,20,0,1,0,1,0,247]);return}const head=[240,66,47+hardware.channel,54];if(bytes[4]===18)emit([...head,66,mode,0,0,4,247]);else if(bytes[4]===16)emit(m.encodeProgram(hardware));else if(bytes[4]===78){mode=3;emit([...head,nak?36:35,247])}else if(bytes[4]===65){const p=m.decodeParameter(bytes,hardware.channel);hardware=m.applyParameter(hardware,p.address,p.value)??hardware;emit([...head,nak?36:35,247])}else if(bytes[4]===64){hardware=m.validateState({...hardware,...m.decodeProgram(bytes)});emit([...head,nak?36:35,247])}}}
const access={sysexEnabled:true,inputs:new Map([['in',input]]),outputs:new Map([['out',output]]),onstatechange:null}
const broker=m.createMidiBroker(access),lease=broker.createLease('x5',m.acceptsQuery,undefined,undefined,undefined,m.acceptsEditBuffer),otherLease=broker.createLease('other')
const a=m.x5drModule.create({instanceId:'x5',midi:lease,now:()=>performance.now()}),b=m.x5drModule.create({instanceId:'other',midi:otherLease,now:()=>performance.now()})
assert.equal(sent.length,0);lease.bind({inputId:'in',outputId:'out'});assert.equal(sent.length,0)
const auth=op=>broker.authorize('x5',op)
assert.throws(()=>lease.send([m.parameterMessage(1,31,2)],auth('query')),/refused/)
assert.throws(()=>lease.send([[240,66,48,54,17,0,0,247]],auth('edit-buffer')),/refused/)
assert.throws(()=>a.setSending(true,auth('edit-buffer')),/Identify/)
await a.identify(auth('query'));assert.equal(a.getSnapshot().identified,true);assert.equal(a.getSnapshot().mode,2)
await a.enterProgramEdit(auth('edit-buffer'),auth('query'));assert.equal(a.getSnapshot().mode,3)
assert.throws(()=>a.setSending(true,auth('edit-buffer')),/Read/)
await a.readProgram(auth('query'));assert.equal(a.getSnapshot().dirty,false);assert.equal(a.serialize().original.length,194)
const before=sent.length;a.dispatch({type:'value',id:50,value:42});assert.equal(sent.length,before);assert.equal(b.serialize().data[50],99)
a.setSending(true,auth('edit-buffer'));a.dispatch({type:'value',id:50,value:61});assert.equal(hardware.data[50],61);assert.deepEqual(sent.at(-1),[240,66,48,54,65,31,0,61,0,247])
await wait(25);a.dispatch({type:'value',id:53,value:-99});assert.equal(hardware.data[53],157)
await wait(25);const old=sent.length;input.onmidimessage({data:new Uint8Array(m.parameterMessage(1,31,77))});assert.equal(a.serialize().data[50],77);assert.equal(sent.length,old,'RX never echoes')
input.onmidimessage({data:new Uint8Array(m.parameterMessage(2,31,11))});assert.equal(a.serialize().data[50],77)
a.dispatch({type:'local-value',id:50,value:62});assert.equal(a.getSnapshot().sending,false);assert.equal(sent.length,old)
a.setLocked(true);assert.throws(()=>a.dispatch({type:'value',id:50,value:1}),/locked/);input.onmidimessage({data:new Uint8Array(m.parameterMessage(1,31,78))});assert.equal(a.serialize().data[50],78,'Lock preserves RX');a.setLocked(false)
a.dispatch({type:'import',bytes:wire});assert.deepEqual(a.serialize().original,wire);a.dispatch({type:'value',id:53,value:-99});assert.deepEqual(m.decodeProgram(m.encodeProgram(a.serialize())).data,data.map((v,i)=>i===53?157:v))
a.dispatch({type:'undo'});assert.equal(a.serialize().data[53],53);a.dispatch({type:'redo'});assert.equal(a.serialize().data[53],157)
await a.sendBuffer(auth('edit-buffer'));assert.equal(hardware.data[53],157);assert.ok(!sent.some(b=>[17,26,76,77,81,82,80].includes(b[4])))
await a.readProgram(auth('query'));a.setSending(true,auth('edit-buffer'));nak=true;a.dispatch({type:'value',id:50,value:30});await wait(0);assert.equal(a.getSnapshot().sending,false);assert.match(a.getSnapshot().lastError,/rejected|load/);nak=false;assert.throws(()=>a.setSending(true,auth('edit-buffer')),/Read/)
await a.readProgram(auth('query'));a.setSending(true,auth('edit-buffer'));reply=false;const count=sent.length;for(let i=0;i<100;i++)a.dispatch({type:'value',id:50,value:i});assert.equal(sent.length,count+1);assert.equal(a.getSnapshot().pending,2,'One in flight + latest pending value')
const stale=auth('edit-buffer');lease.release();await wait(30);assert.equal(a.getSnapshot().sending,false);assert.equal(a.getSnapshot().pending,0);assert.equal(a.getSnapshot().identified,false);assert.equal(sent.length,count+1,'Disconnect cancels pending writes')
lease.bind({inputId:'in',outputId:'out'});assert.throws(()=>lease.send([m.parameterMessage(1,31,1)],stale),/Stale/)
reply=true;await a.identify(auth('query'));await a.readProgram(auth('query'));reply=false;await assert.rejects(a.readProgram(auth('query')),/Program read timed out: no valid 194-byte reply; 0 MIDI message/);assert.throws(()=>a.setSending(true,auth('edit-buffer')),/Read/);reply=true;await a.readProgram(auth('query'));a.setSending(true,auth('edit-buffer'));reply=false;a.dispatch({type:'value',id:50,value:20});await wait(1600);assert.equal(a.getSnapshot().sending,false);assert.match(a.getSnapshot().lastError,/timed out/)
const read=a.readProgram(auth('query'));a.cancel();await assert.rejects(read,/cancel/i)
// Absent validator denies edit-buffer, even with a real host-issued token.
lease.release();otherLease.bind({inputId:'in',outputId:'out'});assert.throws(()=>otherLease.send([m.parameterMessage(1,31,1)],broker.authorize('other','edit-buffer')),/refused/);otherLease.release()
let ticks=0;const unsubscribe=b.subscribe(()=>ticks++);const raw={time:new Date().toISOString(),environment:{os:os.release(),cpu:os.cpus()[0].model,node:process.version},warmup:500,budgets:{codecP95Ms:2,editP95Ms:2},codecMs:[],editMs:[]}
for(let i=0;i<5500;i++){let t=performance.now();m.encodeProgram(m.validateState({...state,...m.decodeProgram(wire)}));let d=performance.now()-t;if(i>=500)raw.codecMs.push(d);t=performance.now();b.dispatch({type:'value',id:50,value:i%100});d=performance.now()-t;if(i>=500)raw.editMs.push(d)}
const p95=s=>[...s].sort((a,b)=>a-b)[Math.floor(s.length*.95)];raw.p95={codec:p95(raw.codecMs),edit:p95(raw.editMs)};assert.ok(raw.p95.codec<2);assert.ok(raw.p95.edit<2);assert.equal(b.getSnapshot().history.undo,100);assert.equal(ticks,5500);unsubscribe()
a.dispose();a.dispose();b.dispose();assert.throws(()=>a.dispatch({type:'undo'}),/disposed/);broker.close()
mkdirSync('output/performance/korg-x5dr',{recursive:true});writeFileSync('output/performance/korg-x5dr/live-headless.json',JSON.stringify(raw,null,2))
console.log('PASS X5DR: '+m.parameters.length+' fields; 47 FX algorithms; MIDI identity/mode/read/live/buffer via broker; no STORE; signed/address/packing fixtures; RX no echo, local route, history, lock; ACK/NAK, coalescing, cancellation, stale grants, timeout, absent-validator deny; headless p95 '+JSON.stringify(raw.p95))
