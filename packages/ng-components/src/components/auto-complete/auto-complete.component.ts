import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
  type TemplateRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { TInput, type InputChangeEvent } from '../input';
import { TPopup } from '../popup';
import {
  type AutoCompleteBlurEvent,
  type AutoCompleteChangeEvent,
  type AutoCompleteClearEvent,
  type AutoCompleteCompositionEvent,
  type AutoCompleteContent,
  type AutoCompleteEnterEvent,
  type AutoCompleteFilter,
  type AutoCompleteFocusEvent,
  type AutoCompleteHighlightPart,
  type AutoCompleteOption,
  type AutoCompleteOptionView,
  type AutoCompleteSelectEvent,
  type AutoCompleteSize,
  type AutoCompleteStatus,
} from './auto-complete.types';

const SIZE_SUFFIX: Record<AutoCompleteSize, string> = {
  small: 's',
  medium: 'm',
  large: 'l',
};

/** 上游从全局配置里取空态文案，这里用同一份默认文案。 */
const DEFAULT_EMPTY_TEXT = '暂无数据';

/** 拆开富文本：字符串进 `text`，模板进 `template`。 */
interface SplitContent {
  text: string | null;
  template: TemplateRef<unknown> | null;
}

function isTemplateRef(value: unknown): value is TemplateRef<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { createEmbeddedView?: unknown }).createEmbeddedView === 'function'
  );
}

function splitContent(content: AutoCompleteContent | undefined): SplitContent {
  if (content === undefined || content === null) {
    return { text: null, template: null };
  }
  if (typeof content === 'string') {
    return { text: content, template: null };
  }
  return { text: null, template: content };
}

/** 上游用 lodash 的 escapeRegExp，这里内联一份等价实现。 */
function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 归一化一个选项：`text` 是选中值，`content` 是展示内容。
 *
 * 上游规则：字符串选项 `text === label`；对象选项优先用 `text`，
 * 没有 `text` 时退回字符串形式的 `label`；`label` 是模板时渲染模板。
 */
function toOptionView(option: AutoCompleteOption): AutoCompleteOptionView {
  if (typeof option === 'string') {
    return { text: option, content: option, template: null, raw: option };
  }
  const label = option.label;
  const text =
    typeof option.text === 'string' ? option.text : typeof label === 'string' ? label : '';
  const template = isTemplateRef(label) ? label : null;
  const content = typeof label === 'string' ? label : text;
  return { text, content, template, raw: option };
}

/**
 * 自动补全。
 *
 * 输入框内输入即过滤选项，弹层复用 `t-popup` + `t-input`：
 * 输入、聚焦时展开，选中、失焦、点击外部、Esc 时收起。
 *
 * ```html
 * <t-auto-complete [options]="options" [(value)]="value" />
 * <t-auto-complete [options]="options" [filter]="remoteFilter" (select)="onSelect($event)" />
 * ```
 */
@Component({
  selector: 't-auto-complete',
  standalone: true,
  imports: [NgTemplateOutlet, TInput, TPopup],
  templateUrl: './auto-complete.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TAutoComplete),
      multi: true,
    },
  ],
})
export class TAutoComplete implements ControlValueAccessor, OnInit {
  /** 值，受控用法。 @zh 值 @en value @defaultValue undefined */
  readonly value = input<string | undefined>(undefined);

  /** 默认值，非受控用法。 @zh 默认值 @en defaultValue @defaultValue '' */
  readonly defaultValue = input<string | undefined>(undefined);

  /** 联想数据源，字符串或 `{ text, label }` 对象。 @zh 联想数据源 @en options @defaultValue [] */
  readonly options = input<AutoCompleteOption[]>([]);

  /** 自定义过滤函数，返回 true 保留该选项。 @zh 自定义过滤函数 @en filter @defaultValue undefined */
  readonly filter = input<AutoCompleteFilter | undefined>(undefined);

  /** 是否根据输入值过滤选项。 @zh 是否过滤选项 @en filterable @defaultValue true */
  readonly filterable = input(true, { transform: booleanAttribute });

