import { Routes } from '@angular/router';

/**
 * 文档站路由。所有页面都懒加载，示例组件的代码只在进入对应页面时才下载。
 * GitHub Pages 对深链接会返回 404 状态码但内容是 index.html，路由仍可正常工作，
 * 未知路径统一回退到按钮页。
 */
export const routes: Routes = [
  {
    path: 'changelog',
    loadComponent: () => import('./docs/changelog/changelog.component').then((m) => m.ChangelogDocs),
  },
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
    path: 'alert',
    loadComponent: () => import('./docs/alert/alert.component').then((m) => m.AlertDocs),
  },
  {
    path: 'card',
    loadComponent: () => import('./docs/card/card.component').then((m) => m.CardDocs),
  },
  {
    path: 'skeleton',
    loadComponent: () => import('./docs/skeleton/skeleton.component').then((m) => m.SkeletonDocs),
  },
  {
    path: 'grid',
    loadComponent: () => import('./docs/grid/grid.component').then((m) => m.GridDocs),
  },
  {
    path: 'layout',
    loadComponent: () => import('./docs/layout/layout.component').then((m) => m.LayoutDocs),
  },
  {
    path: 'input',
    loadComponent: () => import('./docs/input/input.component').then((m) => m.InputDocs),
  },
  {
    path: 'input-adornment',
    loadComponent: () =>
      import('./docs/input-adornment/input-adornment.component').then((m) => m.InputAdornmentDocs),
  },
  {
    path: 'link',
    loadComponent: () => import('./docs/link/link.component').then((m) => m.LinkDocs),
  },
  {
    path: 'typography',
    loadComponent: () => import('./docs/typography/typography.component').then((m) => m.TypographyDocs),
  },
  {
    path: 'breadcrumb',
    loadComponent: () => import('./docs/breadcrumb/breadcrumb.component').then((m) => m.BreadcrumbDocs),
  },
  {
    path: 'steps',
    loadComponent: () => import('./docs/steps/steps.component').then((m) => m.StepsDocs),
  },
  {
    path: 'descriptions',
    loadComponent: () =>
      import('./docs/descriptions/descriptions.component').then((m) => m.DescriptionsDocs),
  },
  {
    path: 'comment',
    loadComponent: () => import('./docs/comment/comment.component').then((m) => m.CommentDocs),
  },
  {
    path: 'timeline',
    loadComponent: () => import('./docs/timeline/timeline.component').then((m) => m.TimelineDocs),
  },
  {
    path: 'statistic',
    loadComponent: () => import('./docs/statistic/statistic.component').then((m) => m.StatisticDocs),
  },
  {
    path: 'affix',
    loadComponent: () => import('./docs/affix/affix.component').then((m) => m.AffixDocs),
  },
  {
    path: 'back-top',
    loadComponent: () => import('./docs/back-top/back-top.component').then((m) => m.BackTopDocs),
  },
  {
    path: 'sticky-tool',
    loadComponent: () => import('./docs/sticky-tool/sticky-tool.component').then((m) => m.StickyToolDocs),
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
    path: 'table',
    loadComponent: () => import('./docs/table/table.component').then((m) => m.TableDocs),
  },
  {
    path: 'tabs',
    loadComponent: () => import('./docs/tabs/tabs.component').then((m) => m.TabsDocs),
  },
  {
    path: 'collapse',
    loadComponent: () => import('./docs/collapse/collapse.component').then((m) => m.CollapseDocs),
  },
  {
    path: 'empty',
    loadComponent: () => import('./docs/empty/empty.component').then((m) => m.EmptyDocs),
  },
  {
    path: 'progress',
    loadComponent: () => import('./docs/progress/progress.component').then((m) => m.ProgressDocs),
  },
  {
    path: 'list',
    loadComponent: () => import('./docs/list/list.component').then((m) => m.ListDocs),
  },
  {
    path: 'slider',
    loadComponent: () => import('./docs/slider/slider.component').then((m) => m.SliderDocs),
  },
  {
    path: 'rate',
    loadComponent: () => import('./docs/rate/rate.component').then((m) => m.RateDocs),
  },
  {
    path: 'cascader',
    loadComponent: () => import('./docs/cascader/cascader.component').then((m) => m.CascaderDocs),
  },
  {
    path: 'tree-select',
    loadComponent: () => import('./docs/tree-select/tree-select.component').then((m) => m.TreeSelectDocs),
  },
  {
    path: 'date-picker',
    loadComponent: () => import('./docs/date-picker/date-picker.component').then((m) => m.DatePickerDocs),
  },
  {
    path: 'date-range-picker',
    loadComponent: () =>
      import('./docs/date-range-picker/date-range-picker.component').then((m) => m.DateRangePickerDocs),
  },
  {
    path: 'time-picker',
    loadComponent: () => import('./docs/time-picker/time-picker.component').then((m) => m.TimePickerDocs),
  },
  {
    path: 'qrcode',
    loadComponent: () => import('./docs/qrcode/qrcode.component').then((m) => m.QRCodeDocs),
  },
  {
    path: 'anchor',
    loadComponent: () => import('./docs/anchor/anchor.component').then((m) => m.AnchorDocs),
  },
  {
    path: 'dropdown',
    loadComponent: () => import('./docs/dropdown/dropdown.component').then((m) => m.DropdownDocs),
  },
  {
    path: 'guide',
    loadComponent: () => import('./docs/guide/guide.component').then((m) => m.GuideDocs),
  },
  {
    path: 'image',
    loadComponent: () => import('./docs/image/image.component').then((m) => m.ImageDocs),
  },
  {
    path: 'image-viewer',
    loadComponent: () => import('./docs/image-viewer/image-viewer.component').then((m) => m.ImageViewerDocs),
  },
  {
    path: 'popconfirm',
    loadComponent: () => import('./docs/popconfirm/popconfirm.component').then((m) => m.PopconfirmDocs),
  },
  {
    path: 'watermark',
    loadComponent: () => import('./docs/watermark/watermark.component').then((m) => m.WatermarkDocs),
  },
  {
    path: 'config-provider',
    loadComponent: () =>
      import('./docs/config-provider/config-provider.component').then((m) => m.ConfigProviderDocs),
  },
  {
    path: 'select-input',
    loadComponent: () =>
      import('./docs/select-input/select-input.component').then((m) => m.SelectInputDocs),
  },
  {
    path: 'auto-complete',
    loadComponent: () =>
      import('./docs/auto-complete/auto-complete.component').then((m) => m.AutoCompleteDocs),
  },
  {
    path: 'color-picker',
    loadComponent: () =>
      import('./docs/color-picker/color-picker.component').then((m) => m.ColorPickerDocs),
  },
  {
    path: 'input-number',
    loadComponent: () =>
      import('./docs/input-number/input-number.component').then((m) => m.InputNumberDocs),
  },
  {
    path: 'range-input',
    loadComponent: () =>
      import('./docs/range-input/range-input.component').then((m) => m.RangeInputDocs),
  },
  {
    path: 'tag-input',
    loadComponent: () =>
      import('./docs/tag-input/tag-input.component').then((m) => m.TagInputDocs),
  },
  {
    path: 'check-tag',
    loadComponent: () =>
      import('./docs/check-tag/check-tag.component').then((m) => m.CheckTagDocs),
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./docs/calendar/calendar.component').then((m) => m.CalendarDocs),
  },
  {
    path: 'swiper',
    loadComponent: () =>
      import('./docs/swiper/swiper.component').then((m) => m.SwiperDocs),
  },
  {
    path: 'tree',
    loadComponent: () =>
      import('./docs/tree/tree.component').then((m) => m.TreeDocs),
  },
  {
    path: 'transfer',
    loadComponent: () =>
      import('./docs/transfer/transfer.component').then((m) => m.TransferDocs),
  },
  {
    path: 'upload',
    loadComponent: () =>
      import('./docs/upload/upload.component').then((m) => m.UploadDocs),
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./docs/menu/menu.component').then((m) => m.MenuDocs),
  },
  {
    path: '**',
    redirectTo: 'button',
  },
];


