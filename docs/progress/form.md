# Form 表单 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/form/`
- 文档页：`/form`（`packages/docs/src/app/docs/form/form.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 34 |
| 已对齐 | 30 |
| 覆盖率 | 88.2% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 4（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 8 个 |

## 组件明细

### `TForm`（`<t-form>`）

上游接口 `TdFormProps`；上游属性 21、已对齐 17（81.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `id` | string \| undefined | undefined | 实际原生 form 元素的 id |
| `layout` | FormLayout | vertical | 表单布局：纵向或行内 |
| `labelAlign` | FormLabelAlign \| undefined | undefined | 标签对齐方式，不设置时纵向布局为 top、行内布局为 right |
| `labelWidth` | string \| number | 100px | 标签宽度 |
| `colon` | boolean | false | 标签文字后是否显示冒号 |
| `requiredMark` | boolean | true | 是否显示必填标记 |
| `disabled` | boolean | false | 是否禁用整个表单 |
| `readonly` | boolean | false | 表单级只读，与支持只读的控件自身配置取并集 |
| `rules` | FormRules \| undefined | undefined | 表单级校验规则，按字段名匹配 |
| `requiredMarkPosition` | 'left' \| 'right' | left | 必填标记的位置 |
| `errorMessage` | string \| undefined | undefined | 统一的错误提示文案，设置后覆盖校验结果里的文案 |
| `showErrorMessage` | boolean | true | 是否显示错误提示 |
| `statusIcon` | boolean | true | 是否显示校验状态图标 |
| `resetType` | FormResetType | empty | 重置时的取值方式：清空或回到初始值 |
| `preventSubmitDefault` | boolean | true | 是否阻止表单的默认提交行为 |
| `scrollToFirstError` | boolean | false | 校验失败时是否滚动到第一个出错的表单项 |
| `submitWithWarningMessage` | boolean | false | 存在 warning 级校验结果时是否允许提交 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `submit` | FormSubmitResult | 提交事件 |
| `reset` | Record<string, unknown> | 重置事件 |
| `validate` | FormValidateMessage | 校验事件 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `data` | Angular 惯用映射 | Angular 用 ngModel/FormGroup 承载表单数据，不需要 data 输入 |
| `onReset` | Angular 惯用映射 | Angular 用 (reset) 输出 |
| `onSubmit` | Angular 惯用映射 | Angular 用 (submit) 输出 |
| `onValidate` | Angular 惯用映射 | Angular 用 (validate) 输出 |

### `TFormItem`（`<t-form-item>`）

上游接口 `TdFormItemProps`；上游属性 13、已对齐 13（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `name` | string \| undefined | undefined | 字段名，用于匹配校验规则与取值 |
| `label` | string \| undefined | undefined | 标签文本 |
| `rules` | FormRule \| FormRule[] \| undefined | undefined | 校验规则，优先于表单级的同名规则 |
| `help` | string \| undefined | undefined | 帮助文字，显示在控件下方并参与布局 |
| `tips` | string \| undefined | undefined | 提示文字，显示在控件下方但不占位 |
| `status` | FormValidateStatus \| '' \| undefined | undefined | 手动指定校验状态，用于服务端校验等场景 |
| `statusIcon` | boolean \| undefined | undefined | 是否显示校验状态图标 |
| `successBorder` | boolean \| undefined | undefined | 是否显示成功态边框 |
| `requiredMark` | boolean \| undefined | undefined | 是否显示必填标记 |
| `labelAlign` | FormLabelAlign \| undefined | undefined | 标签对齐方式 |
| `labelWidth` | string \| number \| undefined | undefined | 标签宽度 |
| `showErrorMessage` | boolean \| undefined | undefined | 是否显示错误信息 |
| `for` | string \| undefined | undefined | 标签的 for 属性，指向控件 id |

## 文档示例

- `packages/docs/src/app/docs/form/demos/form-basic.ts`
- `packages/docs/src/app/docs/form/demos/form-disabled.ts`
- `packages/docs/src/app/docs/form/demos/form-inline.ts`
- `packages/docs/src/app/docs/form/demos/form-label.ts`
- `packages/docs/src/app/docs/form/demos/form-lifecycle.ts`
- `packages/docs/src/app/docs/form/demos/form-readonly.ts`
- `packages/docs/src/app/docs/form/demos/form-rules.ts`
- `packages/docs/src/app/docs/form/demos/form-validator.ts`
