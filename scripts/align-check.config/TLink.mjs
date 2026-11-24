

export default {
    upstream: 'link',
    renames: {},
    // 上游用 prefixIcon / suffixIcon 插槽判断是否渲染图标占位，
    // Angular 侧投影内容无法在模板里判断空，改用显式布尔开关。
    angularOnly: ['hasPrefixIcon', 'hasSuffixIcon'],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载链接文字',
      default: '同 content，Vue 的默认插槽',
      prefixIcon: 'Angular 用 <t-icon tLinkPrefixIcon> 投影，配合 [hasPrefixIcon] 留出间距',
      suffixIcon: 'Angular 用 <t-icon tLinkSuffixIcon> 投影，配合 [hasSuffixIcon] 留出间距',
      onClick: 'Angular 直接监听原生 click（会冒泡到宿主），不再额外提供输出，避免一次点击触发两次',
    },
  };
