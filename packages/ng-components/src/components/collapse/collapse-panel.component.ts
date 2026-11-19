import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { TCollapse } from './collapse.component';
import { CollapsePanelValue } from './collapse.types';

/**
 * 折叠面板的单个面板，必须放在 `<t-collapse>` 内使用。
 *
 * ```html
 * <t-collapse-panel value="1" header="第一项">内容一</t-collapse-panel>
 * ```
 */
@Component({
  selector: 't-collapse-panel',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './collapse-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TCollapsePanel {
  private readonly parent = inject(TCollapse);

  /** @zh 面板值，未传时按面板顺序自动生成 @en Panel value, defaults to its index @defaultValue undefined */
  readonly value = input<CollapsePanelValue | undefined>(undefined);

  /** @zh 面板标题 @en Panel header @defaultValue '' */
  readonly header = input('');

  /** @zh 标题右侧内容 @en Content on the right side of the header @defaultValue '' */
  readonly headerRightContent = input('');

  /** @zh 面板内容，也可以用内容投影 @en Panel content, or use content projection @defaultValue '' */
  readonly content = input('');

  /** @zh 展开图标，传 false 隐藏，传模板自定义 @en Expand icon, false hides it @defaultValue undefined */
  readonly expandIcon = input<boolean | TemplateRef<unknown> | undefined>(undefined);

  /** @zh 是否禁用该面板 @en Whether the panel is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否收起后销毁内容 @en Whether the content is destroyed after collapsing @defaultValue false */
  readonly destroyOnCollapse = input(false, { transform: booleanAttribute });

  /** 面板值：显式传入优先，否则用它在父级中的顺序（与上游一致） */
  readonly panelValue = computed<CollapsePanelValue>(
    () => this.value() ?? this.parent.panelIndexOf(this),
  );

  protected readonly active = computed(() => this.parent.isExpanded(this.panelValue()));

  protected readonly isDisabled = computed(() => this.disabled() || this.parent.disabled());

  protected readonly expandOnRowClick = computed(() => this.parent.expandOnRowClick());

  protected readonly placement = computed(() => this.parent.expandIconPlacement());

  protected readonly icon = computed(() => this.expandIcon() ?? this.parent.expandIcon());

  protected readonly showIcon = computed(() => this.icon() !== false);

  protected readonly iconTemplate = computed(() => {
    const icon = this.icon();
    return icon instanceof TemplateRef ? icon : null;
  });

  protected toggle(): void {
    if (this.isDisabled()) {
      return;
    }
    this.parent.toggle(this.panelValue());
  }

  protected handleHeaderClick(): void {
    if (this.expandOnRowClick() && !this.isDisabled()) {
      this.toggle();
    }
  }

  protected handleIconClick(event: MouseEvent): void {
    event.stopPropagation();
    this.toggle();
  }

  protected stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}
