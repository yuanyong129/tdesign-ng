# Tree 树 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/tree/`
- 文档页：`/tree`（`packages/docs/src/app/docs/tree/tree.component.ts`）
- 状态：🚧 有深度债 19 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 50 |
| 已对齐 | 30 |
| 覆盖率 | 60.0% |
| 深度债 | 19（D1 10 / D2 8 / D3 1） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TTree`（`<t-tree>`）

上游接口 `TdTreeProps`；上游属性 50、已对齐 30（60.0%）；深度债 19 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `activable` | boolean | false | 是否显示激活态 |
| `activeMultiple` | boolean | false | 是否允许多个节点同时处于激活态 |
| `actived` | TreeValue[] \| undefined | undefined | 激活的节点值，受控用法 |
| `defaultActived` | TreeValue[] | [] | 默认激活的节点值 |
| `checkable` | boolean | false | 是否显示复选框 |
| `checkStrictly` | boolean | false | 是否禁用复选框的父子联动，为 true 时各节点互不影响 |
| `data` | TreeOption[] | [] | 树形数据 |
| `disableCheck` | boolean \| ((node: TreeNodeModel) => boolean) | false | 是否禁用某个节点的复选框，可传布尔值或 `(node) => boolean` |
| `disabled` | boolean | false | 是否禁用整棵树 |
| `empty` | string | 暂无数据 | 空数据时的提示文案 |
| `expandAll` | boolean | false | 是否默认展开全部节点 |
| `expandLevel` | number | 0 | 默认展开的层级，节点 `level < expandLevel` 时展开 |
| `expandMutex` | boolean | false | 是否只允许同级的展开一个节点 |
| `expandOnClickNode` | boolean | false | 点击节点时是否展开 |
| `expandParent` | boolean | false | 展开节点时是否一并展开其祖先 |
| `expanded` | TreeValue[] \| undefined | undefined | 展开的节点值，受控用法 |
| `defaultExpanded` | TreeValue[] | [] | 默认展开的节点值 |
| `height` | string \| number \| undefined | undefined | 树的高度，超出后滚动 |
| `hover` | boolean | false | 节点悬停时是否高亮 |
| `icon` | boolean | true | 是否显示展开图标 |
| `keys` | TreeKeys | {} | 自定义字段名，默认 value / label / children / disabled |
| `label` | boolean | true | 是否显示节点文案 |
| `lazy` | boolean | true | 是否启用懒加载，`children: true` 的节点在展开时调用 `load` |
| `line` | boolean | false | 是否显示连接线 |
| `load` | ((node: TreeNodeModel) => TreeOption[] \| Promise<TreeOption[]>) \| undefined | undefined | 懒加载回调，返回子节点数组（可返回 Promise） |
| `loading` | boolean | false | 是否显示整棵树的加载态 |
| `maxHeight` | string \| number \| undefined | undefined | 树的最大高度，超出后滚动 |
| `size` | TreeSize | medium | 树尺寸；样式表里没有 tree 的尺寸规则，当前只保留接口 |
| `transition` | boolean | true | 是否开启展开收起的过渡动画 |
| `value` | TreeValue[] \| undefined | undefined | 勾选值，受控用法；配合 valueChange 支持 `[(value)]` |
| `defaultValue` | TreeValue[] | [] | 默认勾选值 |
| `valueMode` | TreeValueMode | onlyLeaf | 勾选值的回传模式：onlyLeaf 只回传叶子，parentFirst 父级全选时回传父级，all 父子都回传 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | TreeValue[] | 勾选值变化时触发 |
| `expandedChange` | TreeValue[] | 展开值变化时触发 |
| `activedChange` | TreeValue[] | 激活值变化时触发 |
| `expand` | TreeExpandEvent | 节点展开或收起时触发 |
| `change` | TreeChangeEvent | 节点勾选状态变化时触发 |
| `active` | TreeActiveEvent | 节点激活状态变化时触发 |
| `click` | TreeClickEvent | 节点被点击时触发 |
| `scroll` | TreeScrollEvent | 树滚动时触发 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `allowDrop` | D1 表格与选择线 | [D1] 拖拽落点校验需要 --tip-top/--tip-bottom/--tip-highlight 状态机，广度期不做 |
| `allowFoldNodeOnFilter` | D1 表格与选择线 | [D1] 依赖 filter 一并后置 |
| `checkAllAffectedBy` | D2 录入与反馈线 | [D2] 固定 'all' 语义（与 vendor/上游默认一致），onlyEnabled 变体深度期补 |
| `checkProps` | D2 录入与反馈线 | [D2] 复选框用原生 input.t-checkbox__former 手写，暂不透传 CheckboxProps |
| `draggable` | D1 表格与选择线 | [D1] 拖拽排序整体后置（落点计算 + 拖动视觉） |
| `filter` | D1 表格与选择线 | [D1] 过滤命中态需要 __item--matched / --locked 类，属交互增强 |
| `modelValue` | Angular 惯用映射 | [D2] 由 Angular 侧 value + [(value)] 双向绑定承担 |
| `onActive` | D2 录入与反馈线 | [D2] Angular 用 (active) 输出，参数 { value, node, e, trigger } |
| `onChange` | D2 录入与反馈线 | [D2] Angular 用 (change) 输出，参数 { value, node, e, trigger } |
| `onClick` | D2 录入与反馈线 | [D2] Angular 用 (click) 输出，参数 { node, e } |
| `onDragEnd` | D1 表格与选择线 | [D1] 依赖 draggable，随拖拽一起后置 |
| `onDragLeave` | D1 表格与选择线 | [D1] 依赖 draggable，随拖拽一起后置 |
| `onDragOver` | D1 表格与选择线 | [D1] 依赖 draggable，随拖拽一起后置 |
| `onDragStart` | D1 表格与选择线 | [D1] 依赖 draggable，随拖拽一起后置 |
| `onDrop` | D1 表格与选择线 | [D1] 依赖 draggable，随拖拽一起后置 |
| `onExpand` | D2 录入与反馈线 | [D2] Angular 用 (expand) 输出，参数 { value, node, e, trigger } |
| `onLoad` | D2 录入与反馈线 | [D2] 名字被 load 回调输入占用，遵循 cascader 先例不提供 load 输出 |
| `onScroll` | D2 录入与反馈线 | [D2] Angular 用 (scroll) 输出，参数 { e } |
| `operations` | D3 其余组件与边角能力 | [D3] 节点操作区属于模板扩展，广度期只做 label/icon/empty 三个模板指令 |
| `scroll` | D1 表格与选择线 | [D1] 虚拟滚动（大数据量）后置，height/maxHeight 已支持普通滚动 |

## 文档示例

- `packages/docs/src/app/docs/tree/demos/tree-base.ts`
- `packages/docs/src/app/docs/tree/demos/tree-checkable.ts`
- `packages/docs/src/app/docs/tree/demos/tree-lazy.ts`
