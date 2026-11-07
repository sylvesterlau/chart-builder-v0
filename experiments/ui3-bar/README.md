# Experimental UI3 Bar plugin

A real Figma development plugin using the selected independent Preact controls from the UI3 spike. This feature branch starts from main; the comparison spike remains archived separately.

## Build and run

Use Node 22 or 24. From the repository root:

```sh
npm install --prefix experiments/ui3-bar
npm run build --prefix experiments/ui3-bar
npm test --prefix experiments/ui3-bar
```

In Figma Desktop, create a development plugin using **Plugins → Development → New plugin**. Copy its generated `id` into the local `experiments/ui3-bar/manifest.json`, then import that manifest. The build preserves this ID. Keep using the same ID to reopen saved charts. The manifest is intentionally ignored by Git. No community publication is required.

Select **Hive UI3 · Experimental Bar**, choose Standard bar, edit data and design, and insert. Select the resulting chart and reopen the plugin to continue editing. Update preserves its root ID and position; Save as new inserts a separate chart. Updating regenerates internal layers, so manual edits inside those layers are replaced.

Optional browser preview: `npm run preview --prefix experiments/ui3-bar`, then open http://127.0.0.1:4174/. Canvas operations require Figma.

## Scope and limitations

- Single/dual grouped bar; editable category and series names, generated or imported JSON data, preview, number format and axes controls.
- Persisted chart dataset and display settings use a versioned plugin-data schema. Generator controls reset on reopening; the generated dataset is preserved.
- Reopening recognizes only charts made by this experimental plugin ID, not legacy charts.
- The preview reuses the existing Bar preview. The experimental canvas renderer creates native text and rectangles with fallback styling; exact layout parity, design-token binding, stacked bars and other chart types remain unfinished.
- Large datasets and long labels still need layout refinement. Test on a duplicate before using in production.
- No network access requested. Chart data is stored in the Figma document, not sent to an external service.

## Verification

Model checks cover schema validation, persistence, negative decimals, preserved second-series values, invalid numbers, and bounded selection. Browser startup and live preview were verified without runtime errors. Desktop testing verified insert, update, close/reopen restoring an edited value, and Save as new. Update retained the original root ID and position.
