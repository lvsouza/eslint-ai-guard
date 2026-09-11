import type { ESLint, Linter } from 'eslint'

import { recommended } from './configs/recommended'
import { plugin } from './plugin'

export * from './rules/index'


interface IAiRulesPlugin extends Omit<ESLint.Plugin, 'configs'> {
  configs: {
    recommended: Linter.Config[]
  }
}

const aiGuardPlugin: IAiRulesPlugin = {
  ...plugin,
  configs: {
    recommended,
  },
}

export default aiGuardPlugin
export { plugin }
export { recommended }