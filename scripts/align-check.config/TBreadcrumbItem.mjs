

export default {
    upstream: 'breadcrumb',
    upstreamInterface: 'TdBreadcrumbItemProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载面包屑文字',
      to: '[D3] Vue Router 的 Route 对象语义，Angular 用 href 或上层 routerLink',
      replace: '[D3] Vue Router 历史替换语义，Angular 用 routerLink 的 replaceUrl',
      router: '[D3] Vue Router 实例注入位，Angular 用 Router DI',
      onClick: 'Angular 用原生 (click)；options 支持 onClick(MouseEvent) 回调',
    },
  };
