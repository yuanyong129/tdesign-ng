#!/usr/bin/env node
/**
 * 把本仓库组件的 API 与 tdesign-vue-next 的 props 定义做机器比对。
 *
 * 目的：P1 逐个重写组件时，靠人眼比文档一定会漏属性。这个脚本产出两个清单——
 *   missing：上游有、我们没有（要做的工作）
 *   extra  ：我们有、上游没有（多半是 Arco 遗留，要删）
 *
 * 数据来源是 tdesign-vue-next 发布包里的 `es/<component>/type.d.ts`，
 * 这是它的公开类型契约（比读源码 props.ts 更稳，不受内部实现影响）。
 *
 * 用法：
 *   node scripts/align-check.mjs              # 打印报告
 *   node scripts/align-check.mjs --strict     # 有任何 missing 就退出码 1（CI 用）
 *   node scripts/align-check.mjs --component TButton
 *   node scripts/align-check.mjs --json       # 输出结构化报告（供 depth-report 消费）
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const API_FILE = path.join(ROOT, 'packages/docs/src/app/api/api.generated.json');
const CACHE_DIR = path.join(ROOT, '.local-cache/upstream');

/** 锁定的上游版本。升级时刻意为之，不跟随 latest，避免报告噪音。 */
const UPSTREAM_VERSION = '1.20.11';
const UPSTREAM_BASE = `https://unpkg.com/tdesign-vue-next@${UPSTREAM_VERSION}/es`;

/**
 * Angular 侧用 `(blur)` `(change)` 之类的输出代替 Vue 的 `onXxx` 回调，
 * 这类差异对所有组件都一样，集中说明一次。
 */
const ANGULAR_EVENT_IGNORES = {
  onBlur: 'Angular 用 (blur) 输出',
  onChange: 'Angular 用 (change) 输出，参数是 { value, event }',
  onFocus: 'Angular 用 (focus) 输出',
  onKeydown: 'Angular 用 (keydown) 输出',
  onKeyup: 'Angular 用 (keyup) 输出',
  onKeypress: '已由 (keydown)/(keyup) 覆盖',
  onEnter: 'Angular 用 (enter) 输出',
  onClick: 'Angular 用 (click) 输出',
};

/**
 * 每个组件的对齐配置。
 * - upstream：上游组件目录名；为 null 表示 TDesign 没有对应组件（Arco 独有，P1 会删除）
 * - renames：上游属性名 -> 我们的输入属性名（语义等价但命名不同）
 * - angularOnly：我们有意多出来的输入属性（Angular 平台特性），不计入 extra
 * - ignoreUpstream：上游属性里我们决定不支持的部分（需写明理由）
 */
