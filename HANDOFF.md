# 交接文档 · TDesign Angular

> 面向「下一个接手这个仓库的会话」。读完这份文档，应该能直接继续开发，而不需要重新调研环境。
> 更新日期：2026-11-21，对应提交：Cascader 第二层（多选 / 搜索 / 异步加载 / 插槽）之后。

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
| P5 复杂录入 | 🚧 | Slider、Rate、Cascader 已完成（Cascader 已到第二层）；TreeSelect / DatePicker / TimePicker / Upload / Transfer / ColorPicker 未开始 |

当前 `align-check` 覆盖 **39 个组件、415 个输入属性、163 个示例**，合计 `missing 0 / extra 0`（`TCascader 已对齐 21/53`）。

组件清单（`packages/ng-components/src/index.ts`）：avatar、badge、button、cascader、checkbox、collapse、dialog、divider、drawer、empty、form、input、link、list、loading、message、notification、pagination、popup、progress、radio、rate、select、slider、space、switch、table、tabs、tag、textarea、tooltip。

## 3. 目录与环境

```
packages/ng-components   # 组件库（standalone + module 双出口）
packages/styles          # 上游 less 的单组件入口（脚本生成）
packages/icons           # TIcon + 内置图标表（脚本生成）
packages/docs            # 文档站（端口 4280）
scripts/                 # gen-api-docs / gen-demo-sources / align-check / gen-icons
vendor/tdesign-common    # 上游样式快照
docs/plans/tdesign-angular-plan.md   # 分阶段计划与实现记录（§14~§20）
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
```

## 5. 必须遵守的约定

1. **输入属性必须有 `@zh` / `@en` 注释**，否则 `gen-api-docs --check` 会挂；枚举值写 `@values`，默认值写 `@defaultValue`。
2. **不要给组件加 `click` 输出**：`(click)` 会与原生事件重复触发两次（已踩过）。禁用态在内部 `preventDefault + stopPropagation` 拦掉即可。
3. **样式 100% 来自 `vendor/tdesign-common`**，`packages/ng-components/src/bridge.less` 只放两类东西：宿主元素桥接（如 `t-button { display: contents; }`、`t-table { display: block; }`）和上游选择器在 Angular 下失效时的等价规则（每条都要写清原因）。
4. **`align-check` 的哲学**：上游每个未实现的属性都必须在 `ignoreUpstream` 里写一句原因；总量必须保持 `missing 0 / extra 0`。上游没有、我们新增的属性放进 `angularOnly` 并注明理由。
5. **demo 约定**：`packages/docs/src/app/docs/<name>/demos/<name>-xxx.ts`，selector 为 `demo-<name>-<id>`，每个 demo 包在 `<docs-demo id="..." title description>` 里；页面末尾是 `<api-table component="TXxx" />` + `<docs-page-nav current="/xxx" />`。
6. **新增组件要同步**：`index.ts` 导出、`nav.ts` 导航、`app.routes.ts` 懒加载路由、`packages/docs/src/styles.less` 引入组件 less、`scripts/align-check.mjs` 配置、README 组件表。

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

## 7. 当前进行中的工作：Cascader 第二层（已完成）

Cascader 第一层（单选 / 回显 / 尺寸 / 禁用 / 清空）已提交（`2ea133c`）；本层补齐多选、搜索、异步加载与插槽，已提交并验证。

**已完成**：

- **多选**：`multiple` + 复选框面板；标签回显（`t-tag`）、单个删除、清空；`t-cascader--multiple` / `t-select-input--multiple` / `t-tag-input` DOM 对齐上游；面板复选框状态（`t-is-checked` / `t-is-indeterminate`）与 `valueMode`（`onlyLeaf` / `parentFirst` / `all`）联动；`checkStrictly` 父子不关联；`max` 到达上限后未选项禁用。
- **`cascader-tree.ts`**：把 `options` 展开成 `CascaderNode`（带 `path` / `pathNodes` / `parent` / `children`），并缓存每个节点的叶子列表；选中、展开、多选推导都基于这份索引，不再线性 `findPath`。
- **搜索**：`filterable` 输入关键字后面板切成 `t-cascader__menu--filter` 扁平列表；默认匹配完整路径（`广东省/深圳市/南山区`），`filter(keyword, option)` 可替换匹配规则；命中片段用 `t-cascader__item-label--filter` 高亮；`reserveKeyword` 控制选中后是否保留关键字；打开面板时清空关键字。
- **异步加载**：`lazy`（默认 true）+ `load(option): Promise<CascaderOption[]>`；展开时右箭头换成 `t-loading` 小环，返回子节点后合并进 `options`（不改原数组）；返回空数组视为叶子并直接完成本次选择；`option.isLeaf` / `option.leaf` 可显式跳过 load。
- **加载态**：`loading` + `loadingText`，面板显示 `t-cascader__panel--empty` 文案，后缀图标换成加载环。
- **插槽**：`<ng-template tCascaderPanelTop>` / `tCascaderPanelBottom` 渲染在面板上下；`<ng-template tCascaderValueDisplay let-value let-selected="selectedOptions" let-onClose="onClose">` 替换默认回显（单选的模板显示在输入框前缀，多选替换标签区）。三个指令随 `TCascaderModule` 一起导出。
- **DOM 修正**：节点文字类名改为上游的 `t-cascader__item-label`（原先是 `t-cascader__label`）；菜单 / 条目改为 `ul` / `li`；单选时展开路径整条高亮（`t-is-selected`）。

