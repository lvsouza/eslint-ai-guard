import { importX, createNodeResolver } from 'eslint-plugin-import-x'
import { defineConfig, globalIgnores } from 'eslint/config'
import stylistic from '@stylistic/eslint-plugin'
import tseslint from 'typescript-eslint'
import globals from 'globals'
import js from '@eslint/js'

import { plugin } from '../plugin'


export const recommended = defineConfig([
  globalIgnores(['dist', 'src/services/generated', 'scripts/types']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      '@stylistic': stylistic,
      'import-x': importX,
      'ai-rules': plugin,
    },
    settings: {
      'import-x/resolver-next': [
        createNodeResolver({
          extensions: ['.ts', '.tsx', '.d.ts', '.js', '.jsx'],
        }),
      ],
    },
    rules: {
      'ai-rules/sort-imports': 'error',
      'ai-rules/no-multiline-imports': 'error',
      'ai-rules/filename-pascal-case': 'error',
      'max-len': 'off',
      'import-x/no-duplicates': 'error',
      'import-x/no-default-export': 'off',
      '@stylistic/semi': ['error', 'never'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeAlias', format: ['PascalCase'], prefix: ['T'] },
      ],
    },
  },
  {
    files: ['**/*.d.ts', 'scripts/**/*'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
])

export default recommended