const CONFIG = {
  TButton: {
    upstream: 'button',
    // 上游的 type 是原生 button 的 submit/reset/button，我们的 type 语义一致；
    // TDesign 的主题与形态分别是 theme / variant，P1 已按上游拆分。
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载插槽内容，不是输入属性',
      default: '同 content，Vue 的默认插槽',
      icon: 'Angular 用 <t-icon tButtonIcon> 投影，不是输入属性',
      suffix: 'Angular 用 <span tButtonSuffix> 投影，不是输入属性',
      onClick: 'Angular 直接监听原生 click（会冒泡到宿主），不再额外提供输出，避免一次点击触发两次',
      'loadingProps': 'Angular 侧用 [loading] 搭配 t-loading 指令实现，P1 定',
    },
  },
  TButtonGroup: { upstream: null, reason: 'TDesign 没有 button-group 组件，用 space + variant 组合替代' },
  TDivider: {
    upstream: 'divider',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载分割线文字',
      default: '同 content，Vue 的默认插槽',
    },
  },
  TLink: {
    upstream: 'link',
    renames: {},
    // 上游用 prefixIcon / suffixIcon 插槽判断是否渲染图标占位，
    // Angular 侧投影内容无法在模板里判断空，改用显式布尔开关。
    angularOnly: ['hasPrefixIcon', 'hasSuffixIcon'],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载链接文字',
      default: '同 content，Vue 的默认插槽',
      prefixIcon: 'Angular 用 <t-icon tLinkPrefixIcon> 投影，配合 [hasPrefixIcon] 留出间距',
      suffixIcon: 'Angular 用 <t-icon tLinkSuffixIcon> 投影，配合 [hasSuffixIcon] 留出间距',
      onClick: 'Angular 直接监听原生 click（会冒泡到宿主），不再额外提供输出，避免一次点击触发两次',
    },
  },
  TSpace: { upstream: 'space', renames: {}, angularOnly: [], ignoreUpstream: {} },
  TSwitch: {
    upstream: 'switch',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 初始值 + ControlValueAccessor',
    },
  },
  TRadio: {
    upstream: 'radio',
    upstreamInterface: 'TdRadioProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(checked)] 双向绑定 + ControlValueAccessor',
      'defaultChecked': 'Angular 用 [checked] 作为受控初始值',
      'default': '内容通过 ng-content 投影，无需 default 插槽属性',
    },
  },
  TRadioGroup: {
    upstream: 'radio',
    upstreamInterface: 'TdRadioGroupProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 作为受控初始值',
    },
  },
  TCheckbox: {
    upstream: 'checkbox',
    upstreamInterface: 'TdCheckboxProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(checked)] 双向绑定 + ControlValueAccessor',
      'defaultChecked': 'Angular 用 [checked] 作为受控初始值',
      'default': '内容通过 ng-content 投影，无需 default 插槽属性',
      'lazyLoad': 'Angular 组件按需渲染，没有延迟加载的等价概念',
    },
  },
  TCheckboxGroup: {
    upstream: 'checkbox',
    upstreamInterface: 'TdCheckboxGroupProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 作为受控初始值',
      'lazyLoad': 'Angular 组件按需渲染，没有延迟加载的等价概念',
    },
  },
  TCollapse: {
    upstream: 'collapse',
    upstreamInterface: 'TdCollapseProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 value（受控）/ defaultValue',
    },
  },
  TEmpty: {
    upstream: 'empty',
    upstreamInterface: 'TdEmptyProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // title / description / image / imageStyle 已实现，只是类型收窄为字符串（不支持 TNode / ImageProps）。
      'action': 'Angular 用 <t-button tEmptyAction> 投影操作区，不是 TNode 属性',
    },
  },
  TProgress: {
    upstream: 'progress',
    upstreamInterface: 'TdProgressProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // label 已实现（string | boolean），只是不支持 TNode 渲染函数。
    },
  },
  TList: {
    upstream: 'list',
    upstreamInterface: 'TdListProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'scroll': '列表虚拟滚动在后续版本实现，当前用 height + 原生滚动；滚动位置用 (scrollChange) 读取',
      'onLoadMore': 'Angular 用 (loadMore) 输出',
      'onScroll': 'Angular 用 (scrollChange) 输出，参数是 { originalEvent, scrollTop, scrollBottom }',
    },
  },
  TSlider: {
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
  },
  TRate: {
    upstream: 'rate',
    upstreamInterface: 'TdRateProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // color / texts / size 已实现（数组与字符串），icon 未实现。
      'icon': '自定义评分图标在后续版本实现，当前固定使用内置星形',
      'onChange': 'Angular 用 (change) 输出',
      'modelValue': 'Angular 用 value 双向绑定',
    },
  },
  TInput: {
    upstream: 'input',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'prefixIcon': 'Angular 用 <t-icon tInputPrefixIcon> 投影，不是输入属性',
      'suffixIcon': '同 prefixIcon，用 <t-icon tInputSuffixIcon> 投影',
      'suffix': 'Angular 用 <ng-content select="[tInputSuffix]"> 承载任意后置内容',
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 初始值 + ControlValueAccessor',
      'onClear': 'Angular 用 (clear) 输出',
      'onCompositionstart': '组合输入事件暂未单独暴露，可用 (keydown)/(change) 覆盖',
      'onCompositionend': '同上',
      'onMouseenter': 'Angular 可直接在原生的宿主元素上监听',
      'onMouseleave': '同上',
      'onPaste': '暂未单独暴露，需要时可监听原生 paste 事件',
      'onValidate': '数值越界校验由 t-form 承担，P2 表单落地后再补',
      'onWheel': '暂未暴露，需要时可监听原生 wheel 事件',
      'inputClass': 'Angular 用 [class] 直接传，或在外层包一个元素',
      'autoWidth': '暂未实现，用 style 指定宽度即可',
      'separate': 'input-group 的属性，P2 做 t-input-group 时处理',
    },
  },
  TCascader: {
    upstream: 'cascader',
    upstreamInterface: 'TdCascaderProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      // 第二层已补齐：multiple / checkStrictly / valueMode / max / filterable / filter /
      // reserveKeyword / lazy / load / loading / loadingText
      'checkProps': '多选复选框配置属于透传，Angular 侧不暴露',
      'valueType': 'valueType 在后续版本实现',
      'minCollapsedNum': '多选折叠在后续版本实现',
      'collapsedItems': '多选折叠在后续版本实现',
      'panelTopContent': 'Angular 用 <ng-template tCascaderPanelTop> 投影',
      'panelBottomContent': 'Angular 用 <ng-template tCascaderPanelBottom> 投影',
      'valueDisplay': 'Angular 用 <ng-template tCascaderValueDisplay> 投影',
      'columnHeader': '自定义列头在后续版本实现',
      'columnFooter': '自定义列尾在后续版本实现',
      'option': '自定义选项渲染在后续版本实现',
      'selectInputProps': '透传 SelectInputProps 在后续版本实现',
      'tagInputProps': '多选标签配置在后续版本实现',
      'tagProps': '多选标签配置在后续版本实现',
      'inputProps': '透传 InputProps 在后续版本实现',
      'popupProps': '透传 PopupProps 在后续版本实现',
      'popupVisible': '受控弹层显隐在后续版本实现',
      'trigger': '只支持 click 触发',
      'prefixIcon': '前缀图标在后续版本实现',
      'suffix': '后缀内容在后续版本实现',
      'suffixIcon': '后缀图标在后续版本实现',
      'label': '标签文案在后续版本实现',
      'tips': '提示文案在后续版本实现',
      'status': '校验状态在后续版本实现',
      'borderless': '无边框模式在后续版本实现',
      'autofocus': '自动聚焦在后续版本实现',
      'readonly': '只读模式在后续版本实现',
      'onChange': 'Angular 用 (change) 输出',
      'onRemove': '多选删除在后续版本实现',
      'onBlur': '失焦事件在后续版本实现',
      'onFocus': '聚焦事件在后续版本实现',
      'onPopupVisibleChange': 'Angular 用 (visibleChange) 输出',
      'modelValue': 'Angular 用 value 双向绑定',
    },
  },
  TDatePicker: {
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
  },
  TDateRangePicker: {
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
  },
  TTimePicker: {
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
  },
  TTreeSelect: {
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
  },
  TTextarea: {
    upstream: 'textarea',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 初始值 + ControlValueAccessor',
      'onValidate': '数值越界校验由 t-form 承担，P2 表单落地后再补',
    },
  },
  TSelect: {
    upstream: 'select',
    upstreamInterface: 'TdSelectProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 作为受控初始值',
      'prefixIcon': 'Angular 用 <t-icon tSelectPrefixIcon> 投影，不是输入属性',
      'suffixIcon': '同 prefixIcon，用 <t-icon tSelectSuffixIcon> 投影',
      'suffix': 'Angular 用 <ng-content select="[tSelectSuffix]"> 承载任意后置内容',
      'popupVisible': '尚未实现受控展开，先用 (popupVisibleChange) 观察状态',
      'valueDisplay': '自定义回显内容尚未实现，先由选项 label 决定',
      'valueType': '值类型恒为 SelectValue，不需要额外的类型声明',
      'keys': '选项字段名固定为 label/value/disabled，不做字段映射',
      'filter': '过滤先用内置的 label 子串匹配，暂不支持自定义过滤函数',
      'reserveKeyword': '关闭面板即清空搜索词，暂不保留',
      'collapsedItems': '多选标签折叠尚未实现',
      'minCollapsedNum': '同 collapsedItems，折叠功能未实现',
      'inputProps': '内部输入框的透传属性尚未开放',
      'selectInputProps': '同 inputProps，暂未开放',
      'tagInputProps': '标签输入相关属性暂未开放',
      'tagProps': '标签透传属性暂未开放',
      'popupProps': '面板透传属性暂未开放',
      'panelTopContent': '面板顶部自定义内容尚未实现',
      'panelBottomContent': '面板底部自定义内容尚未实现',
      'scroll': '虚拟滚动尚未实现，选项不多时直接渲染',
      'autoWidth': '宽度默认撑满父容器，需要时用 style 指定',
      'inputValue': '受控搜索词尚未开放，搜索词由组件内部维护',
      'defaultInputValue': '受控搜索词尚未开放，搜索词由组件内部维护',
      'defaultPopupVisible': '尚未实现受控展开，先用 (popupVisibleChange) 观察状态',
      'onClear': 'Angular 用 (clear) 输出',
      'onCreate': 'Angular 用 (create) 输出',
      'onRemove': 'Angular 用 (remove) 输出',
      'onSearch': 'Angular 用 (search) 输出',
      'onPopupVisibleChange': 'Angular 用 (popupVisibleChange) 输出',
      'onInputChange': '搜索词变化统一走 (search)，不再单独暴露输入事件',
    },
  },
  TScrollbar: { upstream: null, reason: 'TDesign 没有 scrollbar 组件，属于 Arco 独有能力，P1 移除' },
  TThumb: { upstream: null, reason: '内部实现组件，不对外' },
  TForm: {
    upstream: 'form',
    upstreamInterface: 'TdFormProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'data': 'Angular 用 ngModel/FormGroup 承载表单数据，不需要 data 输入',
      'id': '宿主元素的 id 交给使用方设置，框架不覆盖',
      'readonly': '只读由各控件自身的 readonly 控制，表单级只提供 disabled',
      'onReset': 'Angular 用 (reset) 输出',
      'onSubmit': 'Angular 用 (submit) 输出',
      'onValidate': 'Angular 用 (validate) 输出',
    },
  },
  TFormItem: {
    upstream: 'form',
    upstreamInterface: 'TdFormItemProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {},
  },
  TTag: {
    upstream: 'tag',
    upstreamInterface: 'TdTagProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'default': '内容通过 ng-content 与 content 输入提供',
      'icon': 'Angular 用 <t-icon tTagIcon> 投影，不是输入属性',
      'onClick': 'Angular 直接监听原生 click（会冒泡到宿主），不再额外提供输出',
      'onClose': 'Angular 用 (close) 输出',
    },
  },
  TBadge: {
    upstream: 'badge',
    upstreamInterface: 'TdBadgeProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'default': '内容通过 ng-content 与 content 输入提供',
    },
  },
  TTabs: {
    upstream: 'tabs',
    upstreamInterface: 'TdTabsProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'action': '自定义操作区未实现',
      'list': '数据驱动面板未实现，用 t-tab-panel 投影',
      'modelValue': 'Angular 用 value（受控）/ defaultValue',
      'onAdd': 'Angular 用 (add) 输出，payload { e }',
      'onChange': 'Angular 用 (change) 输出',
      'onDragSort': 'Angular 用 (dragSortChange) 输出',
      'onRemove': 'Angular 用 (remove) 输出，payload { value, index, e }',
    },
  },
  TAvatar: {
    upstream: 'avatar',
    upstreamInterface: 'TdAvatarProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'default': '内容通过 ng-content 与 content 输入提供',
      'icon': 'Angular 用 <t-icon tAvatarIcon> 投影，不是输入属性',
      'imageProps': '内部用原生 img，暂不透传 Image 组件属性',
      'onError': 'Angular 用 (error) 输出',
    },
  },
  TAvatarGroup: {
    upstream: 'avatar',
    upstreamInterface: 'TdAvatarGroupProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'popupProps': '折叠头像的弹层列表尚未实现，只显示 +N',
    },
  },
  TTable: {
    upstream: 'table',
    upstreamInterface: 'TdBaseTableProps',
    renames: {},
    // loadingText 是 Angular 侧的独立文字属性，上游是 loading 的 TNode；
    // sort / defaultSort / filterValue / defaultFilterValue 来自上游 TdPrimaryTableProps（本处对比的是 TdBaseTableProps）；
    // 行选择与展开行的输入同样来自 TdPrimaryTableProps，事件用 (selectChange) / (expandChange) 输出；
    // pagination / disableDataPage 是 TdBaseTableProps 上的属性，已实现，不再列入忽略。
    angularOnly: [
      'loadingText',
      'sort',
      'defaultSort',
      'multipleSort',
      'filterValue',
      'defaultFilterValue',
      'selectedRowKeys',
      'defaultSelectedRowKeys',
      'indeterminateSelectedRowKeys',
      'rowSelectionAllowUncheck',
      'selectOnRowClick',
      'expandedRowKeys',
      'defaultExpandedRowKeys',
      'expandOnRowClick',
      'expandIcon',
    ],
    ignoreUpstream: {
      'activeRowKeys': '点击激活行未实现，行选择用 selectedRowKeys + 选择列',
      'defaultActiveRowKeys': '点击激活行未实现，行选择用 selectedRowKeys + 选择列',
      'activeRowType': '点击激活行未实现，行选择用选择列 type',
      'allowResizeColumnWidth': '列宽拖拽在后续版本实现',
      'attach': '表格固定在当前 DOM，暂不支持自定义挂载点',
      'bottomContent': '底部内容暂未实现',
      'cellEmptyContent': '单元格空值占位暂未实现',
      'disableSpaceInactiveRow': '键盘空格取消选中未实现',
      'firstFullRow': '整行内容在后续版本实现',
      'fixedRows': '固定行在后续版本实现',
      'footData': '表尾数据在后续版本实现',
      'footerAffixProps': '表尾吸底在后续版本实现',
      'footerAffixedBottom': '表尾吸底在后续版本实现',
      'footerSummary': '表尾汇总在后续版本实现',
      'headerAffixProps': '表头吸顶在后续版本实现',
      'headerAffixedTop': '表头吸顶在后续版本实现',
      'horizontalScrollAffixedBottom': '横向滚动条吸底在后续版本实现',
      'keyboardRowHover': '键盘行高亮在后续版本实现',
      'lastFullRow': '整行内容在后续版本实现',
      'lazyLoad': '懒加载在后续版本实现',
      'loadingProps': '加载配置暂不透传',
      'locale': '文案目前用输入属性控制，暂不接入 locale',
      'paginationAffixedBottom': '分页吸底在后续版本实现',
      'rowAttributes': '行属性在后续版本实现',
      'rowClassName': '行类名在后续版本实现',
      'rowspanAndColspanInFooter': '表尾合并单元格在后续版本实现',
      'tableContentWidth': '表格内容宽度在后续版本实现',
      'topContent': '顶部内容暂未实现',
      'onActiveChange': '点击激活行未实现',
      'onActiveRowAction': '点击激活行未实现',
      'onCellClick': '单元格点击在后续版本实现',
      'onColumnResizeChange': 'Angular 用 (columnResizeChange) 输出',
      'onPageChange': 'Angular 用 (pageChange) 输出',
      'onRowClick': '行事件在后续版本实现',
      'onRowDblclick': '行事件在后续版本实现',
      'onRowMousedown': '行事件在后续版本实现',
      'onRowMouseenter': '行事件在后续版本实现',
      'onRowMouseleave': '行事件在后续版本实现',
      'onRowMouseover': '行事件在后续版本实现',
      'onRowMouseup': '行事件在后续版本实现',
      'onSortChange': 'Angular 用 (sortChange) 输出',
      'onFilterChange': 'Angular 用 (filterChange) 输出',
      'onScroll': '滚动事件暂未暴露',
      'onScrollX': '横向滚动事件暂未暴露',
      'onScrollY': '纵向滚动事件暂未暴露',
    },
  },
  TPagination: {
    upstream: 'pagination',
    upstreamInterface: 'TdPaginationProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'modelValue': 'Angular 用 [(current)] 双向绑定',
      'defaultCurrent': 'Angular 用 [current] 作为受控初始值',
      'defaultPageSize': 'Angular 用 [pageSize] 作为受控初始值',
      'selectProps': '每页条数选择器用内置 t-select，暂不透传属性',
      'onChange': 'Angular 用 (change) 输出，携带 PageInfo',
      'onCurrentChange': 'Angular 用 (currentChange) 输出',
      'onPageSizeChange': 'Angular 用 (pageSizeChange) 输出',
    },
  },
  TPopup: {
    upstream: 'popup',
    upstreamInterface: 'TdPopupProps',
    renames: {},
    angularOnly: ['ignoreOutsideSelector'],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'default': '触发器与内容都通过 ng-content 投影，不需要 default 插槽属性',
      'triggerElement': '触发元素就是默认投影的内容',
      'defaultVisible': 'Angular 用 [visible] 作为受控初始值',
      'modelValue': 'Angular 用 [(visible)] 双向绑定',
      'attach': '弹层固定挂到 body（CDK overlay），暂不支持自定义挂载点',
      'overlayStyle': '样式通过 [overlayClassName] 或全局 CSS 控制',
      'overlayInnerStyle': '样式通过 [overlayInnerClassName] 或全局 CSS 控制',
      'popperOptions': '定位由 CDK Overlay 负责，不透传 popper 配置',
      'onScroll': '暂未暴露内容区滚动事件，可直接监听原生 scroll',
      'onScrollToBottom': '暂未暴露滚动到底事件，可直接监听原生 scroll',
      'onOverlayClick': 'Angular 用 (overlayClick) 输出',
      'onVisibleChange': 'Angular 用 (visibleChange) 输出',
    },
  },
  TTooltip: {
    upstream: 'tooltip',
    upstreamInterface: 'TdTooltipProps',
    renames: {},
    // Tooltip 复用了 Popup 的通用能力，这些属性在上游是通过 extends 得到的
    angularOnly: ['content', 'disabled', 'visible', 'zIndex'],
    ignoreUpstream: {},
  },
  TDialog: {
    upstream: 'dialog',
    upstreamInterface: 'TdDialogProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'default': '内容通过 ng-content 投影，不需要 default 插槽属性',
      'attach': '对话框固定挂到 body 层级的 fixed 容器，暂不支持自定义挂载点',
      'draggable': '拖拽尚未实现，需要时可在外层自行实现',
      'showInAttachedElement': '同 attach，暂不支持挂到指定元素内',
      'confirmOnEnter': '回车确认尚未实现',
      'onClose': 'Angular 用 (close) 输出，携带 trigger 与原始事件',
      'onConfirm': 'Angular 用 (confirm) 输出',
      'onCancel': 'Angular 用 (cancel) 输出',
      'onCloseBtnClick': '关闭按钮会触发 (close)，trigger 为 close-btn',
      'onOverlayClick': 'Angular 用 (overlayClick) 输出',
      'onEscKeydown': 'Esc 关闭会触发 (close)，trigger 为 esc',
      'onBeforeClose': '暂未暴露关闭前钩子',
      'onBeforeOpen': '暂未暴露打开前钩子',
      'onOpened': '暂未暴露打开后回调，可用 (visibleChange) 判断',
      'onClosed': '暂未暴露关闭后回调，可用 (visibleChange) 判断',
    },
  },
  TDrawer: {
    upstream: 'drawer',
    upstreamInterface: 'TdDrawerProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'default': '内容通过 ng-content 投影，不需要 default 插槽属性',
      'attach': '抽屉固定挂到 body 层级的 fixed 容器，暂不支持自定义挂载点',
      'showInAttachedElement': '同 attach，暂不支持挂到指定元素内',
      'sizeDraggable': '拖拽调整尺寸尚未实现',
      'onClose': 'Angular 用 (close) 输出，携带 trigger 与原始事件',
      'onConfirm': 'Angular 用 (confirm) 输出',
      'onCancel': 'Angular 用 (cancel) 输出',
      'onCloseBtnClick': '关闭按钮会触发 (close)，trigger 为 close-btn',
      'onOverlayClick': 'Angular 用 (overlayClick) 输出',
      'onEscKeydown': 'Esc 关闭会触发 (close)，trigger 为 esc',
      'onBeforeClose': '暂未暴露关闭前钩子',
      'onBeforeOpen': '暂未暴露打开前钩子',
      'onSizeDragEnd': '尺寸拖拽未实现，因此没有该事件',
    },
  },
  TMessage: {
    upstream: 'message',
    upstreamInterface: 'TdMessageProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'onClose': 'Angular 用 (close) 输出，携带 trigger 与原始事件',
      'onCloseBtnClick': 'Angular 用 (closeBtnClick) 输出',
      'onDurationEnd': '到时关闭会触发 (close)，trigger 为 duration-end',
    },
  },
  TNotification: {
    upstream: 'notification',
    upstreamInterface: 'TdNotificationProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'default': '内容通过 ng-content 与 content 输入提供',
      'onClose': 'Angular 用 (close) 输出，携带 trigger 与原始事件',
      'onCloseBtnClick': 'Angular 用 (closeBtnClick) 输出',
      'onDurationEnd': '到时关闭会触发 (close)，trigger 为 duration-end',
    },
  },
  TLoading: {
    upstream: 'loading',
    upstreamInterface: 'TdLoadingProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'attach': '暂不支持挂到指定元素，全屏模式固定挂到 body',
      'content': '需要把加载态包在内容外层时，用 flex/relative 容器自行组合',
      'default': '同 content，暂未提供包裹内容的插槽',
      'indicator': '自定义加载图标尚未实现，使用内置的渐变环',
    },
  },
  // ---- B1 布局与静态展示 ----
  TLayout: {
    upstream: 'layout',
    upstreamInterface: 'TdLayoutProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {},
  },
  THeader: {
    upstream: 'layout',
    upstreamInterface: 'TdHeaderProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {},
  },
  TAside: {
    upstream: 'layout',
    upstreamInterface: 'TdAsideProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {},
  },
  TContent: {
    upstream: 'layout',
    upstreamInterface: 'TdContentProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载内容',
      default: '同 content，Vue 的默认插槽',
    },
  },
  TFooter: {
    upstream: 'layout',
    upstreamInterface: 'TdFooterProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {},
  },
  TRow: {
    upstream: 'grid',
    upstreamInterface: 'TdRowProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      tag: '[D3] Angular 组件宿主标签固定为 <t-row>，自定义标签需要改用指令形态（<div tRow>）',
    },
  },
  TCol: {
    upstream: 'grid',
    upstreamInterface: 'TdColProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      tag: '[D3] Angular 组件宿主标签固定为 <t-col>，自定义标签需要改用指令形态（<div tCol>）',
    },
  },
  TCard: {
    upstream: 'card',
    upstreamInterface: 'TdCardProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载卡片主体内容',
      default: '同 content，Vue 的默认插槽',
      loadingProps: '[D2] 加载态目前是内置骨架，透传 t-loading 全部属性留到深度期',
    },
  },
  TAlert: {
    upstream: 'alert',
    upstreamInterface: 'TdAlertProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载消息主体',
      onClose: 'Angular 用 (close) 输出，参数为 { e }',
      onClosed: 'Angular 用 (closed) 输出，参数为 { e }',
    },
  },
  TSkeleton: {
    upstream: 'skeleton',
    upstreamInterface: 'TdSkeletonProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载被包裹的内容',
      default: '同 content，Vue 的默认插槽',
    },
  },
  TText: {
    upstream: 'typography',
    upstreamInterface: 'TdTextProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载文本内容',
      copyable: '[D3] 复制交互（图标 + copyable.text/suffix/tooltipProps/onCopy）未实现',
    },
  },
  TTitle: {
    upstream: 'typography',
    upstreamInterface: 'TdTitleProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载标题文本',
    },
  },
  TParagraph: {
    upstream: 'typography',
    upstreamInterface: 'TdParagraphProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载段落文本',
    },
  },
  TBreadcrumb: {
    upstream: 'breadcrumb',
    upstreamInterface: 'TdBreadcrumbProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ellipsis: '[D3] 折叠省略号需要 Popup/Tooltip 门户与溢出测量，本库暂无折叠容器',
      maxItems: '[D3] 与 ellipsis 配套的折叠阈值',
      itemsBeforeCollapse: '[D3] 折叠算法参数',
      itemsAfterCollapse: '[D3] 折叠算法参数',
    },
  },
  TBreadcrumbItem: {
    upstream: 'breadcrumb',
    upstreamInterface: 'TdBreadcrumbItemProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载面包屑文字',
      to: '[D3] Vue Router 的 Route 对象语义，Angular 用 href 或上层 routerLink',
      replace: '[D3] Vue Router 历史替换语义，Angular 用 routerLink 的 replaceUrl',
      router: '[D3] Vue Router 实例注入位，Angular 用 Router DI',
      onClick: 'Angular 用原生 (click)；options 数据驱动项暂不提供回调',
    },
  },
  TSteps: {
    upstream: 'steps',
    upstreamInterface: 'TdStepsProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      modelValue: 'Angular 用 [(current)] 双向绑定',
      onChange: 'Angular 用 (currentChange) 输出，参数为新的 current',
      sequence: '[D3] 依赖反转渲染顺序，投影内容无法重排且会错位连接线伪元素',
    },
  },
  TStepItem: {
    upstream: 'steps',
    upstreamInterface: 'TdStepItemProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载步骤描述',
    },
  },
  TDescriptions: {
    upstream: 'descriptions',
    upstreamInterface: 'TdDescriptionsProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 收集 <t-descriptions-item> 子项',
    },
  },
  TDescriptionItem: {
    upstream: 'descriptions',
    upstreamInterface: 'TdDescriptionsItemProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: '[D3] 子项默认插槽用 display:none + textContent 快照，仅支持纯文本，富内容用 [content]="tpl"',
    },
  },
  TComment: {
    upstream: 'comment',
    upstreamInterface: 'TdCommentProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载评论内容',
    },
  },
  TTimeline: {
    upstream: 'timeline',
    upstreamInterface: 'TdTimelineProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {},
  },
  TTimelineItem: {
    upstream: 'timeline',
    upstreamInterface: 'TdTimelineItemProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载节点内容（未传 content 时渲染投影）',
      onClick: 'Angular 用 (itemClick) 输出，避开与原生 click 重名',
    },
  },
  TStatistic: {
    upstream: 'statistic',
    upstreamInterface: 'TdStatisticProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      animation: '[D3] 数值滚动动画需要 rAF tween 基础设施',
      animationStart: '[D3] 同上，并依赖组件实例方法 start()',
    },
  },
  TAffix: {
    upstream: 'affix',
    upstreamInterface: 'TdAffixProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载被吸附的内容',
      onFixedChange:
        'Angular 用 (fixedChange) 输出 { affixed, top }，且只在吸附状态翻转时派发（避免滚动期间反复变更检测）',
    },
  },
  TBackTop: {
    upstream: 'back-top',
    upstreamInterface: 'TdBackTopProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载自定义按钮内容',
      onClick: 'Angular 用宿主原生 (click)，避免与内部按钮双触发',
    },
  },
  TStickyTool: {
    upstream: 'sticky-tool',
    upstreamInterface: 'TdStickyToolProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      onClick: 'Angular 用 (itemClick) 输出 { e, item }',
      onHover: 'Angular 用 (itemHover) 输出 { e, item }',
      popupProps: '[D3] 弹层属性深度透传未实现，当前固定 hideEmptyPopup + 自动 placement',
    },
  },
  TQRCode: {
    upstream: 'qrcode',
    upstreamInterface: 'TdQRCodeProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      onRefresh: 'Angular 用 (refresh) 输出，过期遮罩里的刷新按钮触发',
    },
  },
  TInputAdornment: {
    upstream: 'input-adornment',
    upstreamInterface: 'TdInputAdornmentProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {},
  },
  TConfigProvider: {
    upstream: 'config-provider',
    upstreamInterface: 'TdConfigProviderProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {},
  },
  TPopconfirm: {
    upstream: 'popconfirm',
    upstreamInterface: 'TdPopconfirmProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> / triggerElement 承载触发器',
      popupProps: '[D2] 未透传 popupProps，弹层可配置项由组件显式 input 暴露（placement / trigger / showArrow / destroyOnClose）',
      onCancel: 'Angular 用 (cancel) 输出，参数 { e }',
      onConfirm: 'Angular 用 (confirm) 输出，参数 { e }',
      onVisibleChange: 'Angular 用 (visibleChange) 输出，参数 { visible, trigger, e? }（对齐上游两段式参数）',
    },
  },
  TDropdown: {
    upstream: 'dropdown',
    upstreamInterface: 'TdDropdownProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      popupProps: '[D2] 未透传 popupProps，弹层可配置项由组件显式 input 暴露',
      onClick: 'Angular 用 (click) 输出，参数 { item, e }',
    },
  },
  TDropdownItem: {
    upstream: 'dropdown',
    upstreamInterface: 'TdDropdownItemProps',
    renames: {},
    angularOnly: ['maxColumnWidth', 'minColumnWidth', 'hasSubmenu'],
    ignoreUpstream: {
      onClick: 'Angular 用 (click) 输出，参数 { value, e }；数据里的 onClick 仍会被调用',
    },
  },
  TImage: {
    upstream: 'image',
    upstreamInterface: 'TdImageProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      onLoad: 'Angular 用 (load) 输出，参数 { e }',
      onError: 'Angular 用 (error) 输出，参数 { e }',
    },
  },
  TImageViewer: {
    upstream: 'image-viewer',
    upstreamInterface: 'TdImageViewerProps',
    renames: {},
    angularOnly: ['visibleChange'],
    ignoreUpstream: {
      attach: '[D2] Angular 不做 Teleport，预览层本身就是 position: fixed 全屏层',
      viewerScale: '[D3] 上游桌面端 image-viewer 未消费该属性，属旧版死配置',
      modelValue: 'Angular 用 [(visible)] 双向绑定 + (visibleChange) 表达同一语义',
      onClose: 'Angular 用 (close) 输出，参数 { trigger, e }',
      onDownload: 'Angular 用 (download) 输出，参数 string | File',
      onIndexChange: 'Angular 用 (indexChange) 输出，参数 { index, trigger }',
    },
  },
  TAnchor: {
    upstream: 'anchor',
    upstreamInterface: 'TdAnchorProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      onChange: 'Angular 用 (change) 输出，参数 { href, previousHref }',
      onClick: 'Angular 用 (click) 输出，参数 { href, e }',
    },
  },
  TAnchorItem: { upstream: 'anchor', upstreamInterface: 'TdAnchorItemProps', renames: {}, angularOnly: [], ignoreUpstream: {} },
  TWatermark: {
    upstream: 'watermark',
    upstreamInterface: 'TdWatermarkProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      default: 'Angular 用 <ng-content> 承载被水印覆盖的内容',
    },
  },
  TGuide: {
    upstream: 'guide',
    upstreamInterface: 'TdGuideProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      modelValue: '[D3] Angular 用 current 单项绑定 + (change)/(currentChange) 表达向导当前步，未提供双向绑定语法糖',
      onChange: 'Angular 用 (change) 输出，参数 GuideChangeContext',
      onFinish: 'Angular 用 (finish) 输出，参数 GuideFinishContext',
      onNextStepClick: 'Angular 用 (next) 输出',
      onPrevStepClick: 'Angular 用 (prev) 输出',
      onSkip: 'Angular 用 (skip) 输出',
    },
  },
};

