# Independent Hive UI3 component spike

2026-10-30. New candidate, not a final implementation decision.

- Components: `components/hive.tsx`, scoped styling `components/hive.css`.
- Gallery: `hive-components.html`; integration: `hive.html`, `hive-panels.html`.
- Built independently in Preact using native HTML semantics. No FigUI3 source imports or translations. Existing Hive native-theme CSS reused and extended.
- Custom select: listbox, arrow/Home/End/Enter, typeahead, Escape focus return, outside click, scroll/resize dismissal, viewport positioning.
- Numeric field keeps raw drafts and precision; invalid values are marked. New Data candidate keeps last valid dataset in preview.
- Slider uses native range behavior; one-row dataset disables it. Tabs and segmented choices have keyboard support.
- Tooltip supports hover/focus, delay, Escape and scroll dismissal, aria-describedby.
- Uses existing shared spike pages and dataset editor; this is not a new spreadsheet engine. JSON validation/template behavior remains shared.

## Validation

Build passes. Browser checks exercise keyboard select/focus, Tooltip dismissal, invalid/decimal input, JSON failure/success and single-row slider. Re-runnable Playwright tool script: `tests/hive-browser.js` (function body for browser_run_code_unsafe; server must run on 4173).

Metafile confirms no FigUI3 inputs in the new candidate. Other comparison variants still use their original dependencies. Gallery ~31 KB JS + 3.8 KB CSS before compression; this includes Preact and is not a library-only measurement.

## Limits

- Desktop, Windows, IME, screen-reader and touch checks not performed in this round.
- Full accessible tab-panel association and richer tooltip hover behavior remain to refine.
- Existing renderer limitations remain: stacked unsupported, Auto divisions defaults to three, format controls are samples, real token bridge not wired.
- Existing preview showed missing chart geometry after repeated changes/theme switch; do not claim preview visual stability. Numeric config checks do not cover that issue.
- Browser theme uses existing comparison harness theme stylesheet. This is not a standalone publishable component package.
- No canvas insertion, publication or branch push.

## 2026-11-01 continuous flow and preview correction

`hive-flow.html`: Landing → Standard bar → Data ↔ Design → detail panels → Charts → Continue editing this session. Other chart cards are visibly disabled. Session memory stores dataset, series, title, generator controls and design configuration; it is not a persisted Figma selection/edit bridge. Existing fixture links remain available.

Root cause of disappearing preview dimensions: raw Preact 11 h() compilation bypassed compat numeric-style normalization. Original preview JSX now compiles through preact/compat.createElement in the spike build, preserving pixel units. No original src files changed. Six repeated theme/slider changes retained both legend swatches; screenshot confirms bars/axes remain rendered. Earlier attribution solely to React/Preact mixing was incomplete.

Validation: existing 8 browser checks pass; Data → Design → axes → Data retains decimal values and title; returning to Landing and continuing restores B=-72.25, Sales axis title and hidden tooltip. Build passes. Desktop and canvas insertion remain out of scope for this step. Generator applies/number formatting and stacked limitations previously documented remain.

## 2026-11-01 design reconciliation

Re-read Figma Data 98:1785 and Design 98:1935. Select trigger matches 24px height / 11px type / 24px chevron slot. Range track matches 16px with local Figma handle asset (40px including shadow). Native input remains the pointer/keyboard layer; visible track/fill/handle are separate. Studied FigUI3 native select/custom editor listbox and Figma Kit track/thumb separation as architecture references; no source copied.

Dataset series headers are editable session values, reflected in preview legends/tooltips and retained across Data/Design and 2→1→2. Category dropdown shows dataset labels. Browser regression 8/8 passes plus names, geometry, local asset loading and keyboard slider checked. Expanded dropdown styling is an implementation interpretation; the inspected screen specifies its closed state. Original preview layout and other section-spacing mismatches remain outside this change.

### Component state/spacing follow-up

Unified independent controls at 24px / 11px type, icon-only buttons at 24×24, property labels 150px, section padding 16px, detail button gap 8px and dataset gap 4px. Removed duplicate navigation divider and extra outer panel/footer borders. Slider handle now uses a solid brand center (user correction), white ring; removed blue focus perimeter, retaining subtle keyboard focus on the handle. Dropdown hides native scrollbar chrome but retains scroll/keyboard access for long lists; short-list height includes border to avoid incidental overflow. Existing 8 browser checks pass; computed styles confirm solid handle and no range outline. Not a claim of full visual parity or Desktop validation.

## 2026-11-07 Data / Design ownership

Data → Axis titles & number format now owns X/Y title text, Prefix, Suffix and separator. Back returns to Data. Design retains title visibility and axis shorthand; Axis lines follows Grid lines. Session values survive tab changes and visibility toggles.

`preview/BarPreview.tsx` is a spike-only adaptation of the original Bar renderer, not a replacement in `src`. `number-format.ts` formats amounts in summary, tooltip and axis ticks without changing dataset values; formatted ticks determine the axis gutter. Tooltip gets reserved space so it does not cover the summary. Axis baselines and grid visibility are independent. This supersedes the earlier sample-only formatting limitation. Stacked rendering, adaptive Auto division count and the Figma insertion bridge remain out of scope.

Validation: build passes; existing eight browser regressions pass; targeted browser checks cover field placement, title visibility, tab/back navigation, session persistence, rendered affixes and decimal/raw-data preservation. Data detail screenshot shows no config horizontal overflow.

### Final ownership revision
Supersedes the earlier Data placement: Design → Axes & grid owns axis-title text and visibility. Design → Number format owns Prefix, Suffix, Separator (Comma / None), and Axis shorthand (Auto / None). Shorthand affects ticks only; summary and tooltip retain full values. Data has no formatting detail entry. Build and targeted browser checks passed, including 12000 showing as a full summary value while the auto axis uses k, then switching shorthand and separator independently.
