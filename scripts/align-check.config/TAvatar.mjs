

export default {
    upstream: 'avatar',
    upstreamInterface: 'TdAvatarProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'default': '内容通过 ng-content 与 content 输入提供',
      'icon': 'Angular 用 <t-icon tAvatarIcon> 投影，不是输入属性',
      'onError': 'Angular 用 (error) 输出',
    },
  };
