import { Directive } from '@angular/core';

/**
 * 标记空状态的操作区内容。
 *
 * ```html
 * <t-empty description="没有匹配的结果">
 *   <t-button tEmptyAction>重新加载</t-button>
 * </t-empty>
 * ```
 */
@Directive({
  selector: '[tEmptyAction]',
  standalone: true,
})
export class TEmptyAction {}
