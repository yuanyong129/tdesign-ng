import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'collapse',
    upstreamInterface: 'TdCollapseProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 value（受控）/ defaultValue',
    },
  };
