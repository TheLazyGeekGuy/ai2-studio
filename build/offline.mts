import {createHash} from 'node:crypto'
import {readFileSync,readdirSync,writeFileSync} from 'node:fs'
import {join,resolve} from 'node:path'
import type {Plugin} from 'vite'

export function buildOfflineCache(directory:string,template:string,precache?:ReadonlySet<string>){
  const paths:string[]=[]
  const walk=(dir:string)=>{for(const e of readdirSync(join(directory,dir),{withFileTypes:true})){const path=dir?`${dir}/${e.name}`:e.name;if(e.name.startsWith('.')||e.name==='_headers'||e.name==='sw.js'||e.name==='app-version.json'||e.name.endsWith('.map'))continue;if(e.isDirectory())walk(path);else paths.push(path)}}
  walk('');paths.sort();if(!paths.includes('index.html')||paths.length>16384)throw Error('Invalid offline asset inventory')
  const indexPath=join(directory,'index.html'),html=readFileSync(indexPath,'utf8').replace(/<meta name="ai2-build" content="[a-f0-9]+">\s*/g,'')
  const version=createHash('sha256').update(template).update(html)
  for(const url of paths)if(url!=='index.html')version.update(url).update(readFileSync(join(directory,url)))
  version.update(JSON.stringify(precache?[...precache].sort():null))
  const build=version.digest('hex').slice(0,24)
  writeFileSync(indexPath,html.replace('</head>',`<meta name="ai2-build" content="${build}"></head>`))
  const entries=paths.map(url=>({url,integrity:'sha256-'+createHash('sha256').update(readFileSync(join(directory,url))).digest('base64')}))
  const source=template.replace('/*__ENTRIES__*/[]',JSON.stringify(entries)).replace('/*__PRECACHE__*/null',JSON.stringify(precache?[...precache].sort():null)).replace('/*__VERSION__*/"development"',JSON.stringify(build))
  writeFileSync(join(directory,'sw.js'),source)
  writeFileSync(join(directory,'app-version.json'),JSON.stringify({format:'ai2-studio-version',version:1,build,assets:entries.filter(e=>e.url==='index.html'||/\.(js|css)$/.test(e.url))}))
  return entries
}
export function offlineCachePlugin():Plugin{
  let outDir='dist',root=''
  const shell=new Set<string>(['index.html'])
  return {name:'studio-offline-cache',apply:'build',enforce:'post',configResolved(config){outDir=resolve(config.root,config.build.outDir);root=config.root},generateBundle(_options,bundle){
    const visit=(file:string)=>{if(shell.has(file))return;shell.add(file);const entry=bundle[file];if(entry?.type==='chunk'){entry.imports.forEach(visit);const metadata=(entry as unknown as {viteMetadata?:{importedCss?:Set<string>;importedAssets?:Set<string>}}).viteMetadata;metadata?.importedCss?.forEach(visit);metadata?.importedAssets?.forEach(visit)}}
    for(const entry of Object.values(bundle))if(entry.type==='chunk'&&(entry.isEntry||entry.moduleIds.some(id=>/\/editor-host\/(?:WorkspaceApp|StandaloneEditorApp)\.tsx$/.test(id))))visit(entry.fileName)
  },writeBundle(){buildOfflineCache(outDir,readFileSync(join(root,'build/offline-worker.js'),'utf8'),shell)}}
}
