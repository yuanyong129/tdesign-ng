import { NgTemplateOutlet } from '@angular/common';
import { isTemplateContent } from '../../_utils/content';
import type { Content } from '../../_utils/content';
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
import {
  RATE_DEFAULT_COLOR,
  RATE_DEFAULT_TEXTS,
  RateChangeEvent,
  RateColor,
  RateSize,
} from './rate.types';

/**
 * @zh 评分组件，用于对内容进行等级评价。
 * @en Rate component used to grade content.
 */
@Component({
  selector: 't-rate',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './rate.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TRate {
  /**
   * @zh 是否允许半星评分。
   * @en Whether half star is allowed.
   * @defaultValue false
   */
  readonly allowHalf = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否允许再次点击已选中的评分时清空。
   * @en Whether clicking the selected value again clears it.
   * @defaultValue false
   */
  readonly clearable = input(false, { transform: booleanAttribute });

  /**
   * @zh 评分颜色，传数组时第一项为选中色、第二项为未选中色。
   * @en Rate color; an array means `[activeColor, inactiveColor]`.
   * @defaultValue '#ED7B2F'
   */
  readonly color = input<RateColor>(RATE_DEFAULT_COLOR);

  /**
   * @zh 评分总数。
   * @en Total number of icons.
   * @defaultValue 5
   */
  readonly count = input(5);

  /**
   * @zh 是否禁用评分。
   * @en Whether the rate is disabled.
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * @zh 图标之间的间距，单位 px。
   * @en Gap between icons in px.
   * @defaultValue 4
   */
  readonly gap = input(4);

  /** @zh 自定义评分图标，支持字符串或模板，模板内使用 currentColor 继承颜色 @en Custom rating icon as text or a template; use currentColor in templates @defaultValue undefined */
  readonly icon = input<Content>(undefined);

  protected readonly isTemplateContent = isTemplateContent;

  /**
   * @zh 是否在评分右侧显示文案。
   * @en Whether to show the text on the right.
   * @defaultValue false
   */
  readonly showText = input(false, { transform: booleanAttribute });

  /**
   * @zh 图标尺寸，任意 CSS 长度。
   * @en Icon size, any CSS length.
   * @defaultValue '24px'
   */
  readonly size = input<RateSize>('24px');

  /**
   * @zh 评分对应的文案，默认使用内置文案（极差 / 失望 / 一般 / 满意 / 惊喜）。
   * @en Texts for each score; built-in texts are used when empty.
   * @defaultValue []
   */
  readonly texts = input<string[]>([]);

  /**
   * @zh 评分值，受控用法。
   * @en Rate value in controlled mode.
   */
  readonly value = input<number | undefined>(undefined);

  /**
   * @zh 默认评分值，非受控用法。
   * @en Default rate value in uncontrolled mode.
   * @defaultValue 0
   */
  readonly defaultValue = input(0);

  /**
   * @zh 评分变化时触发。
   * @en Emitted when the rate value changes.
   */
  readonly change = output<RateChangeEvent>();

  private readonly innerValue = signal<number | null>(null);
  private readonly hoverValue = signal<number | null>(null);

  protected readonly activeColor = computed(() => {
    const color = this.color();
    return Array.isArray(color) ? color[0] : color;
  });

  protected readonly inactiveColor = computed(() => {
    const color = this.color();
    return Array.isArray(color) ? color[1] : 'var(--td-bg-color-component)';
  });

  protected readonly currentValue = computed(
    () => this.value() ?? this.innerValue() ?? this.defaultValue(),
  );

  protected readonly displayValue = computed(() => this.hoverValue() ?? this.currentValue());

  protected readonly items = computed(() =>
    Array.from({ length: Math.max(0, this.count()) }, (_, index) => index + 1),
  );

  protected readonly displayTexts = computed(() =>
    this.texts().length ? this.texts() : RATE_DEFAULT_TEXTS,
  );

  protected readonly displayText = computed(() => {
    const index = Math.ceil(this.displayValue() - 1);
    return index >= 0 ? (this.displayTexts()[index] ?? '') : '';
  });

  protected isFull(item: number): boolean {
    return item <= this.displayValue();
  }

  protected isHalf(item: number): boolean {
    return this.allowHalf() && item - 0.5 === this.displayValue();
  }

  protected handleMouseMove(event: MouseEvent, item: number): void {
    if (this.disabled()) {
      return;
    }
    this.hoverValue.set(this.valueOfEvent(event, item));
  }

  protected handleMouseLeave(): void {
    if (this.disabled()) {
      return;
    }
    this.hoverValue.set(null);
  }

  protected handleClick(event: MouseEvent, item: number): void {
    if (this.disabled()) {
      return;
    }
    const next = this.valueOfEvent(event, item);
    if (this.clearable() && next === this.currentValue()) {
      this.hoverValue.set(null);
      this.commit(0);
      return;
    }
    this.commit(next);
  }

  private commit(next: number): void {
    if (this.value() === undefined) {
      this.innerValue.set(next);
    }
    this.change.emit({ value: next });
  }

  private valueOfEvent(event: MouseEvent, item: number): number {
    if (!this.allowHalf()) {
      return item;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    return event.clientX < rect.left + rect.width / 2 ? item - 0.5 : item;
  }
}
