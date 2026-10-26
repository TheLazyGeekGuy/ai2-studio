import assert from 'node:assert/strict'
import {build} from 'esbuild'
import {writeFileSync,mkdirSync,readFileSync,readdirSync} from 'node:fs'
import ts from 'typescript'
const dir='output/research/expansion-20261025/i18n';mkdirSync(dir,{recursive:true})
const result=await build({stdin:{contents:`export {translate,catalog,translatedTree,I18nContext} from './src/i18n';export {ai2French} from './src/i18n-ai2';export {ai2LocaleRows} from './src/i18n-ai2-locales';export {ai2ExtraRows,ai2ModelRows,ai2BackupRows,ai2ParameterRows} from './src/i18n-ai2-extra';export {Ai2Effects} from './src/instrument-families/korg-ai2/Ai2Effects';export {initialAi2Program} from './src/instrument-families/korg-ai2/initial-program';`,resolveDir:process.cwd()},bundle:true,packages:'external',write:false,format:'esm',platform:'node',jsx:'automatic'})
writeFileSync(dir+'/test.mjs',result.outputFiles[0].text);const m=await import('../'+dir+'/test.mjs');const {createElement:h}=await import('react');const {renderToStaticMarkup:render}=await import('react-dom/server')
for(const [en,fr] of Object.entries(m.ai2French)){assert.equal(m.translate(fr,'en'),en,'French source: '+fr);assert.equal(m.translate(en,'fr'),fr,'English source: '+en)}
assert.equal(m.translate('  Fermer les réglages  ','en'),'  Close settings  ')
assert.equal(m.translate('Lire banque Program','en'),'Read Program bank')
assert.equal(m.translate('Éditer le résultat sur X5DR','en'),'Edit result on X5DR')
assert.equal(m.translate('Résultat chargé dans l’éditeur N264 ; aucun envoi MIDI.','en'),'Result loaded in editor N264; no MIDI sent.')
assert.equal(m.translate('Préciser cette variante pour le fichier Sunrise Program.SYX','en'),'Specify the source variant for Sunrise Program.SYX')
assert.equal(m.translate('unlisted-preset-123','fr'),'unlisted-preset-123')
assert.ok(m.translate('Language','de')!=='Language','Existing German translations lost')
const opaque=h('span',{'data-i18n-skip':true},'Lire');assert.equal(m.translatedTree(opaque,'en'),opaque)
const panel=h('section',null,h('button',{title:'Close'},'Library'),h('input',{value:'Lire',readOnly:true}),opaque)
assert.equal(m.translatedTree(panel,'en'),panel);const en=render(m.translatedTree(panel,'en'));assert.ok(en.includes('>Library<')&&en.includes('title="Close"')&&en.includes('value="Lire"')&&en.includes('>Lire<'))
for(const language of ['en','fr']){const html=render(h(m.I18nContext.Provider,{value:{language,choice:language,setChoice(){}}},h(m.Ai2Effects,{patch:m.initialAi2Program('N1'),disabled:true,onChange(){}})));assert.ok(html.includes(language==='en'?'This model uses separate effects objects.':'Ce modèle utilise des objets effets séparés.'),language+' family effects view')}
console.log('PASS AI² localization: canonical EN/FR messages, French source aliases, whitespace, opaque identifiers, existing locales, UI rendering, protected names')

for(const directory of ['src/editors/korg-x5dr','src/instrument-families/korg-ai2','src/editor-host'])for(const name of readdirSync(directory).filter(n=>n.endsWith('.tsx'))){const file=directory+'/'+name,source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);function inspect(node){if(ts.isCallExpression(node)&&node.expression.getText(source)==='uiTranslate'){let parent=node.parent;while(parent&&!ts.isJsxElement(parent)&&!ts.isJsxSelfClosingElement(parent)){if(ts.isJsxAttribute(parent))assert.ok(!['key','value','defaultValue','checked','disabled','data-active'].includes(parent.name.getText(source)),'Translation changes identity/value: '+file);if(ts.isBinaryExpression(parent))assert.ok(![ts.SyntaxKind.EqualsEqualsEqualsToken,ts.SyntaxKind.ExclamationEqualsEqualsToken].includes(parent.operatorToken.kind),'Translation changes comparison: '+file);parent=parent.parent}}ts.forEachChild(node,inspect)}inspect(source)}
console.log('PASS UI localization leaves keys, values, modes and comparison operands intact')

for(const [key,...values]of m.ai2LocaleRows){assert.equal(values.length,6);for(const [i,locale]of ['it','de','ja','es','ru','zh'].entries()){assert.equal(m.translate(key,locale),values[i],key+' '+locale);assert.deepEqual([...values[i].matchAll(/\{([^}]+)\}/g)].map(v=>v[1]).sort(),[...key.matchAll(/\{([^}]+)\}/g)].map(v=>v[1]).sort(),'Placeholders '+key+' '+locale)}}
for(const row of [...m.ai2ExtraRows,...m.ai2ModelRows,...m.ai2BackupRows,...m.ai2ParameterRows])assert.equal(row.split('|').length,8,'Eight locale columns required')
assert.equal(m.translate('Éditer le résultat sur N264','ru'),'Редактировать результат на N264');assert.equal(m.translate('Lire banque Program','it'),'Leggi banco Program');assert.equal(m.translate('Rechercher','it'),'Cerca');
console.log('PASS all eight locales: six complete AI² catalogs, translated aliases and dynamic messages; placeholders preserved')

assert.equal(m.translate('OSC 1 VDF cutoff','ru'),'OSC 1 Частота среза VDF');assert.equal(m.translate('KEY TOP','it'),'Tasto superiore');assert.equal(m.translate('Sauvegarder les librairies · ZIP','ru'),'Резервная копия библиотек · ZIP')
for(const key of Object.keys(m.ai2French))for(const locale of ['en','fr','it','de','ja','es','ru','zh'])assert.equal(typeof m.catalog[key][locale],'string',key+' missing '+locale)

const sharedKeys=new Set(['Close','Files','Connect','Disconnect','Input','Output','Channel','Global theme','Preset name','Type','Search','Name','value','Notes','None','Destination']);const dedicatedKeys=new Set(m.ai2LocaleRows.map(row=>row[0]));for(const key of Object.keys(m.ai2French))assert.ok(dedicatedKeys.has(key)||sharedKeys.has(key),'New AI² message needs six translations: '+key)
