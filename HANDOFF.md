# 交接文档 · TDesign Angular

> 面向「下一个接手这个仓库的会话」。读完这份文档，应该能直接继续开发，而不需要重新调研环境。
> 更新日期：2026-11-20，对应提交：`ffec8f6`（Empty 空状态）之后的未提交改动（新组件 Progress）。

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
| P4 数据展示 | 🚧 | Tag / Badge / Avatar(+Group) / Pagination / Table / Tabs / Collapse / Empty 已完成；**Progress 待提交**；List 未开始 |
| P5 复杂录入 | ⬜ | DatePicker / Cascader / TreeSelect / Upload / Transfer / Slider / Rate 等 |

当前 `align-check` 覆盖 **33 个组件、360 个输入属性、144 个示例**，合计 `missing 0 / extra 0`（`TProgress 已对齐 8/8`）。

组件清单（`packages/ng-components/src/index.ts`）：avatar、badge、button、checkbox、collapse、dialog、divider、drawer、empty、form、input、link、loading、message、notification、pagination、popup、progress、radio、select、space、switch、table、tabs、tag、textarea、tooltip。

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
- 临时脚本、截图、上游缓存都放 `.local-cache/`（已 gitignore）。

## 7. 当前进行中的工作：新组件 Progress（进度条）

Empty 已提交（`ffec8f6`）；本层新增 `@tdesign-ng/components` 的 Progress（进度条）。

**已完成（未提交）**：

- `TProgress`（`t-progress`）：`theme`（line / plump / circle，默认 line）、`percentage`（0–100，默认 0）、`status`（success / error / warning / active）、`color`（单色 / 颜色数组 / `Record<百分比, 颜色>`）、`trackColor`、`strokeWidth`（line 条高、circle 环宽）、`size`（small / medium / large 或自定义像素）、`label`（`string | boolean`）。
- 状态优先级 `status ?? (percentage >= 100 ? 'success' : 'default')`；line 与 circle 在 success / warning / error 时用图标替百分比，plump 始终显示文本。
- DOM 照上游：line `div.t-progress--thin.t-progress--status--x` > `__bar` > `__inner` + `__info`；plump `div.t-progress__bar.t-progress--plump.t-progress--over-ten|--under-ten`（over-ten 时 `__info` 内嵌在 `__inner`）；circle `div.t-progress--circle` + `svg` 双 circle（外层 `__circle-outer`、内层 `__circle-inner` 带 `stroke-dasharray` 与 `matrix(0,-1,1,0,0,d)`）。
- circle 直径 `72 / 112 / 160`，字号 `14 / 20 / 36`；环宽默认 6（small 为 4）；颜色数组生成 `linear-gradient(90deg, …)`，对象按 key 排序生成分段渐变。
- 图标全部内联 SVG（`t-progress__icon`）；circle 下额外用 `circleIconSize`（直径 × 0.18）覆盖 less 的 `2.4em`，否则图标会撑满整个圆环（踩过）。
- 新 demo：`progress-basic`（20/45/70/100%）、`progress-status`（success/warning/error/active）、`progress-plump`（70/30/8% + small）、`progress-circle`（三档尺寸 + 自定义 90px、环宽 4）、`progress-color`（单色 + trackColor、渐变数组、分段对象、circle 描边）。
- `align-check` 新增 `TProgress`（`TdProgressProps`），结果 `TProgress 已对齐 8/8`，总量 `missing 0 / extra 0`。

**已用 CDP 验证**（`http://localhost:4280/progress`）：

- line：宽度 20 / 45 / 70 / 100%，100% 自动 `status--success` 且背景 `rgb(43,164,113)`。
- status：success / warning / error 渲染 `t-progress__icon`（`__info` 文本为空），active 显示 `70%`。
- plump：70 / 30 为 `--over-ten` 且文本在 `__inner` 内、8% 为 `--under-ten` 文本在条外；条高 20px，small 16px。
- circle：72 / 112 / 160px、字号 14 / 20 / 36px、`stroke-dasharray` 与内外圈 stroke 正确；状态图标 20 / 29 / 16px。
- color：单色、渐变、分段、circle 描边都正确；`apiRows 8`；`console issues` 为空。

**下一步（建议顺序）**：

1. P4 最后一项：List。
2. Progress 余项：`label` 支持 TNode / 模板；circle 状态图标换成上游的细线图标。
3. Table / Tabs / Collapse / Empty 的余项见 §8。

## 8. 已知缺口与技术债

- **富内容一律走模板**：Message/Notification 的内容还是纯字符串；Table 单元格目前支持 `cell` 函数返回字符串 + `tTableCell` 模板，二者不要混用。
- **没有单测**：组件全靠 CDP 行为验证 + `align-check` 契约验证；Vitest 迁移仍未开始。
- **Icon SSR**：`TIcon` 用 `DOMParser`，未做 `isPlatformBrowser` 分支。
- **未实现的上游能力**（均已在 `align-check` 写明原因）：Dialog 的 `draggable`/`confirmOnEnter`/`beforeOpen`/`beforeClose`；Loading 的 `indicator`/`attach`；Avatar 的 `imageProps`；AvatarGroup 折叠头像的弹层列表；CheckTag / CheckTagGroup；Pagination 的 `simple` 形态只有「当前页/总页数」；Tabs 的 `action`（自定义操作区）与 `list`（数据驱动面板）未实现；Collapse 的 `expandIcon` 只接受 `boolean | TemplateRef`，不接受上游的渲染函数；Empty 的 `image` 只接受 URL 字符串（不支持 ImageProps），`title` / `description` 为字符串（不支持 TNode）；Progress 的 `label` 只接受 `string | boolean`（不支持 TNode），`plump` 的 over/under 用 `percentage >= 10` 近似（未做逐像素测量），circle 状态图标沿用填充图标（上游是细线图标）。
- **文档站**：无搜索、无中英切换、无右侧锚点导航；示例卡片视觉可再贴近官网。

## 9. 怎么验证一个改动

1. `node scripts/gen-api-docs.mjs && node scripts/gen-demo-sources.mjs`（有新增输入/示例时）。
2. `node scripts/align-check.mjs` 必须 `missing 0 / extra 0`。
3. `pnpm build` 全绿。
4. 用 `.local-cache/` 下的 CDP 脚本模板（如 `cdp-check-table2.mjs`）打开对应路由，断言 DOM 类名、文本、交互后的状态与 `consoleErrors`。
5. `node .local-cache/cdp-check-live.mjs https://yuanyong129.github.io/tdesign-ng/<route>` 验证线上页面。



