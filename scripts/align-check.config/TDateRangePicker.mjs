import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'date-picker',
    upstreamInterface: 'TdDateRangePickerProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // 第三层：range / label / tips / status / borderless / readonly 已实现；
      // 第四层：enableTimePicker / defaultTime / needConfirm 已实现
      'cancelRangeSelectLimit': '范围选择上限在后续版本实现',
      'panelPreselection': '面板预选在后续版本实现',
      'cell': '自定义单元格在后续版本实现',
      'disableTime': '时间选择在后续版本实现',
      'timePickerProps': '时间面板透传在后续版本实现',
      'mode': '年份/月份模式在后续版本实现',
      'multiple': '多选日期在后续版本实现',
      'panelActiveDate': '面板初始年月在后续版本实现',
      'prefixIcon': 'Angular 用 <t-icon tDateRangePickerPrefixIcon> 投影',
      'suffixIcon': '默认日历图标，未支持替换',
      'valueDisplay': '自定义回显在后续版本实现',
      'inputProps': '透传 InputProps 在后续版本实现',
      'rangeInputProps': '透传 RangeInputProps 在后续版本实现',
      'selectInputProps': '透传 SelectInputProps 在后续版本实现',
      'popupProps': '透传 PopupProps 在后续版本实现',
      'onChange': 'Angular 用 (change) 输出',
      'onPick': '选中已包含在 (change) 的 trigger="pick" 里',
      'onPresetClick': '预设已包含在 (change) 的 trigger="preset" 里',
      'onConfirm': '需确认在后续版本实现',
      'onInput': '手输已包含在 (change) 的 trigger="enter" 里',
      'onMonthChange': '年月变化事件暂未暴露',
      'onYearChange': '年月变化事件暂未暴露',
      'onBlur': '失焦事件在后续版本实现',
      'onFocus': '聚焦事件在后续版本实现',
      'modelValue': 'Angular 用 value 双向绑定',
    },
  };
