

export default {
    upstream: 'menu',
    upstreamInterface: 'TdMenuItemProps',
    renames: { onClick: 'click' },
    angularOnly: [],
    ignoreUpstream: {
      default: '[D1] Angular 用 <ng-content> 投影（同时提供 content 字符串入口），不再开同名 input',
      onClick: 'Angular 用 (click) 输出，参数 { e, value }',
      to: '[D2] 库未声明 @angular/router peer 依赖，接入路由后由使用方用 (click) + Router 自行跳转',
      routerLink: '[D2] 同上，需要 @angular/router peer dep 才能提供 RouterLink 语义',
      router: '[D2] 同上',
      replace: '[D2] 同上（history.replace 语义依赖 router）',
    },
  };
