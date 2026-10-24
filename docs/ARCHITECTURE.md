# Architecture

AI² Studio is assembled from the MIDI Studio monorepo by `scripts/assemble-ai2-studio.mjs`:

- the standalone host shared by every MIDI Studio edition (`publication/standalone-shared-files.txt`);
- the `korg-x5dr-editor` module and every file it imports, found by an esbuild walk of its module and view (lazy chunks included): `src/editors/korg-x5dr/`, `src/instrument-families/korg-ai2/` (21 model definitions, codecs, conversion, file editors, panels), the shared envelope graph, library and editor-host pieces, and the model slider;
- the editor's offline test scripts (`scripts/test-*.mjs`, listed in `tests/suites.json`).

`vite.config.mts` sets the distribution to that single module in standalone mode, with the library tool.

## Reference repository

Since 2026-10-25 this repository is the home of the Korg AI² editor. The assembler only bootstrapped it; changes are made here, not in MIDI Studio or bcr32 studio. MIDI Studio's own Patchbay integration of this editor stays in MIDI Studio.

Taken from MIDI Studio's 2026-10-24 work on its built-in copy: the « Korg AI² » name, the façade and patch-number fixes, and the editor side of browser session recovery (`context.recovered`: keep the local draft, identify only, no implicit Live; covered by `scripts/test-x5dr-session-resume.mjs`). The standalone host here does not yet restore sessions itself; a host that sets `recovered` gets that behaviour.
