/** Presentation-only sampling. The authoritative store still processes every event. */
export function createFrameStore<T>(source: {getSnapshot(): T; subscribe(fn: () => void): () => void}, clock: {
 request(fn: () => void): number; cancel(id: number): void
}) {
 let cached = source.getSnapshot(), pending: number | null = null, off: (() => void) | undefined
 const listeners = new Set<() => void>()
 const publish = () => {
  pending = null
  const next = source.getSnapshot()
  if (Object.is(next, cached)) return
  cached = next
  for (const listener of listeners) listener()
 }
 return {
  getSnapshot: () => cached,
  subscribe(listener: () => void) {
   listeners.add(listener)
   if (!off) {
    off = source.subscribe(() => { if (pending === null) pending = clock.request(publish) })
    // Catch events between render and subscription, including a StrictMode remount.
    publish()
   }
   return () => {
    listeners.delete(listener)
    if (!listeners.size) {
     off?.(); off = undefined
     if (pending !== null) clock.cancel(pending)
     pending = null
    }
   }
  }
 }
}
