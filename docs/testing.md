# Testing

The automated test suite is part of the plugin repository so tests, fixtures,
and production code can change together.

## Runtime

Use Node.js 22, as declared in `.nvmrc`. Use any Node.js installation or
version manager available on your system. For example, with `nvm`:

```bash
nvm use
```

GitHub Actions installs Node.js 22 independently through `actions/setup-node`.

## Commands

```bash
# Run all automated tests once
npm test

# Run unit tests only
npm run test:unit

# Re-run affected tests while developing
npm run test:watch

# Typecheck, build, and run all automated tests
npm run check
```

## Current coverage

The first test layer covers deterministic business and chart calculations in a
Node.js environment. The initial suite protects:

- pie, donut, and semi-donut size, ring-width, and gap calculations;
- deterministic line-chart sample data and UTC labels;
- positive, negative, and mixed-sign Cartesian domains and scales;
- finite coordinate mapping and zero-axis positioning.

Future layers will add plugin UI behavior tests, a Figma API mock for generated
node-tree contracts, browser screenshot regression tests, and a real-Figma
smoke-test workflow.

## Test rules

- Prefer behavior and invariant assertions over implementation details.
- Every fixed bug should gain a regression test that fails without the fix.
- Test invalid and boundary inputs as well as the default happy path.
- Do not update snapshots or visual baselines without reviewing the difference.
- Keep real-Figma visual checks separate from tests that must run in CI.

## Continuous integration

GitHub Actions runs `npm run check` for every push and pull request. Repository
branch protection should require the `test` job before changes can merge into
`main`.
