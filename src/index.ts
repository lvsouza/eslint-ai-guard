import type { ESLint } from 'eslint'

import { recommended } from './configs/recommended'
import { plugin } from './plugin'

export * from './rules/index'


const aiGuardPlugin: ESLint.Plugin = {
  ...plugin,
  configs: {
    recommended,
  },
}

export default aiGuardPlugin
export { plugin }
export { recommended }