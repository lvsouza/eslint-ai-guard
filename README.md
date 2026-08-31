# eslint-plugin-ai-rules

[![npm version](https://img.shields.io/npm/v/eslint-plugin-ai-rules)](https://www.npmjs.com/package/eslint-plugin-ai-rules)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![node >=18](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](package.json)
[![eslint ^9](https://img.shields.io/badge/eslint-%5E9-4B32C3)](https://eslint.org)

Flat-config only ESLint plugin that bundles useful rules for AI-generated code. Ships a `recommended` preset with all rules enabled as `error` — zero config for consumers.

> **ESLint 9+ only.** Uses flat config (`eslint.config.{ts,js}`) and `eslint/config` `defineConfig`. No legacy `.eslintrc` support.

## Features

- **AI Rules rules** — catches typical AI drift: wrong filename casing, unsorted/multiline imports
- **Bundled preset** — `aiRules.configs.recommended` enables custom + `import-x`, `@stylistic`, `typescript-eslint` rules out of the box
- **Autofix** — `sort-imports` and `no-multiline-imports` are `fixable: code` (`eslint --fix`)
- **Dual build** — `dist/index.js` (ESM) + `dist/index.cjs` (CJS) via `tsup`, single-file bundle, `type: module`

## Requirements

- Node `>=18` (`package.json` `engines`)
- ESLint `^8.57.0 || ^9.0.0` (peer) — flat config requires ESLint 9
- TypeScript `>=5.0.0` (peer)
- `jiti` if you use `eslint.config.ts` (ESLint loads TS config via `jiti`)

`@eslint/js`, `eslint-plugin-import-x`, `@stylistic/eslint-plugin`, `typescript-eslint`, `globals` are already `dependencies` — you don't need to install them.

## Installation

```bash
# npm
npm i -D eslint-plugin-ai-rules eslint typescript

# yarn
yarn add -D eslint-plugin-ai-rules eslint typescript

# pnpm
pnpm add -D eslint-plugin-ai-rules eslint typescript

# bun
bun add -d eslint-plugin-ai-rules eslint typescript
```

> `jiti` is required only for `eslint.config.ts`. Install it as dev dep if you use TS config:
> ```bash
> npm i -D jiti
> ```

## Quick Start

### `eslint.config.ts` (recommended)

```ts
import aiRules from 'eslint-plugin-ai-rules'

export default [
  ...aiRules.configs.recommended,
]
```

### `eslint.config.js` / `eslint.config.mjs`

```js
import aiRules from 'eslint-plugin-ai-rules'

export default [
  ...aiRules.configs.recommended,
]
```

### With overrides

```ts
import aiRules from 'eslint-plugin-ai-rules'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  ...aiRules.configs.recommended,
  {
    // turn off filename check for tests or generated code
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', 'scripts/**/*'],
    rules: {
      'ai-rules/filename-pascal-case': 'off',
    },
  },
  {
    // or disable a bundled rule
    rules: {
      '@stylistic/semi': 'off',
    },
  },
])
```

Run:

```bash
npx eslint .
npx eslint --fix .   # autofix for sort-imports / no-multiline-imports
```

## Configuration

### `recommended` preset

`src/configs/recommended.ts` exports `defineConfig([...])` with:

- `globalIgnores(['dist', 'src/services/generated', 'scripts/types'])`
- `files: ['**/*.{ts,tsx}']` — `extends: [js.configs.recommended, tseslint.configs.recommended]`, `languageOptions.globals: globals.browser`, `import-x/resolver-next` with `extensions: ['.ts','.tsx','.d.ts','.js','.jsx']`
- `plugins: { '@stylistic': stylistic, 'import-x': importX, 'ai-rules': plugin }`
- Rules (all `error` unless noted):

| Rule | Default | Notes |
|------|---------|-------|
| `ai-rules/filename-pascal-case` | `error` | `src/` + `scripts/` only. See below |
| `ai-rules/sort-imports` | `error` | Groups + length desc, collapses multiline |
| `ai-rules/no-multiline-imports` | `error` | Single-line imports |
| `import-x/no-duplicates` | `error` |  |
| `import-x/no-default-export` | `off` |  |
| `max-len` | `off` |  |
| `@stylistic/semi` | `['error','never']` | No semicolons |
| `@typescript-eslint/consistent-type-imports` | `['error',{prefer:'type-imports'}]` |  |
| `@typescript-eslint/no-unused-vars` | `['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}]` |  |
| `@typescript-eslint/naming-convention` | `['error', {interface:'PascalCase' prefix I}, {typeAlias:'PascalCase' prefix T}]` | Second override disables it for `**/*.d.ts` + `scripts/**/*` |

Second config entry: `files: ['**/*.d.ts','scripts/**/*']` → `naming-convention: off`.

### Custom setup (without `recommended`)

```ts
import { plugin } from 'eslint-plugin-ai-rules'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'ai-rules': plugin },
    rules: {
      'ai-rules/sort-imports': 'error',
      'ai-rules/no-multiline-imports': 'warn',
      'ai-rules/filename-pascal-case': 'off',
    },
  },
])
```

You can also import rules individually:

```ts
import { filenamePascalCase, sortImports, noMultilineImports } from 'eslint-plugin-ai-rules'
```

## Rules

Brief overview. See source in `src/rules/` for full logic.

### `ai-rules/filename-pascal-case`

Enforces `PascalCase` for files under `src/` and `scripts/`.

- **Type:** `suggestion`, no autofix, `messageId: invalid`
- **Ignores:** `index.{ts,tsx,js,jsx}`, `*.d.ts`, `*.css`
- **Checks:** `path.basename` normalized via `path.sep`, `getPhysicalFilename()` / `getCwd()` aware, `^[A-Z][a-zA-Z0-9]*$`, `kebab/snake -> PascalCase` conversion

```ts
// src/my-component.ts  ❌  File name "my-component.ts" must be in PascalCase. Rename to "MyComponent.ts".
// src/MyComponent.ts   ✅
```

To disable internally (as this repo does in `eslint.config.ts`):

```ts
import { defineConfig } from 'eslint/config'
import { recommended } from './src/configs/recommended'

export default defineConfig([
  ...recommended,
  { files: ['src/**/*'], rules: { 'ai-rules/filename-pascal-case': 'off' } },
])
```

### `ai-rules/no-multiline-imports`

Disallows multiline `ImportDeclaration`.

- **Type:** `layout`, `fixable: code`, `messageId: multilineImport`
- **Fix:** collapses `{`, `}`, `,` and whitespace to single line: `import { b, a } from 'lodash'`

```ts
// ❌
import {
  b,
  a
} from 'lodash'

// ✅ after --fix
import { b, a } from 'lodash'
```

Note: `ai-rules/sort-imports` also collapses multiline; both fixers may run, but `sort-imports` handles the full `Program` sort.

### `ai-rules/sort-imports`

Sorts imports by group and line-length descending, collapsing multiline imports.

- **Type:** `layout`, `fixable: code` (`Program` fixer), `messageId: sortRequired`
- **Groups (in order, each separated by one blank line):**
  1. Directives (`'use client'`, `'use server'`, `'use strict'`)
  2. External (`react` first, then other externals sorted by `line.length` desc → `localeCompare`)
  3. Internal (`.`, `@/` sorted same)
  4. Re-exports (`export { ... } from`, `export * from` sorted same)
- **Rest:** code after imports, joined with `\n\n\n` (two blank lines between imports and code)
- **Directives:** preserved at top while `canAcceptDirectives` is true

```ts
// ❌ before --fix
import { local } from './local'
import { a } from 'lodash'
import React from 'react'

// ✅ after --fix
import React from 'react'
import { a } from 'lodash'

import { local } from './local'
```

Supports side-effect `import 'polyfill'`, `import type`, `export * from`, `export { ... } from`.

## TypeScript

Plugin itself uses `module: ESNext` + `moduleResolution: bundler` (`tsconfig.json`) and **no `.js` extensions** in source imports (e.g., `from './plugin'`). Output is bundled to single `dist/index.js` via `tsup`, so consumers don't need to handle internal paths. For your project, any TS config works; the preset sets `languageOptions.globals: globals.browser` and `import-x/resolver-next`.

## Troubleshooting

**`jiti` is required for loading TypeScript configuration files**
```
Error: The 'jiti' library is required for loading TypeScript configuration files.
```
Fix: `npm i -D jiti`

**File ignored because outside of base path**
You passed an absolute path outside the config's `basePath`. Run `npx eslint .` from project root or use `npx eslint --no-config-lookup -c ./eslint.config.js ./src/file.ts` with correct cwd.

**Flat config only**
This plugin exports `defineConfig` arrays. It does not support legacy `.eslintrc`. Use `eslint.config.{js,ts}`.

**Filename rule too strict for tests**
Override as shown in Quick Start: disable `ai-rules/filename-pascal-case` for `**/*.test.*`, `**/*.spec.*`, or your own `src/__fixtures__`.

## Development

```bash
git clone <repo>
cd eslint-ai-guard
npm install

npm run typecheck  # tsc --noEmit
npm run lint       # eslint .
npm run lint -- --fix
npm run build      # tsup -> dist/index.js + dist/index.cjs + dist/index.d.ts
npm run dev        # tsup --watch
npm pack --dry-run # verify files: dist only
```

### Project structure

```
eslint-ai-guard/  # package: eslint-plugin-ai-rules
├── src/
│   ├── index.ts              # re-exports plugin + recommended
│   ├── plugin.ts             # plugin.meta + rules
│   ├── configs/
│   │   ├── recommended.ts    # defineConfig preset (bundled rules)
│   │   └── index.ts
│   └── rules/
│       ├── FilenamePascalCase.ts
│       ├── NoMultilineImports.ts
│       ├── SortImports.ts    # also exports getSortedContent
│       └── index.ts
├── eslint/                   # deprecated original implementations
├── eslint.config.ts          # dogfooding: ...recommended + disable filename for src
├── tsconfig.json             # ESNext/bundler, no .js extensions
├── tsup.config.ts            # entry src/index.ts, format cjs+esm, dts, splitting:false
├── package.json              # type module, exports ., files [dist]
└── dist/                     # build output (gitignored)
```

### Adding a new rule

1. Create `src/rules/MyRule.ts` (`Rule.RuleModule`, `meta.messages`, `fixable` if needed)
2. Export it from `src/rules/index.ts`
3. Register in `src/plugin.ts` (`rules: { 'my-rule': myRule }`)
4. Enable in `src/configs/recommended.ts` (`'ai-rules/my-rule': 'error'`)
5. Add fixture and test `npx eslint --fix` on `src/__fixtures__/MyRule_test.ts`
6. `npm run typecheck && npm run build && npx eslint .`

### Publishing

```bash
npm version patch|minor|major
npm run build
npm publish --access public
# prepublishOnly runs build automatically
```

## Legacy

`eslint/` keeps the three original rule files before packaging (deprecated). Source of truth is now `src/rules/`.

## License

MIT
