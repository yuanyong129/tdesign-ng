import { Directive, TemplateRef, inject, input } from '@angular/core';

/** 单元格模板指令：`<ng-template tTableCell="status" let-row>…</ng-template>`。 */
@Directive({
  selector: '[tTableCell]',
  standalone: true,
})
export class TTableCell {
  /** 对应的列 `colKey`。 */
  readonly colKey = input.required<string>({ alias: 'tTableCell' });

  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
