# 交接文档 · TDesign Angular

> 面向「下一个接手这个仓库的会话」。读完这份文档，应该能直接继续开发，而不需要重新调研环境。
> 更新日期：2026-11-23，对应路线：**广度已完成（B0~B4 100%）→ 深度阶段 D0 横切工程**（见 §7）。

## 1. 这个项目是什么

把 `yuanyong129/tdesign-ng`（原 Arco Design Angular 移植）改造成 **TDesign 的 Angular 版本**。

- **API 唯一真源**：`tdesign-vue-next@1.20.11`（`https://unpkg.com/tdesign-vue-next@1.20.11/es/<component>/type.d.ts`）。
- **视觉唯一真源**：仓库内 `packages/styles/vendor/tdesign-common/style/web`（上游 less 快照，`pnpm vendor:styles` 更新）。
- 不兼容原 Arco 的任何属性，不做兼容层；TDesign 没有的组件（ButtonGroup / Scrollbar）已删除。
- 用户已经明确：**组件功能/API/演示文档优先**（文档站的样式与布局已按官网对齐，见 §8）；**提交不需要问，直接 commit**。

## 2. 当前进度

| 阶段 | 状态 | 说明 |
| --- | --- | --- |
| P0 工程基建 | ✅ | pnpm workspace、`@tdesign-ng/{components,icons,styles,docs}`、GitHub Pages 部署 |
| P1 打样 | ✅ | Button / Link / Divider / Space / Icon |
| P2 基础表单 | ✅ | Input / Textarea / Switch / Checkbox / Radio / Select / Form（含 TDesign rules 校验引擎） |
| P3 弹层与反馈 | ✅ | Popup / Tooltip / Dialog / Drawer / Message / Notification / Loading |
| P4 数据展示 | ✅ | Tag / Badge / Avatar(+Group) / Pagination / Table / Tabs / Collapse / Empty / Progress / List 全部落地，余项见 §8 |
| P5 复杂录入 | ✅ | Slider、Rate、Cascader（两层）、TreeSelect（两层）、DatePicker（八层）、DateRangePicker（四层）、TimePicker（两层）已完成；Upload / Transfer / ColorPicker 转入广度路线 |
| **广度阶段** | ✅ | 2026-11-23 完成：上游 71 个组件目录 100% 覆盖（B1 15 + B2 8 + B3 12 + B4 4），当前 73 个组件目录；进入深度阶段。计划见 `docs/plans/breadth-first-roadmap.md` |

**两个数字要分清**：

- `pnpm gen:api` 统计的是**本仓库现有 API**：99 个组件、1052 个输入属性、301 个示例。
- `node scripts/align-check.mjs` 统计的是**对齐契约**：94 个组件、上游 1576 个属性、已对齐 1001（63.5%），合计 `missing 0 / extra 0`（未实现项都登记在 `ignoreUpstream`）。

组件清单（`packages/ng-components/src/index.ts`，73 条导出）：affix、alert、anchor、auto-complete、avatar、back-top、badge、breadcrumb、button、calendar、card、cascader、checkbox、check-tag、collapse、color-picker、comment、config-provider、date-picker、date-range-picker、descriptions、dialog、divider、drawer、dropdown、empty、form、grid、guide、image、image-viewer、input、input-adornment、input-number、layout、link、list、loading、menu、message、notification、pagination、popconfirm、popup、progress、qrcode、radio、range-input、rate、select、select-input、skeleton、slider、space、statistic、steps、sticky-tool、switch、swiper、table、tabs、tag、tag-input、textarea、time-picker、timeline、tooltip、transfer、tree、tree-select、typography、upload、watermark（含 DateRangePicker 独立实现）。

## 3. 目录与环境

