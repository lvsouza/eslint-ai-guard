import { recommended } from './configs/recommended'
import { plugin } from './plugin'

export * from './rules/index'


const aiGuardPlugin = {
  ...plugin,
  configs: {
    recommended,
  },
}

export default aiGuardPlugin
export { plugin }
export { recommended }