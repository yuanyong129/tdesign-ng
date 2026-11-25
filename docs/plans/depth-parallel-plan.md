# 深度阶段并行开发计划（多会话分工）

> 更新：2026-11-24。前置状态：广度阶段已完成（上游 71 个组件目录 100% 覆盖，tag `v0.4.0-alpha`）。
> 本文回答一个问题：**把不同组件分给不同会话并行做深度对齐，会不会被"通用能力"卡住？**

## 0. TL;DR

组件之间基本是文件级解耦的，**可以并行**；但有 **3 个硬阻塞** 和 **3 个软约束**，硬阻塞不解决，多个会话会互相踩、并且各自发明一套不兼容的写法。

| 类别 | 问题 | 处理 |
| --- | --- | --- |
| 🔴 硬阻塞 1 | `scripts/align-check.mjs` 是 1410 行单文件、`CONFIG` 里 100 条 `ignoreUpstream` —— 每个会话都要改同一个对象，git 必冲突 | 拆成 `scripts/align-check.config/<Component>.mjs`，loader 聚合（D0-lite 第 1 项） |
| 🔴 硬阻塞 2 | 真正好用的工具（`wire-component`、CDP 页面探针）在 `.local-cache/`（被 gitignore），**其他会话根本拿不到** | 迁到 `scripts/`，端口/参数用环境变量（D0-lite 第 2 项） |
| 🔴 硬阻塞 3 | 三套横切契约没统一：`popupProps`（7 个组件）、`Content`（9 个文件 21 处 union）、受控值（43 条债 / 29 个组件） | 先定类型与写法，再让各会话复用（D0-lite 第 3~5 项） |
| 🟡 软约束 1 | `attach`（Teleport）只有 3 个组件需要（Dialog / Drawer / ImageViewer） | 可延后，但必须统一记 `[D2]` |
| 🟡 软约束 2 | i18n / ConfigProvider 只接了二维码（`TConfigService` 仅 2 个文件引用），29 个文件硬编码中文 | 单开一条"工程线"，别让每个会话自己造文案常量 |
| 🟡 软约束 3 | 库没有 `@angular/router` peer 依赖，`to`/`routerLink`（BreadcrumbItem、MenuItem，6 条）无法实现 | 先决定加不加 peer，否则统一记 `[D2]` |

结论：**先花半天做 D0-lite（§3 五项），再开并行会话**。做完之后，6 条线可以同时跑（§4）。

## 1. 现状证据（2026-11-24 实测）

| 能力 | 现状 | 数字 |
| --- | --- | --- |
| 上游对齐 | `align-check` | 94 个组件 / 上游 1576 props / 已对齐 1001（63.5%）/ `missing 0 / extra 0` |
| 深度债 | `pnpm depth:report` | 真实欠账 **298**：D1 180（60.4%）、D2 71（23.8%）、D3 47（15.8%），显式 `[D#]` 82 条 |
| `popupProps` 透传 | 只有 `color-picker`、`select-input` 自己有裁剪版入口；`TPopup` 本身没有 | 卡住 7 个组件：Cascader、DatePicker、DateRangePicker、TimePicker、TreeSelect、Popconfirm、Dropdown（+ `TSelect.inputProps` 1 条） |
| `Content`（TNode） | 各组件自己写 `string \| TemplateRef<unknown>` | 9 个文件 21 处；无统一类型/渲染工具 |
| 受控值写法 | `value` / `defaultValue` / `(valueChange)` 手写，`model()` 只在 upload 用 | 43 条债 / 29 个组件 |
| `attach`（Teleport） | 完全没有（`inject(Overlay)` 挂 CDK overlay 容器） | 3 个组件：Dialog、Drawer、ImageViewer |
| i18n | `TConfigService` 只被 qrcode 消费；其余写死中文 | 29 个文件有中文字面量（calendar 19、upload 11、date-picker-utils 7、cascader / dialog / drawer / tree-select 各 6） |
| a11y | 只有部分组件带 `role`/`aria-*` | 11 / 99 个组件文件 |
| 单测 | 无（只有 `packages/dist` 里的 smoke spec） | 0 |
| 虚拟滚动 | 无公共实现，Table/Select/Tree/Cascader 各自待补 | 4 条大债 |
| 图标 | curated 65 个，`pnpm gen:icons --all` 可生成 2300+ | 需要时一次性生成 |

