# 交接文档 · TDesign Angular

> 面向「下一个接手这个仓库的会话」。读完这份文档，应该能直接继续开发，而不需要重新调研环境。
> 更新日期：2026-11-21，对应提交：TreeSelect 第一层（单选 / 展开 / 面板插槽）之后。

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
| P5 复杂录入 | 🚧 | Slider、Rate、Cascader（两层）、TreeSelect（第一层）已完成；DatePicker / TimePicker / Upload / Transfer / ColorPicker 未开始 |

当前 `align-check` 覆盖 **40 个组件、427 个输入属性、167 个示例**，合计 `missing 0 / extra 0`（`TCascader 已对齐 21/53`、`TTreeSelect 已对齐 12/44`）。

组件清单（`packages/ng-components/src/index.ts`）：avatar、badge、button、cascader、checkbox、collapse、dialog、divider、drawer、empty、form、input、link、list、loading、message、notification、pagination、popup、progress、radio、rate、select、slider、space、switch、table、tabs、tag、textarea、tooltip、tree-select。

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

## 7. 当前进行中的工作：TreeSelect 第一层（已完成）

Cascader 第二层已在 `036ae9f` 收尾（多选 / 搜索 / 异步加载 / 插槽，细节见 §8 与提交记录）。本层开始 P5 第四个组件 TreeSelect：**第一层只做单选**，多选与搜索留到下一层。

**已完成**：

- **组件骨架**：`t-tree-select`（standalone + module 双出口），输入 `data` / `value` / `defaultValue` / `keys` / `valueType`（`value` | `object`）/ `clearable` / `disabled` / `size` / `placeholder` / `empty` / `loading` / `loadingText`；输出 `(change)`（`{ value, data, trigger }`，trigger 为 `check` / `clear` / `uncheck`）与 `(visibleChange)`。
- **树索引**：`tree-select-tree.ts` 把 `data` 展开成 `TreeSelectNode`（`path` / `pathNodes` / `parent` / `children` / `disabled`），并按 value 与数据项引用建两份索引；`valueType="object"` 时用数据项引用回查。
- **面板**：`t-select__dropdown` 弹层 + `t-select__dropdown-inner--size-*`，树 DOM 对齐上游：`t-tree`（`--hoverable` / `--transition`）> `t-tree__list` > `t-tree__item`（`--visible` / `--open` / `t-is-active` / `t-is-disabled`，`--level` 通过 CSS 变量控制缩进）> `t-tree__icon--default` + `t-tree__label`。
- **交互**：点箭头只展开 / 收起、点文字选中并收起面板；只渲染可见节点（展开状态用 value 集合记录）；打开面板自动展开已选节点的父级；`clearable` 清空；`disabled` 时忽略展开与清空；`valueType="object"` 回传整个数据项。
- **加载与空态**：`loading` 时面板显示 `t-select-loading-tips` 文案（并隐藏树），`empty` 用 `t-tree__empty > t-select__empty`。
- **插槽**：`<ng-template tTreeSelectPanelTop>` / `tTreeSelectPanelBottom` 渲染在 `t-select__dropdown-inner` 内、树的上下，两个指令随 `TTreeSelectModule` 导出。
- **弹层宽度**：宿主用 `ResizeObserver` 记录宽度，`t-select__dropdown-inner` 设 `min-width` 与触发器同宽（对齐上游 SelectInput 的 matchWidth）。
- **bridge.less**：`t-tree-select { display: block }`；补 `.t-select__dropdown .t-select-loading-tips` 的弹层内布局（上游 tree-select 用单下划线类名，less 里只有双下划线的遮罩版本）。

**已用 CDP 验证**（`http://localhost:4280/tree-select`，4 个 demo）：

- 基础：默认值 `nanshan` 回显「南山区」，打开后父级自动展开（广东省 / 深圳市 `__item--open`），可见节点 6 个，南山区 `t-is-active`，`--level` 分别为 0 / 2。
- 选中：点「广州市」文字 → 输入框回显「广州市」、hint 更新为 `guangzhou`、面板关闭。
- 展开：点浙江省箭头 → 出现「杭州市」，`t-is-open` 生效，输入框值不变（不误选）。
- 配置：清空后输入框为空且 wrapper 带 `t-select-input--empty`；`disabled` 点击不展开、箭头带 `t-fake-arrow--disable`；`size="small/large"` 对应 `t-size-s/l`；`keys`（name / code / items）与 `valueType="object"` 选中「前端组」后 hint 显示「前端组」。
- 加载：`loading=true` 时面板显示「正在加载组织架构…」（宽度与触发器一致 360px、高度 120px、无树），切回后显示技术部 / 产品部两行。
- 插槽：面板顶部「面板顶部：组织架构」与底部「共 8 个节点」都在；`consoleErrors` 为空。

