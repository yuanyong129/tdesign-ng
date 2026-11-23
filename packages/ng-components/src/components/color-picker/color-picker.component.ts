import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { TInput, type InputValue } from '../input';
import { TPopup } from '../popup';
import { TSelect, type SelectMultipleValue, type SelectOptionObj, type SelectSingleValue } from '../select';
import {
  COLOR_PICKER_BASE_FORMATS,
  COLOR_PICKER_FORMATS,
  ColorObject,
  ColorPickerChangeEvent,
  ColorPickerChangeTrigger,
  ColorPickerFormat,
  ColorPickerMode,
  ColorPickerSize,
  DEFAULT_COLOR_PICKER_COLOR,
  DEFAULT_COLOR_PICKER_SWATCHES,
  RgbaColor,
} from './color-picker.types';
import {
  clamp,
  formatColor,
  hsvToRgb,
  isSameColor,
  parseColor,
  pushRecentColor,
  rgbToHsv,
  toColorObject,
} from './color-picker.utils';

type DragTarget = 'saturation' | 'hue' | 'alpha';

/** 关闭透明度时，把带 alpha 的格式回退到基础格式，避免选择器出现无效项。 */
const ALPHA_TO_BASE_FORMAT: Partial<Record<ColorPickerFormat, ColorPickerFormat>> = {
  HEX8: 'HEX',
  RGBA: 'RGB',
  HSLA: 'HSL',
  HSVA: 'HSV',
};

/**
 * 颜色选择器。
 *
 * 触发器使用输入框，点击后展开面板，可在饱和度/明度面板与色相、透明度滑条上拖拽取色。
 * 值遵循上游语义：受控值通过 `value`（或 `modelValue`）传入，每次变化通过 `change` 抛出。
 *
 * ```html
 * <t-color-picker [value]="color" (change)="color = $event.value" />
 * ```
 */
@Component({
  selector: 't-color-picker',
  standalone: true,
  imports: [TInput, TPopup, TSelect],
  templateUrl: './color-picker.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TColorPicker),
      multi: true,
    },
  ],
})
export class TColorPicker implements ControlValueAccessor {
  /** @zh 是否无边框 @en Whether the trigger input is borderless @defaultValue false */
  readonly borderless = input(false, { transform: booleanAttribute });

  /** @zh 是否可清空 @en Whether the value can be cleared @defaultValue false */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** @zh 颜色模式，渐变能力暂未实现 @en Color modes; gradient mode is not implemented yet @defaultValue ['monochrome','linear-gradient'] @values monochrome,linear-gradient */
  readonly colorModes = input<ColorPickerMode[]>(['monochrome', 'linear-gradient']);

  /** @zh 是否禁用 @en Whether the color picker is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否开启透明度 @en Whether alpha is enabled @defaultValue false */
  readonly enableAlpha = input(false, { transform: booleanAttribute });

  /** @zh 渐变模式下是否允许多个渐变点，渐变能力暂未实现 @en Whether multiple gradient stops are allowed; gradient mode is not implemented @defaultValue true */
  readonly enableMultipleGradient = input(true, { transform: booleanAttribute });

  /** @zh 颜色格式 @en Color format @defaultValue 'RGB' @values HEX,HEX8,RGB,RGBA,HSL,HSLA,HSV,HSVA,CMYK,CSS */
  readonly format = input<ColorPickerFormat>('RGB');

  /** @zh 透传给触发器输入框的属性 @en Props passed through to the trigger input @defaultValue undefined */
  readonly inputProps = input<Record<string, unknown> | undefined>(undefined);

  /** @zh 透传给弹层的属性 @en Props passed through to the popup @defaultValue undefined */
  readonly popupProps = input<Record<string, unknown> | undefined>(undefined);

  /** @zh 最近使用颜色，`true` 显示、`false` 隐藏、数组自定义 @en Recent colors: true to show, false to hide, or a custom array @defaultValue undefined */
  readonly recentColors = input<string[] | boolean | null | undefined>(undefined);

  /** @zh 默认最近使用颜色 @en Default recent colors in uncontrolled mode @defaultValue [] */
  readonly defaultRecentColors = input<string[]>([]);