## 2. 并行会话的冲突面（必须约定，否则会互相踩）

| 文件 | 谁改 | 说明 |
| --- | --- | --- |
| `scripts/align-check.mjs` | **改造后：谁都不改** | 拆分后每个会话只写 `scripts/align-check.config/<Component>.mjs` |
| `packages/ng-components/src/index.ts` | integrator | 深度阶段基本不需要动（组件已导出） |
| `packages/docs/src/app/docs/nav.ts`、`app.routes.ts` | integrator | 深度阶段不加新页面，若加由 integrator 统一写 |
| `packages/docs/src/styles.less`、`bridge.less` | integrator | `bridge.less` 是全局宿主规则，必须有唯一 owner |
| `packages/docs/src/app/api/api.generated.json`、`demo-sources.generated.json` | **只有 integrator 跑 `gen:api` / `gen:demos`** | 会话自己跑会产出半成品、并和其他会话冲突 |
| `README.md` / `HANDOFF.md` / `docs/plans/*` | integrator | 会话只在报告里给"要写的行" |
| 共享内部模块 | 指定 owner | `date-picker-utils.ts`（DatePicker 线）、tree core（Tree 线）、`popup/*`（工程线）、CVA 基类（工程线） |
| 端口 | 每会话独立 | dev server `--port 43xx`；CDP `CDP_PORT=94xx`；Edge profile 用独立目录 |

## 3. D0-lite：并行前必须落的 5 件事

| # | 事项 | 产出 | 状态 |
| --- | --- | --- | --- |
| 1 | align-check 配置拆分 | `scripts/align-check.config/*.mjs`（97 个组件各一个文件 + `shared.mjs` + `index.mjs` loader） | ✅ 已完成，拆分前后 97 条逐组件签名 **0 差异**，totals 仍是 94 / 1576 / 1001 / 0 / 0 |
| 2 | 工具入库 | `scripts/wire-component.mjs`、`scripts/cdp-page.mjs`（`PORT`/`CDP_PORT`/`PROBES`/`SHOT`/`SHOT_DIR`）、`scripts/headless-edge.mjs`（`start`/`kill`，自带独立 profile 与端口） | ✅ 已完成，`node scripts/cdp-page.mjs /button` 可跑 |
| 3 | 生成物隔离 + `pnpm verify` | `gen-api-docs.mjs` 支持 `API_OUT`、`align-check.mjs` 支持 `API_FILE`、`scripts/verify-session.mjs` + `pnpm verify:session` / `pnpm verify` | ✅ 已完成，`API_OUT=.local-cache/api.session.json` 生成、`API_FILE=… align-check` 读取、入库 `api.generated.json` 不变 |
| 4 | `Content` 契约 | `_utils/content.ts`：`Content = string \| TemplateRef<unknown> \| undefined` + `isTemplateContent()` / `isContentEmpty()` / `contentText()`；23 个组件的 `XxxContent` 别名统一指向 `Content` | ✅ 已完成（L7 第一项），TSDoc 与约定写进 HANDOFF §5 第 9 条 |
| 5 | `popupProps` 契约 | `popup/popup.types.ts` 导出 `PopupOptions` / `PopupClassNames` / `mergePopupOptions()` / `mergePopupClassNames()`；Popconfirm / Dropdown / Cascader 已接入，显式 input 优先 | ✅ 已完成（L7 第二项），HANDOFF §5 第 10 条写清优先级；其余弹层组件（DatePicker / DateRangePicker / TimePicker / TreeSelect）按同一模式补 |

