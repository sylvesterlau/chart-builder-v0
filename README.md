# Chart builder

A Figma plugin for quick chart experiments. The UI is built with [create-figma-plugin](https://github.com/yuanqing/create-figma-plugin), Preact, and TypeScript. Generated output uses native Figma frames, text, vectors, and rectangles. Preview and canvas output read shared design tokens from `src/config.ts` (`ds` and legacy flat exports).

## Chart types

Pie, donut, semi-donut, horizontal bar (stacked).

## Build and install

1. Clone or extract the project, then install and build:

```bash
npm install
npm run build
npm run dev
```

2. In Figma, **Plugins → Development → Import plugin from manifest** and choose the generated `manifest.json` in this repo.

3. Edit **`src/config.ts`** to match your palette, typography, chart dimensions, and (for variable lookup) your library collection usage. Restart or rebuild the plugin after changes.

## Scripts

```bash
# Production build (typecheck + minify)
npm run build

# Watch + typecheck (same as npm run watch)
npm run dev
```

Compiled output: `build/main.js`, `build/ui.js` (see `manifest.json`).

## Project layout

```
src/                      # app source root
├── main.ts               # plugin main thread, messages, Figma API
├── ui.tsx                # Preact UI root, screen routing
├── config.ts             # design tokens (`ds`), sample data
├── types.ts              # shared TypeScript types
├── helpers.ts            # main-thread utilities (e.g. variables)
├── pages/                # full-screen flows per feature
├── components/           # previews, inputs, small UI pieces
└── utils/                # chart draw helpers, typography on canvas
```

## Configuration (`src/config.ts`)

- **`ds`** — Primary design-system object: **`colors`** (`dataVis.general`, `text`), **`chartTitle`**, **`legend`** (typography, spacing, `color.divider`), **`chart.semiDonut`** (`size`, `ratio`, `totalValue.typography`), **`chart.pie`** (frame size, radii, `donutInnerRadiusRatio`, **`indicator`** with line/label offsets, slice and leader-line stroke weights, and indicator **typography**).
- **`pluginUISize`** — Plugin shell only (not under `ds`): **`homePage`** (default) and **`editPage`** (wide chart editors). The design system screen resizes to **490×490** while it is open, then restores the home size on exit.
- **Legacy exports** — `dataVisColor`, `textColor`, `dividerColor`, `pieChartConfig`, `semiDonutChartConfig`, `legendSpacingConfig`, and **`typography`** (flattened chart title, legend, pie indicator, semi-donut total value) alias into `ds` for existing imports.
- **Chart calculations** — `src/utils/chart/` (`sizeBounds`, `semiDonutCalculate`, `pieDonutCalculate`, `lineChartCalculate`) and `src/utils/dataVisAt.ts` for layout math and palette indexing.
- **`sampleData`** — Demo rows for chart pages (not part of `ds`).

## Embedded JSON spike (horizontal stacked bar + line chart)

Branch: `codex/spike/chart-json-persistence`.

The chart's root frame stores a versioned JSON envelope under plugin data key
`hive_chart_config`. It contains the complete editor draft (including hidden title
and legend choices), chart type, schema version and revision. No server or external
JSON file is required. Opening the plugin with a chart or its child selected restores
that draft. **Update chart** keeps the root ID and rebuilds its children; **Insert copy**
creates a separate chart. Stale revisions are rejected before replacing content.

### Validation performed

- `npm run build`: typecheck and production build passed on Node 22.
- `npm run test:spike`: eight tests cover horizontal/line draft round trips, invalid/future records,
  UTF-8 size limits, child/copy ownership and stale updates.
- Figma desktop: generated a chart, closed/reopened the plugin and restored its
  custom label; changed the first value from 412 to 600 while retaining root `7:74`;
  duplicated it with Figma Duplicate and reopened copy `7:145`, restoring value 600.
- Native test artifacts: [JSON spike sandbox](https://www.figma.com/design/DdO1KrhSLV8nuShxVARAjx?node-id=9-71).

Line chart extension: stores actual series values and editor settings (including
hidden title, date/time inputs, tooltip percentage and the number unit while in
percentage mode). Reopening does not regenerate random data. Size validation matches
the renderer: width 260–1200, plot height 260–900.

Figma desktop line validation: created a two-series time-axis chart at width 600,
closed/reopened it, changed its series name and updated root `7:231`. Both curve
vector paths matched the pre-reopen paths exactly. Native Duplicate produced
`7:365`; reopening restored the updated series name, width and time range.

### Scope and limits

- Only newly created horizontal stacked bars and line charts carry this configuration. Existing
  charts without metadata cannot be reconstructed reliably from their layers.
- Updating replaces manual edits inside the chart. Use Insert copy to preserve
  those edits. This is a feasibility spike, not a general layer reconciliation engine.
- Styling uses the current plugin design tokens; resolved token values are not
  snapshotted. A future renderer/schema migration policy is still needed.
- Plugin data belongs to the plugin ID. Keep a stable registered ID for distribution
  and collaboration; the repository still contains its development ID placeholder.
  Different-user and cross-file behavior have not been tested here.
- The spike rejects configurations over 90 kB. JSON is document metadata, not a
  secure store for credentials or secrets.
- Preact is bounded to major 10 and TypeScript to 6.0.x because the existing build
  integration failed when the former open-ended ranges installed their next majors.

### JSON debug inspector

Saved horizontal bars and line charts expose **查看 / 导出 JSON** in their editor
footer. It rereads `hive_chart_config` from the session's root Frame, displays a
read-only formatted view, and exports the exact raw stored JSON through Figma's
save dialog. Unsaved editor changes are excluded. **重新读取** refreshes the snapshot;
**返回编辑** or Escape closes it without discarding editor inputs.

Verified in Figma desktop: opened saved line chart `7:431`, read its metadata,
exported a valid JSON file through the native save dialog, and parsed the exported
file (two series, 100 points each). Build and whitespace checks pass.
