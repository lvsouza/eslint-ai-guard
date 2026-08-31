import type { Rule } from 'eslint'


export const sortImports: Rule.RuleModule = {
  meta: {
    type: 'layout',
    docs: {
      description: 'Sort imports by group and line length descending, collapsing multiline imports',
    },
    fixable: 'code', // Habilita o modo --fix (autofix)
    schema: [],
    messages: {
      sortRequired: 'As importações devem estar ordenadas por grupo e tamanho da linha, ocupando uma única linha.',
    },
  },
  create(context) {
    return {
      Program(node) {
        const sourceCode = context.sourceCode
        const content = sourceCode.text

        const newContent = getSortedContent(content)

        if (newContent && newContent !== content) {
          context.report({
            node,
            messageId: 'sortRequired',
            fix(fixer) {
              return fixer.replaceText(node, newContent)
            },
          })
        }
      },
    }
  },
}

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------
type TImportItem = {
  line: string;
  from: string;
}

// ---------------------------------------------------------------------------
// Lógica Core
// ---------------------------------------------------------------------------
function getSortedContent(content: string): string | null {
  // Função para limpar comentários e espaços de imports que ocupam várias linhas
  const collapseMultiline = (match: string) => {
    return match
      .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários de bloco /* ... */
      .replace(/\/\/.*$/gm, '')         // Remove comentários de linha // ...
      .replace(/\s+/g, ' ')            // Colapsa quebras de linha e espaços extras em um único espaço
  }

  // 1. Pré-processamento: Força imports e re-exports para ocuparem apenas uma linha
  const normalizedContent = content
    // Colapsa multiline imports: import { ... } from '...' ou import A, { ... } from '...'
    .replace(/import\s+([^'";]+)\s+from\s+(['"][^'"]+['"])/g, collapseMultiline)
    // Colapsa multiline re-exports: export { ... } from '...' ou export * from '...'
    .replace(/export\s+([^'";]+)\s+from\s+(['"][^'"]+['"])/g, collapseMultiline)

  const lines: string[] = normalizedContent.split('\n')

  const directiveLines: string[] = []
  const reactFirstLine: string[] = []
  const externalLines: TImportItem[] = []
  const internalLines: TImportItem[] = []
  const reExportLines: TImportItem[] = []
  const nonImportLines: string[] = []

  let inImportBlock = false
  let canAcceptDirectives = true

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()

    // 2. Detecta o início do código real para fechar a "janela" de imports
    if (
      /^(function|const|let|var|class|interface|enum)\b/.test(trimmed) ||
      (/^(type|export)\b/.test(trimmed) && !/ from ['"]/.test(trimmed) && !/^export\s*\{[^}]*\}\s*from/.test(trimmed) && !/^export\s*\*/.test(trimmed)) ||
      trimmed.startsWith('}')
    ) {
      canAcceptDirectives = false
    }

    if (inImportBlock && trimmed === '') continue

    // 3. Diretivas ('use client', 'use strict')
    if (canAcceptDirectives && /^['"]use (client|server|strict)['"];?$/.test(trimmed)) {
      directiveLines.push(lines[i])
      continue
    }

    // 4. Re-exports (Agora garantidos em uma única linha pelo Regex inicial)
    const isReExport =
      /^export\s+(type\s+)?\{[^}]*\}\s+from\s+['"]/.test(trimmed) ||
      /^export\s+\*(\s+as\s+\w+)?\s+from\s+['"]/.test(trimmed)

    if (isReExport) {
      const m = lines[i].match(/from\s+['"]([^'"]+)['"]/)
      if (m) reExportLines.push({ line: lines[i], from: m[1] })
      inImportBlock = true
      canAcceptDirectives = false
      continue
    }

    // 5. Imports (Agora garantidos em uma única linha pelo Regex inicial)
    const isImport = /^import\s/.test(trimmed) || /^import\{/.test(trimmed)

    if (isImport) {
      inImportBlock = true
      canAcceptDirectives = false

      const fromMatch = lines[i].match(/from\s+['"]([^'"]+)['"]/)
      const seMatch = lines[i].match(/^import\s+['"]([^'"]+)['"]/)
      const from = fromMatch ? fromMatch[1] : seMatch ? seMatch[1] : null

      if (!from) {
        nonImportLines.push(lines[i])
        continue
      }

      const isTypeOnly = /^import\s+type\b/.test(trimmed)
      const isInternal = from.startsWith('.') || from.startsWith('@/')
      const isReactEntry = !isTypeOnly && (from === 'react' || from.startsWith('react/'))

      if (isReactEntry) {
        reactFirstLine.push(lines[i])
      } else if (isInternal) {
        internalLines.push({ line: lines[i], from })
      } else {
        externalLines.push({ line: lines[i], from })
      }
      continue
    }

    // 6. Restante do código
    inImportBlock = false
    nonImportLines.push(lines[i])
  }

  // Verifica se o arquivo precisa ser modificado
  if (reactFirstLine.length === 0 && externalLines.length === 0 && internalLines.length === 0 && reExportLines.length === 0) {
    return null
  }

  // 7. Ordenação: Tamanho da linha (Decrescente), depois Alfabeto (Crescente)
  const byLengthDesc = (a: TImportItem, b: TImportItem) =>
    b.line.length !== a.line.length ? b.line.length - a.line.length : a.line.localeCompare(b.line)

  externalLines.sort(byLengthDesc)
  internalLines.sort(byLengthDesc)
  reExportLines.sort(byLengthDesc)

  // 8. Reconstrução dos blocos
  const blocks: string[] = []

  if (directiveLines.length > 0) blocks.push(directiveLines.join('\n'))

  const externalBlock = [...reactFirstLine, ...externalLines.map(i => i.line)]
  if (externalBlock.length > 0) {
    if (blocks.length > 0) blocks.push('')
    blocks.push(externalBlock.join('\n'))
  }

  if (internalLines.length > 0) {
    if (blocks.length > 0) blocks.push('')
    blocks.push(internalLines.map(i => i.line).join('\n'))
  }

  if (reExportLines.length > 0) {
    if (blocks.length > 0) blocks.push('')
    blocks.push(reExportLines.map(i => i.line).join('\n'))
  }

  const rest = nonImportLines.join('\n').replace(/^\n+/, '')

  let newContent: string
  if (blocks.length > 0 && rest.length > 0) {
    newContent = blocks.join('\n') + '\n\n\n' + rest
  } else if (blocks.length > 0) {
    newContent = blocks.join('\n') + '\n'
  } else {
    newContent = rest
  }

  return newContent
}
