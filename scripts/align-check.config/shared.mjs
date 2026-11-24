/**
 * 所有组件通用的「Angular 事件映射」忽略项（上游 onXxx -> Angular (xxx) 输出）。
 * 拆分自 scripts/align-check.mjs，各组件配置用 ...ANGULAR_EVENT_IGNORES 引用。
 */
export const ANGULAR_EVENT_IGNORES = {
  onBlur: 'Angular 用 (blur) 输出',
  onChange: 'Angular 用 (change) 输出，参数是 { value, event }',
  onFocus: 'Angular 用 (focus) 输出',
  onKeydown: 'Angular 用 (keydown) 输出',
  onKeyup: 'Angular 用 (keyup) 输出',
  onKeypress: '已由 (keydown)/(keyup) 覆盖',
  onEnter: 'Angular 用 (enter) 输出',
  onClick: 'Angular 用 (click) 输出',
};
