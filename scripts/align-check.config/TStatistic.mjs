

export default {
    upstream: 'statistic',
    upstreamInterface: 'TdStatisticProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      animation: '[D3] 数值滚动动画需要 rAF tween 基础设施',
      animationStart: '[D3] 同上，并依赖组件实例方法 start()',
    },
  };
