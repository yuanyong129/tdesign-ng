import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * 自定义时间选择器的回显内容。
 *
 * 模板上下文：`{ $implicit: value, value }`。
 */
@Directive({
  selector: '[tTimePickerValueDisplay]',
  standalone: true,
})
export class TTimePickerValueDisplay {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
