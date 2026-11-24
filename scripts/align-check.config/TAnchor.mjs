

export default {
    upstream: 'anchor',
    upstreamInterface: 'TdAnchorProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      onChange: 'Angular 用 (change) 输出，参数 { href, previousHref }',
      onClick: 'Angular 用 (click) 输出，参数 { href, e }',
    },
  };
