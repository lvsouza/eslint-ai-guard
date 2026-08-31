import { filenamePascalCase } from './rules/FilenamePascalCase.js'
import { noMultilineImports } from './rules/NoMultilineImports.js'
import { sortImports } from './rules/SortImports.js'


export const plugin = {
  meta: {
    name: 'eslint-plugin-ai-guard',
    version: '0.1.0',
  },
  rules: {
    'filename-pascal-case': filenamePascalCase,
    'no-multiline-imports': noMultilineImports,
    'sort-imports': sortImports,
  },
} as const