```
packages/ng-components   # 组件库（standalone + module 双出口）
packages/styles          # 上游 less 的单组件入口（脚本生成）+ vendor 快照，随包发布
packages/icons           # TIcon + 内置图标表（脚本生成）
packages/docs            # 文档站（端口 4280）
scripts/                 # gen-api-docs / gen-demo-sources / align-check / gen-icons
packages/styles/vendor/tdesign-common  # 上游样式快照（打进 styles 包，不在仓库根）
docs/plans/breadth-first-roadmap.md  # 当前执行计划：广度优先波次、L1/L2 定义  ← 先读这个
docs/plans/milestones.md             # 里程碑记录（里程碑不打 tag，发布 tag 只对应 npm 版本）
docs/plans/tdesign-angular-plan.md   # 历史分期与实现记录（§14~§22）
```

- Node 22 / pnpm 12 / Angular 19.2 / ng-packagr 19.2，zone CD + `provideZoneChangeDetection({ eventCoalescing: true })`。
- 线上：`https://yuanyong129.github.io/tdesign-ng/`（`base-href=/tdesign-ng/`），push 到 `main` 自动部署；深链接返回 404 状态但能渲染（靠 `404.html`）。

## 4. 常用命令

```bash
pnpm build            # icons → components → docs（改完必跑）
pnpm build:lib        # 只构建组件库（含 ng-packagr 严格检查）
pnpm start            # 文档站 dev server :4280（`pnpm start --port 4301` 可换端口）
pnpm gen:api          # 由 TSDoc 生成 packages/docs/.../api.generated.json
pnpm gen:demos        # 由 demo 源码生成 demo-sources.generated.json
node scripts/align-check.mjs            # 全部组件对齐检查
node scripts/align-check.mjs --component TTable
node scripts/align-check.mjs --json     # 结构化报告（depth-report 的数据源）
node scripts/depth-report.mjs           # D 阶段工作单（按 D1/D2/D3 统计债务）

# 并行开发（多会话）专用
pnpm verify:session                     # gen → .local-cache/api.session.json + tsc + ngc + align-check
pnpm verify:session -- TTable           # 只校验一个组件
pnpm verify                             # integrator 专用：重新 gen 入库生成物 + demos + align + build:lib
node scripts/headless-edge.mjs start    # 起专用 headless Edge（CDP_PORT=9411 换端口）
node scripts/cdp-page.mjs /table        # 页面探针（PORT / CDP_PORT / PROBES / SHOT 环境变量）
node scripts/wire-component.mjs <dir> <ClassStem> "<label>" <group> <afterPath>
```

## 5. 必须遵守的约定

