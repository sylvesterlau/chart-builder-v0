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
- Preview and canvas now share the same normalized dataset and presentation model. Canvas uses the original Bar renderer and token binding helpers; Desktop preview resolves the same token payloads. Browser-only preview uses fallback tokens. Stacked bars and other chart types remain unfinished.
- Width and chart-area Height are configurable. Title and summary add to total card height. Top information and Tooltip share Auto / Horizontal / Rows; Auto evaluates each block independently from its actual text and available width.
- Large datasets and long labels still need layout refinement. Test on a duplicate before using in production.
- No network access requested. Chart data is stored in the Figma document, not sent to an external service.

## Verification

Model checks cover schema validation, persistence, negative decimals, preserved second-series values, invalid numbers, and bounded selection. Browser startup and live preview were verified without runtime errors. Desktop testing verified insert, update, close/reopen restoring an edited value, and Save as new. Update retained the original root ID and position.

Renderer repair validation: original plugin typecheck/build and experiment tests pass. Desktop insert/update tested at 480×320 and 640×400 chart-area sizes, including shared Rows. Browser checked 800×440 fit-to-panel and state retention across tabs. Persisted size/layout and legacy defaults have model regression coverage. Browser and Figma font metrics can still differ slightly.