const argv = process.argv.slice(2);
const STRICT = argv.includes('--strict');
const JSON_OUT = argv.includes('--json');
const ONLY = argv.includes('--component') ? argv[argv.indexOf('--component') + 1] : null;

/** 读取（并缓存）上游某个组件的 type.d.ts。 */
async function fetchUpstreamTypes(componentDir) {
  const cacheFile = path.join(CACHE_DIR, `${UPSTREAM_VERSION}-${componentDir}-type.d.ts`);
  try {
    return await fs.readFile(cacheFile, 'utf8');
  } catch {
    // 未缓存，走网络。
  }
  const url = `${UPSTREAM_BASE}/${componentDir}/type.d.ts`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`拉取失败 ${url}: HTTP ${res.status}`);
  const text = await res.text();
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cacheFile, text, 'utf8');
  return text;
}

/** 从 .d.ts 里解析出 props 接口的成员。 */
function parseProps(text, componentDir, interfaceName) {
  const source = ts.createSourceFile('type.d.ts', text, ts.ScriptTarget.Latest, true);
  const members = new Map();
  // 部分上游组件把单个与分组的 props 放在同一个 type.d.ts 里（如 checkbox、radio），
  // 这时必须按接口名精确取值，否则会把另一组件的属性算成 missing。
  const matches = (name) => (/^Td.*Props$/.test(name) ? !interfaceName || name === interfaceName : false);

  const collectFromTypeLiteral = (literal) => {
    for (const m of literal.members) {
      if (!ts.isPropertySignature(m) || !m.name) continue;
      const name = ts.isIdentifier(m.name) || ts.isStringLiteral(m.name) ? m.name.text : m.name.getText(source);
      members.set(name, {
        name,
        optional: !!m.questionToken,
        type: m.type?.getText(source) ?? 'any',
      });
    }
  };

  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      // 约定：props 接口名形如 TdXxxProps
      if (matches(node.name.text)) {
        for (const m of node.members) {
          if (!ts.isPropertySignature(m) || !m.name) continue;
          const name = ts.isIdentifier(m.name) || ts.isStringLiteral(m.name) ? m.name.text : m.name.getText(source);
          members.set(name, {
            name,
            optional: !!m.questionToken,
            type: m.type?.getText(source) ?? 'any',
          });
        }
      }
    }
    if (ts.isTypeAliasDeclaration(node) && matches(node.name.text) && ts.isTypeLiteralNode(node.type)) {
      collectFromTypeLiteral(node.type);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  if (!members.size) throw new Error(`${componentDir}/type.d.ts 里没找到 Td*Props 接口`);
  return members;
}