**下一步（建议顺序）**：

1. TreeSelect 第二层：`multiple` + 复选框树（`max` / `minCollapsedNum` / 折叠标签）、`filterable` / `filter` 搜索、`treeProps` 透传（`checkStrictly` / `valueMode` / `expandAll` / `defaultExpanded`）。
2. 继续 P5：DatePicker / TimePicker / Upload / Transfer / ColorPicker。
3. Cascader 余项见 §8（`valueType`、多选折叠、列头列尾、`option` 自定义渲染、各类透传 props）。

## 8. 已知缺口与技术债

- **富内容一律走模板**：Message/Notification 的内容还是纯字符串；Table 单元格目前支持 `cell` 函数返回字符串 + `tTableCell` 模板，二者不要混用。
- **没有单测**：组件全靠 CDP 行为验证 + `align-check` 契约验证；Vitest 迁移仍未开始。
- **Icon SSR**：`TIcon` 用 `DOMParser`，未做 `isPlatformBrowser` 分支。
- **未实现的上游能力**（均已在 `align-check` 写明原因）：Dialog 的 `draggable`/`confirmOnEnter`/`beforeOpen`/`beforeClose`；Loading 的 `indicator`/`attach`；Avatar 的 `imageProps`；AvatarGroup 折叠头像的弹层列表；CheckTag / CheckTagGroup；Pagination 的 `simple` 形态只有「当前页/总页数」；Tabs 的 `action`（自定义操作区）与 `list`（数据驱动面板）未实现；Collapse 的 `expandIcon` 只接受 `boolean | TemplateRef`，不接受上游的渲染函数；Empty 的 `image` 只接受 URL 字符串（不支持 ImageProps），`title` / `description` 为字符串（不支持 TNode）；Progress 的 `label` 只接受 `string | boolean`（不支持 TNode），`plump` 的 over/under 用 `percentage >= 10` 近似（未做逐像素测量），circle 状态图标沿用填充图标（上游是细线图标）；List 的 `scroll`（虚拟滚动）未实现，`asyncLoading` 不支持模板，`(scrollChange)` 原样透出没有节流。；Slider 的 `inputNumberProps`（两侧数字输入框）与 `tooltipProps` 透传未实现，键盘只支持方向键 / Home / End；Rate 的自定义 `icon` 未实现（固定内置星形），`showText` 不提供每颗星的悬浮 tooltip。Cascader 的 `valueType`、`minCollapsedNum` / `collapsedItems`（多选折叠）、`columnHeader` / `columnFooter`、`option`（自定义选项渲染）、`checkProps` 与各类 `*Props` 透传、`trigger="hover"`、受控 `popupVisible`、`readonly` / `borderless` / `status` / `tips` / 前后缀图标均未实现；`filter` 只能是同步函数（上游允许 Promise）。TreeSelect 的 `multiple` / `max` / `minCollapsedNum` / `collapsedItems` / `tagProps`、`filterable` / `filter` / `inputValue` / `defaultInputValue`、`valueDisplay`、`treeProps` 透传、各类 `*Props` 透传、受控 `popupVisible`、`autoWidth` / `borderless` / `readonly`、`suffix` / `suffixIcon` 与失焦/聚焦/搜索事件均未实现（第一层只做单选 + 展开）。
- **文档站**：无搜索、无中英切换、无右侧锚点导航；示例卡片视觉可再贴近官网。

## 9. 怎么验证一个改动

1. `node scripts/gen-api-docs.mjs && node scripts/gen-demo-sources.mjs`（有新增输入/示例时）。
2. `node scripts/align-check.mjs` 必须 `missing 0 / extra 0`。
3. `pnpm build` 全绿。
4. 用 `.local-cache/` 下的 CDP 脚本模板（如 `cdp-check-table2.mjs`）打开对应路由，断言 DOM 类名、文本、交互后的状态与 `consoleErrors`。
5. `node .local-cache/cdp-check-live.mjs https://yuanyong129.github.io/tdesign-ng/<route>` 验证线上页面。





