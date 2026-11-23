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
| **广度阶段** | 🚧 | 2026-11-23 起：先补齐上游 71 个组件目录（当前 72 个组件目录，B1 的 15 项、B2 的 8 项与 B3 的 12 项已全部落地），再回填深度。计划见 `docs/plans/breadth-first-roadmap.md` |

**两个数字要分清**：

- `pnpm gen:api` 统计的是**本仓库现有 API**：92 个组件、940 个输入属性、289 个示例。
- `node scripts/align-check.mjs` 统计的是**对齐契约**：87 个组件、上游 1403 个属性、已对齐 896（63.9%），合计 `missing 0 / extra 0`（未实现项都登记在 `ignoreUpstream`）。

组件清单（`packages/ng-components/src/index.ts`，69 条导出）：affix、alert、anchor、auto-complete、avatar、back-top、badge、breadcrumb、button、calendar、card、cascader、checkbox、check-tag、collapse、color-picker、comment、config-provider、date-picker、date-range-picker、descriptions、dialog、divider、drawer、dropdown、empty、form、grid、guide、image、image-viewer、input、input-adornment、input-number、layout、link、list、loading、message、notification、pagination、popconfirm、popup、progress、qrcode、radio、range-input、rate、select、select-input、skeleton、slider、space、statistic、steps、sticky-tool、switch、swiper、table、tabs、tag、tag-input、textarea、time-picker、timeline、tooltip、tree-select、typography、watermark（含 DateRangePicker 独立实现）。

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

## 7. 当前进行中的工作：广度优先 B4

2026-11-23 起路线改为**广度优先**：先把上游 71 个组件目录补齐到 L1 可用基线，再回填深度。完整计划见 [`docs/plans/breadth-first-roadmap.md`](./docs/plans/breadth-first-roadmap.md)。

**已完成（B0~B3）**：

- **B0 基建**：`scripts/align-check.mjs` 支持 `--json`（`ignored[]` 带 `inUpstream` 区分真上游属性与插槽/事件映射）；新增 `scripts/depth-report.mjs`（`pnpm depth:report`）按 `[D1]/[D2]/[D3]` 聚合债务。
- **B1 布局与静态展示 15/15**：Layout/Header/Aside/Content/Footer、Row/Col、Card、Alert、Skeleton、Typography（Text/Title/Paragraph）、Breadcrumb(+Item)、Steps(+Item)、Descriptions(+Item)、Comment、Timeline(+Item)、Statistic、StickyTool、Affix、BackTop。
- **B2 弹层与媒体 8/8**：Popconfirm、Dropdown(+Item)、Guide、Image、ImageViewer、Anchor(+Item)、QRCode（可选 peer 依赖 `qrcode`）、Watermark；新增横切组件 **ConfigProvider**（`TConfigService` 暴露 `config` signal，二维码文案已接入）。
- **B3 录入补全 12/12**：InputAdornment、SelectInput、TagInput、RangeInput、InputNumber、AutoComplete、Calendar、ColorPicker、Swiper、CheckTag(+Group)、ConfigProvider。

**当前债务基线（2026-11-23，`pnpm depth:report`）**：上游 1403 props，已对齐 896（63.9%）；未实现 507 项里 253 项是 Angular 惯用映射（插槽/双向绑定/事件名，不算债），**真实欠账 254 项**：D1 166（65.4%）、D2 48（18.9%）、D3 40（15.7%）。显式 `[D#]` 前缀 38 项。

**下一步：B4 重型组件（4 项 / 184 props）**

| 组件 | 上游 | 第一层（必须） | 第二层（可后置） |
| --- | ---: | --- | --- |
| Tree | 50 | 展开/选中/勾选、父子联动、禁用、异步加载、自定义节点模板 | 拖拽、虚拟滚动、懒加载大数据 |
| Menu | 45 | 递归菜单、展开/收起、选中、子菜单弹层 | 折叠态、键盘导航、主题 |
| Transfer | 26 | 双列表、勾选、搜索、移动 | 树形穿梭、分页、拖拽排序 |
| Upload | 63 | 选择/拖拽、文件列表、进度、删除、自定义请求 | 图片预览、多选、目录、失败重试 |

顺序：Tree 优先（TreeSelect 深度工作依赖抽出公共核心）→ Menu → Transfer → Upload。

**每波收尾固定动作**：`gen:api` → `gen:demos` → `align-check`（missing/extra 必须 0）→ `tsc` → `ngc -p packages/docs/tsconfig.json` → `build:lib` → 本地 dev server + `cdp-page.mjs` 实拍 → 同步 README/HANDOFF/roadmap → 提交推送。

**待拍板**：

- ColorPicker 渐变面板与吸管（`[D3]`，依赖渐变编辑器工作量）；
- 广度期不引 Vitest（组件交互目前靠 CDP 探针 + strictTemplates 校验）；
- Upload 自定义请求是否需要 `HttpClient` 依赖。

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






