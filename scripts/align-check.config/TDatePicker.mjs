import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'date-picker',
    upstreamInterface: 'TdDatePickerProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // 已实现：第一/二层 + 第三层的 enableTimePicker / defaultTime / needConfirm + mode（date/month/year）
      'disableTime': '时间选择的禁用候选在后续版本实现',
      'timePickerProps': '时间面板透传在后续版本实现',
            'prefixIcon': 'Angular 用 <t-icon tDatePickerPrefixIcon> 投影',
      'suffixIcon': '默认日历图标，未支持替换',
      'borderless': '无边框模式在后续版本实现',
      'readonly': '只读模式在后续版本实现',
      'status': '校验状态在后续版本实现',
      'tips': '提示文案在后续版本实现',
      'label': '标签文案在后续版本实现',
      'inputProps': '透传 InputProps 在后续版本实现',
      'selectInputProps': '透传 SelectInputProps 在后续版本实现',
      'popupProps': '透传 PopupProps 在后续版本实现',
      'onChange': 'Angular 用 (change) 输出',
      'onClear': '清空已包含在 (change) 的 trigger="clear" 里',
      'onConfirm': '确认已包含在 (change) 的 trigger="confirm" 里',
      'onPick': '选中已包含在 (change) 的 trigger="pick" 里',
      'onPresetClick': '预设日期已包含在 (change) 的 trigger="preset" 里',
      'onMonthChange': '月份变化事件暂未暴露',
      'onYearChange': '年份变化事件暂未暴露',
      'onBlur': '失焦事件在后续版本实现',
      'onFocus': '聚焦事件在后续版本实现',
      'modelValue': 'Angular 用 value 双向绑定',
    },
  };
