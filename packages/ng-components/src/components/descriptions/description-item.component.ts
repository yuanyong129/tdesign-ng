import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  input,
  numberAttribute,
  viewChild,
} from '@angular/core';
import type { DescriptionsContent } from './descriptions.types';

/**
 * 描述列表项。
 *
 * 本身不渲染任何可见 DOM：`t-descriptions` 通过 `contentChildren` 收集所有项，再按
 * `layout` / `column` 统一算出表格行列并渲染 `t-descriptions__label` /
 * `t-descriptions__content` 单元格。
 *
 * 内容来自 `content` 输入，或默认投影的富内容；显式 content 优先。
 */
@Component({
  selector: 't-descriptions-item',
  standalone: true,
  template: `<ng-template #projectedContent><ng-content /></ng-template>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // 本组件只承载数据、不参与视觉渲染：单元格由 t-descriptions 统一渲染，
  // 这里必须隐藏宿主，否则写进元素里的纯文本会在表格外再显示一份。
  host: {
    style: 'display: none',
  },
})
export class TDescriptionItem {
  /** 标签。 @zh 标签 @en label */
  readonly label = input<DescriptionsContent>(undefined);

  /** 内容，字符串按文本渲染，模板交给 `*ngTemplateOutlet`。 @zh 内容 @en content */
  readonly content = input<DescriptionsContent>(undefined);

  /** 占用的列数，仅 `layout` 为 horizontal 时生效。 @zh 占用的列数 @en span @defaultValue 1 */
  readonly span = input(1, { transform: numberAttribute });

  /** 默认投影按模板渲染，保留组件、绑定和交互，不读取 DOM 文本快照。 */
  readonly projectedContent = viewChild<TemplateRef<unknown>>('projectedContent');
}
