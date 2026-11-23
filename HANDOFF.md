# 交接文档 · TDesign Angular

> 面向「下一个接手这个仓库的会话」。读完这份文档，应该能直接继续开发，而不需要重新调研环境。
> 更新日期：2026-11-23，对应路线：**广度优先**（B0 基建 → B1 布局与静态展示，见 §7）。

## 1. 这个项目是什么

把 `yuanyong129/tdesign-ng`（原 Arco Design Angular 移植）改造成 **TDesign 的 Angular 版本**。

- **API 唯一真源**：`tdesign-vue-next@1.20.11`（`https://unpkg.com/tdesign-vue-next@1.20.11/es/<component>/type.d.ts`）。
- **视觉唯一真源**：仓库内 `vendor/tdesign-common/style/web`（上游 less 快照，`pnpm vendor:styles` 更新）。
- 不兼容原 Arco 的任何属性，不做兼容层；TDesign 没有的组件（ButtonGroup / Scrollbar）已删除。
- 用户已经明确：**文档站先不精修，优先组件开发**；**提交不需要问，直接 commit**。

## 2. 当前进度

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| P0 工程基建 | ✅ | pnpm workspace、`@tdesign-ng/{components,icons,styles,docs}`、GitHub Pages 部署 |
| P1 打样 | ✅ | Button / Link / Divider / Space / Icon |
| P2 基础表单 | ✅ | Input / Textarea / Switch / Checkbox / Radio / Select / Form（含 TDesign rules 校验引擎） |
| P3 弹层与反馈 | ✅ | Popup / Tooltip / Dialog / Drawer / Message / Notification / Loading |
| P4 数据展示 | ✅ | Tag / Badge / Avatar(+Group) / Pagination / Table / Tabs / Collapse / Empty / Progress / List 全部落地，余项见 §8 |
| P5 复杂录入 | ✅ | Slider、Rate、Cascader（两层）、TreeSelect（两层）、DatePicker（八层）、DateRangePicker（四层）、TimePicker（两层）已完成；Upload / Transfer / ColorPicker 转入广度路线 |
| **广度阶段** | 🚧 | 2026-11-23 起：先补齐上游 71 个组件目录（当前 60 个组件目录，B1 的 15 项与 B2 的 8 项已全部落地），再回填深度。计划见 `docs/plans/breadth-first-roadmap.md` |

**两个数字要分清**：

- `pnpm gen:api` 统计的是**本仓库现有 API**：81 个组件、770 个输入属性、262 个示例。
- `node scripts/align-check.mjs` 统计的是**对齐契约**：77 个组件、上游 1151 个属性、已对齐 726（63.1%），合计 `missing 0 / extra 0`（未实现项都登记在 `ignoreUpstream`）。

组件清单（`packages/ng-components/src/index.ts`，50 条导出）：affix、alert、avatar、back-top、badge、breadcrumb、button、card、cascader、checkbox、collapse、comment、date-picker、date-range-picker、descriptions、dialog、divider、drawer、empty、form、grid、input、layout、link、list、loading、message、notification、pagination、popup、progress、radio、rate、select、skeleton、slider、space、statistic、steps、sticky-tool、switch、table、tabs、tag、textarea、time-picker、timeline、tooltip、tree-select、typography（含 DateRangePicker 独立实现）。

## 3. 目录与环境

```
packages/ng-components   # 组件库（standalone + module 双出口）
packages/styles          # 上游 less 的单组件入口（脚本生成）
packages/icons           # TIcon + 内置图标表（脚本生成）
packages/docs            # 文档站（端口 4280）
scripts/                 # gen-api-docs / gen-demo-sources / align-check / gen-icons
vendor/tdesign-common    # 上游样式快照
docs/plans/breadth-first-roadmap.md  # 当前执行计划：广度优先波次、L1/L2 定义  ← 先读这个
docs/plans/tdesign-angular-plan.md   # 历史分期与实现记录（§14~§22）
```

- Node 22 / pnpm 12 / Angular 19.2 / ng-packagr 19.2，zone CD + `provideZoneChangeDetection({ eventCoalescing: true })`。
- 线上：`https://yuanyong129.github.io/tdesign-ng/`（`base-href=/tdesign-ng/`），push 到 `main` 自动部署；深链接返回 404 状态但能渲染（靠 `404.html`）。