> 受控值约定不单独改代码，写进 §5 的 brief 模板与 §6 检查清单即可（`model<T>()` + `defaultX` + `(xChange)`，`Change` 输出带 `{ value, source? }`）。

**并行会话的验证命令（不写入库生成物）**

```bash
pnpm verify:session              # gen → .local-cache/api.session.json + tsc + ngc + align-check
pnpm verify:session -- TTable    # 只校验一个组件
PORT=4301 pnpm start             # 每个会话用自己的文档站端口
CDP_PORT=9411 node scripts/headless-edge.mjs start
PORT=4301 CDP_PORT=9411 SHOT=1 node scripts/cdp-page.mjs /table
CDP_PORT=9411 node scripts/headless-edge.mjs kill
```


## 4. 建议分线（按"文件不重叠"切，不按债务大小切）

| 线 | 组件（上游 props / 当前债） | 共享模块 | 说明 |
| --- | --- | --- | --- |
| **L1 表格线** | `TTable`(62/41) `TPagination`(23/4) | checkbox、分页、empty | 单线独占，Table 是全库最大债（41） |
| **L2 选择线** | `TSelect`(55/22) `TSelectInput`(43/4) `TCascader`(53/26) `TTreeSelect`(44/16) | `popup/*`、tree core | Cascader/TreeSelect 依赖 Tree 核心，本线内部串行 |
| **L3 日期线** | `TDatePicker`(44/19) `TDateRangePicker`(44/18) `TTimePicker`(33/17) `TCalendar`(22/6) | `date-picker-utils.ts` | 四个组件共用一个日期工具文件，必须单线 |
| **L4 弹层反馈线** | `TDialog`(37/10) `TDrawer`(31/8) `TPopup`(24/7) `TTooltip` `TMessage` `TNotification` `TGuide` `TImageViewer` | `popup/*`、overlay、z-index | 涉及 `attach` 决策 |
| **L5 表单与录入线** | `TForm`(21/6) `TInput`(46/11) `TTextarea` `TInputNumber` `TSlider` `TRate` `TSwitch` `TRadio` `TCheckbox` `TUpload`(63/10) `TTransfer`(26/10) | CVA 基类、校验 | 表单的 `form` 集成需要统一 CVA 写法 |
| **L6 树与重型线** | `TTree`(50/19) `TMenu`(45/?) `TUpload`(63/10) `TTransfer`(26/10) | tree core | 若 L2 已占 tree core，本线先做 Menu/Upload/Transfer |
| **L7 工程线**（建议你自己或固定一个会话） | i18n/ConfigProvider、a11y、单测（Vitest）、`Content`/`popupProps` 收敛、虚拟滚动工具 | `_utils/*`、`popup/*` | 只做横切，不改业务组件逻辑 |

**依赖顺序**：L7 的 `popupProps`/`Content` 已落地（见 §3 第 4/5 项），L2/L4 可直接消费；tree core 先于 L2 的 Cascader/TreeSelect；`date-picker-utils` 归 L3 独占。

## 5. 单个会话的 brief 模板（可直接粘给新会话）

