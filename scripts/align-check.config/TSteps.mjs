

export default {
    upstream: 'steps',
    upstreamInterface: 'TdStepsProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      modelValue: 'Angular 用 [(current)] 双向绑定',
      onChange: 'Angular 用 (currentChange) 输出，参数为新的 current',
      sequence: '[D3] 依赖反转渲染顺序，投影内容无法重排且会错位连接线伪元素',
    },
  };
