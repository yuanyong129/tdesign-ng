import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'time-picker',
    upstreamInterface: 'TdTimePickerProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // 第二层已补齐：presets / disableTime / hideDisabledTime / allowInput
      'borderless': '无边框模式在后续版本实现',
      'readonly': '只读模式在后续版本实现',
      'status': '校验状态在后续版本实现',
      'tips': '提示文案在后续版本实现',
      'label': '标签文案在后续版本实现',
      'prefixIcon': 'Angular 用 <t-icon tTimePickerPrefixIcon> 投影',
      'suffixIcon': '默认时钟图标，未支持替换',
      'valueDisplay': 'Angular 用 <ng-template tTimePickerValueDisplay> 投影',
      'inputProps': '透传 InputProps 在后续版本实现',
      'selectInputProps': '透传 SelectInputProps 在后续版本实现',
      'popupProps': '透传 PopupProps 在后续版本实现',
      'onChange': 'Angular 用 (change) 输出',
      'onClear': '清空已包含在 (change) 的 trigger="clear" 里',
      'onConfirm': '确认已包含在 (change) 的 trigger="confirm" 里',
      'onClose': '关闭事件暂未暴露',
      'onOpen': '打开事件暂未暴露',
      'onPick': '选中只更新面板草稿，确认后才派发 (change)',
      'onInput': '输入框编辑时间在后续版本实现',
      'onBlur': '失焦事件在后续版本实现',
      'onFocus': '聚焦事件在后续版本实现',
      'modelValue': 'Angular 用 value 双向绑定',
    },
  };