1. **输入属性必须有 `@zh` / `@en` 注释**，否则 `gen-api-docs --check` 会挂；枚举值写 `@values`，默认值写 `@defaultValue`。
2. **不要给组件加 `click` 输出**：`(click)` 会与原生事件重复触发两次（已踩过）。禁用态在内部 `preventDefault + stopPropagation` 拦掉即可。
3. **样式 100% 来自 `vendor/tdesign-common`**，`packages/ng-components/src/bridge.less` 只放两类东西：宿主元素桥接（如 `t-button { display: contents; }`、`t-table { display: block; }`）和上游选择器在 Angular 下失效时的等价规则（每条都要写清原因）。
4. **`align-check` 的哲学**：上游每个未实现的属性都必须在 `ignoreUpstream` 里写一句原因；总量必须保持 `missing 0 / extra 0`。上游没有、我们新增的属性放进 `angularOnly` 并注明理由。
5. **demo 约定**：`packages/docs/src/app/docs/<name>/demos/<name>-xxx.ts`，selector 为 `demo-<name>-<id>`，每个 demo 包在 `<docs-demo id="..." title description>` 里；页面末尾是 `<api-table component="TXxx" />` + `<docs-page-nav current="/xxx" />`。
6. **新增组件要同步**：`index.ts` 导出、`nav.ts` 导航、`app.routes.ts` 懒加载路由、`packages/docs/src/styles.less` 引入组件 less、`scripts/align-check.config/<TXxx>.mjs` 配置、README 组件表（新增组件用 `node scripts/wire-component.mjs` 一次接好前四项）。
7. **未实现的上游属性必须标深度债**：`ignoreUpstream` 的 reason 以 `[D1]`（表格与选择线）/ `[D2]`（录入与反馈线）/ `[D3]`（其余）开头，后接一句"缺什么、为什么"。这既是文档，也是 `scripts/depth-report.mjs` 的输入。
8. **广度期每个组件按 L1 六条交付**（roadmap §2.1）：主干可交互、通用维度齐全、契约完整、文档闭环、`build:lib` + CDP 通过、明确写清允许的欠账。不要用"先占位、以后再补"跳过 demo 与 align-check。
9. **内容入参统一用 `Content`**（`packages/ng-components/src/_utils/content.ts`）：`export type Content = string | TemplateRef<unknown> | undefined;`。组件可以保留自己的别名（`export type CardContent = Content;`）以便 API 文档显示专有名，但**不要**再各写一份 `string | TemplateRef<unknown> | undefined`。判空用 `isContentEmpty()`，判模板用 `isTemplateContent()`（鸭子类型，避免多份 Angular 运行时 `instanceof` 误判），降级文案用 `contentText()`。
10. **弹层组件的 `popupProps` 统一走 `PopupOptions`**（`packages/ng-components/src/components/popup/popup.types.ts`）：组件内用 `mergePopupOptions(passthrough)` 展开，**自己暴露的显式属性（`placement`/`showArrow`/`destroyOnClose` 等）优先级最高**，其次才是 `popupProps` 里的同名键；合并类名用 `mergePopupClassNames('t-xxx', passthrough.overlayClassName)`，绑定到 `TPopup` 时记得 `?? null`（`overlayClassName` 的输入类型不含 `undefined`，strictTemplates 会报 TS2322）。`PopupOptions` 刻意不含 `attach`/`overlayStyle`/`popperOptions`/`triggerElement`，不要偷偷收下无法生效的键。

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

## 7. 当前进行中的工作：深度阶段 D0（广度已完成）

2026-11-23 起路线为**广度优先**（先把上游 71 个组件目录补齐到 L1 可用基线），现已全部完成，转入**深度阶段**：D0 横切工程 → D1 表格与选择线 → D2 录入与反馈线 → D3 其余。完整计划见 [`docs/plans/breadth-first-roadmap.md`](./docs/plans/breadth-first-roadmap.md)。

**广度完成（100%）**：

- **B0 基建**：`align-check --json`（`ignored[]` 带 `inUpstream`）、`scripts/depth-report.mjs`（`pnpm depth:report`）按 `[D1]/[D2]/[D3]` 聚合债务、`scripts/wire-component.mjs` 一键接线。
- **B1 布局与静态展示 15/15**：Layout/Header/Aside/Content/Footer、Row/Col、Card、Alert、Skeleton、Typography（Text/Title/Paragraph）、Breadcrumb(+Item)、Steps(+Item)、Descriptions(+Item)、Comment、Timeline(+Item)、Statistic、StickyTool、Affix、BackTop。
- **B2 弹层与媒体 8/8**：Popconfirm、Dropdown(+Item)、Guide、Image、ImageViewer、Anchor(+Item)、QRCode（可选 peer 依赖 `qrcode`）、Watermark；新增横切组件 **ConfigProvider**（`TConfigService` 暴露 `config` signal，二维码文案已接入）。
- **B3 录入补全 12/12**：InputAdornment、SelectInput、TagInput、RangeInput、InputNumber、AutoComplete、Calendar、ColorPicker、Swiper、CheckTag(+Group)、ConfigProvider。
- **B4 重型 4/4**：Tree（`load` 懒加载、父子和半选、`[tTreeLabel]` 等模板指令）、Menu（合并 TMenu/THeadMenu 为 `mode`、子菜单复用 `t-popup`）、Transfer（`targetValue` 双向绑定、`oneWay`、两侧搜索）、Upload（`model()` 的 `[(files)]`、XHR 真实进度、`requestMethod` 自定义上传）。

