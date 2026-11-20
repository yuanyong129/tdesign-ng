import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { TPopup } from '../popup';
import {
  CascaderChangeEvent,
  CascaderKeys,
  CascaderMenu,
  CascaderOption,
  CascaderValue,
} from './cascader.types';

const DEFAULT_KEYS: Required<CascaderKeys> = {
  label: 'label',
  value: 'value',
  children: 'children',
};

/**
 * @zh 级联选择器，用于在树形结构的数据中逐级选择。
 * @en Cascader used to select values level by level from tree data.
 */
@Component({
  selector: 't-cascader',
  standalone: true,
  imports: [TPopup],
  templateUrl: './cascader.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TCascader {
  /**
   * @zh 级联选项数据。
   * @en Cascader options.
   * @defaultValue []
   */
  readonly options = input<CascaderOption[]>([]);

  /**
   * @zh 选中值，受控用法。
   * @en Selected value in controlled mode.
   */
  readonly value = input<CascaderValue | undefined>(undefined);

  /**
   * @zh 默认选中值，非受控用法。
   * @en Default selected value in uncontrolled mode.
   */
  readonly defaultValue = input<CascaderValue | undefined>(undefined);

  /**
   * @zh 自定义字段名，默认 label / value / children。
   * @en Custom field names; defaults to label / value / children.
   */
  readonly keys = input<CascaderKeys>({});

  /**
   * @zh 面板展开时是否显示完整路径（父级 / 子级），为 false 时只显示最后一级。
   * @en Whether to show the full path in the input; false shows the last level only.
   * @defaultValue true
   */
  readonly showAllLevels = input(true, { transform: booleanAttribute });

  /**
   * @zh 是否可清空。
   * @en Whether the value can be cleared.
   * @defaultValue false
   */
  readonly clearable = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否禁用。
   * @en Whether the cascader is disabled.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * @zh 输入框尺寸。
   * @en Size of the input.
   * @defaultValue 'medium'
   * @values small, medium, large
   */
  readonly size = input<'small' | 'medium' | 'large'>('medium');

  /**
   * @zh 占位文案。
   * @en Placeholder text.
   * @defaultValue '请选择'
   */
  readonly placeholder = input('请选择');

  /**
   * @zh 无选项时的提示文案。
   * @en Text shown when there are no options.
   * @defaultValue '暂无数据'
   */
  readonly empty = input('暂无数据');

  /**
   * @zh 选中值变化时触发。
   * @en Emitted when the selected value changes.
   */
  readonly change = output<CascaderChangeEvent>();

  protected readonly open = signal(false);
  private readonly innerValue = signal<CascaderValue | undefined>(undefined);
  private readonly expandedPath = signal<CascaderOption[]>([]);

  private readonly fieldKeys = computed<Required<CascaderKeys>>(() => ({
    ...DEFAULT_KEYS,
    ...this.keys(),
  }));

  protected readonly currentValue = computed(
    () => this.value() ?? this.innerValue() ?? this.defaultValue(),
  );

  /** 从根到选中叶子节点的路径，用于回显与面板展开状态。 */
  protected readonly selectedPath = computed<CascaderOption[]>(() => {
    const target = this.currentValue();
    if (target === undefined || target === null) return [];
    return this.findPath(this.options(), target) ?? [];
  });

  protected readonly hasValue = computed(() => this.selectedPath().length > 0);

  protected readonly displayText = computed(() => {
    const path = this.selectedPath();
    if (!path.length) return '';
    const labelKey = this.fieldKeys().label;
    const labels = path.map((item) => String(item[labelKey] ?? ''));
    return this.showAllLevels() ? labels.join(' / ') : (labels[labels.length - 1] ?? '');
  });

  /** 当前面板的列：第一列是根选项，之后每列是上一列展开项的子选项。 */
  protected readonly menus = computed<CascaderMenu[]>(() => {
    const result: CascaderMenu[] = [];
    let current: CascaderOption[] = this.options();
    if (!current.length) return result;
    result.push({ options: current, level: 0 });

    const path = this.expandedPath();
    for (let index = 0; index < path.length; index++) {
      const children = this.childrenOf(path[index]);
      if (!children.length) break;
      result.push({ options: children, level: index + 1 });
      current = children;
    }
    return result;
  });

  protected readonly inputClasses = computed(() => {
    const classes = ['t-input', 't-input--prefix', 't-input--suffix'];
    const size = this.size();
    if (size === 'small') classes.push('t-size-s');
    else if (size === 'large') classes.push('t-size-l');
    if (this.open()) classes.push('t-input--focused', 't-is-focused');
    if (this.disabled()) classes.push('t-is-disabled');
    return classes.join(' ');
  });

  protected readonly wrapperClasses = computed(() => {
    const classes = ['t-select-input', 't-cascader', 't-cascader--single'];
    if (this.open()) classes.push('t-select-input--popup-visible');
    if (!this.hasValue()) classes.push('t-select-input--empty');
    return classes.join(' ');
  });

  protected readonly arrowClasses = computed(() => {
    const classes = ['t-fake-arrow', 't-cascader__icon'];
    if (this.open()) classes.push('t-fake-arrow--active');
    return classes.join(' ');
  });

  protected labelOf(option: CascaderOption): string {
    return String(option[this.fieldKeys().label] ?? '');
  }

  protected valueOf(option: CascaderOption): CascaderValue | undefined {
    return option[this.fieldKeys().value] as CascaderValue | undefined;
  }

  protected childrenOf(option: CascaderOption | undefined): CascaderOption[] {
    if (!option) return [];
    const children = option[this.fieldKeys().children] as CascaderOption[] | undefined;
    return children ?? [];
  }

  protected isExpanded(option: CascaderOption): boolean {
    return !!this.childrenOf(option).length && this.expandedPath().includes(option);
  }

  protected isSelected(option: CascaderOption): boolean {
    const path = this.selectedPath();
    return path.length > 0 && path[path.length - 1] === option;
  }

  protected isDisabledOption(option: CascaderOption): boolean {
    return this.disabled() || !!option.disabled;
  }

  protected itemClasses(option: CascaderOption, level: number): string {
    const classes = ['t-cascader__item', `t-size-${this.sizeSuffix()}`];
    if (this.childrenOf(option).length) classes.push('t-cascader__item--with-icon');
    else classes.push('t-cascader__item--leaf');
    if (this.isExpanded(option)) classes.push('t-is-expanded');
    if (this.isSelected(option)) classes.push('t-is-selected');
    if (this.isDisabledOption(option)) classes.push('t-is-disabled');
    return classes.join(' ');
  }

  protected handleVisibleChange(visible: boolean): void {
    if (this.disabled()) return;
    this.open.set(visible);
    if (visible) {
      const path = this.selectedPath();
      this.expandedPath.set(path.slice(0, Math.max(path.length - 1, 0)));
    }
  }

  protected pickOption(option: CascaderOption, level: number): void {
    if (this.isDisabledOption(option)) return;
    const children = this.childrenOf(option);
    if (children.length) {
      const next = [...this.expandedPath().slice(0, level), option];
      this.expandedPath.set(next);
      return;
    }
    const value = this.valueOf(option);
    if (value === undefined) return;
    if (this.value() === undefined) this.innerValue.set(value);
    this.open.set(false);
    this.change.emit({ value, source: 'check', option });
  }

  protected handleClear(event: Event): void {
    event.stopPropagation();
    if (this.disabled()) return;
    if (this.value() === undefined) this.innerValue.set(undefined);
    this.change.emit({ value: undefined, source: 'clear' });
  }

  private sizeSuffix(): string {
    const size = this.size();
    return size === 'small' ? 's' : size === 'large' ? 'l' : 'm';
  }

  private findPath(options: CascaderOption[], target: CascaderValue): CascaderOption[] | null {
    const valueKey = this.fieldKeys().value;
    for (const option of options) {
      if (option[valueKey] === target) return [option];
      const children = this.childrenOf(option);
      if (children.length) {
        const path = this.findPath(children, target);
        if (path) return [option, ...path];
      }
    }
    return null;
  }
}



