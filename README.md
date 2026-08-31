# eslint-plugin-ai-guard

ESLint plugin com regras úteis para projetos com ESLint — flat config only (ESLint 9+). Fornece `recommended` com todas as regras já ativadas.

## Instalação

```bash
npm i -D eslint-plugin-ai-guard
# peer
npm i -D eslint typescript
```

> `dependencies` já incluem `@eslint/js`, `eslint-plugin-import-x`, `@stylistic/eslint-plugin`, `typescript-eslint` e `globals`. Não precisa instalar manualmente.

## Uso

### Flat config (`eslint.config.ts`)

```ts
import aiGuard from 'eslint-plugin-ai-guard'

export default [
  ...aiGuard.configs.recommended,
  // overrides opcionais
  {
    rules: {
      'ai-guard/filename-pascal-case': 'off',
    },
  },
]
```

### Regras incluídas

Todas ativadas como `error` no `recommended`:

- `ai-guard/filename-pascal-case` — força PascalCase em `src/` e `scripts/` (ignora `index.*`, `*.d.ts`, `*.css`)
- `ai-guard/sort-imports` — ordena imports por grupo (react → externos → internos → re-exports) e tamanho da linha decrescente, colapsando multiline e com autofix (`Program`)
- `ai-guard/no-multiline-imports` — proíbe imports multiline (`ImportDeclaration` com autofix)
- `import-x/no-duplicates` — `error`
- `@stylistic/semi: ['error','never']`
- `@typescript-eslint/consistent-type-imports`, `no-unused-vars`, `naming-convention` (I/T prefix)

Veja `src/configs/recommended.ts` para o snapshot completo (inclui `globalIgnores` e `import-x/resolver-next`).

### Imports individuais

```ts
import { plugin } from 'eslint-plugin-ai-guard' // ou dist
import { filenamePascalCase, sortImports, noMultilineImports } from 'eslint-plugin-ai-guard'
```

### Desenvolvimento

```bash
npm run typecheck
npm run build   # tsup -> dist/index.{js,cjs} + .d.ts (dual CJS/ESM)
npm run lint
```

### Legado

Pasta `eslint/` mantém as implementações originais (deprecated). Fonte atual em `src/rules/`.

## Licença

MIT