  /** 是否高亮命中的关键字。 @zh 是否高亮关键字 @en highlightKeyword @defaultValue true */
  readonly highlightKeyword = input(true, { transform: booleanAttribute });

  /** 空态内容。 @zh 空态内容 @en empty @defaultValue undefined */
  readonly empty = input<AutoCompleteContent | undefined>(undefined);

  /** 面板顶部内容。 @zh 面板顶部内容 @en panelTopContent @defaultValue undefined */
  readonly panelTopContent = input<AutoCompleteContent | undefined>(undefined);

  /** 面板底部内容。 @zh 面板底部内容 @en panelBottomContent @defaultValue undefined */
  readonly panelBottomContent = input<AutoCompleteContent | undefined>(undefined);

  /** 自定义触发器，传入后替换内置输入框。 @zh 自定义触发器 @en triggerElement @defaultValue undefined */
  readonly triggerElement = input<AutoCompleteContent | undefined>(undefined);

  /** 输入框占位符。 @zh 占位符 @en placeholder @defaultValue undefined */
  readonly placeholder = input<string | undefined>(undefined);

  /** 尺寸。 @zh 尺寸 @en size @defaultValue medium @values small,medium,large */
  readonly size = input<AutoCompleteSize>('medium');

  /** 校验状态。 @zh 校验状态 @en status @defaultValue default @values default,success,warning,error */
  readonly status = input<AutoCompleteStatus>('default');

  /** 输入框下方的提示文字。 @zh 提示文字 @en tips @defaultValue undefined */
  readonly tips = input<string | undefined>(undefined);

  /** 是否无边框。 @zh 是否无边框 @en borderless @defaultValue false */
  readonly borderless = input(false, { transform: booleanAttribute });

  /** 是否可清空。 @zh 是否可清空 @en clearable @defaultValue false */
  readonly clearable = input(false, { transform: booleanAttribute });

  /** 是否禁用。 @zh 是否禁用 @en disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 是否只读。 @zh 是否只读 @en readonly @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** 是否自动聚焦。 @zh 是否自动聚焦 @en autofocus @defaultValue false */
  readonly autofocus = input(false, { transform: booleanAttribute });

  /** 值变化事件，用于双向绑定。 @zh 值变化 @en valueChange */
  readonly valueChange = output<string>();

  /** 值变化事件，携带触发来源。 @zh 值变化 @en change */
  readonly change = output<AutoCompleteChangeEvent>();

  /** 选中选项。 @zh 选中选项 @en select */
  readonly select = output<AutoCompleteSelectEvent>();

  /** 按下回车。 @zh 按下回车 @en enter */
  readonly enter = output<AutoCompleteEnterEvent>();

  /** 获得焦点。 @zh 获得焦点 @en focus */
  readonly focus = output<AutoCompleteFocusEvent>();

  /** 失去焦点。 @zh 失去焦点 @en blur */
  readonly blur = output<AutoCompleteBlurEvent>();

  /** 点击清空图标。 @zh 清空 @en clear */
  readonly clear = output<AutoCompleteClearEvent>();

  /** 组合输入开始。 @zh 组合输入开始 @en compositionstart */
  readonly compositionstart = output<AutoCompleteCompositionEvent>();

  /** 组合输入结束。 @zh 组合输入结束 @en compositionend */
  readonly compositionend = output<AutoCompleteCompositionEvent>();

  private readonly destroyRef = inject(DestroyRef);

  private readonly wrapRef = viewChild<ElementRef<HTMLElement>>('wrap');

  protected readonly innerValue = signal('');

  protected readonly open = signal(false);

  private readonly active = signal('');

  protected readonly hostWidth = signal(0);

  /** 表单通过 `setDisabledState` 下发的禁用态，与模板上的 `disabled` 取并集。 */
  private readonly disabledByForms = signal(false);

  private onChange: (value: string) => void = () => {};

  private onTouched: () => void = () => {};