## 4. 常用命令

```bash
pnpm build            # icons → components → docs（改完必跑）
pnpm build:lib        # 只构建组件库（含 ng-packagr 严格检查）
pnpm start            # 文档站 dev server :4280
pnpm gen:api          # 由 TSDoc 生成 packages/docs/.../api.generated.json
pnpm gen:demos        # 由 demo 源码生成 demo-sources.generated.json
node scripts/align-check.mjs            # 全部组件对齐检查
node scripts/align-check.mjs --component TTable
node scripts/align-check.mjs --json     # 结构化报告（depth-report 的数据源）
node scripts/depth-report.mjs           # D 阶段工作单（按 D1/D2/D3 统计债务）
```

## 5. 必须遵守的约定

1. **输入属性必须有 `@zh` / `@en` 注释**，否则 `gen-api-docs --check` 会挂；枚举值写 `@values`，默认值写 `@defaultValue`。
2. **不要给组件加 `click` 输出**：`(click)` 会与原生事件重复触发两次（已踩过）。禁用态在内部 `preventDefault + stopPropagation` 拦掉即可。
3. **样式 100% 来自 `vendor/tdesign-common`**，`packages/ng-components/src/bridge.less` 只放两类东西：宿主元素桥接（如 `t-button { display: contents; }`、`t-table { display: block; }`）和上游选择器在 Angular 下失效时的等价规则（每条都要写清原因）。
4. **`align-check` 的哲学**：上游每个未实现的属性都必须在 `ignoreUpstream` 里写一句原因；总量必须保持 `missing 0 / extra 0`。上游没有、我们新增的属性放进 `angularOnly` 并注明理由。
5. **demo 约定**：`packages/docs/src/app/docs/<name>/demos/<name>-xxx.ts`，selector 为 `demo-<name>-<id>`，每个 demo 包在 `<docs-demo id="..." title description>` 里；页面末尾是 `<api-table component="TXxx" />` + `<docs-page-nav current="/xxx" />`。
6. **新增组件要同步**：`index.ts` 导出、`nav.ts` 导航、`app.routes.ts` 懒加载路由、`packages/docs/src/styles.less` 引入组件 less、`scripts/align-check.mjs` 配置、README 组件表。
7. **未实现的上游属性必须标深度债**：`ignoreUpstream` 的 reason 以 `[D1]`（表格与选择线）/ `[D2]`（录入与反馈线）/ `[D3]`（其余）开头，后接一句"缺什么、为什么"。这既是文档，也是 `scripts/depth-report.mjs` 的输入。
8. **广度期每个组件按 L1 六条交付**（roadmap §2.1）：主干可交互、通用维度齐全、契约完整、文档闭环、`build:lib` + CDP 通过、明确写清允许的欠账。不要用"先占位、以后再补"跳过 demo 与 align-check。

## 6. 环境坑（都踩过）

