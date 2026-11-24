

export default {
    upstream: 'loading',
    upstreamInterface: 'TdLoadingProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'attach': '暂不支持挂到指定元素，全屏模式固定挂到 body',
      'content': '需要把加载态包在内容外层时，用 flex/relative 容器自行组合',
      'default': '同 content，暂未提供包裹内容的插槽',
      'indicator': '自定义加载图标尚未实现，使用内置的渐变环',
    },
  };