**广度验收（2026-11-23 实测）**：`tsc` / `ngc` / `build:lib` 干净；`gen:api` 99 个组件、1052 个输入属性、301 个示例；`align-check` 94 个组件、上游 1576 个属性、已对齐 1001（63.5%）、`missing 0 / extra 0`；73 个组件目录与 73 条 barrel 导出；每个新增页面均本地 CDP 实拍（0 console error / 0 4xx）。

**当前债务基线（`pnpm depth:report`）**：真实欠账 **298** 项——D1 180（60.4%）、D2 71（23.8%）、D3 47（15.8%），显式 `[D#]` 前缀 82 项。债务头部：`TTable` 62 上游 / 19 已对齐（30.6%，D1 41）、`TCascader` 53 / 21（D1 26）、`TSelect` 55 / 20（D1 22）。

**下一步：D0 横切工程（1~2 周，先做）**

| 主题 | 目标 | 落点 |
| --- | --- | --- |
| TNode 模板化 | `content`/`title`/`label` 等从「字符串或 TemplateRef」收口到统一的 `Content` 类型 + 渲染指令 | ✅ `_utils/content` 已落地，23 个组件别名已统一；渲染指令（`tContent`）尚未抽出 |
| `*Props` 透传 | `popupProps`/`inputProps`/`treeProps` 等上游透传对象 | `PopupOptions` + `mergePopupOptions` 已落地，Popconfirm / Dropdown / Cascader 已接入（其他弹层组件按同一模式补）；`inputProps` 等其余透传未做 |
| 受控/非受控统一 | `[(value)]`、`model()` 与 `value`/`defaultValue` 三件套行为一致 | 逐个组件核对 + 回归探针 |
| SSR 与 a11y | `isPlatformBrowser` 守卫、`aria-*` 补齐 | `TIcon` 的 `DOMParser` 首修 |
| 单测 | 引入 Vitest，先覆盖 `_utils` 与 5 个纯逻辑组件 | `pnpm test` + CI |
| i18n | 把内建中文常量收进 ConfigProvider | 从 QRCode/Calendar/Upload 开始 |

**待拍板**：

- ColorPicker 渐变面板与吸管（`[D3]`，依赖渐变编辑器工作量）；
- 深度期是否引入 Vitest（当前单测为 0，靠 CDP 探针 + strictTemplates）；
- Upload 自定义请求是否需要 `HttpClient`（当前 XHR，零依赖）；
- `@angular/router` 是否作为 peer 依赖（Menu/Tree 的 `to`/`routerLink` 需要它）。

**并行开发（2026-11-24 起）**：深度阶段按组件分给多个会话并行做。开工前读 [`docs/plans/depth-parallel-plan.md`](./docs/plans/depth-parallel-plan.md)：§2 冲突面与 owner、§3 D0-lite 状态（配置拆分 / 工具入库 / 生成物隔离 / `Content` 与 `popupProps` 契约均已完成）、§4 七条线、§5 可直接粘给新会话的 brief、§6 单组件验收清单、§7 integrator 固定动作。

三条硬阻塞已解决，会话之间不会互相踩：

1. **`align-check` 配置单文件冲突** → 已拆成 `scripts/align-check.config/<Component>.mjs`，每个会话只改自己那 1~2 个文件。
2. **生成物冲突** → `gen-api-docs.mjs` 支持 `API_OUT`、`align-check.mjs` 支持 `API_FILE`；会话用 `pnpm verify:session` 写 `.local-cache/api.session.json`，不入库文件保持不变，由 integrator 跑 `pnpm verify` 统一覆盖。
3. **探针脚本只在 `.local-cache`（gitignore）** → `scripts/cdp-page.mjs`、`scripts/wire-component.mjs`、`scripts/headless-edge.mjs` 已入库；每个会话用独立 `PORT=43xx` / `CDP_PORT=94xx` 并存。

