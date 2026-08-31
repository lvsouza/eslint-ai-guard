import type { Rule } from 'eslint'


export const filenamePascalCase: Rule.RuleModule = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Enforce PascalCase for file names' },
    schema: [],
  },
  create(context) {
    const filePath = context.filename ?? context.physicalFilename ?? ''
    const cwd = process.cwd()
    const relativePath = filePath.startsWith(cwd) ? filePath.slice(cwd.length + 1) : filePath

    if (!relativePath.startsWith('src/') && !relativePath.startsWith('scripts/')) return {}

    const basename = relativePath.split('/').pop() ?? ''
    if (basename === 'index.ts' || basename === 'index.tsx') return {}
    if (basename.endsWith('.d.ts')) return {}
    if (basename.endsWith('.css')) return {}

    const nameWithoutExt = basename.replace(/\.(ts|tsx|js|jsx)$/, '')
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(nameWithoutExt)) {
      const pascalCase = nameWithoutExt
        .split(/[-_]/)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')

      context.report({
        loc: { line: 1, column: 0 },
        message: `File name "${basename}" must be in PascalCase. Rename to "${pascalCase}.${basename.split('.').pop()}".`,
      })
    }

    return {}
  },
}
