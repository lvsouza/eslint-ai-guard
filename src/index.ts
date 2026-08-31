import { recommended } from './configs/recommended.js'
import { plugin } from './plugin.js'

export * from './rules/index.js'


const aiGuardPlugin = {
  ...plugin,
  configs: {
    recommended,
  },
}

export default aiGuardPlugin
export { plugin }
export { recommended }