import { TemplateRef } from '@angular/core';

/**
 * 富内容入参的统一契约。
 *
 * TDesign 的上游属性（`content` / `title` / `label` / `description` …）在 Vue 侧是
 * `string | TNode`，到 Angular 侧统一收敛成「纯文本 或 模板」：
 *
 * ```ts
 * readonly title = input<Content>(undefined);
 * ```
 *
 * 约定：
 * - `undefined` / `null` / `''` 都表示「没有内容」，组件用 `isContentEmpty()` 判断；
 * - 模板用 `NgTemplateOutlet` 渲染，纯文本走插值，**不要**用 `innerHTML`（会被当 HTML 注入）；
 * - 组件对外仍可导出自己的别名（`export type CardContent = Content;`），保持 API 文档里的专有名。
 */
export type Content = string | TemplateRef<unknown> | undefined;

/**
 * 判断是否为模板内容。
 *
 * 用鸭子类型而不是 `instanceof TemplateRef`：模板引用可能来自另一个 Angular 运行时副本
 * （多入口构建、微前端），`instanceof` 会误判成 false。
 */
export function isTemplateContent(value: unknown): value is TemplateRef<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { createEmbeddedView?: unknown }).createEmbeddedView === 'function'
  );
}

/** 判断内容是否为空（`undefined` / `null` / 空字符串都算空）。 */
export function isContentEmpty(value: Content | null | undefined): boolean {
  if (value === undefined || value === null) return true;
  if (isTemplateContent(value)) return false;
  return String(value).length === 0;
}

/** 取纯文本内容；模板内容返回空串（用于 `aria-label` 之类的降级场景）。 */
export function contentText(value: Content | null | undefined): string {
  if (value === undefined || value === null || isTemplateContent(value)) return '';
  return String(value);
}
