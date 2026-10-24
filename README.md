# AI² Studio

Browser editor and librarian for the Korg AI² synthesis family, built on the MIDI Studio host.

- **X5DR**: native editor with hardware editing over MIDI (Program, Combination, Multi, Drums, Global), live edits, auto edit, library and banks.
- **20 other AI² models** (01/W series, 03R/W, 05R/W, X2, X3, X3R, X5, X5D, N264, N364, NS5R, NX5R, N5, N5EX, N1, N1R): file editing (SysEx, workspace JSON), offline conversion between models, Combi editing, keyboard/controller routing. Hardware editing for these models is not enabled.
- One workstation for every model: a model slider, aligned oscillator columns (Source / VDF / VDA, then their envelopes), draggable envelopes, a single toolbar, one MIDI connection panel and a bottom drawer for the monitor, keyboard play, A/B, files and presentation.

```sh
npm install
npm run dev        # http://127.0.0.1:5173 ; add ?midi=manual to start without the MIDI permission request
npm test           # offline suites + type check
npm run build      # dist/, works from any sub-path
```

Hardware STORE is never sent: edits go to the volatile edit buffer only. The application stores drafts and the library in this browser (IndexedDB).