  /** @zh 透传给格式选择器的属性 @en Props passed through to the format selector @defaultValue undefined */
  readonly selectInputProps = input<Record<string, unknown> | undefined>(undefined);

  /** @zh 是否显示当前颜色预览 @en Whether to show the current color preview @defaultValue true */
  readonly showPrimaryColorPreview = input(true, { transform: booleanAttribute });

  /** @zh 尺寸 @en Size of the trigger input @defaultValue 'medium' @values small,medium,large */
  readonly size = input<ColorPickerSize>('medium');

  /** @zh 预设颜色，传 `null` 时使用系统预设 @en Preset swatches; null falls back to the system palette @defaultValue undefined */
  readonly swatchColors = input<string[] | null | undefined>(undefined);

  /** @zh 受控颜色值 @en Controlled color value @defaultValue undefined */
  readonly value = input<string | undefined>(undefined);

  /** @zh 非受控初始颜色 @en Initial color in uncontrolled mode @defaultValue '' */
  readonly defaultValue = input('');

  /** @zh 受控颜色值（v-model 别名） @en Controlled color value (v-model alias) @defaultValue undefined */
  readonly modelValue = input<string | undefined>(undefined);

  /** @zh 颜色变化 @en Emitted when the color changes */
  readonly change = output<ColorPickerChangeEvent>();

  /** @zh 点击清空 @en Emitted when the value is cleared */
  readonly clear = output<{ e: MouseEvent }>();

  /** @zh 色相条、透明度条变化 @en Emitted when the hue or alpha bar changes */
  readonly paletteBarChange = output<{ color: ColorObject }>();

  /** @zh 最近使用颜色变化 @en Emitted when the recent color list changes */
  readonly recentColorsChange = output<string[]>();

  private readonly formatState = signal<ColorPickerFormat | null>(null);

  protected readonly effectiveFormat = computed<ColorPickerFormat>(() => {
    const chosen = this.formatState() ?? this.format();
    return this.enableAlpha() ? chosen : (ALPHA_TO_BASE_FORMAT[chosen] ?? chosen);
  });

  protected readonly panelVisible = signal(false);

  private readonly innerValue = signal('');

  protected readonly triggerDraft = signal<string | null>(null);

  protected readonly formatDraft = signal<string | null>(null);

  protected readonly recentList = signal<string[]>([]);

  private readonly disabledByForms = signal(false);

  private dragTarget: DragTarget | null = null;

  private dragElement: HTMLElement | null = null;

  /** 拖拽时保留色相：低饱和/低明度颜色的 hsv.h 会退化为 0，需要额外记住用户选中的色相。 */
  private readonly hueDraft = signal<number | null>(null);

  private onChangeFn: (value: string) => void = () => {};

  private onTouchedFn: () => void = () => {};

  constructor() {
    this.innerValue.set(this.value() ?? this.modelValue() ?? this.defaultValue());

    const initialRecent = this.recentColors();
    this.recentList.set(
      Array.isArray(initialRecent) ? [...initialRecent] : [...this.defaultRecentColors()],
    );

    // 外部受控值变化时同步到内部状态；用户拖拽时不回写，避免打断交互。
    effect(() => {
      const external = this.value() ?? this.modelValue();
      untracked(() => {
        if (external === undefined) return;
        if (external !== this.innerValue()) {
          this.hueDraft.set(null);
          this.innerValue.set(external);
        }
      });
    });

    // `recentColors` 传数组时作为受控列表。
    effect(() => {
      const recent = this.recentColors();
      untracked(() => {
        if (Array.isArray(recent)) this.recentList.set([...recent]);
      });
    });
  }

  protected readonly classes = computed(() => 't-color-picker');

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  /** 当前颜色；空值与非法值都回退到默认色，保证面板始终可操作。 */
  protected readonly currentColor = computed<RgbaColor>(() => {
    const parsed = parseColor(this.innerValue());
    return parsed ?? (parseColor(DEFAULT_COLOR_PICKER_COLOR) as RgbaColor);
  });

  protected readonly currentHsv = computed(() => {
    const base = rgbToHsv(this.currentColor());
    const draft = this.hueDraft();
    return draft === null ? base : { ...base, h: draft };
  });

  protected readonly hueColor = computed(() => `hsl(${this.currentHsv().h}, 100%, 50%)`);

