import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * 自定义树节点的内容，模板上下文为 `{ $implicit: TreeNodeModel, node: TreeNodeModel }`。
 *
 * ```html
 * <t-tree [data]="data">
 *   <ng-template tTreeLabel let-node>
 *     <span class="demo-node">{{ node.label }}（{{ node.value }}）</span>
 *   </ng-template>
 * </t-tree>
 * ```
 */
@Directive({
  selector: '[tTreeLabel]',
  standalone: true,
})
export class TTreeLabelTemplate {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * 自定义展开图标，模板上下文为 `{ $implicit: TreeNodeModel, node: TreeNodeModel }`。
 *
 * ```html
 * <t-tree [data]="data">
 *   <ng-template tTreeIcon let-node>
 *     <span class="demo-icon">{{ node.expanded ? '−' : '+' }}</span>
 *   </ng-template>
 * </t-tree>
 * ```
 */
@Directive({
  selector: '[tTreeIcon]',
  standalone: true,
})
export class TTreeIconTemplate {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}

/** 自定义空数据内容。 */
@Directive({
  selector: '[tTreeEmpty]',
  standalone: true,
})
export class TTreeEmptyTemplate {
  /** 模板引用。 */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef);
}
