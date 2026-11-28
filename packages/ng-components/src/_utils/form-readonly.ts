import { computed, inject, InjectionToken, type Signal } from '@angular/core';

/** 与 Form 解耦的只读上下文，投影和弹层中的原组件均可继承。 */
export interface FormReadonlyContext { readonly: Signal<boolean>; }
export const FORM_READONLY = new InjectionToken<FormReadonlyContext>('TDesign Form readonly');

/** 显式只读和最近的表单只读取并集，不改变 Angular Control 的 disabled 状态。 */
export function useFormReadonly(local: Signal<boolean>): Signal<boolean> {
  const form = inject(FORM_READONLY, { optional: true });
  return computed(() => local() || !!form?.readonly());
}