  protected readonly opaqueColor = computed(() =>
    formatColor({ ...this.currentColor(), a: 1 }, 'RGB', false),
  );

  protected readonly previewColor = computed(() =>
    formatColor(this.currentColor(), 'RGBA', this.enableAlpha()),
  );

  protected readonly triggerColor = computed(() => formatColor(this.currentColor(), 'RGBA', true));

  protected readonly formattedColor = computed(() =>
    formatColor(this.currentColor(), this.effectiveFormat(), this.enableAlpha()),
  );

  protected readonly triggerText = computed(() => {
    const draft = this.triggerDraft();
    if (draft !== null) return draft;
    return this.innerValue().trim() ? this.formattedColor() : '';
  });

  protected readonly formatInputText = computed(() => this.formatDraft() ?? this.formattedColor());

  protected readonly formatOptions = computed<SelectOptionObj[]>(() => {
    const formats = this.enableAlpha() ? COLOR_PICKER_FORMATS : COLOR_PICKER_BASE_FORMATS;
    return formats.map((item) => ({ label: item, value: item }));
  });

  protected readonly effectiveSwatches = computed<string[]>(
    () => this.swatchColors() ?? DEFAULT_COLOR_PICKER_SWATCHES,
  );

  protected readonly recentEnabled = computed(() => {
    const configured = this.recentColors();
    if (Array.isArray(configured)) return true;
    if (configured === true) return true;
    if (configured === false || configured === null) return false;
    return this.defaultRecentColors().length > 0;
  });

  protected readonly recentVisible = computed(
    () => this.recentEnabled() && this.recentList().length > 0,
  );

  protected readonly placeholder = computed(() => {
    const value = this.inputProps()?.['placeholder'];
    return typeof value === 'string' ? value : undefined;
  });

  protected readonly saturationLeft = computed(() => `${this.currentHsv().s}%`);

  protected readonly saturationTop = computed(() => `${100 - this.currentHsv().v}%`);

  protected readonly hueLeft = computed(() => `${(this.currentHsv().h / 360) * 100}%`);

  protected readonly alphaLeft = computed(() => `${this.currentColor().a * 100}%`);

  protected isActiveSwatch(color: string): boolean {
    const parsed = parseColor(color);
    return parsed ? isSameColor(parsed, this.currentColor()) : false;
  }

  protected handleVisibleChange(visible: boolean): void {
    this.panelVisible.set(visible);
  }

  protected onFormatChange(value: SelectSingleValue | SelectMultipleValue): void {
    if (typeof value !== 'string') return;
    if (!COLOR_PICKER_FORMATS.includes(value as ColorPickerFormat)) return;
    this.formatState.set(value as ColorPickerFormat);
  }

  protected onTriggerInput(value: InputValue): void {
    this.triggerDraft.set(String(value ?? ''));
  }

  protected onTriggerBlur(): void {
    this.commitTriggerInput();
    this.onTouchedFn();
  }

  protected commitTriggerInput(): void {
    const draft = this.triggerDraft();
    if (draft === null) return;
    this.triggerDraft.set(null);
    const parsed = parseColor(draft);
    if (!parsed) return;
    this.commitColor(parsed, 'input');
  }

  protected onFormatInput(value: InputValue): void {
    this.formatDraft.set(String(value ?? ''));
  }

  protected commitFormatInput(): void {
    const draft = this.formatDraft();
    if (draft === null) return;
    this.formatDraft.set(null);
    const parsed = parseColor(draft);
    if (!parsed) return;
    this.commitColor(parsed, 'input');
  }

  protected handleClear(event: MouseEvent): void {
    this.triggerDraft.set(null);
    this.hueDraft.set(null);
    this.innerValue.set('');
    this.onChangeFn('');
    this.clear.emit({ e: event });
  }

  protected selectSwatch(color: string, trigger: 'preset' | 'recent'): void {
    if (this.mergedDisabled()) return;
    const parsed = parseColor(color);
    if (!parsed) return;
    this.commitColor(parsed, trigger);
  }

  protected startSaturation(event: PointerEvent): void {
    this.startDrag(event, 'saturation');
  }

  protected moveSaturation(event: PointerEvent): void {
    if (this.dragTarget !== 'saturation') return;
    this.updateSaturation(event);
  }

