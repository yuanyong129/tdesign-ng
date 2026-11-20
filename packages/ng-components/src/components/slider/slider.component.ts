import { booleanAttribute, ChangeDetectionStrategy, Component, computed, ElementRef, inject, Injector, input, OnDestroy, output, signal, ViewEncapsulation, afterNextRender } from '@angular/core';
import { TTooltip } from '../tooltip';
import type { SliderLayout, SliderMark, SliderMarks, SliderValue } from './slider.types';

/** 把数值限制在区间内。 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** 保留与 step 一致的小数位。 */
function roundTo(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/** 取数字的小数位数。 */
function precisionOf(value: number): number {
  const text = String(value);
  const index = text.indexOf('.');
  return index < 0 ? 0 : text.length - index - 1;
}

@Component({
  selector: 't-slider',
  imports: [TTooltip],
  templateUrl: './slider.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TSlider implements OnDestroy {
  private readonly injector = inject(Injector);
  private readonly host = inject(ElementRef<HTMLElement>);

  /**
   * 滑块值，形如 `30` 或 `[10, 60]`（`range` 为 true 时）。
   * @zh 滑块值，受控用法
   * @en Slider value, controlled usage
   */
  readonly value = input<SliderValue | undefined>(undefined);
  /**
   * 默认滑块值（非受控）。
   * @zh 默认滑块值
   * @en Default slider value
   * @defaultValue 0
   */
  readonly defaultValue = input<SliderValue>(0);
  /**
   * 最小值。
   * @zh 最小值
   * @en Minimum value
   * @defaultValue 0
   */
  readonly min = input(0);
  /**
   * 最大值。
   * @zh 最大值
   * @en Maximum value
   * @defaultValue 100
   */
  readonly max = input(100);
  /**
   * 步长，拖动和键盘操作都会按步长取整。
   * @zh 步长
   * @en Step
   * @defaultValue 1
   */
  readonly step = input(1);
  /**
   * 是否为区间选择。
   * @zh 是否双滑块（区间选择）
   * @en Whether to use range selection
   * @defaultValue false
   */
  readonly range = input(false, { transform: booleanAttribute });
  /**
   * 是否禁用。
   * @zh 是否禁用
   * @en Whether disabled
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * 布局方向。
   * @zh 布局方向
   * @en Layout direction
   * @values horizontal, vertical
   * @defaultValue 'horizontal'
   */
  readonly layout = input<SliderLayout>('horizontal');
  /**
   * 滑块提示文案。为 `true` 时显示当前值，为字符串时可用 `{value}` 占位。
   * @zh 滑块提示文案
   * @en Tooltip label of the slider button
   * @defaultValue undefined
   */
  readonly label = input<string | boolean | undefined>(undefined);
  /**
   * 是否显示步长刻度点。
   * @zh 是否显示步长刻度点
   * @en Whether to show step stops
   * @defaultValue false
   */
  readonly showStep = input(false, { transform: booleanAttribute });
  /**
   * 刻度标记，数字数组或 `{ 数值: 文案 }` 对象。
   * @zh 刻度标记
   * @en Slider marks
   * @defaultValue undefined
   */
  readonly marks = input<SliderMarks | undefined>(undefined);

  /**
   * 拖动过程中值变化时触发。
   * @zh 值变化时触发
   * @en Emits when value changes
   */
  readonly change = output<SliderValue>();
  /**
   * 拖动结束或点击轨道时触发。
   * @zh 拖动结束或点击轨道时触发
   * @en Emits when dragging ends or rail is clicked
   */
  readonly changeEnd = output<SliderValue>();

  private readonly innerValue = signal<SliderValue | null>(null);
  protected readonly dragging = signal(false);
  protected readonly hovered = signal(-1);
  private readonly draggingIndex = signal(-1);
  private railEl?: HTMLElement;

  /** 当前值：受控优先，其次内部值，最后默认值。 */
  private readonly currentValue = computed<SliderValue>(() => this.value() ?? this.innerValue() ?? this.defaultValue());

  protected readonly vertical = computed(() => this.layout() === 'vertical');

  protected readonly firstValue = computed(() => {
    const current = this.currentValue();
    return Array.isArray(current) ? current[0] : current;
  });

  protected readonly secondValue = computed(() => {
    const current = this.currentValue();
    return Array.isArray(current) ? current[1] : current;
  });

  /** 数值精度：由 min / max / step 的小数位决定。 */
  private readonly precision = computed(() => Math.max(precisionOf(this.min()), precisionOf(this.max()), precisionOf(this.step())));

  protected readonly rangeStart = computed(() => (this.range() ? Math.min(this.firstValue(), this.secondValue()) : this.firstValue()));

  protected readonly rangeEnd = computed(() => (this.range() ? Math.max(this.firstValue(), this.secondValue()) : this.firstValue()));

  protected readonly trackStyle = computed<Record<string, string>>(() => {
    const total = this.max() - this.min() || 1;
    const start = this.range() ? ((this.rangeStart() - this.min()) / total) * 100 : 0;
    const end = ((this.rangeEnd() - this.min()) / total) * 100;
    const style: Record<string, string> = {};
    if (this.vertical()) {
      style['bottom'] = `${start}%`;
      style['height'] = `${end - start}%`;
    } else {
      style['left'] = `${start}%`;
      style['width'] = `${end - start}%`;
    }
    return style;
  });

  protected readonly stops = computed<number[]>(() => {
    const step = this.step();
    const total = this.max() - this.min();
    if (!this.showStep() || step <= 0 || total <= 0) {
      return [];
    }
    const result: number[] = [];
    for (let position = step; position < total; position += step) {
      result.push((position / total) * 100);
    }
    return result;
  });

  protected readonly markList = computed<SliderMark[]>(() => {
    const marks = this.marks();
    if (!marks) {
      return [];
    }
    const min = this.min();
    const max = this.max();
    const total = max - min || 1;
    const entries: Array<[number, string]> = Array.isArray(marks)
      ? marks.map((point) => [point, String(point)])
      : Object.keys(marks)
          .map((key) => [Number(key), marks[Number(key)]] as [number, string])
          .sort((a, b) => a[0] - b[0]);
    return entries
      .filter(([point]) => point >= min && point <= max)
      .map(([point, label]) => ({ point, position: ((point - min) / total) * 100, label }));
  });

  constructor() {
    afterNextRender(() => {
      this.railEl = this.host.nativeElement.querySelector('.t-slider__rail') ?? undefined;
    }, { injector: this.injector });
  }

  ngOnDestroy(): void {
    this.stopDrag();
  }

  /** 单个滑块按钮的内联样式。 */
  protected buttonStyle(value: number): Record<string, string> {
    const total = this.max() - this.min() || 1;
    const percent = ((value - this.min()) / total) * 100;
    const style: Record<string, string> = {};
    style[this.vertical() ? 'bottom' : 'left'] = `${percent}%`;
    return style;
  }

  /** 刻度点 / 刻度的内联样式。 */
  protected stopStyle(position: number): Record<string, string> {
    const style: Record<string, string> = {};
    style[this.vertical() ? 'bottom' : 'left'] = `${position}%`;
    return style;
  }

  /** 提示是否可见：拖动中或鼠标悬停在对应滑块上。 */
  protected isTooltipVisible(index: number): boolean {
    return this.isButtonDragging(index) || this.hovered() === index;
  }

  /** 该滑块是否正在被拖动。 */
  protected isButtonDragging(index: number): boolean {
    return this.dragging() && this.draggingIndex() === index;
  }

  /** 提示文案；返回空字符串表示不展示 tooltip。 */
  protected tooltipContent(value: number): string {
    const label = this.label();
    if (label === true) {
      return String(value);
    }
    if (typeof label === 'string') {
      return label.replace('{value}', String(value));
    }
    return '';
  }

  /** 由百分比位置算出对齐步长的数值。 */
  private valueOfPercent(percent: number): number {
    const min = this.min();
    const max = this.max();
    const total = max - min;
    const raw = min + (clamp(percent, 0, 100) / 100) * total;
    const step = this.step();
    const snapped = step > 0 ? Math.round(raw / step) * step : raw;
    return roundTo(clamp(snapped, min, max), this.precision());
  }

  /** 指针在轨道上的百分比位置。 */
  private percentOfEvent(event: MouseEvent): number {
    const rail = this.railEl;
    if (!rail) {
      return 0;
    }
    const rect = rail.getBoundingClientRect();
    if (this.vertical()) {
      return ((rect.bottom - event.clientY) / rect.height) * 100;
    }
    return ((event.clientX - rect.left) / rect.width) * 100;
  }

  /** 提交新值：非受控时写内部值，并触发 change。 */
  private commit(value: SliderValue): void {
    if (this.value() === undefined) {
      this.innerValue.set(value);
    }
    this.change.emit(value);
  }

  /** 点击轨道：单滑块直接跳转，双滑块移动较近的一端。 */
  protected handleRailClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    const percent = this.percentOfEvent(event);
    const next = this.valueOfPercent(percent);
    if (this.range()) {
      const index = Math.abs(next - this.firstValue()) <= Math.abs(next - this.secondValue()) ? 0 : 1;
      this.setRangeValue(index, next, true);
    } else {
      this.commit(next);
      this.changeEnd.emit(next);
    }
  }

  /** 双滑块：更新一端并保证 start ≤ end。 */
  private setRangeValue(index: number, next: number, emitEnd = false): void {
    const first = index === 0 ? next : this.firstValue();
    const second = index === 1 ? next : this.secondValue();
    const value: SliderValue = first <= second ? [first, second] : index === 0 ? [second, first] : [first, second];
    this.commit(value);
    if (emitEnd) {
      this.changeEnd.emit(value);
    }
  }

  protected handleButtonDown(event: MouseEvent, index: number): void {
    if (this.disabled()) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.setDragging(index);
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);
  }

  protected handleButtonKeydown(event: KeyboardEvent, index: number): void {
    if (this.disabled()) {
      return;
    }
    const step = this.step();
    const current = index === 0 ? this.firstValue() : this.secondValue();
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowLeft':
      case 'ArrowDown':
        next = current - step;
        break;
      case 'ArrowRight':
      case 'ArrowUp':
        next = current + step;
        break;
      case 'Home':
        next = this.min();
        break;
      case 'End':
        next = this.max();
        break;
      default:
        return;
    }
    event.preventDefault();
    const value = roundTo(clamp(next, this.min(), this.max()), this.precision());
    if (this.range()) {
      this.setRangeValue(index, value, true);
    } else {
      this.commit(value);
      this.changeEnd.emit(value);
    }
  }

  /** 拖动中用指针位置直接换算数值，避免累计误差。 */
  private readonly handleDragMove = (event: MouseEvent): void => {
    if (this.draggingIndex() < 0) {
      return;
    }
    const next = this.valueOfPercent(this.percentOfEvent(event));
    if (this.range()) {
      this.setRangeValue(this.draggingIndex(), next);
    } else {
      this.commit(next);
    }
  };

  private readonly handleDragEnd = (): void => {
    this.setDragging(-1);
    this.changeEnd.emit(this.currentValue());
  };

  private setDragging(index: number): void {
    this.draggingIndex.set(index);
    this.dragging.set(index >= 0);
    if (index >= 0) {
      return;
    }
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
  }

  private stopDrag(): void {
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    this.draggingIndex.set(-1);
    this.dragging.set(false);
  }
}




