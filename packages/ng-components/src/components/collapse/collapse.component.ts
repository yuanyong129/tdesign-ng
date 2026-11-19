import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { TCollapsePanel } from './collapse-panel.component';
import {
  CollapseExpandIconPlacement,
  CollapsePanelValue,
  CollapseValue,
} from './collapse.types';

/**
 * 折叠面板。把内容分区收起 / 展开，适合信息量大但允许分组的场景。
 *
 * ```html
 * <t-collapse defaultValue="1">
 *   <t-collapse-panel value="1" header="第一项">内容一</t-collapse-panel>
 *   <t-collapse-panel value="2" header="第二项">内容二</t-collapse-panel>
 * </t-collapse>
 * ```
 */
@Component({
  selector: 't-collapse',
  standalone: true,
  templateUrl: './collapse.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TCollapse {
  /** @zh 是否无边框 @en Whether the collapse is borderless @defaultValue false */
  readonly borderless = input(false, { transform: booleanAttribute });

  /** @zh 是否默认展开全部面板，仅在非受控时生效 @en Whether all panels are expanded by default @defaultValue false */
  readonly defaultExpandAll = input(false, { transform: booleanAttribute });

  /** @zh 是否禁用全部面板 @en Whether all panels are disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 展开图标；传 false 隐藏，传模板自定义 @en Expand icon, false hides it @defaultValue true */
  readonly expandIcon = input<boolean | TemplateRef<unknown>>(true);

  /** @zh 展开图标位置 @en Expand icon placement @defaultValue 'left' @values left, right */
  readonly expandIconPlacement = input<CollapseExpandIconPlacement>('left');

  /** @zh 是否只允许同时展开一个面板（手风琴） @en Whether only one panel can be expanded at a time @defaultValue false */
  readonly expandMutex = input(false, { transform: booleanAttribute });

  /** @zh 是否点击整行展开 / 收起 @en Whether clicking the whole row toggles the panel @defaultValue false */
  readonly expandOnRowClick = input(false, { transform: booleanAttribute });

  /** @zh 当前展开的面板值，受控时以它为准 @en Expanded panel values (controlled) @defaultValue undefined */
  readonly value = input<CollapseValue | undefined>(undefined);

  /** @zh 默认展开的面板值 @en Default expanded panel values @defaultValue [] */
  readonly defaultValue = input<CollapseValue>([]);

  /** @zh 展开面板变化时触发 @en Emits when expanded panels change */
  readonly change = output<CollapseValue>();

  /** 面板由内容投影提供，这里只读取它们的元信息 */
  protected readonly panels = contentChildren(TCollapsePanel);

  private readonly innerValue = signal<CollapseValue | null>(null);

  private expandedAllApplied = false;

  protected readonly currentValue = computed(
    () => this.value() ?? this.innerValue() ?? this.defaultValue(),
  );

  constructor() {
    effect(() => {
      const panels = this.panels();
      if (this.expandedAllApplied) {
        return;
      }
      if (!this.defaultExpandAll() || this.value() !== undefined || panels.length === 0) {
        return;
      }
      this.expandedAllApplied = true;
      this.innerValue.set(panels.map((panel) => panel.panelValue()));
    });
  }

  /** 面板在父级中的位置，未显式传 value 时用它作为面板值 */
  panelIndexOf(panel: TCollapsePanel): number {
    return this.panels().indexOf(panel);
  }

  isExpanded(value: CollapsePanelValue): boolean {
    return this.currentValue().includes(value);
  }

  toggle(value: CollapsePanelValue): void {
    const next = [...this.currentValue()];
    const index = next.indexOf(value);
    if (index >= 0) {
      next.splice(index, 1);
    } else if (this.expandMutex()) {
      next.splice(0, next.length, value);
    } else {
      next.push(value);
    }
    if (this.value() === undefined) {
      this.innerValue.set(next);
    }
    this.change.emit(next);
  }
}
