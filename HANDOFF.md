# 交接文档 · TDesign Angular

> 面向「下一个接手这个仓库的会话」。读完这份文档，应该能直接继续开发，而不需要重新调研环境。
> 更新日期：2026-11-22，对应提交：DatePicker 第七层（range 可选范围）之后。

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
| P5 复杂录入 | 🚧 | Slider、Rate、Cascader（两层）、TreeSelect（两层）、DatePicker（七层）、DateRangePicker（四层）、TimePicker（两层）已完成；Upload / Transfer / ColorPicker 未开始 |

当前 `align-check` 覆盖 **43 个组件、492 个输入属性、187 个示例**，合计 `missing 0 / extra 0`（`TCascader 已对齐 21/53`、`TTreeSelect 已对齐 20/44`、`TDatePicker 已对齐 18/44`、`TDateRangePicker 已对齐 23/44`、`TTimePicker 已对齐 12/33`）。

组件清单（`packages/ng-components/src/index.ts`）：avatar、badge、button、cascader、checkbox、collapse、date-picker、date-range-picker、dialog、divider、drawer、empty、form、input、link、list、loading、message、notification、pagination、popup、progress、radio、rate、select、slider、space、switch、table、tabs、tag、textarea、time-picker、tooltip、tree-select。

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

## 7. 当前进行中的工作：DatePicker 第七层（已完成）

DatePicker 前六层已提交：单日期 + 输入/清空/尺寸、面板翻页与快捷预设、时间模式与 `needConfirm`、`mode` 月份/年份（`ce33e6d`）、`mode` 周/季度（`cdb84f5` + `9043574`）、`cell` / `valueDisplay` 自定义（`4723a3e`）。本层补上「可选范围」限制。

**已完成（第七层）**：

- **`range`**：`input<DatePickerRange | undefined>`，类型 `DateValue[] | ((date: DateValue) => boolean)`（与上游 `PickerDateRange` 一致）。
  - 数组形式取前两个值作为 `[start, end]` 窗口，窗口外（含 start/end 之外）一律不可选；缺省一端表示不限。
  - 函数形式按日期判断是否可选：返回 `false` 的日期禁用，与上游「`allow(date)` 取反」一致；入参是该格格式化后的值。
- 实现拆成 `isCellDisabled()`（禁用状态 → `disableDate` → `range`）与两个私有方法 `isCellDisabledByDisableDate()` / `isCellOutOfRange()`，`disableDate` 与 `range` 可以叠加。
- 因为所有选择路径（日期格、周行、季度格、手输 Enter、预设）都走 `isCellDisabled`，窗口外的输入与预设也会被拒绝。
- `scripts/align-check.mjs` 从 `TDatePicker` 的 `ignoreUpstream` 移除 `range`（DateRangePicker 的 `range` 是另一套语义，仍保留）。

**已用 CDP 验证**（`http://localhost:4280/date-picker`，`date-picker-range` demo）：

- 数组窗口 `['2024-05-10','2024-05-20']`：面板里 5 月 9 日与 21 日及之外全部 `t-date-picker__cell--disabled`，15 日可选。
- 函数形式（只允许周一至周五）：11 月面板里 1/7/8/14/15/21/22/28/29 这些周末格禁用，其余 21 个工作日可选。
- `align-check` 合计 `missing 0 / extra 0`（`TDatePicker 已对齐 21/44`）；`gen:api` 43 组件 / 492 属性，`gen:demos` 187 示例；`consoleErrors` 为空。

**下一步（建议顺序）**：

1. DatePicker 余项：`multiple`（多选与标签回显）、`disableTime` / `timePickerProps`、`label` / `tips` / `status` / `borderless` / `readonly` 与各类 `*Props` 透传。
2. DateRangePicker 余项：`disableTime` / `timePickerProps`、`mode`、`panelActiveDate`、`panelPreselection` / `cancelRangeSelectLimit`、`cell` / `valueDisplay`、`prefixIcon` / `suffixIcon` 与各类 `*Props` 透传。
3. 继续 P5：Upload / Transfer / ColorPicker。
4. TimePicker / TreeSelect / Cascader 余项见 §8。

## 8. 已知缺口与技术债

