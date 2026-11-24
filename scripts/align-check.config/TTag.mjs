

export default {
    upstream: 'tag',
    upstreamInterface: 'TdTagProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'default': '内容通过 ng-content 与 content 输入提供',
      'icon': 'Angular 用 <t-icon tTagIcon> 投影，不是输入属性',
      'onClick': 'Angular 直接监听原生 click（会冒泡到宿主），不再额外提供输出',
      'onClose': 'Angular 用 (close) 输出',
    },
  };
