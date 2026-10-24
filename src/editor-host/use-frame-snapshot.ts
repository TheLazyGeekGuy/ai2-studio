import {useMemo, useSyncExternalStore} from 'react'
import {createFrameStore} from './frame-store'

/** A view can sample snapshots without delaying MIDI decoding, queues or host services. */
export function useFrameSnapshot<T>(source: {getSnapshot(): T; subscribe(fn: () => void): () => void}): T {
 const store = useMemo(() => createFrameStore(source, {
  request: fn => window.requestAnimationFrame(fn), cancel: id => window.cancelAnimationFrame(id)
 }), [source])
 return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
