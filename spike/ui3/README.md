# Hive UI3 library spike

Completed UI comparison checkpoint. The selected direction is Preact with the independent, minimal Hive UI3 components. The comparison includes six variants; earlier reports retain historical recommendations and are not the final decision.

## Run locally

Use Node 22 or 24. Install the repository dependencies at its root, then:

```sh
cd spike/ui3
npm ci
npm run build
npm run preview
```

Open http://127.0.0.1:4173/hive-flow.html for the continuous Standard bar flow. The comparison index and component gallery are also available at that server. Rebuild after editing source.

## Scope

- Data: editable categories, values and series names; generation and JSON import.
- Design: axis title inputs and visibility in Axes & grid; Prefix, Suffix, Separator (Comma / None) and Axis shorthand (Auto / None) in Number format.
- Formatting affects displayed amounts, not raw values. Shorthand affects axis ticks only.
- State survives tab changes and 2→1→2 series switches within the current window.
- The preview is adapted from the repository's original Bar renderer in `preview/BarPreview.tsx`. Production `src` is unchanged.
- Browser checks cover inputs, dropdown keyboard behavior, JSON validation, state retention and formatting. Build uses esbuild; it is not a full TypeScript check.

This checkpoint does not insert or update canvas charts. Stacked rendering, adaptive Auto division count, real Figma token resolution and full Desktop validation remain outside the UI comparison. A separate experimental plugin branch will validate the host integration.

## Figma UI-only fixture

Build, then import `manifest.json` through Plugins → Development in Figma Desktop. A locally assigned development plugin ID may be required. The fixture has no canvas-writing handlers. Browser theme simulation does not establish host theme behavior.

## Repository hygiene

Only source, dependency lockfile, portable documentation and test code are versioned. Dependencies, generated bundles, screenshots, local evidence, credentials, agent instructions and vault records are excluded. Third-party packages are installed from their registries; their licenses still apply. See `HIVE-COMPONENTS.md` for implementation notes and the historical reports for comparison context.
