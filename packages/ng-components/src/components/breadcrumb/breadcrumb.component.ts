import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, forwardRef, input } from '@angular/core';
import {
  T_BREADCRUMB,
  TBreadcrumbItem,
  type BreadcrumbContent,
  type BreadcrumbHost,
  type BreadcrumbTarget,
} from './breadcrumb-item.component';

/** 面包屑主题。上游只有 `light` 一种，且没有对应样式规则。 */
export const BREADCRUMB_THEMES = ['light'] as const;
/** 面包屑主题取值。 */
export type BreadcrumbTheme = (typeof BREADCRUMB_THEMES)[number];

/** `options` 里一项的数据形状，对应上游 `TdBreadcrumbItemProps`（不含 Vue 的 `onClick`）。 */
export interface BreadcrumbOption {
  /** 面包屑内容，等价于子项的 `content`。 */
  content?: BreadcrumbContent;
  /** 默认插槽内容，`content` 未设置时使用。 */
  default?: BreadcrumbContent;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 跳转链接。 */
  href?: string;
  /** 前缀图标。 */
  icon?: BreadcrumbContent;
  /** 内容最大宽度。 */
  maxWidth?: string;
  /** 链接打开位置。 */
  target?: BreadcrumbTarget;
}

/**
 * 面包屑。
 *
 * 宿主元素就是 `.t-breadcrumb`（`display: flex`），子项 `t-breadcrumb-item` 直接投影进来参与
 * flex 布局，因此不需要 ng-template 逐个重排（`vendor/tdesign-common/style/web/components/breadcrumb/_index.less:11`）。
 * 分隔符与 `maxItemWidth` 通过 DI 令牌 `T_BREADCRUMB` 下发给子项，对应上游
 * `provide('tBreadcrumb', { separator, theme, maxItemWidth })`。
 *
 * 折叠（`maxItems` / `ellipsis` / `itemsBeforeCollapse` / `itemsAfterCollapse`）依赖 Tooltip
 * 与下拉层，本期不做。
 */
@Component({
  selector: 't-breadcrumb',
  standalone: true,
  imports: [TBreadcrumbItem],
  template: `
    <ng-content />
    @for (option of normalizedOptions(); track $index) {
      <t-breadcrumb-item
        [content]="option.content ?? option.default"
        [disabled]="option.disabled ?? false"
        [href]="option.href"
        [icon]="option.icon"
        [maxWidth]="option.maxWidth"
        [target]="option.target"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
  providers: [
    {
      provide: T_BREADCRUMB,
      useExisting: forwardRef(() => TBreadcrumb),
    },
  ],
})
export class TBreadcrumb implements BreadcrumbHost {
  /** 子项未设置 `maxWidth` 时的兜底最大宽度，默认 120px。 @zh 最大宽度 @en max item width */
  readonly maxItemWidth = input<string | undefined>(undefined);

  /** 数据驱动的面包屑项，与投影子项二选一。 @zh 选项列表 @en options */
  readonly options = input<BreadcrumbOption[] | undefined>(undefined);

  /** 分隔符，字符串按文本渲染，也可以传入模板；未设置时渲染默认的右箭头图标。 @zh 分隔符 @en separator */
  readonly separator = input<BreadcrumbContent>(undefined);

  /** 主题，上游只支持 `light`，该值不会产生类名（上游把主题当裸类名拼在子项上，样式表里并无对应选择器）。 @zh 主题 @en theme @defaultValue light @values light */
  readonly theme = input<BreadcrumbTheme>('light');

  /** 宿主类名。 */
  protected readonly classes = computed(() => 't-breadcrumb');

  /** `@for` 需要一个稳定的可迭代对象，避免每次变更检测都新建数组。 */
  protected readonly normalizedOptions = computed<BreadcrumbOption[]>(() => this.options() ?? []);
}
