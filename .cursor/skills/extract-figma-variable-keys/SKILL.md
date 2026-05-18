---
name: extract-figma-variable-keys
description: >-
  Extracts Figma Variables import keys (40-char hex) from design nodes for use
  with figma.variables.importVariableByKeyAsync and ColorToken.key in this repo.
  Use when filling src/config.ts keys, syncing tokens from a Figma file, or when
  the user mentions Figma variable keys, bound variables, or REST nodes API.
disable-model-invocation: true
---

# Extract Figma variable import keys

## Goal

Produce **`Variable.key`** strings (40 lowercase hex chars) that match **`figma.variables.importVariableByKeyAsync(key)`** and this project’s `ColorToken.key` fields.

These keys are **not** the human-readable paths (`dataVis/1`). They come from API bindings on paints.

## Prerequisites

- **Personal access token** with **`file_content:read`** (required for the nodes endpoint below).
- Token in env: **`FIGMA_TOKEN`**, **`FIGMA_ACCESS_TOKEN`**, or **`figma_api_key`** (project `.env`; never commit).
- Optional: **`file_variables:read`** only if using `GET /v1/files/:file_key/variables/local` instead (not needed for the recommended flow).

## Recommended: nodes + boundVariables

1. **File key** — from a design URL:
   `https://www.figma.com/design/<FILE_KEY>/…`

2. **Node ids** — from `node-id` in the URL (`88-205`) or from the desktop MCP `get_metadata`. Use them as **`88-206,88-209,…`** (hyphens) in the query.

3. **Request**:

   `GET https://api.figma.com/v1/files/<FILE_KEY>/nodes?ids=<id1>,<id2>,…`  
   Header: `X-Figma-Token: <token>`

4. **Parse** each node’s first solid fill:

   - Path: `nodes["88:206"].document.fills[0]` (response keys use **`:`**).
   - Read `boundVariables.color.id` — string like `VariableID:<40hex>/1:60`.
   - **Import key** = the first **40 hex chars** after `VariableID:` (regex: `VariableID:([a-f0-9]{40})`).

5. **Verify** resolved color vs `fills[0].color` (r,g,b 0–1 → `#RRGGBB`) matches the swatch you expect.

## Helper script

Script path (same skill directory): [`scripts/extract-figma-variable-keys.py`](scripts/extract-figma-variable-keys.py)

From **repository root** (after `source .env` or exporting token):

```bash
python3 .cursor/skills/extract-figma-variable-keys/scripts/extract-figma-variable-keys.py <FILE_KEY> --ids '88-206,88-209,88-217'
```

Prints `node_id`, layer `name`, **`variable_key`**, and **`#hex`** per requested node (root layer only — use separate `--ids` entries or extend the script to walk children when needed).

## MCP (desktop) limitation

Figma MCP **`get_variable_defs`** returns **path → resolved value** (e.g. `dataVis/1` → `#347893`). It does **not** return **`Variable.key`** for `importVariableByKeyAsync`. Use REST **nodes** (above) or **`variables/local`** with **`file_variables:read`**.

## Mapping into `src/config.ts`

- **`ds.colors.dataVis.general[i]`** — one entry per data-vis swatch; `key` = extracted import key, `value` = `#hex` from API or MCP.
- **`ds.colors.text.primary` / `onDark`** — use keys from the rectangles (or text layers) that bind **`text/primary`** and **`text/onDark`** (or equivalent).

## Security

Do not paste tokens into chat or commit `.env`. Rotate tokens if exposed.
