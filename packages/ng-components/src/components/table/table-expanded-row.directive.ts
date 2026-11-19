import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * 展开行模板指令：`<ng-template tTableExpandedRow let-row>…</ng-template>`。
 *
 * 模板上下文为 `{ $implicit: row, row, rowIndex }`。
 */
@Directive({
  selector: '[tTableExpandedRow]',
  standalone: true,
})
export class TTableExpandedRow {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