  protected endSaturation(event: PointerEvent): void {
    this.endDrag(event, 'saturation');
  }

  protected startHue(event: PointerEvent): void {
    this.startDrag(event, 'hue');
  }

  protected moveHue(event: PointerEvent): void {
    if (this.dragTarget !== 'hue') return;
    this.updateHue(event);
  }

  protected endHue(event: PointerEvent): void {
    this.endDrag(event, 'hue');
  }

  protected startAlpha(event: PointerEvent): void {
    this.startDrag(event, 'alpha');
  }

  protected moveAlpha(event: PointerEvent): void {
    if (this.dragTarget !== 'alpha') return;
    this.updateAlpha(event);
  }

  protected endAlpha(event: PointerEvent): void {
    this.endDrag(event, 'alpha');
  }

  private startDrag(event: PointerEvent, target: DragTarget): void {
    if (this.mergedDisabled()) return;
    event.preventDefault();
    const element = event.currentTarget as HTMLElement;
    this.dragTarget = target;
    this.dragElement = element;
    element.setPointerCapture?.(event.pointerId);

    if (target === 'saturation') this.updateSaturation(event);
    if (target === 'hue') this.updateHue(event);
    if (target === 'alpha') this.updateAlpha(event);
  }

  private endDrag(event: PointerEvent, target: DragTarget): void {
    if (this.dragTarget !== target) return;
    this.dragElement?.releasePointerCapture?.(event.pointerId);
    this.dragTarget = null;
    this.dragElement = null;
    this.rememberCurrentColor();
  }

  private updateSaturation(event: PointerEvent): void {
    const element = this.dragElement;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const saturation = clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100);
    const value = clamp((1 - (event.clientY - rect.top) / rect.height) * 100, 0, 100);
    const hue = this.currentHsv().h;
    this.hueDraft.set(hue);
    const next = hsvToRgb({ h: hue, s: saturation, v: value }, this.currentColor().a);
    this.commitColor(next, 'palette-saturation-brightness');
  }

  private updateHue(event: PointerEvent): void {
    const element = this.dragElement;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (!rect.width) return;
    const hue = clamp(((event.clientX - rect.left) / rect.width) * 360, 0, 360);
    const current = this.currentHsv();
    this.hueDraft.set(hue);
    const next = hsvToRgb({ h: hue, s: current.s, v: current.v }, this.currentColor().a);
    this.commitColor(next, 'palette-hue-bar');
  }

  private updateAlpha(event: PointerEvent): void {
    const element = this.dragElement;
    if (!element) return;
    const rect = element.getBoundingClientRect();
    if (!rect.width) return;
    const alpha = clamp((event.clientX - rect.left) / rect.width, 0, 1);
    const next: RgbaColor = { ...this.currentColor(), a: alpha };
    this.commitColor(next, 'palette-alpha-bar');
  }

  private commitColor(color: RgbaColor, trigger: ColorPickerChangeTrigger): void {
    if (trigger === 'preset' || trigger === 'recent' || trigger === 'input') {
      this.hueDraft.set(null);
    }
    const value = formatColor(color, this.effectiveFormat(), this.enableAlpha());
    this.innerValue.set(value);
    this.onChangeFn(value);
    const colorObject = toColorObject(color, this.effectiveFormat(), this.enableAlpha());
    this.change.emit({ value, color: colorObject, trigger });
    if (trigger === 'palette-hue-bar' || trigger === 'palette-alpha-bar') {
      this.paletteBarChange.emit({ color: colorObject });
    }
    if (trigger === 'preset' || trigger === 'recent' || trigger === 'input') {
      this.rememberColor(formatColor(color, 'HEX', true));
    }
  }

  private rememberCurrentColor(): void {
    this.rememberColor(formatColor(this.currentColor(), 'HEX', true));
  }

  private rememberColor(color: string): void {
    if (!this.recentEnabled()) return;
    const next = pushRecentColor(this.recentList(), color);
    if (next.length === this.recentList().length && next[0] === this.recentList()[0]) return;
    this.recentList.set(next);
    this.recentColorsChange.emit([...next]);
  }

  writeValue(value: string | null | undefined): void {
    this.hueDraft.set(null);
    this.innerValue.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }
}
