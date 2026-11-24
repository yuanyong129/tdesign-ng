

export default {
    upstream: 'transfer',
    upstreamInterface: 'TdTransferProps',
    // 我们用 targetValue/defaultTargetValue 表达上游的 value/defaultValue/modelValue（Angular 侧避免与 t-transfer 的 value 语义混淆）
    renames: { value: 'targetValue', defaultValue: 'defaultTargetValue', modelValue: 'targetValue' },
    // sourceChecked/targetChecked/filter/searchPlaceholder/height/oneWay 是 Angular 侧增量能力
    angularOnly: ['sourceChecked', 'targetChecked', 'filter', 'searchPlaceholder', 'height', 'oneWay'],
    ignoreUpstream: {
      checkboxProps: '[D2] 逐项 Checkbox 属性透传需中间层，第一层固定默认（checked/indeterminate/disabled 已覆盖主要语义）',
      keys: '[D2] 字段名固定为 label/value/disabled，自定义 key 映射后置',
      pagination: '[D1] 列表内分页需接 t-pagination 与页码状态，属第二层',
      targetDraggable: '[D2] 拖拽排序依赖拖拽基础设施，后置',
      tree: '[D2] 树形穿梭依赖 tree 与展开计数，后置',
      onChange: '[D1] Angular 用 (change) 输出，参数 { value, movedKeys, source, target, data }',
      onCheckedChange: '[D1] Angular 用 (checkedChange) 输出，参数 { checked, sourceChecked, targetChecked, type }',
      onPageChange: '[D1] 依赖 pagination，随分页一起后置',
      onScroll: '[D3] Angular 用 (scroll) 输出，参数 { e, bottomDistance, type }',
      onSearch: '[D3] Angular 用 (search) 输出，参数 { query, type, trigger, e }',
    },
  };
