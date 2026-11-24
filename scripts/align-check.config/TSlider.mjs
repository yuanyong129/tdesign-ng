import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'slider',
    upstreamInterface: 'TdSliderProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // label 已实现（string | boolean），只是不支持 TNode 渲染函数。
      'inputNumberProps': '滑块两侧的数字输入框在后续版本实现',
      'tooltipProps': '滑块提示用内置 t-tooltip，未透传 TooltipProps',
      'onChange': 'Angular 用 (change) 输出',
      'onChangeEnd': 'Angular 用 (changeEnd) 输出',
      'modelValue': 'Angular 用 value 双向绑定',
    },
  };
