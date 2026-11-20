# 交接文档 · TDesign Angular

> 面向「下一个接手这个仓库的会话」。读完这份文档，应该能直接继续开发，而不需要重新调研环境。
> 更新日期：2026-11-20，对应提交：`146f5e3`（Progress 进度条）之后的未提交改动（新组件 List）。

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
| P5 复杂录入 | ⬜ | DatePicker / Cascader / TreeSelect / Upload / Transfer / Slider / Rate 等 |

当前 `align-check` 覆盖 **36 个组件、372 个输入属性、148 个示例**，合计 `missing 0 / extra 0`（`TList 已对齐 7/10`）。

组件清单（`packages/ng-components/src/index.ts`）：avatar、badge、button、checkbox、collapse、dialog、divider、drawer、empty、form、input、link、list、loading、message、notification、pagination、popup、progress、radio、select、space、switch、table、tabs、tag、textarea、tooltip。

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

## 7. 当前进行中的工作：新组件 List（列表）

Progress 已提交（`146f5e3`）；本层新增 `@tdesign-ng/components` 的 List（列表），P4 的五个组件（Tag / Badge / Avatar / Pagination / Table / Tabs / Collapse / Empty / Progress / List）到此全部落地。

**已完成（未提交）**：

- `TList`（`t-list`）：`header`、`footer`、`layout`（horizontal / vertical）、`size`（small / medium / large）、`split`、`stripe`、`asyncLoading`（`loading` / `load-more` / 自定义文案）；输出 `(loadMore)` 与 `(scrollChange)`。
- `TListItem`（`t-list-item`）：`content`、`action`，可在宿主内投影富内容。
- `TListItemMeta`（`t-list-item-meta`）：`image`（头像 URL）、`title`、`description`。
- DOM 照上游：`div.t-list.t-size-*[.t-list--split][.t-list--stripe][.t-list--vertical-action]` > `__header` / `ul.__inner` / `__footer` / `div.t-list__load[--loading|--load-more]`；列表项 `li.t-list-item` > `.t-list-item-main` + `ul.t-list-item__action`（上游把 action 放在 main 内，导致 `--vertical-action` 的 `flex-direction: column` 不生效，这里改为 main 的兄弟节点，操作区才会真正换行）。
- 结构选择器桥接（写进 `bridge.less`，附原因）：上游 `.t-list--stripe .t-list-item:nth-child(even)` 与 `.t-list--split .t-list-item:not(:last-child)::after` 依赖 li 在 ul 里的兄弟关系，Angular 每个列表项多一层宿主后会全部失效，因此补了两条落到宿主上的等价规则（颜色用 `var(--td-*)` + 兜底值）。
- `align-check` 新增 `TList`（`TdListProps`），结果 `TList 已对齐 7/10`，总量 `missing 0 / extra 0`；`scroll`（列表虚拟滚动）与 `onLoadMore` / `onScroll` 写了忽略理由。
- 新 demo：`list-basic`（头像 + 标题 + 描述 + header/footer）、`list-action`（操作区、horizontal / vertical）、`list-style`（分割线 / 斑马纹 / small 尺寸）、`list-async`（load-more → loading → 追加 3 条）。

**已用 CDP 验证**（`http://localhost:4280/list`）：

- basic：`t-list t-size-m`、header「文件列表」、footer「共 3 个文件」、3 个 item / 3 个 meta、头像 img 存在、标题与描述正确、`padding: 12px 16px`。
- action：`layout="vertical"` 时根类含 `t-list--vertical-action`，`li.t-list-item` 计算样式 `flex-direction: column`（操作区换行）。
- style：split 的 `::after` 在非末项为 `rgb(232,232,232)`、末项透明；stripe 第 2 项背景 `rgb(243,243,243)`；`t-size-s` 的 item padding `8px 12px`。
- async：初始 `t-list__load--load-more`「加载更多」；点击后变 `--loading`「加载中...」→ 600ms 后回到 load-more，item 由 5 条变 8 条，hint 同步。
- `console issues` 为空。

**下一步（建议顺序）**：

1. P4 收尾后进入 P5（DatePicker / Cascader / TreeSelect / Upload / Transfer / Slider / Rate 等），见 `docs/plans/tdesign-angular-plan.md` §21。
2. List 余项：`scroll` 虚拟滚动、`onScroll` 的 scroll 节流、`asyncLoading` 支持模板。
3. 其余组件缺口见 §8。

## 8. 已知缺口与技术债

- **富内容一律走模板**：Message/Notification 的内容还是纯字符串；Table 单元格目前支持 `cell` 函数返回字符串 + `tTableCell` 模板，二者不要混用。
- **没有单测**：组件全靠 CDP 行为验证 + `align-check` 契约验证；Vitest 迁移仍未开始。
- **Icon SSR**：`TIcon` 用 `DOMParser`，未做 `isPlatformBrowser` 分支。
- **未实现的上游能力**（均已在 `align-check` 写明原因）：Dialog 的 `draggable`/`confirmOnEnter`/`beforeOpen`/`beforeClose`；Loading 的 `indicator`/`attach`；Avatar 的 `imageProps`；AvatarGroup 折叠头像的弹层列表；CheckTag / CheckTagGroup；Pagination 的 `simple` 形态只有「当前页/总页数」；Tabs 的 `action`（自定义操作区）与 `list`（数据驱动面板）未实现；Collapse 的 `expandIcon` 只接受 `boolean | TemplateRef`，不接受上游的渲染函数；Empty 的 `image` 只接受 URL 字符串（不支持 ImageProps），`title` / `description` 为字符串（不支持 TNode）；Progress 的 `label` 只接受 `string | boolean`（不支持 TNode），`plump` 的 over/under 用 `percentage >= 10` 近似（未做逐像素测量），circle 状态图标沿用填充图标（上游是细线图标）；List 的 `scroll`（虚拟滚动）未实现，`asyncLoading` 不支持模板，`(scrollChange)` 原样透出没有节流。
- **文档站**：无搜索、无中英切换、无右侧锚点导航；示例卡片视觉可再贴近官网。

## 9. 怎么验证一个改动

1. `node scripts/gen-api-docs.mjs && node scripts/gen-demo-sources.mjs`（有新增输入/示例时）。
2. `node scripts/align-check.mjs` 必须 `missing 0 / extra 0`。
3. `pnpm build` 全绿。
4. 用 `.local-cache/` 下的 CDP 脚本模板（如 `cdp-check-table2.mjs`）打开对应路由，断言 DOM 类名、文本、交互后的状态与 `consoleErrors`。
5. `node .local-cache/cdp-check-live.mjs https://yuanyong129.github.io/tdesign-ng/<route>` 验证线上页面。