- **富内容一律走模板**：Message/Notification 的内容还是纯字符串；Table 单元格目前支持 `cell` 函数返回字符串 + `tTableCell` 模板，二者不要混用。
- **没有单测**：组件全靠 CDP 行为验证 + `align-check` 契约验证；Vitest 迁移仍未开始。
- **Icon SSR**：`TIcon` 用 `DOMParser`，未做 `isPlatformBrowser` 分支。
- **未实现的上游能力**（均已在 `align-check` 写明原因）：Dialog 的 `draggable`/`confirmOnEnter`/`beforeOpen`/`beforeClose`；Loading 的 `indicator`/`attach`；Avatar 的 `imageProps`；AvatarGroup 折叠头像的弹层列表；CheckTag / CheckTagGroup；Pagination 的 `simple` 形态只有「当前页/总页数」；Tabs 的 `action`（自定义操作区）与 `list`（数据驱动面板）未实现；Collapse 的 `expandIcon` 只接受 `boolean | TemplateRef`，不接受上游的渲染函数；Empty 的 `image` 只接受 URL 字符串（不支持 ImageProps），`title` / `description` 为字符串（不支持 TNode）；Progress 的 `label` 只接受 `string | boolean`（不支持 TNode），`plump` 的 over/under 用 `percentage >= 10` 近似（未做逐像素测量），circle 状态图标沿用填充图标（上游是细线图标）；List 的 `scroll`（虚拟滚动）未实现，`asyncLoading` 不支持模板，`(scrollChange)` 原样透出没有节流。；Slider 的 `inputNumberProps`（两侧数字输入框）与 `tooltipProps` 透传未实现，键盘只支持方向键 / Home / End；Rate 的自定义 `icon` 未实现（固定内置星形），`showText` 不提供每颗星的悬浮 tooltip。Cascader 的 `valueType`、`minCollapsedNum` / `collapsedItems`（多选折叠）、`columnHeader` / `columnFooter`、`option`（自定义选项渲染）、`checkProps` 与各类 `*Props` 透传、`trigger="hover"`、受控 `popupVisible`、`readonly` / `borderless` / `status` / `tips` / 前后缀图标均未实现；`filter` 只能是同步函数（上游允许 Promise）。TreeSelect 的 `collapsedItems`（折叠标签的自定义内容，目前用内置 +N）、`valueDisplay`、`inputProps` / `selectInputProps` / `popupProps` 透传、受控 `popupVisible`、`autoWidth` / `borderless` / `readonly`、`suffix` / `suffixIcon` 与失焦/聚焦事件未实现；`treeProps` 目前只支持 `checkStrictly` / `valueMode` / `expandAll`，其余 Tree 能力（拖拽、虚拟滚动、懒加载、自定义图标/标签、`checkProps`）未透传。DatePicker 的 `mode` 已支持 date / week / month / quarter / year，但 week 的值格式用 `YYYY-[W]WW`（上游 dayjs 为 `gggg-wo`，依赖 weekOfYear 插件与本地化），未实现 `multiple`（多选）、`disableTime` / `timePickerProps` 与各类 `*Props` 透传；`cell` / `valueDisplay` 已支持但只接受返回字符串的回调（上游支持 `TNode`）、`borderless` / `readonly` / `status` / `tips` / `label`。DateRangePicker 未实现 `disableTime` / `timePickerProps`、`mode`、`panelActiveDate`、`panelPreselection` / `cancelRangeSelectLimit`、`cell` / `valueDisplay`、`prefixIcon` / `suffixIcon` 与 `inputProps` / `rangeInputProps` / `selectInputProps` / `popupProps` 透传、打开/关闭/失焦/聚焦事件。TimePicker 未实现 `t-time-range-picker`（区间）、`borderless` / `readonly` / `status` / `tips` / `label`、`suffixIcon` 替换与 `inputProps` / `selectInputProps` / `popupProps` 透传、打开 / 关闭 / 失焦 / 聚焦事件。
- **文档站**：无搜索、无中英切换、无右侧锚点导航；示例卡片视觉可再贴近官网。

## 9. 怎么验证一个改动

1. `node scripts/gen-api-docs.mjs && node scripts/gen-demo-sources.mjs`（有新增输入/示例时）。
2. `node scripts/align-check.mjs` 必须 `missing 0 / extra 0`。
3. `pnpm build` 全绿。
4. 用 `.local-cache/` 下的 CDP 脚本模板（如 `cdp-check-table2.mjs`）打开对应路由，断言 DOM 类名、文本、交互后的状态与 `consoleErrors`。
5. `node .local-cache/cdp-check-live.mjs https://yuanyong129.github.io/tdesign-ng/<route>` 验证线上页面。






