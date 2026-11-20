/**
 * 空状态类型。
 */
export const EMPTY_TYPES = ['empty', 'success', 'fail', 'network-error', 'maintenance'] as const;

export type EmptyType = (typeof EMPTY_TYPES)[number];

/**
 * 空状态尺寸。
 */
export const EMPTY_SIZES = ['small', 'medium', 'large'] as const;

export type EmptySize = (typeof EMPTY_SIZES)[number];

/**
 * 各内置类型在没有传 title 时使用的默认标题。
 */
export const EMPTY_DEFAULT_TITLES: Record<EmptyType, string> = {
  empty: '暂无数据',
  success: '成功',
  fail: '失败',
  'network-error': '网络异常',
  maintenance: '维护中',
};
