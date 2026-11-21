# TDesign Angular

[TDesign](https://tdesign.tencent.com/) 的 Angular 实现。

> **状态：早期开发中（pre-alpha）。** 组件数量与 API 仍在快速变动，尚未发布到 npm。

本项目的两条硬性原则：

1. **API 以官方为准。** 组件的属性名、取值、默认值一律对齐 [tdesign-vue-next](https://github.com/Tencent/tdesign-vue-next)，不发明 Angular 特有的替代品。`pnpm check:align` 会拿上游 `type.d.ts` 与本仓库的 API 清单做机器比对，差异会被直接列出来。
2. **样式零自研。** 组件 CSS 100% 来自 [tdesign-common](https://github.com/Tencent/tdesign-common) 的 less 源码（以 `vendor/tdesign-common` 快照形式引入），本仓库只写必要的宿主元素桥接层。这样视觉与官方逐像素一致，也让上游样式更新可以直接同步。

## 组件进度

| 组件 | 状态 |
| --- | --- |
| Button | ✅ 已按上游契约实现 |
| Divider | ✅ |
| Link | ✅ |
| Space | ✅ |
| Icon | ✅（`@tdesign-ng/icons`，内置 65 个精选图标） |
| Input / Textarea | ✅ 清空、字数限制、前后缀投影、autosize |
| Switch / Checkbox / CheckboxGroup / Radio / RadioGroup | ✅ 受控值 + `ControlValueAccessor` |
| Form / FormItem | ✅ 内置 TDesign `rules` 校验引擎，兼容 `ngModel` 与 `formControl` |
| Select | ✅ CDK Overlay 面板，单选/多选/搜索/分组/创建项/键盘导航 |
| Popup | ✅ 五种触发方式、12 个方向、箭头、延迟与受控显隐 |
| Tooltip | ✅ 六种主题、延迟与自动消失，复用 Popup 定位 |
| Dialog | ✅ 遮罩、Esc、焦点陷阱、滚动锁定、主题图标 |
| Drawer | ✅ 四个方向、尺寸、遮罩与焦点管理 |
| Message | ✅ 服务式调用，九个位置、自动关闭与 closeAll |
| Notification | ✅ 服务式调用，四个角、标题/内容/底部 |
| Loading | ✅ 行内组件 + 全屏服务，延迟与滚动锁定 |
| Tag | ✅ 主题 / 变体 / 形状 / 尺寸 / 可关闭 / 自定义颜色 |
| Badge | ✅ 数字封顶、小红点、showZero、偏移与自定义色 |
| Avatar / AvatarGroup | ✅ 图片/文字/图标、形状与尺寸、max 折叠 |
| Pagination | ✅ 每页条数、跳转、统计、折叠省略号、simple 形态 |
| Table | ✅ 数据与列渲染、模板单元格、排序、表头筛选、固定列、行选择、展开行、分页联动、多级表头、合并单元格、虚拟滚动、列宽拖拽 |
| Tabs | ✅ normal / card 主题、四个方向、禁用与受控取值、新增/关闭页签、拖拽排序、懒加载与 destroyOnHide |
| Collapse | ✅ 手风琴互斥、默认展开、整行点击、无边框、箭头位置、收起销毁内容 |
| Empty | ✅ 五种内置插图、三种尺寸、自定义图片、操作区投影 |
| Progress | ✅ line / plump / circle 主题、状态图标、渐变与分段颜色、自定义尺寸 |
| List | ✅ 头像与标题描述、操作区、分割线、斑马纹、尺寸、异步加载更多 |
| Slider | ✅ 单值与区间、步长与刻度、横竖布局、提示文案、键盘操作 |
| Rate | ✅ 半星、自定义数量与间距、选中/未选中颜色、禁用、再次点击清空、评分文案 |
| Cascader | ✅ 单选/多选级联、完整路径回显、自定义字段名、清空、禁用、三种尺寸、父子不关联、搜索、异步加载、面板与回显插槽 |
| TreeSelect | ✅ 单选/多选、展开父级、父子不关联与取值模式、搜索、自定义字段名、清空、禁用、三种尺寸、加载态、面板插槽 |
| DatePicker | ✅ 单日期、日期 + 时间（enableTimePicker / needConfirm / defaultTime）、面板导航、custom format / valueType、firstDayOfWeek、disableDate、预设日期、手动输入、清空、禁用、三种尺寸 |
| DateRangePicker | ✅ 双面板范围选择、日期 + 时间（enableTimePicker / needConfirm / defaultTime）、开始/结束归一化、范围高亮、custom format / valueType、firstDayOfWeek、disableDate、range 可选范围、预设范围、手动输入、自定义分隔符、label / tips / status、borderless / readonly、清空、禁用、三种尺寸 |
| TimePicker | ✅ 时分秒三列、format 控制列、steps 步长、面板确认、此刻、预设时间、禁用时间、手动输入、自定义回显、清空、禁用、三种尺寸 |

P4 数据展示已全部落地；P5 复杂录入进行中（Slider、Rate、Cascader、TreeSelect、DatePicker、TimePicker 已完成，Upload / Transfer / ColorPicker 待做），计划见 `docs/plans/tdesign-angular-plan.md`；
接手开发请先读 [`HANDOFF.md`](./HANDOFF.md)。

`ButtonGroup`、`Scrollbar` 在 TDesign 中没有对应组件，已从本仓库移除。

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `packages/ng-components` | 组件库 `@tdesign-ng/components` |
| `packages/icons` | 图标包 `@tdesign-ng/icons`，图标数据由脚本从 `tdesign-icons-svg` 生成 |
| `packages/styles` | 样式包 `@tdesign-ng/styles`，把上游 less 拆成单组件入口 |
| `packages/docs` | 文档站 `@tdesign-ng/docs`（Angular 应用） |
| `vendor/tdesign-common` | 上游样式源码快照，`VERSION.json` 记录同步版本 |
| `scripts` | 代码生成与校验脚本（API 文档、图标、样式构建、上游对齐） |
| `docs/plans` | 改造计划与技术决策记录 |

## 本地开发

需要 Node 22 与 pnpm 12（仓库 `packageManager` 字段已声明版本）。

```bash
pnpm install
pnpm start          # 文档站开发服务器 → http://localhost:4280/
```

### 常用脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm start` | 启动文档站（端口 4280，热重载） |
| `pnpm build` | 完整流水线：API 文档 → 图标 → 组件库 → 样式 → 文档站 |
| `pnpm build:lib` | 只构建组件库（ng-packagr） |
| `pnpm build:icons` | 只构建图标包 |
| `pnpm build:styles` | 把上游 less 编译成 CSS 产物并做内容断言 |
| `pnpm gen:api` | 从组件源码的 TSDoc 生成 API 表格数据 |
| `pnpm gen:icons` | 生成内置图标表，`--all` 可生成全量 2358 个图标 |
| `pnpm check:api` | 校验每个输入属性都有中英文描述 |
| `pnpm check:align` | 比对组件 API 与 tdesign-vue-next 的差异 |
| `pnpm vendor:styles` | 重新同步 `vendor/tdesign-common` 到上游最新 |
| `pnpm build:docs:pages` | 构建文档站并把 `base-href` 设为 `/tdesign-ng/`（Pages 部署用） |
| `pnpm preview:pages` | 本地预览 GitHub Pages 产物（需先执行上一条） |

## 文档站

- 开发：`http://localhost:4280/`
- 线上：`https://yuanyong129.github.io/tdesign-ng/`

文档站的 API 表格不是手写的：`scripts/gen-api-docs.mjs` 用 TypeScript 编译器 API 扫描组件源码，读取 `@Input` / `@Output` 上的 `@zh`、`@en`、`@defaultValue`、`@values` 注释生成。所以**给属性写注释就是在写文档**，漏写会被 `pnpm check:api` 拦下。

## 参与贡献

目前处于打样阶段，API 仍会变动，暂不接受新增组件类 PR。组件实现请参考 `packages/ng-components/src/components/button/` 的写法（standalone、信号输入、OnPush、`ViewEncapsulation.None`、类名直接使用上游的 `.t-*` 约定）。

## 许可

[MIT](./LICENSE)

样式与设计规范来自 TDesign（Copyright 2021-present TDesign, MIT License），图标来自 [tdesign-icons](https://github.com/Tencent/tdesign-icons)。

