# Experimental UI3 Charts plugin

A real Figma development plugin using the selected independent Preact controls from the UI3 spike. This feature branch starts from main; the comparison spike remains archived separately.

## Build and run

Use Node 22 or 24. From the repository root:

```sh
npm install --prefix experiments/ui3-bar
npm run build --prefix experiments/ui3-bar
npm test --prefix experiments/ui3-bar
```

In Figma Desktop, create a development plugin using **Plugins → Development → New plugin**. Copy its generated `id` into the local `experiments/ui3-bar/manifest.json`, then import that manifest. The build preserves this ID. Keep using the same ID to reopen saved charts. The manifest is intentionally ignored by Git. No community publication is required.

Select **Hive UI3 · Experimental Charts**, choose Standard bar, Line chart or Pie & Donut, edit data and design, and insert. Select the resulting chart and reopen the plugin to continue editing. Update preserves its root ID and position; Save as new inserts a separate chart. Updating regenerates internal layers, so manual edits inside those layers are replaced.

Optional browser preview: `npm run preview --prefix experiments/ui3-bar`, then open http://127.0.0.1:4174/. Canvas operations require Figma.

## Scope and limitations

- Single/dual grouped bar; editable category and series names, generated or imported JSON data, preview, number format and axes controls.
- Persisted chart dataset and display settings use a versioned plugin-data schema. Generator controls reset on reopening; the generated dataset is preserved.
- Reopening recognizes only charts made by this experimental plugin ID, not legacy charts.
- Preview and canvas now share the same normalized dataset and presentation model. Canvas uses the original Bar renderer and token binding helpers; Desktop preview resolves the same token payloads. Browser-only preview uses fallback tokens. Stacked bars, horizontal composition bars and semi-donuts remain unfinished.
- Width and chart-area Height are configurable. Title and summary add to total card height. Top information and Tooltip always use Auto, evaluating each block independently from text length and available width. Legacy manual layout preferences are ignored.
- Large datasets and long labels still need layout refinement. Test on a duplicate before using in production.
- No network access requested. Chart data is stored in the Figma document, not sent to an external service.

## Verification

Model checks cover schema validation, persistence, negative decimals, preserved second-series values, invalid numbers, and bounded selection. Browser startup and live preview were verified without runtime errors. Desktop testing verified insert, update, close/reopen restoring an edited value, and Save as new. Update retained the original root ID and position.

Renderer repair validation: original plugin typecheck/build and experiment tests pass. Desktop insert/update tested at 480×320 and 640×400 chart-area sizes, including shared Rows. Browser checked 800×440 fit-to-panel and state retention across tabs. Persisted size/layout and legacy defaults have model regression coverage. Browser and Figma font metrics can still differ slightly.

Latest Auto-only repair: Desktop insertion at 390 px verified separate tooltip label/value rows with an 8 px gap. The browser Size panel exposes no manual layout selector. Model tests cover ignoring legacy layout choices. Floating Tooltip may obscure top information by design; no additional reserved band is inserted.


Data/axis follow-up: Auto divisions now use chart height and domain expansion to choose a readable zero-anchored scale. Custom counts remain exact. Inactive B values/name stay in the current editor session but are stripped from saved single-series charts (including legacy single-series records when read). Switching back to dual after reopening generates replacement B values. Import templates and validation follow the active series count; the import page shows a table on success and blocks canvas actions until Apply or Back. Reducing categories clamps the selected tooltip category in editor state.

Verification: model regressions cover persistence, single/dual JSON bounds, selection reduction, adaptive scale coverage and custom counts. Browser interaction checks cover import success/error, immediate Insert blocking/re-enabling, table preview, 2→1→2 restoration across tabs, and 6→1 selection synchronization. Figma Desktop verified insert as single series after setting B1=987, close/reopen, Continue editing, and adding B again: B1 was freshly filled as 30 rather than restored as 987. Update chart then completed successfully.


Label/grid follow-up: Apply to displays current series names while retaining stable A/B targets. Axes & grid offers Auto or Every N categories (1–100); all data remains rendered and the selected category label stays visible. Auto uses a conservative text-width estimate and available chart width, so custom font metrics and unusually long labels still require visual review. Horizontal and vertical grids have independent visibility, separate from axis lines. Legacy grid=false migrates to both directions hidden. Model tests and browser checks cover these controls; original-plugin typecheck/build passes. A fresh Desktop visual check of these new grid/density combinations remains pending.


Horizontal canvas resizing: new experimental Bar charts distribute category containers evenly, stretch axes/grids, retain label font sizes, and keep the floating tooltip pointer aligned with the selected category. Verified in Figma Desktop at 390→780 px: six 115 px category slots in a 690 px plot, 12 px axis labels, screenshot checked. Tick counts and label density do not recalculate on canvas resize; vertical resizing is outside this change. Existing charts need Update to receive these constraints. Saved plugin size settings still control regeneration.


## Line and Pie/Donut extension

Line uses the original renderer and source tokens, with a read-only dataset, JSON import, Date/Date & time generation, six trends, targeted series generation, Full/Partial display, visible-point tooltip selection, axes, independent grids and number format. Changing the generated timeline regenerates all active series. Imported irregular timestamps retain their relative spacing. Timestamps are design-demo wall-clock values; no timezone conversion is performed. The Y domain follows the original Line scale, rather than the Bar zero-baseline rule. Line + area is not supported.

Pie/Donut uses shared preview/canvas geometry and original typography, colors, ring width and legend spacing tokens. Values are non-negative with a positive total. Slices sort descending counterclockwise; more than six inputs become the largest five plus Others, which stays last. Direct labels and legend are mandatory. Donut center offers None / Total / Category. Each legend category occupies a full-width row, like the original plugin: Left and right places name/value alongside each other; Top and bottom stacks them. Auto falls back to stacked content when estimated text widths exceed the row. Internal saved values Horizontal/Rows are retained for schema compatibility.

Validation: model regressions cover all chart types, restore, irregular time spacing, Partial selection, Others ordering, zero-total rejection and both legend layouts. Both builds pass. Desktop verified Line/Pie/Donut insertion, Line/Donut restore and update, Pie/Donut switching and Save as new, and Pie legend-layout updates with the same root ID. Native screenshots were compared with original output/source styles. Browser checks cover JSON application and control flows.

Limits: text fitting uses conservative estimates; unusually long labels or center values still need visual review. Dense direct labels that cannot fit report a size error instead of overlapping deliberately. The Bar horizontal-resize postprocessor does not yet apply to Line/Pie/Donut; use plugin Width/Height and Update for these chart types. Generator preferences are session-local. This remains an experimental feature branch, not a production release.
