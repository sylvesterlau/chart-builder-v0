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
- Width and chart-area Height are configurable. Title and summary add to total card height. Top information and Tooltip always use Auto, evaluating each block independently from text length and available width. Legacy manual layout preferences are ignored.
- Large datasets and long labels still need layout refinement. Test on a duplicate before using in production.
- No network access requested. Chart data is stored in the Figma document, not sent to an external service.

## Verification

Model checks cover schema validation, persistence, negative decimals, preserved second-series values, invalid numbers, and bounded selection. Browser startup and live preview were verified without runtime errors. Desktop testing verified insert, update, close/reopen restoring an edited value, and Save as new. Update retained the original root ID and position.

Renderer repair validation: original plugin typecheck/build and experiment tests pass. Desktop insert/update tested at 480×320 and 640×400 chart-area sizes, including shared Rows. Browser checked 800×440 fit-to-panel and state retention across tabs. Persisted size/layout and legacy defaults have model regression coverage. Browser and Figma font metrics can still differ slightly.

Latest Auto-only repair: Desktop insertion at 390 px verified separate tooltip label/value rows with an 8 px gap. The browser Size panel exposes no manual layout selector. Model tests cover ignoring legacy layout choices. Tooltip placement can still obscure top information; this remains a separate layout issue.


Data/axis follow-up: Auto divisions now use chart height and domain expansion to choose a readable zero-anchored scale. Custom counts remain exact. Inactive B values/name stay in the current editor session but are stripped from saved single-series charts (including legacy single-series records when read). Switching back to dual after reopening generates replacement B values. Import templates and validation follow the active series count; the import page shows a table on success and blocks canvas actions until Apply or Back. Reducing categories clamps the selected tooltip category in editor state.

Verification: model regressions cover persistence, single/dual JSON bounds, selection reduction, adaptive scale coverage and custom counts. Browser interaction checks cover import success/error, immediate Insert blocking/re-enabling, table preview, 2→1→2 restoration across tabs, and 6→1 selection synchronization. Figma Desktop verified insert as single series after setting B1=987, close/reopen, Continue editing, and adding B again: B1 was freshly filled as 30 rather than restored as 987. Update chart then completed successfully.


Label/grid follow-up: Apply to displays current series names while retaining stable A/B targets. Axes & grid offers Auto or Every N categories (1–100); all data remains rendered and the selected category label stays visible. Auto uses a conservative text-width estimate and available chart width, so custom font metrics and unusually long labels still require visual review. Horizontal and vertical grids have independent visibility, separate from axis lines. Legacy grid=false migrates to both directions hidden. Model tests and browser checks cover these controls; original-plugin typecheck/build passes. A fresh Desktop visual check of these new grid/density combinations remains pending.


Horizontal canvas resizing: new experimental Bar charts distribute category containers evenly, stretch axes/grids, retain label font sizes, and keep the floating tooltip pointer aligned with the selected category. Verified in Figma Desktop at 390→780 px: six 115 px category slots in a 690 px plot, 12 px axis labels, screenshot checked. Tick counts and label density do not recalculate on canvas resize; vertical resizing is outside this change. Existing charts need Update to receive these constraints. Saved plugin size settings still control regeneration.
