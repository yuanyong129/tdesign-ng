/** 骨架屏动画效果：渐变扫过、闪烁、无动画。 */
export const SKELETON_ANIMATIONS = ['gradient', 'flashed', 'none'] as const;

export type SkeletonAnimation = (typeof SKELETON_ANIMATIONS)[number];

/** 骨架屏主题，每个主题对应一套预设的行列结构。 */
export const SKELETON_THEMES = ['text', 'avatar', 'paragraph', 'avatar-text', 'tab', 'article'] as const;

export type SkeletonTheme = (typeof SKELETON_THEMES)[number];

/** 骨架屏的列类型，缺省为 text。 */
export const SKELETON_COL_TYPES = ['rect', 'circle', 'text'] as const;

export type SkeletonColType = (typeof SKELETON_COL_TYPES)[number];

/**
 * 单列配置。
 *
 * 尺寸、外边距均按 CSS 值书写，纯数字字符串也可直接使用（如 `'120px'`、`'50%'`）。
 */
export type SkeletonRowColObj = {
  width?: string;
  height?: string;
  size?: string;
  marginRight?: string;
  marginLeft?: string;
  margin?: string;
  content?: string;
  type?: SkeletonColType;
};

/**
 * 行列结构。
 *
 * - 数字：该行渲染为其数量的等宽文本列；
 * - 对象：该行只有一列；
 * - 数组：一行内的多列。
 */
export type SkeletonRowCol = Array<number | SkeletonRowColObj | Array<SkeletonRowColObj>>;

/** 各主题的预设行列结构，来源 tdesign-vue-next 的 ThemeMap。 */
export const SKELETON_THEME_ROW_COLS: Record<SkeletonTheme, SkeletonRowCol> = {
  text: [1],
  avatar: [{ type: 'circle', size: '56px' }],
  paragraph: [1, 1, { width: '70%' }],
  'avatar-text': [[{ type: 'circle' }, { type: 'text', height: '32px' }]],
  tab: [{ height: '30px' }, { height: '200px' }],
  article: [
    { type: 'rect', height: '30px', width: '100%' },
    { type: 'rect', height: '200px', width: '100%' },
    [
      { type: 'text', height: '30px' },
      { type: 'text', height: '30px' },
      { type: 'text', height: '30px' },
    ],
    [
      { type: 'text', height: '30px' },
      { type: 'text', height: '30px' },
    ],
    [
      { type: 'text', height: '30px' },
      { type: 'text', height: '30px' },
    ],
    [
      { type: 'text', height: '30px' },
      { type: 'text', height: '30px' },
    ],
  ],
};
