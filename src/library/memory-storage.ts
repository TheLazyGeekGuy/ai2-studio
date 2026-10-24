import {legacyOccurrence,mergeOccurrences,type LibraryOccurrence} from './occurrences'
import {libraryLimits,type LibraryStorage,type LibrarySource} from './storage'
import {emptyMetadata,validateMetadata,mergeMetadata,type LibraryMetadata} from './metadata'
/** Explicit ephemeral adapter for headless applications/tests, never an implicit failed-IDB fallback. */
export function createMemoryLibrary():LibraryStorage{
  let records=new Map<string,{source:LibrarySource;bytes:Uint8Array}>(),notes=emptyMetadata(),occurrences:LibraryOccurrence[]=[],closed=false
  const check=()=>{if(closed)throw Error('Library storage closed')}
  const merge=async(rows:readonly {source:LibrarySource;bytes:Uint8Array}[],metadata?:LibraryMetadata,copies?:readonly LibraryOccurrence[])=>{
    check();const next=new Map(records);let added=0
    for(const row of structuredClone(rows)){if(next.has(row.source.id))continue;if(row.source.size!==row.bytes.length)throw Error('Library source size mismatch');next.set(row.source.id,row);added++}
    const sources=[...next.values()].map(r=>r.source)
    if(next.size>libraryLimits.sources||sources.reduce((n,s)=>n+s.size,0)>libraryLimits.bytes||sources.reduce((n,s)=>n+s.inventory.entries.length,0)>libraryLimits.entries)throw Error('Library storage budget exceeded')
    const updated=metadata?validateMetadata(mergeMetadata(notes,validateMetadata(metadata,sources)),sources):notes
    const nextCopies=mergeOccurrences(occurrences,copies??sources.filter(s=>!records.has(s.id)).map(legacyOccurrence),sources)
    records=next;notes=updated;occurrences=nextCopies;return added
  }
  return {
    async list(){check();return structuredClone([...records.values()].map(r=>r.source))},
    async original(id){check();const row=records.get(id);if(!row)throw Error('Library source missing');return row.bytes.slice()},
    async insert(source,bytes){return (await merge([{source,bytes}]))===1},merge,
    async occurrences(){check();return structuredClone(occurrences)},
    async metadata(){check();return structuredClone(notes)},
    async setMetadata(value){check();notes=validateMetadata(value,[...records.values()].map(r=>r.source))},
    async removeSource(id){check();const next=new Map(records),updated=structuredClone(notes);next.delete(id);const instruments=new Set([...next.values()].flatMap(r=>r.source.inventory.entries.map(e=>e.instrumentId)));updated.aliases=updated.aliases.filter(a=>instruments.has(a.instrumentId));updated.annotations=updated.annotations.filter(a=>a.ref.sourceId!==id);for(const bank of updated.banks)bank.entries=bank.entries.filter(ref=>ref.sourceId!==id);notes=validateMetadata(updated,[...next.values()].map(r=>r.source));records=next;occurrences=occurrences.filter(o=>o.sourceId!==id)},
    close(){closed=true},
  }
}