**已用 CDP 验证**（`http://localhost:4280/cascader`，7 个 demo）：

- 多选：`[nanshan, futian]` 初始值 → 深圳市全选、广东省半选（`t-is-indeterminate`）；勾选天河区 → `[nanshan, futian, tianhe]`；勾选广州市父节点 → 连带越秀区；取消深圳市 → 两条被移除；清空后面板收起、`t-tag-input t-is-empty`。
- `checkStrictly`：勾选深圳市后子节点保持未勾选；`valueMode="parentFirst"`：勾选深圳市父节点得到 `[shenzhen]`。
- 搜索：输入「南山」得到 1 条 `广东省/深圳市/南山区` 且「南山」高亮；选中后输入框回显完整路径；重新打开回到 3 列面板且关键字已清空；自定义 `filter` 搜「深圳」无结果（空态"暂无数据"）、搜「福田」命中。
- 异步加载：点广东省 120ms 后出现 `t-cascader__item-icon t-loading`，900ms 后多出第二列；点深圳市直接选中并收起面板。`loading=true` 时面板显示「正在加载选项…」，切回后面板恢复。
- 插槽：面板顶部 / 底部文案都在；自定义回显显示「深圳市 / 广州市」两个标签，点 × 后值变为 `guangzhou`，底部计数同步为 1。
- 单选回归：回显、逐级选择、清空、`showAllLevels`、`keys` 自定义字段、尺寸、禁用（点击不展开）全部正常；`consoleErrors` 为空。

**下一步（建议顺序）**：

1. 继续 P5：TreeSelect / DatePicker / TimePicker / Upload / Transfer / ColorPicker。
2. Cascader 余项见 §8（`valueType`、多选折叠、列头列尾、`option` 自定义渲染、各类透传 props）。

## 8. 已知缺口与技术债

- **富内容一律走模板**：Message/Notification 的内容还是纯字符串；Table 单元格目前支持 `cell` 函数返回字符串 + `tTableCell` 模板，二者不要混用。
- **没有单测**：组件全靠 CDP 行为验证 + `align-check` 契约验证；Vitest 迁移仍未开始。
- **Icon SSR**：`TIcon` 用 `DOMParser`，未做 `isPlatformBrowser` 分支。
- **未实现的上游能力**（均已在 `align-check` 写明原因）：Dialog 的 `draggable`/`confirmOnEnter`/`beforeOpen`/`beforeClose`；Loading 的 `indicator`/`attach`；Avatar 的 `imageProps`；AvatarGroup 折叠头像的弹层列表；CheckTag / CheckTagGroup；Pagination 的 `simple` 形态只有「当前页/总页数」；Tabs 的 `action`（自定义操作区）与 `list`（数据驱动面板）未实现；Collapse 的 `expandIcon` 只接受 `boolean | TemplateRef`，不接受上游的渲染函数；Empty 的 `image` 只接受 URL 字符串（不支持 ImageProps），`title` / `description` 为字符串（不支持 TNode）；Progress 的 `label` 只接受 `string | boolean`（不支持 TNode），`plump` 的 over/under 用 `percentage >= 10` 近似（未做逐像素测量），circle 状态图标沿用填充图标（上游是细线图标）；List 的 `scroll`（虚拟滚动）未实现，`asyncLoading` 不支持模板，`(scrollChange)` 原样透出没有节流。；Slider 的 `inputNumberProps`（两侧数字输入框）与 `tooltipProps` 透传未实现，键盘只支持方向键 / Home / End；Rate 的自定义 `icon` 未实现（固定内置星形），`showText` 不提供每颗星的悬浮 tooltip。Cascader 的 `valueType`、`minCollapsedNum` / `collapsedItems`（多选折叠）、`columnHeader` / `columnFooter`、`option`（自定义选项渲染）、`checkProps` 与各类 `*Props` 透传、`trigger="hover"`、受控 `popupVisible`、`readonly` / `borderless` / `status` / `tips` / 前后缀图标均未实现；`filter` 只能是同步函数（上游允许 Promise）。
- **文档站**：无搜索、无中英切换、无右侧锚点导航；示例卡片视觉可再贴近官网。

## 9. 怎么验证一个改动

1. `node scripts/gen-api-docs.mjs && node scripts/gen-demo-sources.mjs`（有新增输入/示例时）。
2. `node scripts/align-check.mjs` 必须 `missing 0 / extra 0`。
3. `pnpm build` 全绿。
4. 用 `.local-cache/` 下的 CDP 脚本模板（如 `cdp-check-table2.mjs`）打开对应路由，断言 DOM 类名、文本、交互后的状态与 `consoleErrors`。
5. `node .local-cache/cdp-check-live.mjs https://yuanyong129.github.io/tdesign-ng/<route>` 验证线上页面。





