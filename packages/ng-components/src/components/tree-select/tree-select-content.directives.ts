import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * 树选择面板顶部内容。
 *
 * ```html
 * <t-tree-select [data]="data">
 *   <ng-template tTreeSelectPanelTop>
 *     <div class="demo-panel-tip">按部门筛选</div>
 *   </ng-template>
 * </t-tree-select>
 * ```
 */
@Directive({
  selector: '[tTreeSelectPanelTop]',
  standalone: true,
})
export class TTreeSelectPanelTop {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** 树选择面板底部内容。 */
@Directive({
  selector: '[tTreeSelectPanelBottom]',
  standalone: true,
})
export class TTreeSelectPanelBottom {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
