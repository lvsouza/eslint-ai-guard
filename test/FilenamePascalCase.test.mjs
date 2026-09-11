import assert from 'node:assert/strict'
import { test } from 'node:test'

import { Linter, RuleTester } from 'eslint'

import aiRules from '../dist/index.js'

const rule = aiRules.rules['filename-pascal-case']

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: 'module' },
})

ruleTester.run('filename-pascal-case', rule, {
  valid: [
    { code: '', filename: 'index.ts' },
    { code: '', filename: 'types.d.ts' },
    { code: '', filename: 'styles.css' },
    { code: '', filename: '.eslintrc.cjs' },
    { code: '', filename: 'MyComponent.ts' },
    { code: '', filename: 'ValidationRanges.test.ts' },
    { code: '', filename: 'MyComponent.stories.tsx' },
    {
      code: '',
      filename: 'ValidationRanges.Test.ts',
      options: [{ ignoreMiddleExtensions: false }],
    },
    {
      code: '',
      filename: 'vitest.config.ts',
      options: [{ ignore: ['\\.config\\.'] }],
    },
  ],
  invalid: [
    {
      code: '',
      filename: 'my-component.ts',
      errors: [
        {
          messageId: 'invalid',
          data: { basename: 'my-component.ts', expected: 'MyComponent.ts' },
        },
      ],
    },
    {
      code: '',
      filename: 'my_component.ts',
      errors: [{ message: 'File name "my_component.ts" must be in PascalCase. Rename to "MyComponent.ts".' }],
    },
    {
      code: '',
      filename: 'my-component.test.ts',
      errors: [
        {
          messageId: 'invalid',
          data: {
            basename: 'my-component.test.ts',
            expected: 'MyComponent.test.ts',
          },
        },
      ],
    },
    {
      code: '',
      filename: 'ValidationRanges.test.ts',
      options: [{ ignoreMiddleExtensions: false }],
      errors: [
        {
          messageId: 'invalid',
          data: {
            basename: 'ValidationRanges.test.ts',
            expected: 'ValidationRanges.Test.ts',
          },
        },
      ],
    },
    {
      code: '',
      filename: 'vitest.config.ts',
      errors: [
        {
          messageId: 'invalid',
          data: {
            basename: 'vitest.config.ts',
            expected: 'Vitest.config.ts',
          },
        },
      ],
    },
  ],
})

const ruleId = 'ai-rules/filename-pascal-case'

function lint(filename, ruleEntry = 'error') {
  return new Linter().verify(
    '',
    {
      files: ['**/*.{js,cjs,mjs,ts,tsx}'],
      plugins: { 'ai-rules': aiRules },
      rules: { [ruleId]: ruleEntry },
    },
    { filename },
  )
}

test('ignore option skips matching files', () => {
  assert.equal(lint('vitest.config.ts').length, 1)
  assert.equal(
    lint('vitest.config.ts', ['error', { ignore: ['\\.config\\.'] }]).length,
    0,
  )
})

test('never reports a no-op suggestion', () => {
  assert.equal(lint('MyComponent.ts').length, 0)
})
