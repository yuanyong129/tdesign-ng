import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * 级联面板顶部内容。
 *
 * ```html
 * <t-cascader [options]="options">
 *   <ng-template tCascaderPanelTop>
 *     <div class="demo-panel-tip">最近使用</div>
 *   </ng-template>
 * </t-cascader>
 * ```
 */
@Directive({
  selector: '[tCascaderPanelTop]',
  standalone: true,
})
export class TCascaderPanelTop {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** 级联面板底部内容。 */
@Directive({
  selector: '[tCascaderPanelBottom]',
  standalone: true,
})
export class TCascaderPanelBottom {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * 自定义回显内容。
 *
 * 模板上下文：`{ $implicit: value, value, displayValue, selectedOptions, onClose }`。
 * `onClose(index)` 用于删除多选里的第 index 个标签。
 */
@Directive({
  selector: '[tCascaderValueDisplay]',
  standalone: true,
})
export class TCascaderValueDisplay {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
