# AI² Studio

Browser editor and librarian for the Korg AI² synthesis family, built on the MIDI Studio host.

- **X5DR**: native editor with hardware editing over MIDI (Program, Combination, Multi, Drums, Global), live edits, auto edit, library and banks.
- **20 other AI² models**: active model-specific Program/Combi editors, complete documented parameters, readback-verified Live MIDI, banks, explicit user-memory saves, Global/kits and family-specific objects. NS5R/N5 generations also expose separate FX and Multi/Performance objects, banks and saves. Tests use simulated instruments; **hardware validation is assigned to users**, with the adapters enabled.
- One workstation for every model: a chronological model slider and clickable variant/compatibility graph, aligned oscillator columns (Source / VDF / VDA, then their envelopes), draggable envelopes, a single toolbar, one MIDI connection panel and a bottom drawer for the monitor, keyboard play, A/B, files and presentation.

```sh
npm install
npm run dev        # http://127.0.0.1:5173 ; add ?midi=manual to start without the MIDI permission request
npm test           # offline suites + type check
npm run build      # dist/, works from any sub-path
```

Live edits use temporary buffers. Global/legacy kit settings require Apply; persistent user-memory saves use a separate explicit action and destination-bank verification. No STORE is sent automatically. Drafts and the library are stored in this browser (IndexedDB).

[Implementation and qualification matrix](docs/EXPANSION-20261025.md). Native panels are model-specific reconstructions, with visual qualification still pending for several variants. Cross-family conversion reports partial mappings and preserves source data; it does not promise identical sound.
