// Generated from src/editor-modules.json. Run npm run modules:generate; do not edit.
import type {EditorModule} from './contracts'
import {x5drModule as entry0} from '../editors/korg-x5dr/module'
export const generatedModules:readonly EditorModule[]=Object.freeze([entry0])
const declaredIds=["korg-x5dr-editor"]
if(generatedModules.some((entry,index)=>entry?.manifest.id!==declaredIds[index]))throw Error('Editor declaration/export mismatch')
