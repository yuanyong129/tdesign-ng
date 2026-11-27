import { Directive, ElementRef, inject, input } from '@angular/core';

/** 复合输入组件中原生编辑区的受支持配置；不接受 value、format 或外框属性。 */
export interface InputOptions {
  name?: string;
  autocomplete?: string;
  spellCheck?: boolean;
  autofocus?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  maxlength?: string | number;
  /** ASCII 计 1，非 ASCII 每个 UTF-16 单元计 2。 */
  maxcharacter?: number;
  allowInputOverMax?: boolean;
  onFocus?: (value: string, context: { e: FocusEvent }) => void;
  onBlur?: (value: string, context: { e: FocusEvent }) => void;
  onKeydown?: (value: string, context: { e: KeyboardEvent }) => void;
  onKeypress?: (value: string, context: { e: KeyboardEvent }) => void;
  onKeyup?: (value: string, context: { e: KeyboardEvent }) => void;
  onChange?: (value: string, context: { e: Event }) => void;
  onCompositionstart?: (value: string, context: { e: CompositionEvent }) => void;
  onCompositionend?: (value: string, context: { e: CompositionEvent }) => void;
}

/** 将白名单属性写到原生输入框；状态与值由所属复合组件控制。 */
@Directive({
  selector: 'input[tInputOptions]',
  standalone: true,
  host: {
    '[attr.name]': 'tInputOptions()?.name ?? null',
    '[attr.autocomplete]': "tInputOptions()?.autocomplete ?? 'off'",
    '[attr.spellcheck]': 'tInputOptions()?.spellCheck ?? true',
    '[attr.maxlength]': 'nativeMaxlength()',
    '[attr.autofocus]': "optionsAutofocus() ? '' : null",
    '(focus)': 'onFocus($event)',
    '(blur)': 'onBlur($event)',
    '(keydown)': 'onKeydown($event)',
    '(keypress)': 'onKeypress($event)',
    '(keyup)': 'onKeyup($event)',
    '(compositionstart)': 'onCompositionstart($event)',
    '(compositionend)': 'onCompositionend($event)',
  },
})
export class InputOptionsDirective {
  readonly tInputOptions = input<InputOptions | undefined>();
  readonly optionsAutofocus = input(false);
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

  protected nativeMaxlength(): number | null {
    const options = this.tInputOptions();
    if (options?.allowInputOverMax || options?.maxlength === undefined || options.maxlength === '') return null;
    const value = Number(options.maxlength);
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : null;
  }

  protected onFocus(e: FocusEvent): void { this.tInputOptions()?.onFocus?.(this.element.nativeElement.value, { e }); }
  protected onBlur(e: FocusEvent): void { this.tInputOptions()?.onBlur?.(this.element.nativeElement.value, { e }); }
  protected onKeydown(e: KeyboardEvent): void { this.tInputOptions()?.onKeydown?.(this.element.nativeElement.value, { e }); }
  protected onKeypress(e: KeyboardEvent): void { this.tInputOptions()?.onKeypress?.(this.element.nativeElement.value, { e }); }
  protected onKeyup(e: KeyboardEvent): void { this.tInputOptions()?.onKeyup?.(this.element.nativeElement.value, { e }); }
  protected onCompositionstart(e: CompositionEvent): void { this.tInputOptions()?.onCompositionstart?.(this.element.nativeElement.value, { e }); }
  protected onCompositionend(e: CompositionEvent): void { this.tInputOptions()?.onCompositionend?.(this.element.nativeElement.value, { e }); }
}

/** 归一化用户输入，保持完整 Unicode 码点；不处理程序写值和数字步进。 */
export function limitInputText(value: string, options: InputOptions | undefined): string {
  if (!options || options.allowInputOverMax) return value;
  let result = '';
  let count = 0;
  let weighted = 0;
  const rawMax = options.maxlength;
  const max = rawMax === undefined || rawMax === '' ? NaN : Number(rawMax);
  const weightedMax = options.maxcharacter;
  for (const character of value) {
    let weight = 0;
    for (let i = 0; i < character.length; i++) weight += character.charCodeAt(i) > 127 ? 2 : 1;
    if (Number.isFinite(max) && max >= 0 && count + 1 > Math.floor(max)) break;
    if (weightedMax !== undefined && Number.isFinite(weightedMax) && weightedMax >= 0 && weighted + weight > weightedMax) break;
    result += character;
    count++;
    weighted += weight;
  }
  return result;
}
