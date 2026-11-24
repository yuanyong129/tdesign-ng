

export default {
    upstream: 'tree',
    upstreamInterface: 'TdTreeProps',
    renames: {},
    // loading：整树加载态（上游只有节点的 load 回调，没有整树 loading）；size：只保留属性位，vendor tree less 无 t-size-* 规则
    angularOnly: ['loading', 'size'],
    ignoreUpstream: {
      allowDrop: '[D1] 拖拽落点校验需要 --tip-top/--tip-bottom/--tip-highlight 状态机，广度期不做',
      draggable: '[D1] 拖拽排序整体后置（落点计算 + 拖动视觉）',
      onDragStart: '[D1] 依赖 draggable，随拖拽一起后置',
      onDragEnd: '[D1] 依赖 draggable，随拖拽一起后置',
      onDragOver: '[D1] 依赖 draggable，随拖拽一起后置',
      onDragLeave: '[D1] 依赖 draggable，随拖拽一起后置',
      onDrop: '[D1] 依赖 draggable，随拖拽一起后置',
      filter: '[D1] 过滤命中态需要 __item--matched / --locked 类，属交互增强',
      allowFoldNodeOnFilter: '[D1] 依赖 filter 一并后置',
      scroll: '[D1] 虚拟滚动（大数据量）后置，height/maxHeight 已支持普通滚动',
      operations: '[D3] 节点操作区属于模板扩展，广度期只做 label/icon/empty 三个模板指令',
      checkAllAffectedBy: "[D2] 固定 'all' 语义（与 vendor/上游默认一致），onlyEnabled 变体深度期补",
      checkProps: '[D2] 复选框用原生 input.t-checkbox__former 手写，暂不透传 CheckboxProps',
      modelValue: '[D2] 由 Angular 侧 value + [(value)] 双向绑定承担',
      onActive: '[D2] Angular 用 (active) 输出，参数 { value, node, e, trigger }',
      onChange: '[D2] Angular 用 (change) 输出，参数 { value, node, e, trigger }',
      onClick: '[D2] Angular 用 (click) 输出，参数 { node, e }',
      onExpand: '[D2] Angular 用 (expand) 输出，参数 { value, node, e, trigger }',
      onLoad: '[D2] 名字被 load 回调输入占用，遵循 cascader 先例不提供 load 输出',
      onScroll: '[D2] Angular 用 (scroll) 输出，参数 { e }',
    },
  };