  constructor() {
    // 外部 `[value]` 变化时同步到内部状态；用户输入时不回写，避免打断正在输入的内容。
    effect(() => {
      const value = this.value();
      if (value === undefined) return;
      untracked(() => {
        if (value !== this.innerValue()) this.innerValue.set(value);
      });
    });

    // 弹层最小宽度跟随触发器宽度，等价于上游的 overlayInnerStyle.width。
    effect(() => {
      const element = this.wrapRef()?.nativeElement;
      if (!element) return;
      untracked(() => this.observeWidth(element));
    });
  }

  ngOnInit(): void {
    if (this.value() !== undefined) return;
    this.innerValue.set(this.defaultValue() ?? '');
  }

  protected readonly mergedDisabled = computed(() => this.disabled() || this.disabledByForms());

  protected readonly sizeSuffix = computed(() => SIZE_SUFFIX[this.size()]);

  protected readonly panelInnerClasses = computed(
    () => `t-select__dropdown-inner t-select__dropdown-inner--size-${this.sizeSuffix()}`,
  );

  protected readonly optionSizeClass = computed(() => `t-size-${this.sizeSuffix()}`);

  protected readonly triggerContent = computed(() => splitContent(this.triggerElement()));

  protected readonly panelTop = computed(() => splitContent(this.panelTopContent()));

  protected readonly panelBottom = computed(() => splitContent(this.panelBottomContent()));

  protected readonly emptyContent = computed<SplitContent>(() => {
    const content = splitContent(this.empty());
    if (content.text === null && content.template === null) {
      return { text: DEFAULT_EMPTY_TEXT, template: null };
    }
    return content;
  });

  /**
   * 过滤后的选项。
   *
   * 与上游一致：有 `filter` 时以它为准（返回 Promise 时按真值处理，不等待）；
   * 否则 `filterable` 打开时用当前输入值做不区分大小写的匹配。
   */
  protected readonly filteredOptions = computed<AutoCompleteOptionView[]>(() => {
    const keyword = this.innerValue();
    const views = this.options().map((option) => toOptionView(option));
    const filter = this.filter();
    if (filter) {
      return views.filter((view) => Boolean(filter(keyword, view.raw)));
    }
    if (!this.filterable() || keyword === '') return views;
    const regExp = new RegExp(escapeRegExp(keyword), 'i');
    return views.filter((view) => regExp.test(view.text));
  });

  protected readonly activeOption = computed<AutoCompleteOptionView | null>(
    () => this.filteredOptions().find((view) => view.text === this.active()) ?? null,
  );

  writeValue(value: string | null | undefined): void {
    this.innerValue.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByForms.set(isDisabled);
  }

  protected handleInputChange(event: InputChangeEvent): void {
    this.commit(String(event.value ?? ''), { trigger: event.trigger, e: event.event });
    this.showPanel();
  }

  protected handleFocus(event: FocusEvent): void {
    this.showPanel();
    this.focus.emit({ e: event, value: this.innerValue() });
  }

  protected handleBlur(event: FocusEvent): void {
    this.inputComposing = false;
    this.onTouched();
    this.blur.emit({ e: event, value: this.innerValue() });
  }

