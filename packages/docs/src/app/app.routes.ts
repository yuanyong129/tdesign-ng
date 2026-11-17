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
    path: 'checkbox',
    loadComponent: () => import('./docs/checkbox/checkbox.component').then((m) => m.CheckboxDocs),
  },
  {
    path: 'radio',
    loadComponent: () => import('./docs/radio/radio.component').then((m) => m.RadioDocs),
  },
  {
    path: 'select',
    loadComponent: () => import('./docs/select/select.component').then((m) => m.SelectDocs),
  },
  {
    path: 'form',
    loadComponent: () => import('./docs/form/form.component').then((m) => m.FormDocs),
  },
  {
    path: 'popup',
    loadComponent: () => import('./docs/popup/popup.component').then((m) => m.PopupDocs),
  },
  {
    path: 'tooltip',
    loadComponent: () => import('./docs/tooltip/tooltip.component').then((m) => m.TooltipDocs),
  },
  {
    path: 'dialog',
    loadComponent: () => import('./docs/dialog/dialog.component').then((m) => m.DialogDocs),
  },
  {
    path: 'drawer',
    loadComponent: () => import('./docs/drawer/drawer.component').then((m) => m.DrawerDocs),
  },
  {
    path: 'message',
    loadComponent: () => import('./docs/message/message.component').then((m) => m.MessageDocs),
  },
  {
    path: 'notification',
    loadComponent: () =>
      import('./docs/notification/notification.component').then((m) => m.NotificationDocs),
  },
  {
    path: 'loading',
    loadComponent: () => import('./docs/loading/loading.component').then((m) => m.LoadingDocs),
  },
  {
    path: 'tag',
    loadComponent: () => import('./docs/tag/tag.component').then((m) => m.TagDocs),
  },
  {
    path: 'badge',
    loadComponent: () => import('./docs/badge/badge.component').then((m) => m.BadgeDocs),
  },
  {
    path: 'avatar',
    loadComponent: () => import('./docs/avatar/avatar.component').then((m) => m.AvatarDocs),
  },
  {
    path: 'pagination',
    loadComponent: () => import('./docs/pagination/pagination.component').then((m) => m.PaginationDocs),
  },
  {
    path: '**',
    redirectTo: 'button',
  },
];
