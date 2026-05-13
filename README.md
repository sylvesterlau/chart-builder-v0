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
- **`dataVisAt(index)`** — Cycles `ds.colors.dataVis.general` for slice/bar colors.
- **`sampleData`** — Demo rows for chart pages (not part of `ds`).