  protected handleEnter(event: KeyboardEvent): void {
    this.enter.emit({ e: event, value: this.innerValue() });
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (this.mergedDisabled()) return;
    if (this.inputComposing || event.isComposing || event.keyCode === 229) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.showPanel();
      this.moveActive(event.key === 'ArrowDown' ? 1 : -1);
      return;
    }
    if (event.key !== 'Enter') return;
    const target = this.activeOption();
    if (!target) return;
    event.preventDefault();
    this.selectOption(target, event);
  }

  protected handleClear(event: MouseEvent): void {
    this.clear.emit({ e: event });
  }

  protected handleCompositionStart(event: CompositionEvent): void {
    this.inputComposing = true;
    this.compositionstart.emit({ e: event, value: this.innerValue() });
  }

  protected handleCompositionEnd(event: CompositionEvent): void {
    this.inputComposing = false;
    this.compositionend.emit({ e: event, value: this.innerValue() });
  }

  private inputComposing = false;

  protected handleVisibleChange(visible: boolean): void {
    if (visible) {
      if (this.mergedDisabled() || this.readonly()) return;
    }
    this.open.set(visible);
    if (!visible) this.active.set('');
  }

  /** 面板按下鼠标时阻止默认行为，保住输入框焦点，否则点击选项会先触发 blur。 */
  protected handlePanelMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  protected selectOption(option: AutoCompleteOptionView, event?: Event): void {
    if (this.mergedDisabled() || this.readonly()) return;
    this.active.set(option.text);
    this.commit(option.text, { e: event });
    this.open.set(false);
    this.select.emit({ value: option.text, e: event });
    this.onTouched();
  }

  protected optionClasses(option: AutoCompleteOptionView): string {
    const classes = ['t-select-option', this.optionSizeClass()];
    if (option.text === this.active()) classes.push('t-select-option--hover');
    return classes.join(' ');
  }

  /**
   * 按当前输入值切分文本（对齐上游 highlight-option）：命中片段标记为高亮，
   * 没有命中时整体作为一个普通片段返回；`highlightKeyword` 关闭时返回空数组。
   */
  /**
   * 把文本按关键字切分后拼成 HTML 片段：命中的部分包 `<b class="t-is-highlight">`。
   * 用 innerHTML 而不是模板里的逐段插值，是因为 Angular 控制流会在片段之间留下空白文本节点，
   * 渲染出来会变成「v ue」这样被空格撑开的样子（模板里无法可靠地消除）。
   */
  protected highlightHtml(text: string): string {
    const parts = this.highlightParts(text);
    if (!parts.length) return escapeHtml(text);
    return parts
      .map((part) => (part.match ? `<b class="t-is-highlight">${escapeHtml(part.text)}</b>` : escapeHtml(part.text)))
      .join('');
  }

  protected highlightParts(text: string): AutoCompleteHighlightPart[] {
    if (!this.highlightKeyword() || !text) return [];
    const keyword = this.innerValue();
    if (!keyword) return [{ text, match: false }];
    const regExp = new RegExp(escapeRegExp(keyword), 'gi');
    const parts: AutoCompleteHighlightPart[] = [];
    let lastIndex = 0;
    let match = regExp.exec(text);
    while (match) {
      if (match.index > lastIndex) {
        parts.push({ text: text.slice(lastIndex, match.index), match: false });
      }
      parts.push({ text: match[0], match: true });
      lastIndex = match.index + match[0].length;
      match = regExp.exec(text);
    }
    if (!parts.length) return [{ text, match: false }];
    if (lastIndex < text.length) parts.push({ text: text.slice(lastIndex), match: false });
    return parts;
  }

  private showPanel(): void {
    if (this.mergedDisabled() || this.readonly()) return;
    this.open.set(true);
  }

  private moveActive(step: number): void {
    const options = this.filteredOptions();
    if (!options.length) {
      this.active.set('');
      return;
    }
    const index = options.findIndex((option) => option.text === this.active());
    const nextIndex =
      step > 0
        ? index + 1 >= options.length
          ? 0
          : index + 1
        : index - 1 < 0
          ? options.length - 1
          : index - 1;
    this.active.set(options[nextIndex].text);
  }

  private commit(value: string, context: { trigger?: AutoCompleteChangeEvent['trigger']; e?: Event }): void {
    const changed = value !== this.innerValue();
    this.innerValue.set(value);
    if (!changed) return;
    if (!value) this.active.set('');
    this.onChange(value);
    this.valueChange.emit(value);
    this.change.emit({ value, trigger: context.trigger, e: context.e });
  }

  private observeWidth(element: HTMLElement): void {
    this.hostWidth.set(Math.round(element.getBoundingClientRect().width));
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;
      this.hostWidth.set(Math.round(width));
    });
    observer.observe(element);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}

/** 转义 HTML 特殊字符，供 innerHTML 高亮片段使用。 */
function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
