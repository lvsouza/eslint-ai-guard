import { filenamePascalCase } from './rules/FilenamePascalCase'
import { noMultilineImports } from './rules/NoMultilineImports'
import { sortImports } from './rules/SortImports'


export const plugin = {
  meta: {
    name: 'eslint-plugin-ai-rules',
    version: '0.1.0',
  },
  rules: {
    'filename-pascal-case': filenamePascalCase,
    'no-multiline-imports': noMultilineImports,
    'sort-imports': sortImports,
  },
} as const