```text
仓库：C:\Users\yuany\OneDrive\Documents\GitHub\tdesign-ng（Angular 19 + pnpm，DSH 环境）
任务：把 <组件名列表> 的上游 API 对齐到 tdesign-vue-next@1.20.11，并补齐对应深度能力。

唯一真源
- API：https://unpkg.com/tdesign-vue-next@1.20.11/es/<dir>/type.d.ts 与 props.mjs（用 web_fetch 取）
- 样式：vendor/tdesign-common/style/web/components/<dir>/_index.less（只允许用里面真实存在的类名）

只允许改这些路径
- packages/ng-components/src/components/<dir>/**
- packages/docs/src/app/docs/<dir>/**
- scripts/align-check.config/T<Component>.mjs（只改自己这一两个文件）

绝对不要改（由 lead/integrator 统一提交）
- packages/ng-components/src/index.ts、bridge.less
- packages/docs/src/app/docs/nav.ts、app.routes.ts、packages/docs/src/styles.less
- scripts/align-check.mjs、scripts/gen-*.mjs、任何 *.generated.json
- README.md、HANDOFF.md、docs/plans/**、任何 package.json

契约（必须遵守，见 docs/plans/depth-parallel-plan.md §6）
- 受控：`value = model<T>()`（或 `value` + `defaultValue` + `(valueChange)`），Change 输出 `{ value, source? }`
- 内容：一律 `import type { Content } from '../../_utils/content'`；需要专有名就 `export type XxxContent = Content;`，不要再写 `string | TemplateRef<unknown> | undefined`
- 弹层：`popupProps?: PopupOptions`（`components/popup/popup.types`），用 `mergePopupOptions()` 合并、`mergePopupClassNames()` 叠类名，显式 input 优先于 popupProps，绑到 `TPopup` 时 `?? null`
- 未实现的上游属性：写进 `align-check.config` 的 ignoreUpstream，理由必须以 `[D1]/[D2]/[D3]` 开头

验证（必须全绿再交）
1. `pnpm verify:session -- T<Component>`（内部依次：gen → .local-cache/api.session.json、tsc、ngc、align-check）
2. 本地实拍：`PORT=43xx pnpm start`（另一个终端）+ `CDP_PORT=94xx node scripts/headless-edge.mjs start` + `PORT=43xx CDP_PORT=94xx SHOT=1 node scripts/cdp-page.mjs /<dir>`
   → demos / apiRows 正常，`issues: []`、`badResources: []`
3. 端口约定：每个会话独占一组 `43xx`（文档站）与 `94xx`（CDP），不要用默认 4200 / 9341
4. 不要跑 `build:lib`/`pnpm verify`（会覆盖入库生成物，由 integrator 统一跑）

交付报告必须包含
- 文件清单 + 行数；input/output 表；未实现项与 [D#] 理由；新增/修改的 demo；
- 三条验证命令的实际输出摘要；已知偏差；需要 integrator 做的事（README 行、生成物、bridge 规则）

提交约定：不要 git commit，把改动留在工作区，由 integrator review 后统一提交。
```

## 6. 单组件 L2 验收清单（"深度对齐"到底要做到什么）

- [ ] 上游 `Td<X>Props` 每个属性：要么实现，要么在 config 里写明 `[D1]/[D2]/[D3]` 理由；`missing 0 / extra 0`
- [ ] 受控/非受控成对（`value` + `defaultValue`），`[(value)]` 可用
- [ ] 内容类属性统一 `Content`；事件统一 `{ ... }` 上下文对象
- [ ] 弹层类组件支持 `popupProps`（`PopupOptions`）
- [ ] a11y：`role` + 必要 `aria-*` + 键盘可操作（上下左右/Esc/Enter）
- [ ] 文档页 ≥ 2 个 demo（基础 + 一个高级），demo 不写与 `description` 重复的 hint
- [ ] 本地 CDP 实拍：0 console error、0 4xx
- [ ] 组件目录里没有"以后再做"的 TODO 注释（要么实现，要么进 config 理由）

## 7. integrator（每次会话收回后）的固定动作

1. `pnpm verify`（api / demos / align / build:lib）
2. `pnpm gen:api` + `pnpm gen:demos`（生成物统一更新）
3. 需要时补 `bridge.less` 宿主规则（唯一 owner）
4. 更新 `README.md` 组件表与 `HANDOFF.md` / 本文件的进度
5. 统一 commit + push（commit message 用 `feat(<dir>): ...` / `fix(<dir>): ...`）
6. `pnpm clean:cache`：会话们各自起的 headless Edge profile、`packages/dist` 一次性测试工程都要清掉。单个 profile 80–570 MB，不清理时 `.local-cache` 一周能到 4~5 GB（2026-11-25 实测 34 个 profile = 4.39 GB，清理后工作区从 5.2 GB 回到 620 MB）。命令默认跳过正在被浏览器占用的 profile，并行会话不会被打断；`--dry-run` 可先看清单。