仍需 integrator 独占的文件：`packages/ng-components/src/index.ts`、`bridge.less`、`nav.ts`、`app.routes.ts`、`packages/docs/src/styles.less`、`*.generated.json`、`README.md`、`HANDOFF.md`、`docs/plans/**`、根 `package.json`。

## 8. 已知缺口与技术债

- **完整缺口清单与深度分批见 `docs/plans/breadth-first-roadmap.md` §1.3 / §4.2**；本节只记跨组件的共性问题。新登记的未实现属性请按 §5 第 7 条补 `[D1]/[D2]/[D3]` 前缀。
- **富内容一律走模板**：Message/Notification 的内容还是纯字符串；Table 单元格目前支持 `cell` 函数返回字符串 + `tTableCell` 模板，二者不要混用。
- **没有单测**：组件全靠 CDP 行为验证 + `align-check` 契约验证；Vitest 迁移仍未开始。
- **Icon SSR**：`TIcon` 用 `DOMParser`，未做 `isPlatformBrowser` 分支。
- **未实现的上游能力**（均已在 `align-check` 写明原因）：Dialog 的 `draggable`/`confirmOnEnter`/`beforeOpen`/`beforeClose`；Loading 的 `indicator`/`attach`；Avatar 的 `imageProps`；AvatarGroup 折叠头像的弹层列表；CheckTag / CheckTagGroup；Pagination 的 `simple` 形态只有「当前页/总页数」；Tabs 的 `action`（自定义操作区）与 `list`（数据驱动面板）未实现；Collapse 的 `expandIcon` 只接受 `boolean | TemplateRef`，不接受上游的渲染函数；Empty 的 `image` 只接受 URL 字符串（不支持 ImageProps），`title` / `description` 为字符串（不支持 TNode）；Progress 的 `label` 只接受 `string | boolean`（不支持 TNode），`plump` 的 over/under 用 `percentage >= 10` 近似（未做逐像素测量），circle 状态图标沿用填充图标（上游是细线图标）；List 的 `scroll`（虚拟滚动）未实现，`asyncLoading` 不支持模板，`(scrollChange)` 原样透出没有节流。；Slider 的 `inputNumberProps`（两侧数字输入框）与 `tooltipProps` 透传未实现，键盘只支持方向键 / Home / End；Rate 的自定义 `icon` 未实现（固定内置星形），`showText` 不提供每颗星的悬浮 tooltip。Cascader 的 `valueType`、`minCollapsedNum` / `collapsedItems`（多选折叠）、`columnHeader` / `columnFooter`、`option`（自定义选项渲染）、`checkProps` 与各类 `*Props` 透传、`trigger="hover"`、受控 `popupVisible`、`readonly` / `borderless` / `status` / `tips` / 前后缀图标均未实现；`filter` 只能是同步函数（上游允许 Promise）。TreeSelect 的 `collapsedItems`（折叠标签的自定义内容，目前用内置 +N）、`valueDisplay`、`inputProps` / `selectInputProps` / `popupProps` 透传、受控 `popupVisible`、`autoWidth` / `borderless` / `readonly`、`suffix` / `suffixIcon` 与失焦/聚焦事件未实现；`treeProps` 目前只支持 `checkStrictly` / `valueMode` / `expandAll`，其余 Tree 能力（拖拽、虚拟滚动、懒加载、自定义图标/标签、`checkProps`）未透传。DatePicker 的 `mode` 已支持 date / week / month / quarter / year，但 week 的值格式用 `YYYY-[W]WW`（上游 dayjs 为 `gggg-wo`，依赖 weekOfYear 插件与本地化），`multiple` 已支持但与 `enableTimePicker` 互斥、在 week / quarter 模式下仍按整周/整季提交；未实现 `disableTime` / `timePickerProps` 与各类 `*Props` 透传；`cell` / `valueDisplay` 已支持但只接受返回字符串的回调（上游支持 `TNode`）、`borderless` / `readonly` / `status` / `tips` / `label`。DateRangePicker 未实现 `disableTime` / `timePickerProps`、`mode`、`panelActiveDate`、`panelPreselection` / `cancelRangeSelectLimit`、`cell` / `valueDisplay`、`prefixIcon` / `suffixIcon` 与 `inputProps` / `rangeInputProps` / `selectInputProps` / `popupProps` 透传、打开/关闭/失焦/聚焦事件。TimePicker 未实现 `t-time-range-picker`（区间）、`borderless` / `readonly` / `status` / `tips` / `label`、`suffixIcon` 替换与 `inputProps` / `selectInputProps` / `popupProps` 透传、打开 / 关闭 / 失焦 / 聚焦事件。
- **文档站外壳已对齐官网（2026-11）**：`packages/docs/src/app/app.component.ts` 是整站外壳（64px 顶栏 + 搜索触发器 + 明暗主题 + 260px 侧栏 + 780px 正文 + 右侧 TOC + 页脚）；`docs/docs-toc.ts` 从 `.demo` / `.docs-section__title` 自动生成锚点；`docs/docs-search.ts` 是基于 `DOCS_NAV` 的客户端搜索（⌘/Ctrl+K）；`docs/docs.less` 统一页面与示例卡片样式；`demo-block.ts` 的示例卡片改为「标题/说明在卡片外 + 40px 舞台 + 48px 图标操作栏」。主题存 `localStorage['tdesign-docs-theme']`，`index.html` 有首屏内联脚本防闪烁。
- **文档站仍未做**：示例 / API / 指南 分段 tab（页面是单页滚动，加 tab 需要改 73 个页面，属页面 owner 范围，目前靠右侧 TOC 导航）；中英切换；示例右上角的「配置」面板。
- **文档站初始包 790 kB** 超过 `packages/docs/angular.json` 的 500 kB 警告线（主要是 `qrcode` 与全量 vendor 样式），只是警告、不阻塞构建。

