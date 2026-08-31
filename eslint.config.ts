import { defineConfig } from 'eslint/config'

import { recommended } from './src/configs/recommended'


// Config do próprio repo (dogfooding) - consome o plugin via src
// Para consumidores externos: import aiRules from 'eslint-plugin-ai-rules'
// export default [...aiRules.configs.recommended]
export default defineConfig([
  ...recommended,
  {
    // Desativa filename-pascal-case para desenvolvimento interno do plugin
    // O recommended exportado continua com a regra ativada para consumidores
    files: ['src/**/*', 'eslint/**/*', '*.config.*'],
    rules: { 'ai-rules/filename-pascal-case': 'off' },
  },
])
