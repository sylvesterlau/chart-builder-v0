# Preact Rectangles (slim)

This is a slim copy of the original `preact-rectangles` plugin containing only the minimal files needed to inspect, build or transfer the project.

Included:

- manifest.json
- package.json
- tsconfig.json
- src/main.ts
- src/ui.tsx
- src/types.ts

How to restore and build

1. Extract the folder.
2. In the folder run:

```bash
npm install
npm run build
```

3. Use the generated `manifest.json` and the `build/` folder to import the plugin into Figma (see original README for details).
