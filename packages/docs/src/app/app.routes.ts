import { Routes } from '@angular/router';

/**
 * 文档站路由。所有页面都懒加载，示例组件的代码只在进入对应页面时才下载。
 * GitHub Pages 对深链接会返回 404 状态码但内容是 index.html，路由仍可正常工作，
 * 未知路径统一回退到按钮页。
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'button',
    pathMatch: 'full',
  },
  {
    path: 'button',
    loadComponent: () => import('./docs/button/button.component').then((m) => m.ButtonDocs),
  },
  {
    path: 'divider',
    loadComponent: () => import('./docs/divider/divider.component').then((m) => m.DividerDocs),
  },
  {
    path: 'input',
    loadComponent: () => import('./docs/input/input.component').then((m) => m.InputDocs),
  },
  {
    path: 'link',
    loadComponent: () => import('./docs/link/link.component').then((m) => m.LinkDocs),
  },
  {
    path: 'space',
    loadComponent: () => import('./docs/space/space.component').then((m) => m.SpaceDocs),
  },
  {
    path: 'textarea',
    loadComponent: () => import('./docs/textarea/textarea.component').then((m) => m.TextareaDocs),
  },
  {
    path: 'switch',
    loadComponent: () => import('./docs/switch/switch.component').then((m) => m.SwitchDocs),
  },
  {
    path: '**',
    redirectTo: 'button',
  },
];