## 9. 怎么验证一个改动

**单个会话（并行开发）**：一条命令搞定，不污染入库生成物。

1. `pnpm verify:session -- TTable`：内部依次 gen 到 `.local-cache/api.session.json`、`tsc`（库源码）、`ngc`（文档站 strictTemplates）、`align-check`（读会话生成物）。必须全绿，`missing 0 / extra 0`。
2. 本地实拍（另开终端）：`PORT=4301 pnpm start` → `CDP_PORT=9411 node scripts/headless-edge.mjs start` → `PORT=4301 CDP_PORT=9411 SHOT=1 node scripts/cdp-page.mjs /table`。检查 title / demos / apiRows / `issues: []` / `badResources: []`；`PROBES=".t-table,.t-table__body"` 可统计选择器命中数，截图落在 `.local-cache/page-*.png`。
3. 结束前 `CDP_PORT=9411 node scripts/headless-edge.mjs kill`（只杀自己 profile 的实例）。

**integrator（合并会话后）**：

1. `pnpm verify`：`gen:api`（覆盖入库的 `api.generated.json`）+ `check:demos` + `check:align` + `build:lib`。
2. 文档站全路由巡检：`node scripts/qa-routes.mjs`（默认 `http://localhost:4280` + CDP 9341），`--width=390` 查移动端，`--routes=/button,/table` 只跑指定路由；判据是标题存在、无横向滚动、有示例就有 TOC、无 console 异常。
3. 线上验证：`PAGE_BASE=https://yuanyong129.github.io/tdesign-ng node scripts/cdp-page.mjs /card`。推送到 main 后 GitHub Pages 约 1~2 分钟生效。
4. 环境说明（2026-11-23 起）：DSH 会话为 `danger-full-access`，`pnpm build`/`ng serve`/管道子进程/`git push`/headless Edge 均可直接运行，不再需要绕 EPERM。






