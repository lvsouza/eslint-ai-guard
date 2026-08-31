// @ts-check
import { defineConfig } from 'eslint/config'
import aiRules from './dist/index.js'

// Dogfooding via dist (requires build before lint, see package.json prelint)
// For consumers: import aiRules from 'eslint-plugin-ai-rules'
// export default [...aiRules.configs.recommended]
export default defineConfig([
  ...aiRules.configs.recommended,
  {
    // Disable filename-pascal-case for internal development
    // Exported recommended still has it enabled for consumers
    files: ['src/**/*', 'eslint/**/*', '*.config.*'],
    rules: { 'ai-rules/filename-pascal-case': 'off' },
  },
])
