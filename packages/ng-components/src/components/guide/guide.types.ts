import type { TemplateRef } from '@angular/core';
import type { ButtonSize, ButtonTheme, ButtonVariant } from '../button/button.types';

/** 引导的展示模式。 */
export const GUIDE_MODES = ['popup', 'dialog'] as const;
export type GuideMode = (typeof GUIDE_MODES)[number];

/** 气泡模式支持的 12 个方向，与上游 `StepPopupPlacement` 对齐。 */
export const GUIDE_POPUP_PLACEMENTS = [
  'top',
  'left',
  'right',
  'bottom',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'left-top',
  'left-bottom',
  'right-top',
  'right-bottom',
] as const;
export type GuidePopupPlacement = (typeof GUIDE_POPUP_PLACEMENTS)[number];

/** 对话框模式只支持顶部与居中两种位置，与上游 `StepDialogPlacement` 对齐。 */
export const GUIDE_DIALOG_PLACEMENTS = ['top', 'center'] as const;
export type GuideDialogPlacement = (typeof GUIDE_DIALOG_PLACEMENTS)[number];

/** 步骤位置。 */
export type GuidePlacement = GuidePopupPlacement | GuideDialogPlacement;

/**
 * 目标元素，与上游 `AttachNode` 对齐：CSS 选择器、DOM 元素，或返回它们的函数。
 * 不传时定位到 `document.body`。
 */
export type GuideAttachNode =
  | string
  | HTMLElement
  | null
  | undefined
  | (() => string | HTMLElement | null | undefined);

/** 引导内容：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type GuideContent = string | TemplateRef<unknown> | null | undefined;

/**
 * 按钮配置，只包含 `t-button` 已支持的字段。
 * 上游的 `ButtonProps` 更宽（含 icon、shape 等），这里按需收窄。
 */
export interface GuideButtonProps {
  /** 按钮文字，缺省时使用内置中文文案。 */
  content?: string;
  /** 按钮主题色。 */
  theme?: ButtonTheme;
  /** 按钮变体。 */
  variant?: ButtonVariant;
  /** 按钮尺寸，缺省时气泡为 `small`、对话框为 `medium`。 */
  size?: ButtonSize;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 是否显示加载状态。 */
  loading?: boolean;
  /** 追加到按钮宿主上的类名。 */
  className?: string;
}

/** 单个引导步骤，字段与上游 `GuideStep` 对齐。 */
export interface GuideStep {
  /** 步骤说明，字符串或模板。 */
  body?: GuideContent;
  /** 完全自定义的气泡内容（仅气泡模式生效），会替代标题、说明与底部操作区。 */
  content?: GuideContent;
  /** 本步高亮的目标元素。 */
  element: GuideAttachNode;
  /** 自定义高亮内容（仅气泡模式生效）。 */
  highlightContent?: GuideContent;
  /** 本步的高亮内边距，覆盖组件级 `highlightPadding`。 */
  highlightPadding?: number;
  /** 本步的展示模式，覆盖组件级 `mode`。 */
  mode?: GuideMode;
  /** 本步“下一步”按钮配置。 */
  nextButtonProps?: GuideButtonProps;
  /** 气泡相对目标元素的像素偏移 `[x, y]`。 */
  offset?: Array<string | number>;
  /** 本步的展示位置。 */
  placement?: GuidePlacement;
  /** 本步“上一步”按钮配置。 */
  prevButtonProps?: GuideButtonProps;
  /** 本步是否展示遮罩，覆盖组件级 `showOverlay`。 */
  showOverlay?: boolean;
  /** 本步“跳过”按钮配置。 */
  skipButtonProps?: GuideButtonProps;
  /** 追加到气泡或对话框上的类名。 */
  stepOverlayClass?: string;
  /** 步骤标题。 */
  title?: string;
}

/** `(change)` 的载荷。 */
export interface GuideChangeContext {
  e?: MouseEvent;
  current: number;
  total: number;
}

/** `(prev)` 的载荷。 */
export interface GuidePrevContext {
  e?: MouseEvent;
  /** 目标步骤下标。 */
  prev: number;
  /** 触发时所在步骤下标。 */
  current: number;
  total: number;
}

/** `(next)` 的载荷。 */
export interface GuideNextContext {
  e?: MouseEvent;
  /** 目标步骤下标。 */
  next: number;
  /** 触发时所在步骤下标。 */
  current: number;
  total: number;
}

/** `(finish)` 的载荷。 */
export interface GuideFinishContext {
  e?: MouseEvent;
  /** 触发完成时的步骤下标。 */
  current: number;
  total: number;
}

/** `(skip)` 的载荷。 */
export interface GuideSkipContext {
  e?: MouseEvent;
  /** 触发跳过时的步骤下标。 */
  current: number;
  total: number;
}

/** 自定义气泡内容可用的上下文。 */
export interface GuideStepContentContext {
  /** 当前步骤下标（从 0 开始）。 */
  current: number;
  /** 步骤总数。 */
  total: number;
  /** 当前步骤配置。 */
  currentStepInfo: GuideStep | undefined;
  /** 是否第一步。 */
  isFirst: boolean;
  /** 是否最后一步。 */
  isLast: boolean;
  /** 上一步。 */
  prev: (e?: MouseEvent) => void;
  /** 下一步。 */
  next: (e?: MouseEvent) => void;
  /** 跳过。 */
  skip: (e?: MouseEvent) => void;
  /** 完成。 */
  finish: (e?: MouseEvent) => void;
}
