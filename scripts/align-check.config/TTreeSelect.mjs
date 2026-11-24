import { ANGULAR_EVENT_IGNORES } from './shared.mjs';


export default {
    upstream: 'tree-select',
    upstreamInterface: 'TdTreeSelectProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // 第二层已补齐：multiple / max / minCollapsedNum / treeProps（checkStrictly /
      // valueMode / expandAll）/ filterable / filter / inputValue / defaultInputValue
      'collapsedItems': '多选用内置 +N 折叠，未提供自定义折叠内容模板',
      'tagProps': '标签固定 maxWidth=300，未透传其他 TagProps',
      'panelTopContent': 'Angular 用 <ng-template tTreeSelectPanelTop> 投影',
      'panelBottomContent': 'Angular 用 <ng-template tTreeSelectPanelBottom> 投影',
      'valueDisplay': '自定义回显在后续版本实现',
      'inputProps': '透传 InputProps 在后续版本实现',
      'selectInputProps': '透传 SelectInputProps 在后续版本实现',
      'popupProps': '透传 PopupProps 在后续版本实现',
      'popupVisible': '受控弹层显隐在后续版本实现',
      'prefixIcon': 'Angular 用 <t-icon tTreeSelectPrefixIcon> 投影',
      'suffix': '后缀内容在后续版本实现',
      'suffixIcon': '后缀图标在后续版本实现',
      'autoWidth': '自动宽度在后续版本实现',
      'borderless': '无边框模式在后续版本实现',
      'readonly': '只读模式在后续版本实现',
      'onChange': 'Angular 用 (change) 输出',
      'onClear': '清空已包含在 (change) 的 trigger="clear" 里',
      'onRemove': '多选删除已包含在 (change) 的 trigger="uncheck" 里',
      'onInputChange': 'Angular 用 (search) 输出',
      'onPopupVisibleChange': 'Angular 用 (visibleChange) 输出',
      'onBlur': '失焦事件在后续版本实现',
      'onFocus': '聚焦事件在后续版本实现',
      'onSearch': 'Angular 用 (search) 输出',
      'modelValue': 'Angular 用 value 双向绑定',
    },
  };
