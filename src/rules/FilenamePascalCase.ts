import type { Rule } from 'eslint'
import path from 'node:path'


export const filenamePascalCase: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Enforce PascalCase for file names' },
    schema: [],
    messages: {
      invalid: 'File name "{{basename}}" must be in PascalCase. Rename to "{{expected}}".',
    },
  },
  create(context) {
    const physicalFilename =
      // eslint 9 flat config
      (context as unknown as { getPhysicalFilename?: () => string }).getPhysicalFilename?.() ??
      (context as unknown as { physicalFilename?: string }).physicalFilename ??
      context.filename ??
      ''

    const basename = path.basename(physicalFilename)

    if (basename === 'index.ts' || basename === 'index.tsx' || basename === 'index.js' || basename === 'index.jsx') return {}
    if (basename.endsWith('.d.ts')) return {}
    if (basename.endsWith('.css')) return {}

    const ext = path.extname(basename) // .ts
    // Para casos como Component.spec.ts -> ext .ts, nameWithoutExt Component.spec - tratamos mantendo só base antes do primeiro ponto?
    // Mantemos compat com original: remove apenas última extensão .ts/.tsx/.js/.jsx
    const nameWithoutExt = basename.replace(/\.(ts|tsx|js|jsx)$/, '')

    if (!/^[A-Z][a-zA-Z0-9]*$/.test(nameWithoutExt)) {
      const pascalCase = nameWithoutExt
        .split(/[-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')

      // Preserva extensão original (ex: .tsx)
      const originalExt = basename.slice(nameWithoutExt.length) || ext
      const expected = `${pascalCase}${originalExt}`

      context.report({
        loc: { line: 1, column: 0 },
        messageId: 'invalid',
        data: { basename, expected },
      })
    }

    return {}
  },
}