function formatList(names) {
  return names.length ? names.join(', ') : '—';
}

async function main() {
  const api = JSON.parse(await fs.readFile(API_FILE, 'utf8'));
  let totalMissing = 0;
  let totalExtra = 0;
  let totalUpstream = 0;
  let totalAligned = 0;
  const rows = [];
  const results = [];

  for (const [className, cfg] of Object.entries(CONFIG)) {
    if (ONLY && className !== ONLY) continue;
    const ours = api.components[className];
    if (!ours) {
      const note = 'API 数据里没有这个组件';
      rows.push({ className, status: 'skip', note });
      results.push({ className, status: 'skip', note });
      continue;
    }

    if (!cfg.upstream) {
      const note = cfg.reason ?? '上游没有对应组件';
      rows.push({ className, status: 'n/a', note });
      results.push({ className, status: 'n/a', note });
      continue;
    }

    let upstream;
    try {
      upstream = parseProps(await fetchUpstreamTypes(cfg.upstream), cfg.upstream, cfg.upstreamInterface);
    } catch (err) {
      rows.push({ className, status: 'error', note: err.message });
      results.push({ className, status: 'error', note: err.message });
      continue;
    }

    const ourNames = new Set(ours.inputs.map((i) => i.name));
    const renamedFrom = new Map(Object.entries(cfg.renames ?? {}));
    const angularOnly = new Set(cfg.angularOnly ?? []);
    const ignoreUpstream = cfg.ignoreUpstream ?? {};

    const missing = [];
    const present = [];
    for (const name of upstream.keys()) {
      if (name in ignoreUpstream) continue;
      const mapped = renamedFrom.get(name) ?? name;
      if (ourNames.has(mapped)) present.push(name);
      else missing.push(name);
    }

    const upstreamMapped = new Set(
      [...upstream.keys()].filter((n) => !(n in ignoreUpstream)).map((n) => renamedFrom.get(n) ?? n),
    );
    const extra = ours.inputs
      .map((i) => i.name)
      .filter((n) => !upstreamMapped.has(n) && !angularOnly.has(n));

    totalMissing += missing.length;
    totalExtra += extra.length;
    totalUpstream += upstream.size;
    totalAligned += present.length;

    results.push({
      className,
      upstream: cfg.upstream,
      status: missing.length || extra.length ? 'drift' : 'ok',
      upstreamTotal: upstream.size,
      aligned: present.length,
      missing,
      extra,
      // ignoreUpstream 是「已决策不实现」的清单，reason 里的 [D1]/[D2]/[D3] 前缀
      // 供 scripts/depth-report.mjs 做深度债分组。inUpstream 区分「真的是上游属性」
      // 与「插槽/事件名的映射说明」，只有前者算深度债。
      ignored: Object.entries(ignoreUpstream).map(([name, reason]) => ({
        name,
        reason,
        inUpstream: upstream.has(name),
      })),
    });

    if (JSON_OUT) continue;

    console.log(`\n${className}  (上游 ${cfg.upstream}@${UPSTREAM_VERSION})`);
    console.log(`  已对齐 ${present.length}/${upstream.size}`);
    console.log(`  missing (${missing.length}): ${formatList(missing)}`);
    console.log(`  extra   (${extra.length}): ${formatList(extra)}`);
    if (missing.length) {
      console.log('  missing 明细:');
      for (const name of missing) {
        const p = upstream.get(name);
        console.log(`    - ${name}${p.optional ? '?' : ''}: ${p.type.replace(/\s+/g, ' ').slice(0, 90)}`);
      }
    }
  }

  if (JSON_OUT) {
    console.log(
      JSON.stringify(
        {
          upstreamVersion: UPSTREAM_VERSION,
          generatedAt: new Date().toISOString(),
          totals: {
            components: results.filter((r) => r.status === 'ok' || r.status === 'drift').length,
            upstreamProps: totalUpstream,
            aligned: totalAligned,
            missing: totalMissing,
            extra: totalExtra,
          },
          components: results,
        },
        null,
        2,
      ),
    );
  } else {
    for (const row of rows) {
      console.log(`\n${row.className}: ${row.status} —— ${row.note}`);
    }

    console.log(`\n合计：missing ${totalMissing} 项，extra ${totalExtra} 项。`);
  }

  if (STRICT && totalMissing > 0) {
    console.error('\n--strict 失败：仍有未对齐的上游属性。');
    process.exit(1);
  }
}

await main();





