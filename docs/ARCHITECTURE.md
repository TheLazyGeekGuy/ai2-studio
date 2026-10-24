# Architecture

AI² Studio is assembled from the MIDI Studio monorepo by `scripts/assemble-ai2-studio.mjs`:

- the standalone host shared by every MIDI Studio edition (`publication/standalone-shared-files.txt`);
- the `korg-x5dr-editor` module and every file it imports, found by an esbuild walk of its module and view (lazy chunks included): `src/editors/korg-x5dr/`, `src/instrument-families/korg-ai2/` (21 model definitions, codecs, conversion, file editors, panels), the shared envelope graph, library and editor-host pieces, and the model slider;
- the editor's offline test scripts (`scripts/test-*.mjs`, listed in `tests/suites.json`).

`vite.config.mts` sets the distribution to that single module in standalone mode, with the library tool.
