import {ai2Model,type ResourceRules,type Resources} from './models'
const catalogs:Record<string,()=>Promise<{default:Resources}>>={
 "01/W":()=>import('./data/catalog-01_W.json'),
 "01/Wfd":()=>import('./data/catalog-01_Wfd.json'),
 "01R/W":()=>import('./data/catalog-01R_W.json'),
 "01/Wpro":()=>import('./data/catalog-01_Wpro.json'),
 "01/WproX":()=>import('./data/catalog-01_WproX.json'),
 "03R/W":()=>import('./data/catalog-03R_W.json'),
 "05R/W":()=>import('./data/catalog-05R_W.json'),
 "X2":()=>import('./data/catalog-X2.json'),
 "X3":()=>import('./data/catalog-X3.json'),
 "X3R":()=>import('./data/catalog-X3R.json'),
 "X5":()=>import('./data/catalog-X5.json'),
 "X5D":()=>import('./data/catalog-X5D.json'),
 "X5DR":()=>import('./data/catalog-X5DR.json'),
 "N264":()=>import('./data/catalog-N264.json'),
 "N364":()=>import('./data/catalog-N364.json'),
 "NS5R":()=>import('./data/catalog-NS5R.json'),
 "NX5R":()=>import('./data/catalog-NX5R.json'),
 "N5":()=>import('./data/catalog-N5.json'),
 "N5EX":()=>import('./data/catalog-N5EX.json'),
 "N1":()=>import('./data/catalog-N1.json'),
 "N1R":()=>import('./data/catalog-N1R.json'),
}
const rules={
 '01W':()=>import('./data/target-01W.json'),
 '01Wpro':()=>import('./data/target-01Wpro.json'),
 '03RW':()=>import('./data/target-03RW.json'),
 'N1':()=>import('./data/target-N1.json'),
 'N5':()=>import('./data/target-N5.json'),
 'X2':()=>import('./data/target-X2.json'),
 'X3':()=>import('./data/target-X3.json'),
 'X5D':()=>import('./data/target-X5D.json'),
}
export async function loadResources(id:string):Promise<Resources>{ai2Model(id);return (await catalogs[id]()).default}
export async function loadRules(id:string):Promise<ResourceRules>{const rom=ai2Model(id).rom as keyof typeof rules;return (await rules[rom]()).default}
