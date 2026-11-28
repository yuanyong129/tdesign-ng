# TDesign Angular

[TDesign](https://tdesign.tencent.com/) 的 Angular 实现。

> **状态：当前已发布 `0.1.1`，下一版本 `0.2.0` 的更新日志正在整理（见 [CHANGELOG](./CHANGELOG.md)）。** API 仍可能在小版本内调整，生产使用请锁版本。发布流程见 [RELEASING.md](./RELEASING.md)。

## 安装

```bash
npm i @tdesign-ng/components @tdesign-ng/styles
npm i @tdesign-ng/icons        # 需要图标时
```

```ts
import { TButton } from '@tdesign-ng/components';
```

```less
// styles.less —— 两行都要，缺一行就是裸 DOM
@import '@tdesign-ng/styles/index.less';
@import '@tdesign-ng/components/bridge.less'; // 纯 CSS 项目用 bridge.css
```

- [`@tdesign-ng/components`](./packages/ng-components)：73 个 Angular 组件（standalone + 逐组件 NgModule）
- [`@tdesign-ng/styles`](./packages/styles)：TDesign 样式，less 按组件入口 + 预编译 CSS
- [`@tdesign-ng/icons`](./packages/icons)：`TIcon` 与图标数据

在线文档：https://yuanyong129.github.io/tdesign-ng/

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
| DatePicker | ✅ 单日期、日期 + 时间（enableTimePicker / needConfirm / defaultTime）、mode 周/月份/季度/年份模式、面板导航、custom format / valueType、firstDayOfWeek、disableDate、预设日期、手动输入、清空、禁用、三种尺寸、自定义单元格与回显、可选范围限制、多选（标签回显） |
| DateRangePicker | ✅ 双面板范围选择、日期 + 时间（enableTimePicker / needConfirm / defaultTime）、开始/结束归一化、范围高亮、custom format / valueType、firstDayOfWeek、disableDate、range 可选范围、预设范围、手动输入、自定义分隔符、label / tips / status、borderless / readonly、清空、禁用、三种尺寸 |
| TimePicker | ✅ 时分秒三列、format 控制列、steps 步长、面板确认、此刻、预设时间、禁用时间、手动输入、自定义回显、清空、禁用、三种尺寸 |
| Layout / Header / Aside / Content / Footer | ✅ 五件套，`direction` 未设置时按内容里有没有 Aside 自动判断横竖 |
| Grid / Row / Col | ✅ 12 栅格、gutter（数字/数组/断点对象）、justify / align、offset / order / pull / push、六个断点响应式 |
| Card | ✅ 头部（头像/标题/副标题/描述/操作区）、封面、主体、底部、poster 主题、加载态复用 `t-loading` |
| Alert | ✅ 四种主题、标题与操作区、`maxLine` 截断、淡出关闭与 `(close)` / `(closed)` |
| Skeleton | ✅ 六个预设主题、`rowCol` 自定义行、gradient / flashed 动画与 `delay` |
| Typography / Text / Title / Paragraph | ✅ 六种标题层级、装饰组合（粗体/斜体/下划线/删除线/代码/键盘/标记）、主题色、省略号截断 |
| Breadcrumb / BreadcrumbItem | ✅ 投影与 `options` 两种用法、自定义分隔符（字符串或模板）、单项最大宽度、禁用项 |
| Steps / StepItem | ✅ 横向/竖向、`theme="dot"` 圆点模式、三种连接线、只读、单项状态覆盖、`(currentChange)` |
| Descriptions / DescriptionItem | ✅ `layout` × `itemLayout` 四种排版、`column` 列数、`span` 跨列、带边框、`colon`、单元格样式 |
| Comment | ✅ 头像/作者/时间、引用块、嵌套回复、操作区（数组或模板）、文本与模板混用 |
| Timeline / TimelineItem | ✅ 纵向/横向、标签左右交替或同侧、正/反序、虚线主题、自定义圆点与加载圆点 |
| Statistic | ✅ 前缀/后缀/单位、小数位与千分位、自定义 `format`、涨跌趋势、加载骨架 |
| StickyTool | ✅ 六个停靠方向、普通/紧凑模式、方形/圆角、悬浮与点击弹层、子项事件 |
| Affix | ✅ 顶部吸附与底部夹紧、自定义滚动容器、`offsetTop` / `offsetBottom`、`(fixedChange)` |
| BackTop | ✅ 滚动阈值、缓出滚动时长、三种主题、方形/圆形、自定义内容与位置 |
| QRCode | ✅ canvas / svg 两种渲染、四种纠错级别、中间图标、过期/已扫描/加载遮罩与 `(refresh)` |
| InputAdornment | ✅ 前置/后置内容（字符串或模板）、圆角拼接、与 `t-input` 组合时自动铺满 |
| ConfigProvider | ✅ `globalConfig` 全局文案（当前接入二维码），`TConfigService` 供组件注入 |
| Anchor / AnchorItem | ✅ scroll spy、`targetOffset`、自定义滚动容器、容器内吸顶、`(change)` / `(click)` |
| Watermark | ✅ canvas 平铺水印、多行/图片内容、透明度与旋转、移动与删除 |
| Guide | ✅ 分步引导、气泡/对话框两种模式、自定义高亮与内容、上一步/下一步/跳过/完成 |
| Popconfirm | ✅ 三种主题、弹出方向、`(confirm)` / `(cancel)` / `(visibleChange)`、异步确认 |
| Dropdown / DropdownItem | ✅ options 数据驱动、子菜单、分割线与禁用、主题与图标 |
| Image | ✅ 三种形状、`fit` 与定位、加载/错误占位、相册阴影、浮层、点击预览 |
| ImageViewer | ✅ 缩放/旋转/翻转/拖拽、键盘操作、缩略图切换、下载、modal 与 modeless |
| InputNumber | ✅ 步进/加法减法按钮、`theme` 三态、小数位与 `format`、`largeNumber` BigInt 步进、`(validate)` |
| RangeInput | ✅ 双输入 + 分隔符、`activeIndex`、逐段 `format`/`placeholder`、`clearable`、焦点与鼠标事件带 `position` |
| TagInput | ✅ 回车建标签、折叠 `+N`、`max`/`minCollapsedNum`、拖拽排序、`excessTagsDisplayType`、CVA |
| CheckTag / CheckTagGroup | ✅ 受控/非受控、禁用与三档尺寸、组内单选/多选、`(change)` 带上下文 |
| SelectInput | ✅ 可输入、标签回显与折叠、面板插槽、`popupVisible` 受控、前后缀图标投影、CVA |
| AutoComplete | ✅ 关键字过滤与高亮、键盘上下选中/回车、自定义选项模板、异步联想、CVA |
| Calendar | ✅ 月/年视图、`card`/`full` 主题、单/多/区间选择、周末隐藏、控制器配置、自定义单元格 |
| Swiper | ✅ 滑动/淡入淡出、自动播放、循环、水平/垂直、卡片模式、多形态导航器、`(change)` 带来源 |
| ColorPicker | ✅ 单色面板（饱和度/色相/透明度）、预设与最近使用、10 种格式互转（自研，零依赖）、CVA |
| Tree | ✅ 展开/勾选父子联动与半选、懒加载 `load`、`hover`/`line`/`icon`、自定义节点模板、键盘导航 |
| Menu / MenuItem / Submenu / MenuGroup | ✅ 垂直/水平、明暗主题、折叠成图标列、子菜单内部展开或 `t-popup` 浮层、`[(value)]` |
| Transfer | ✅ 双列表移动、两侧搜索与自定义过滤、勾选与全选、`oneWay`、模板化标题/底部/空态、键盘操作 |
| Upload | ✅ 选择与拖拽、文件列表与进度、删除/取消、`requestMethod` 自定义上传、`beforeUpload`/`format` 钩子 |

P0~P4 已全部落地；P5 复杂录入已完成 Slider / Rate / Cascader / TreeSelect / DatePicker / TimePicker，剩余 Upload / Transfer / ColorPicker 转入下面的广度路线。

广度阶段 B1（布局与静态展示）15/15、B2（弹层与媒体）8/8、B3（录入补全）12/12、B4（重型组件）4/4，**上游组件已 100% 覆盖**。

### 广度优先路线（2026-11-23 起）

策略：**先把上游组件全部补齐到「可用」基线，再逐个补高级能力。** 完整波次表、L1/L2 验收标准、工作流与风险见 [`docs/plans/breadth-first-roadmap.md`](./docs/plans/breadth-first-roadmap.md)。

| 波次 | 内容 | 项数 / 上游属性 |
| --- | --- | --- |
| B0 | 基线：`[D1]/[D2]/[D3]` 债务标记、`align-check --json`、`depth-report` 脚本 | — |
| B1 ✅ | 布局与静态展示：Layout、Grid、Typography、Card、Alert、Skeleton、Comment、Breadcrumb、Steps、Timeline、Statistic、Descriptions、StickyTool、Affix、BackTop | 15 项 / 203 |
| B2 ✅ | 弹层与媒体：Popconfirm、Dropdown、Guide、Image、ImageViewer、Anchor、QRCode、Watermark | 8 项 / 143 |
| B3 ✅ | 录入补全：InputAdornment、ConfigProvider、SelectInput、TagInput、RangeInput、InputNumber、AutoComplete、Calendar、ColorPicker、Swiper、CheckTag | 12 项 / 285 |
| B4 ✅ | 重型组件：Menu、Tree、Transfer、Upload | 4 项 / 184 |

广度阶段已完成（73 个组件目录、上游 71 个组件目录 100% 覆盖），当前进入深度阶段：D0 横切工程（TNode 模板化、`*Props` 透传、受控/非受控统一、SSR、a11y、单测、i18n）→ D1 表格与选择线 → D2 录入与反馈线 → D3 其余组件。深度债基线见 `pnpm depth:report`（298 项：D1 180 / D2 71 / D3 47）。

**每个组件的进度明细见 [`docs/progress/`](./docs/progress/README.md)**：总表 + 每个组件一页（已实现输入/事件、逐条深度债与原因、示例清单）。数据由 `pnpm gen:progress` 从 `align-check` 生成，`pnpm check:progress` 可校验是否过期；汇总口径仍看 `pnpm depth:report`。

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
| `docs/progress` | 组件进度文档（生成物，`pnpm gen:progress`） |

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


