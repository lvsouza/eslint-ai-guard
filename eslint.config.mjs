// @ts-check
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import aiRules from './dist/index.js'

// Dogfooding via dist (requires build before lint, see package.json prelint)
// For consumers: import aiRules from 'eslint-plugin-ai-rules'
// export default [{ files: ['**/*.{ts,tsx}'], ...aiRules.configs.recommended }]
export default defineConfig([
  globalIgnores(['dist', 'src/services/generated', 'scripts/types']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
  },
  // ai-rules is file-agnostic — scope it to TS files for this repo
  ...aiRules.configs.recommended.map((c) => ({ ...c, files: ['**/*.{ts,tsx}'] })),
  {
    files: ['**/*.d.ts', 'scripts/**/*'],
    rules: { '@typescript-eslint/naming-convention': 'off' },
  },
  {
    // Disable filename-pascal-case for internal development
    // Exported recommended still has it enabled for consumers
    files: ['src/**/*', 'eslint/**/*', '*.config.*'],
    rules: { 'ai-rules/filename-pascal-case': 'off' },
  },
])
