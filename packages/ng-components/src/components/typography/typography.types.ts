import { TemplateRef } from '@angular/core';
import type { Content } from '../../_utils/content';
import type { TooltipPlacement, TooltipTheme } from '../tooltip/tooltip.component';

/** 复制按钮的提示配置，仅接受当前 Tooltip 支持的输入。 */
export interface TypographyCopyTooltipProps {
  content?: string;
  placement?: TooltipPlacement;
  theme?: TooltipTheme;
  showArrow?: boolean;
  delay?: number;
  duration?: number;
  disabled?: boolean;
  destroyOnClose?: boolean;
  zIndex?: number;
}

/** 复制配置，模板 suffix 可通过 let-copied="copied" 读取成功状态。 */
export interface TypographyCopyable {
  text?: string;
  suffix?: Content;
  tooltipProps?: TypographyCopyTooltipProps;
  onCopy?: () => void;
}

/**
 * 排版富文本内容：字符串按纯文本渲染，TemplateRef 交给 *ngTemplateOutlet 渲染。
 *
 * 对应上游的 `string | TNode`（TNode 在 Vue 里是字符串或渲染函数），
 * Angular 侧没有渲染函数，统一用模板引用表达。
 */
export type TypographyContent = Content;

/** 文本主题，取自上游 text 的 theme 可选值。 */
export const TYPOGRAPHY_THEMES = ['primary', 'secondary', 'success', 'warning', 'error'] as const;
export type TypographyTheme = (typeof TYPOGRAPHY_THEMES)[number];

/** 标题层级，取自上游 title 的 level 可选值。 */
export const TYPOGRAPHY_LEVELS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
export type TypographyLevel = (typeof TYPOGRAPHY_LEVELS)[number];

/**
 * 省略配置。
 *
 * 上游的 collapsible / expandable / suffix / tooltipProps / onExpand 属于
 * 交互增强（本期 [D3] 不实现），所以这里也不声明，传了会直接报类型错误。
 */
export interface TypographyEllipsis {
  /** 省略行数，默认 1。 */
  row?: number;
}

/** 富文本转模板引用，模板里用 `@if (asTemplate(value); as template)` 判断。 */
export function asTemplateRef(value: TypographyContent): TemplateRef<unknown> | null {
  return value instanceof TemplateRef ? value : null;
}

/**
 * ellipsis 需要的内联布局量。
 *
 * 取值与上游 Ellipsis 内层 `<p>` 的 ellipsisStyles 完全一致
 * （tdesign-vue-next es/typography/components/ellipsis.mjs）。只有这组布局量走
 * 内联 style：颜色、字号、间距仍然全部来自 `.t-typography`。
 */
export function typographyEllipsisStyle(ellipsis: boolean | TypographyEllipsis): Record<string, string> | null {
  if (!ellipsis) {
    return null;
  }
  const row = typeof ellipsis === 'object' && ellipsis.row ? ellipsis.row : 1;
  return {
    overflow: 'hidden',
    'text-overflow': 'ellipsis',
    'white-space': 'normal',
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    '-webkit-line-clamp': `${row}`,
  };
}
