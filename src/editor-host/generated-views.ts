// Generated from src/editor-modules.json. Run npm run modules:generate; do not edit.
import type {EditorViewRegistration} from './view-contract'
import {x5drView as entry0} from '../editors/korg-x5dr/registration'
export const generatedViews:readonly EditorViewRegistration[]=Object.freeze([entry0])
const declaredIds=["korg-x5dr-editor"]
if(generatedViews.some((entry,index)=>entry?.moduleId!==declaredIds[index]))throw Error('Editor declaration/export mismatch')
