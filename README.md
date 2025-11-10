# Chart builder v0 (slim)

This is a slim copy of the chart-builder plugin used for experimentation and quick iteration. It contains the minimal files needed to build, inspect, and test the plugin locally.

Included:

- `manifest.json`
- `package.json`
- `tsconfig.json`
- `src/main.ts` (plugin entry)
- `src/helpers.ts` (utility and variable-binding helper)
- `src/ui.tsx`
- `src/types.ts`

Quick build

1. Extract the folder.
2. Replace the Theme collection key in `src/config.ts` `teamLibrary.coreToolKit.collectionKey`
3. Install and build:

```bash
npm install
npm run build
```

3. Use the generated `manifest.json` and the `build/` folder to import the plugin into Figma.
