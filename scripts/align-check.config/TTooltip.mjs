

export default {
    upstream: 'tooltip',
    upstreamInterface: 'TdTooltipProps',
    renames: {},
    // Tooltip 复用了 Popup 的通用能力，这些属性在上游是通过 extends 得到的
    angularOnly: ['content', 'disabled', 'visible', 'zIndex'],
    ignoreUpstream: {},
  };
