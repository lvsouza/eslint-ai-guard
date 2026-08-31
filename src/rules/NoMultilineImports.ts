import type { Rule } from 'eslint'


export const noMultilineImports: Rule.RuleModule = {
  meta: {
    type: 'layout',
    fixable: 'code',
    docs: {
      description: 'Disallow multiline imports',
    },
    schema: [],
    messages: {
      multilineImport: 'Imports must be written on a single line.',
    },
  },

  create(context) {
    const sourceCode = context.sourceCode

    return {
      ImportDeclaration(node) {
        const text = sourceCode.getText(node)

        if (!text.includes('\n')) {
          return
        }

        context.report({
          node,
          messageId: 'multilineImport',

          fix(fixer) {
            const firstToken = sourceCode.getFirstToken(node)
            const lastToken = sourceCode.getLastToken(node)

            if (!firstToken || !lastToken) {
              return null
            }

            let importText = sourceCode.getText(node)

            importText = importText
              .replace(/\s*\{\s*/g, ' { ')
              .replace(/\s*\}\s*/g, ' } ')
              .replace(/\s*,\s*/g, ', ')
              .replace(/\s+/g, ' ')
              .replace(/ \{ /g, ' { ')
              .replace(/ \} /g, ' } ')
              .replace(/\s+from\s+/g, ' from ')
              .trim()
              // Corrige espaços colapsados em torno de { e }
              .replace(/\{ \s+/g, '{ ')
              .replace(/\s+ \}/g, ' }')

            return fixer.replaceText(node, importText)
          },
        })
      },
    }
  },
}