- `pnpm` / `ng` 需要完整权限；本会话审批被禁用，不要传 `sandbox_permissions`。
- **不要用 PowerShell 的 `Get-Content | Out-File` 改源码**：会按 ANSI 解码导致中文变乱码。用编辑工具，或 Python `io.open(..., encoding='utf-8', newline='\n')`。
- **编辑 `bridge.less` 后 dev server 热更新会报** `absoluteFrom(../ng-components/src/bridge.less): path is not absolute`，重启 dev server 即恢复（Angular 19 dev-server 对全局样式依赖的已知问题）。改 less 后优先重启。
- 新增懒加载路由后 dev server 不认，必须重启 `pnpm --filter @tdesign-ng/docs run start`。
- push 到 GitHub 经常失败：用 15 次重试、每次 sleep 12~20s 的循环（历史上重启到第 15 次才成功）。
- CDP 验证：headless Edge 在 **9341**（用户自己的 Edge 也开 9340，别用）。启动参数必须带 `--disable-background-timer-throttling --disable-renderer-backgrounding --disable-backgrounding-occluded-windows`，脚本里要先 `Page.bringToFront()`，否则后台页 rAF 被节流、Angular 的 coalesced 变更检测不跑，交互看起来「没反应」。
- **在组件元素上绑定与原生同名的输出会触发两次**：给 `<t-checkbox (change)="...">` 绑定时，Angular 既挂了 `OutputEmitterRef`，又给宿主挂了一个原生 `change` 的 DOM 监听，一次点击回调执行两遍（用 `console.log(new Error().stack)` 能同时看到两条路径）。Cascader 多选因此改成手写复选框 DOM（`label.t-checkbox` + `input.t-checkbox__former`），勾选完全由 `value` 驱动，并在 click 上 `preventDefault + stopPropagation`。
- 组件输出名与原生事件重名时（`change` / `click`）优先用「原生事件 + 指令」而不是输出，或像上一条一样手写 DOM；这是避免双触发的通用做法。
- 临时脚本、截图、上游缓存都放 `.local-cache/`（已 gitignore）。
- 清理 headless Edge 只杀自己的实例：`Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -match 'local-cache[\\/]+edge-' } | ForEach-Object { taskkill /PID $_.ProcessId /T /F }`。**不要用 `Get-Process msedge | Stop-Process`**，会把用户自己的浏览器一起杀掉；正则要同时匹配 `/` 和 `\`（用 Node `spawn` 拼路径时是正斜杠，只写 `\\` 会漏杀）。

## 7. 当前进行中的工作：广度优先 B3

2026-11-23 起路线改为**广度优先**：先把上游 71 个组件目录补齐到 L1 可用基线，再回填深度。完整计划见 [`docs/plans/breadth-first-roadmap.md`](./docs/plans/breadth-first-roadmap.md)。

**已完成（B0 基建）**：

- 新建 `docs/plans/breadth-first-roadmap.md`：39 项缺口按 B1~B4 分波（15 / 8 / 12 / 4 项，共 815 个上游属性）、L1 六条门槛、D0~D3 深度分批、风险表、单组件 8 步工作流。
- README 与旧计划已加路线指针（旧文件 §22）；本文件 §2 / §5 / §7 / §8 同步更新。
- `scripts/align-check.mjs` 支持 `--json`，输出 `{ upstreamVersion, totals, components[] }`；每个组件的 `ignored[]` 带 `inUpstream`（区分真上游属性与插槽/事件映射）。
- 新增 `scripts/depth-report.mjs`（`pnpm depth:report`）：读 align-check 的 JSON，按 `[D1]/[D2]/[D3]`（reason 无前缀则按组件默认归属）聚合债务，输出「分布表 + 组件债务表 + 每条债务明细」的 markdown。

**当前债务基线（2026-11-23，`pnpm depth:report`）**：上游 1151 props，已对齐 726（63.1%）；未实现 425 项里 190 项是 Angular 惯用映射（插槽/双向绑定/事件名，不算债），**真实欠账 235 项**：D1 159（67.7%）、D2 44（18.7%）、D3 32（13.6%）。显式 `[D#]` 前缀 15 项——存量按组件默认归属统计，新写的债必须带前缀。

**B1 全部完成（15/15）**：

| 组件 | 落地要点 |
| --- | --- |
| Layout / Header / Aside / Content / Footer | 五个组件一个目录；`direction` 缺省时用 `contentChildren(TAside)` 判断横竖，`t-layout--with-sider` 同步 |
| Grid / Row / Col | `T_ROW` 注入 token 把 gutter 传给列；gutter 支持 `number`（水平）/ `[水平, 垂直]` / 断点对象；响应式靠 CSS 媒体查询，列不监听 viewport；六个断点的 span/offset/order/pull/push 全支持 |
| Card | 头部四段（头像/标题副标题描述/操作区）、封面、主体、底部；`poster2` 把 actions 移到底部；加载态直接渲染 `t-loading`，不自写占位视觉 |
| Alert | 四主题图标内联 SVG、`maxLine` 用 `-webkit-line-clamp`、关闭走 `t-alert--closing` → `transitionend`（宿主 opacity）→ `t-is-hidden`，260ms 兜底 |
| Skeleton | `rowCol` 展开成行/列视图，六种 theme 预设；`loading=false` 时宿主不带类并投影真实内容 |
| Typography / Text / Title / Paragraph | 样式根落在内部语义元素（`span` / `h1~h6` / `p`），因为 `.t-typography` 的字号选择器是 `h1&`~`h6&`；装饰嵌套顺序 `<i><kbd><mark><code><del><u><strong>`；宿主 `display: contents` |
| Breadcrumb / BreadcrumbItem | 投影与 `options` 两种用法；`separator` 支持字符串与模板；`maxItemWidth` 截断；文字层统一渲染成 `<a>`（两支 span/a 各带一个 `ng-content` 会让投影只进第一个槽） |
| Steps / StepItem | 横向/竖向、`theme="dot"`、三种 `separator`、`readonly`、单项 `status` 覆盖、`(currentChange)`；`state` 用 protected 供子项读取 |
| Descriptions / DescriptionItem | `layout` × `itemLayout` 四种组合的 cell 模型照上游 `getRows`；`span` 与「末项吸收剩余列」一致；带边框 / `colon` / 单元格样式 |
| Comment | 头像（字符串当 URL）、作者与时间、引用块 `__quote`、回复区嵌套 `t-comment`、操作区数组或模板 |
| Timeline / TimelineItem | `labelAlign` 按 layout 自动换算、`mode` 交替/同侧、`reverse` 用 DOM 重排、`theme="dot"` 虚线、自定义与 loading 圆点（`dotColor` 默认 `primary`，与上游一致） |
| Statistic | 数值格式化复刻 `getFormatValue`（小数位上下限 + 分隔符替换）、`format` 接管、趋势箭头、loading 骨架 |
| StickyTool | 六个停靠方向、普通/紧凑、方形/圆角、`width` 居中、子项弹层走 `[tPopupContent]`、`(itemClick)` / `(itemHover)` |
| Affix | `measure()` 与上游逐行对齐（先 offsetTop、再 offsetBottom 夹紧）、`(fixedChange)` 只在吸附状态翻转时派发 |
| BackTop | `rAF` + `easeOutCubic` 平滑滚动、`visibleHeight` 阈值、三种主题与两种形状、不提供 `onClick` 输出（原生 click 冒泡） |

新增共享基建：`packages/ng-components/src/_utils/breakpoint.ts`（`BREAKPOINTS`、`BREAKPOINT_MIN_WIDTH`、`matchBreakpoint`、`TViewportService`，SSR 下不注册 resize 监听）。

**B2 全部完成（8/8，2026-11-23）**：

| 组件 | 落地要点 |
| --- | --- |
| Popconfirm | 复用 `t-popup` 定位；`(visibleChange)` 带 `{ visible, trigger, e }`，不做 `[(visible)]`；`popupProps` 标 `[D2]` |
| Dropdown / DropdownItem | options 数据驱动 + `children` 子菜单、分割线/禁用/主题；默认 `trigger="hover"`；子菜单纵向位置实时测量 |
| Guide | 不套 CDK Overlay（z-index 低于 999999），宿主内手写 `position: fixed` + 视口夹紧 + 主轴翻转；气泡/对话框两种模式 |
| Image | `src` 支持 `字符串或 File`；形状 / `fit` / `position` / 浮层 / 相册阴影；点击预览交给使用方监听原生 click |
| ImageViewer | modal / modeless；缩放旋转翻转拖拽、键盘、缩略图、下载；`attach` 标 `[D2]`、`viewerScale` 标 `[D3]` |
| Anchor / AnchorItem | scroll spy + `targetOffset`；**只有一个默认投影槽**，吸顶改用 `position: sticky`（多 `<ng-content>` 会丢内容）；自写 300ms 缓动滚动 |
| QRCode | 引入 `qrcode`（可选 peer + 根 devDependency，docs 直接编译库源码时必须提升）；canvas/svg 双渲染、图标挖空、过期/已扫描/加载遮罩 |
| Watermark | canvas 平铺、多行/图片、透明度与旋转、移动/删除；复用单个 `<style>` 注入 keyframes（上游会泄漏） |

新增共享基建：`ConfigProvider`（`globalConfig` 输入 + `TConfigService` 注入 + `effect` 同步、销毁时清空）。当前只接二维码文案，其余分组在 D0 统一接。

**下一步（按此顺序执行）**：

1. **B3 剩余 10 项**：SelectInput、TagInput、RangeInput、InputNumber、AutoComplete、Calendar、ColorPicker、Swiper、CheckTag（InputAdornment ✅、ConfigProvider ✅ 已完成）。
2. 每完成 5 个组件，更新 README 组件表与 roadmap §3 状态。
3. 波次结束：`gen:api` → `align-check` → `tsc` / `ngc` → `pnpm build:lib` → CDP 冒烟 → 提交 + 更新本文件。

**待拍板（B3 开工前确认）**：

- ColorPicker：颜色转换自研约 150 行（默认），不引依赖。
- Calendar：复用现有日期工具，不引 dayjs。
- 广度期不引入 Vitest（保持速度），D0 统一落地；日期/颜色等纯函数可先用 `node --test` 兜底。

### 上一个任务：DatePicker 第八层（2026-11-22 完成，留作记录）

DatePicker 前七层已提交：单日期、面板翻页/预设、时间模式、mode 月份/年份、mode 周/季度、cell / valueDisplay、range 可选范围。第八层补上「多选」。

- **multiple**：`input(false, { transform: booleanAttribute })`；开启后值类型变为数组（`DatePickerValue = DateValue | DateValue[]`，新增 `DateMultipleValue`）。
  - `values` computed 统一把单选/多选都归一成 `DateValue[]`，`firstValue` 供单选相关逻辑（解析、时间草稿、`valueDisplay`）使用。
  - `pickDate` 在多选时切换选中并**保持面板打开**；`cellClasses` 的 active 判定改为「值列表里存在同一天」，因此可同时高亮多个格子。
  - 输入框渲染 `t-tag` 列表（复用 `TTag`，`closable` 时点击可单独删除，`removeTag` 过滤后提交），`handleClear` 提交 `[]`，`(change)` 事件值同步为数组。
  - `enableTimePicker` 与 `multiple` 互斥（多选时 `isTimeMode` 为 false）；`week` / `quarter` 模式仍走整周/整季提交，不支持多选（与上游一致）。
- `scripts/align-check.mjs` 从 `TDatePicker` 的 `ignoreUpstream` 移除 `multiple`（DateRangePicker 保留）。
- **样式桥接**：上游多选走 `tag-input` 布局，我方用 `t-tag` + 输入框组合，在 `bridge.less` 补了最小规则（`.t-date-picker--multiple .t-input` 允许换行、标签行内排列、`__inner` 弹性收缩、`__suffix` 靠右），原因写在注释里。

**已用 CDP 验证**（`http://localhost:4280/date-picker`，`date-picker-multiple` demo）：

- 初值 `['2024-05-01','2024-05-08']`：宿主类 `t-date-picker--multiple`，输入框内 2 个标签，面板里 1 日与 8 日同时高亮。
- 依次点 15、16 日：标签依次增加且面板保持打开；点标签上的关闭图标只移除该日期；清空后标签与高亮全部消失、hint 显示「已选 0 个日期」。
- `align-check` 合计 `missing 0 / extra 0`（`TDatePicker 已对齐 22/44`）；`gen:api` 43 组件 / 493 属性，`gen:demos` 188 示例；`consoleErrors` 为空。

DatePicker / DateRangePicker / TimePicker / Cascader / TreeSelect 的余项不再占用当前窗口，已转为深度债（`[D1]`），与 §8 合并记录。

## 8. 已知缺口与技术债

- **完整缺口清单与深度分批见 `docs/plans/breadth-first-roadmap.md` §1.3 / §4.2**；本节只记跨组件的共性问题。新登记的未实现属性请按 §5 第 7 条补 `[D1]/[D2]/[D3]` 前缀。
- **富内容一律走模板**：Message/Notification 的内容还是纯字符串；Table 单元格目前支持 `cell` 函数返回字符串 + `tTableCell` 模板，二者不要混用。
- **没有单测**：组件全靠 CDP 行为验证 + `align-check` 契约验证；Vitest 迁移仍未开始。
- **Icon SSR**：`TIcon` 用 `DOMParser`，未做 `isPlatformBrowser` 分支。
- **未实现的上游能力**（均已在 `align-check` 写明原因）：Dialog 的 `draggable`/`confirmOnEnter`/`beforeOpen`/`beforeClose`；Loading 的 `indicator`/`attach`；Avatar 的 `imageProps`；AvatarGroup 折叠头像的弹层列表；CheckTag / CheckTagGroup；Pagination 的 `simple` 形态只有「当前页/总页数」；Tabs 的 `action`（自定义操作区）与 `list`（数据驱动面板）未实现；Collapse 的 `expandIcon` 只接受 `boolean | TemplateRef`，不接受上游的渲染函数；Empty 的 `image` 只接受 URL 字符串（不支持 ImageProps），`title` / `description` 为字符串（不支持 TNode）；Progress 的 `label` 只接受 `string | boolean`（不支持 TNode），`plump` 的 over/under 用 `percentage >= 10` 近似（未做逐像素测量），circle 状态图标沿用填充图标（上游是细线图标）；List 的 `scroll`（虚拟滚动）未实现，`asyncLoading` 不支持模板，`(scrollChange)` 原样透出没有节流。；Slider 的 `inputNumberProps`（两侧数字输入框）与 `tooltipProps` 透传未实现，键盘只支持方向键 / Home / End；Rate 的自定义 `icon` 未实现（固定内置星形），`showText` 不提供每颗星的悬浮 tooltip。Cascader 的 `valueType`、`minCollapsedNum` / `collapsedItems`（多选折叠）、`columnHeader` / `columnFooter`、`option`（自定义选项渲染）、`checkProps` 与各类 `*Props` 透传、`trigger="hover"`、受控 `popupVisible`、`readonly` / `borderless` / `status` / `tips` / 前后缀图标均未实现；`filter` 只能是同步函数（上游允许 Promise）。TreeSelect 的 `collapsedItems`（折叠标签的自定义内容，目前用内置 +N）、`valueDisplay`、`inputProps` / `selectInputProps` / `popupProps` 透传、受控 `popupVisible`、`autoWidth` / `borderless` / `readonly`、`suffix` / `suffixIcon` 与失焦/聚焦事件未实现；`treeProps` 目前只支持 `checkStrictly` / `valueMode` / `expandAll`，其余 Tree 能力（拖拽、虚拟滚动、懒加载、自定义图标/标签、`checkProps`）未透传。DatePicker 的 `mode` 已支持 date / week / month / quarter / year，但 week 的值格式用 `YYYY-[W]WW`（上游 dayjs 为 `gggg-wo`，依赖 weekOfYear 插件与本地化），`multiple` 已支持但与 `enableTimePicker` 互斥、在 week / quarter 模式下仍按整周/整季提交；未实现 `disableTime` / `timePickerProps` 与各类 `*Props` 透传；`cell` / `valueDisplay` 已支持但只接受返回字符串的回调（上游支持 `TNode`）、`borderless` / `readonly` / `status` / `tips` / `label`。DateRangePicker 未实现 `disableTime` / `timePickerProps`、`mode`、`panelActiveDate`、`panelPreselection` / `cancelRangeSelectLimit`、`cell` / `valueDisplay`、`prefixIcon` / `suffixIcon` 与 `inputProps` / `rangeInputProps` / `selectInputProps` / `popupProps` 透传、打开/关闭/失焦/聚焦事件。TimePicker 未实现 `t-time-range-picker`（区间）、`borderless` / `readonly` / `status` / `tips` / `label`、`suffixIcon` 替换与 `inputProps` / `selectInputProps` / `popupProps` 透传、打开 / 关闭 / 失焦 / 聚焦事件。
- **文档站**：无搜索、无中英切换、无右侧锚点导航；示例卡片视觉可再贴近官网。

## 9. 怎么验证一个改动

1. `node scripts/gen-api-docs.mjs && node scripts/gen-demo-sources.mjs`（有新增输入/示例时）。
2. `node scripts/align-check.mjs` 必须 `missing 0 / extra 0`。
3. `pnpm build:lib` 全绿（`gen:api` / `gen:demos` 的 check 已包含在内）。
4. **本地预览（首选）**：`pnpm start --port 4200 --host 127.0.0.1` 起 dev server（后台任务），再用 `node .local-cache/cdp-page.mjs /card /alert` 探针检查标题 / demo / api 表 / console 报错 / 4xx 资源；`PAGE_BASE` 可改地址，`PAGE_PROBES=".t-card,.t-alert"` 可统计选择器命中数。dev server 的 `prestart` 会自动跑 `gen-api-docs` + `gen-demo-sources`。
5. 线上验证：`PAGE_BASE=https://yuanyong129.github.io/tdesign-ng node .local-cache/cdp-page.mjs /card`。推送到 main 后 GitHub Pages 约 1~2 分钟生效。
6. 环境说明（2026-11-23 起）：DSH 会话已切到 `danger-full-access`，`pnpm build`/`ng serve`/管道子进程/`git push`/headless Edge 均可直接运行，不再需要绕 EPERM。






