import { defineConfig } from 'eslint/config'

import { recommended } from './src/configs/recommended'


// Config do próprio repo (dogfooding) - consome o plugin via src
// Para consumidores externos: import aiGuard from 'eslint-plugin-ai-guard'
// export default [...aiGuard.configs.recommended]
export default defineConfig([
  ...recommended,
  {
    // Desativa filename-pascal-case para desenvolvimento interno do plugin
    // O recommended exportado continua com a regra ativada para consumidores
    files: ['src/**/*', 'eslint/**/*', '*.config.*'],
    rules: { 'ai-guard/filename-pascal-case': 'off' },
  },
])
