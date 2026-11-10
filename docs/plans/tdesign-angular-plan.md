# tdesign-ng 改造计划：把本仓库从 Arco 移植版改造为 TDesign 的 Angular 实现

> 状态：草案 v0.1（2026-11-10）
> 参照源：`Tencent/tdesign-vue-next`（API 规范源）、`Tencent/tdesign-react`（TS 类型与工程化参照）、`Tencent/tdesign-common`（设计变量/样式源）、`Tencent/tdesign-icons`（图标源）
> 关键前提：TDesign 官方没有 Angular 实现，本项目是社区版 Angular 实现，**API 以 tdesign-vue-next 为唯一规范**，实现方式完全按 Angular 的习惯来。

---

## 0. 结论速览（TL;DR）

1. **不要"改造"现有 Arco 代码，而是"重建"**：现有 5 个组件的 `.ts` 只当脚手架参考（standalone 结构、`getPrefixCls`、module 聚合方式可留），`.less` 样式全部丢弃，改用 `tdesign-common` 的设计变量与组件样式，避免自研样式与官方视觉漂移。
2. **API 逐字段对齐 tdesign-vue-next**：props / events / slots / 类型定义一一映射，写成可执行的「对齐检查表」，每个组件验收时必须过表。
3. **先立骨架再铺组件**：P0（命名/构建/样式管线/图标/CI）约 3~4 周，之后按组件族分批推进，`Button/Icon/Divider/Space/Link` 作为打样批（2 周内可交付可发布版本）。
4. **样式零自研**：直接消费 `tdesign-common` 的 less + CSS 变量（`--td-*`），类名统一 `t-` 前缀，主题切换走 CSS 变量，暗色走 `[theme-mode='dark']`（选择器以 common 仓库实际实现为准）。
5. **需要早期决策的三件事**：npm 包名/scope、是否引入 `@angular/cdk`、Angular 版本基线（建议 lib peer 支持 20/21/22，docs 站跟最新稳定版）。

---

## 1. 现状盘点（已实测）

| 项 | 现状 |
| --- | --- |
| 仓库 | `yuanyong129/tdesign-ng`（`git remote origin`），分支 `main`，最新提交 `87deae3 chore: linux系统运行报错修复` |
| 本质 | Arco Design Angular 2.0 的**非官方移植**，monorepo 名为 `arco-design-ng-monorepo` |
| 包管理 | pnpm workspaces（`packages/*`，`pnpm 12.11.2`，Node `v22.23.3`） |
| 库包 | `packages/web-ng` → `@arco-design/web-ng@0.0.1`，ng-packagr 单入口（`dest: ../dist/components`，entry `src/index.ts`） |
| 组件 | 5 个：`button`（含 `button-group`）、`divider`、`link`、`scrollbar`、`space`；另有 `style/`（color + theme，含 `palette.js` / `css-variables.less` / `component.less`）与 `_utils/`（`class-name`、`type-check`、`dom`、`is`、`global-config`、`constant`、`types`） |
| 文档站 | `packages/arco-ng-docs` → `@arco-design/arco-ng-docs`，Angular 19.2 + `ng serve`，路由硬编码（`app.routes.ts` 里 5 条，其中 scrollbar 用 `loadComponent`），文档是**手写组件模板**（非 markdown 驱动） |
| 技术栈 | Angular `^19.2.0`、TypeScript `~5.7.2`、`ng-packagr ^19.2.0`、Karma+Jasmine 测试 |
| 命名约定 | selector `a-button`、类名 `ArcoButton`、module `ArcoButtonModule`、`CLASS_PREFIX='arco'`、全局配置名 `$arco` |
| 关键耦合点 | 类前缀几乎全部集中在 `packages/web-ng/src/_utils/global-config.ts`（`getPrefixCls`），改名成本低；但 less 里大量 `~'@{prefix}-btn'` 需随样式方案一起替换 |

**结论**：现有资产里真正可复用比例不高——`_utils`（类型判断类工具）约 50% 可留，组件结构约 30% 可参考，less 主题 100% 丢弃（改用官方变量）。

---

## 2. 目标与非目标

### 目标
- 交付一个可发布的 Angular 组件库：`t-` 前缀、standalone、信号优先、支持按需引入、支持 SSR、支持暗色与自定义主题。
- API 与 `tdesign-vue-next` 同名、同语义、同默认值（含事件名、类型枚举、受控/非受控行为）。
- 配套文档站：与 TDesign 官网同构的信息架构（设计指南/组件/示例/API 表），API 表由 TSDoc 自动生成。
- 可持续：能跟踪上游版本（vue-next 的 minor 迭代），有版本发布流程与变更日志。

### 非目标（本期不做，避免范围失控）
- 不做 TDesign Mobile（移动端）与 TDesign Flutter/小程序。
- 不做 Figma 插件/设计稿同步工具。
- 不做 `tdesign-vue-next` 的"全部" 70+ 组件的一步到位——按第 6 节分批。
- 不追求与官方视觉像素级 100% 一致，但**必须**复用官方样式产物（见 4.3）。

---

## 3. 上游参照与对齐原则

```
tdesign-common     → 设计变量、组件 less、视觉口径（唯一 true source）
tdesign-icons      → SVG 源，脚本生成 Angular 图标组件
tdesign-vue-next   → 组件 API 规范（props / events / slots / 默认值 / 交互行为）
tdesign-react      → TS 类型组织、受控组件写法、Tree-shaking 打包方式
```

对齐原则（写进 PR 模板）：

1. **属性名 = vue-next prop 名**（`camelCase`），Angular 模板里用 `kebab-case` 天然可用（`[size]="'large'"` / `size="large"`）。
2. **事件名 = vue-next event 名**，Angular 侧输出为 `@Output() sizeChange`（`(sizeChange)`），不额外造 `onChange`。
3. **枚举值字符串原样保留**：`'default' | 'primary' | 'danger' | 'warning' | 'success'` 等不翻译、不改写。
4. **默认值以文档为准**：vue-next 的 `withDefaults`/props 定义是唯一裁决方，遇到文档与代码不一致时以代码为准并在 PR 里记录。
5. **slot → Angular 映射规则**（Angular 无 slot，需统一）：
   - 具名内容 slot → `<ng-content select="[t-xxx]">`
   - 渲染函数类 slot（`default`、`content`、`label`、`cell`）→ `@Input() xxx: TemplateRef<...> | string`
   - 需要作用域参数（如 `cell({ row, col })`）→ 一律走 `TemplateRef` + `ngTemplateOutlet` 传 context
   - 这条规则要在 P0 写成 `docs/plans/slot-mapping.md` 并配示例，避免各人各写。
6. **双向绑定**：`model()` / `input()` 信号 API 实现 `v-model` 等价物，组件必须同时支持 `[value]` + `(valueChange)` 与 `[(value)]`。

---

## 4. 关键架构决策

### 4.1 命名与包结构

| 项 | 决策 |
| --- | --- |
| 包名 | 待定：`tdesign-ng`（单包，多入口）或 `@tdesign-ng/components` + `@tdesign-ng/icons` + `@tdesign-ng/styles`。**推荐后者**，因为 `@tdesign` scope 归腾讯所有不可用 |
| 组件类名 | `TButton` / `TButtonGroup` / `TInput`（对应 vue 的 `TButton`） |
| selector | `t-button`、`t-button-group`、`t-space`、`t-space-item` |
| 模块名 | `TButtonModule`（仍保留 NgModule 聚合，兼容 non-standalone 使用方） |
| CSS 类前缀 | `t-`（`t-button`、`t-button--primary`，严格照抄 common 里的类名结构） |
| CSS 变量 | `--td-*`（不新增自定义前缀） |
| 目录 | 一组件一目录，目录内 `xxx.component.ts` / `xxx.types.ts` / `xxx.module.ts` / `index.ts` / `style/`（沿用现有约定，降低迁移摩擦） |

### 4.2 组件实现范式

- **Standalone + 信号**：`input()` / `model()` / `output()` / `computed()`；不再用 `@Input()` 装饰器（与现有 `button.component.ts` 的 `computed()` 混用 `@Input()` 写法不一致，需统一）。
- **变更检测**：`ChangeDetectionStrategy.OnPush` 全线开启；lib 内禁用 `zone.js` 依赖，兼容 zoneless 应用。
- **样式封装**：`ViewEncapsulation.None` + 全局 `t-` 命名空间（TDesign 样式是全局 BEM，Emulated 会造成选择器碎片和主题变量失效）；每个组件 less 单独入口，文档站和库都可按需引入。
- **overlay / 定位 / a11y**：弹层类（Dialog/Drawer/Popup/Select/DatePicker/Tooltip）**建议引入 `@angular/cdk`**（`Overlay`、`Portal`、`FocusTrap`、`A11yModule`）——自研可访问性与焦点管理成本远高于依赖 CDK，且 CDK 是 Angular 官方。
- **表单组件**：`ControlValueAccessor` + `Validator`，同时提供 `t-form` 组件（对齐 vue-next 的 `rules`/`validate`/`reset` 语义）；与 Reactive Forms 双通。
- **i18n**：`InjectionToken` + `provideTDesignLocale()`，locale key 结构照抄 vue-next 的 `common/js/global-config/locale`（zh_CN/en_US 等），不新造词条。
- **图标**：独立包 `@tdesign-ng/icons`，由脚本从 `tdesign-icons` 的 SVG 源批量生成 Angular standalone 组件（`TIconXxx`），产物入库并带校验脚本；`t-icon` 组件通过 `name` 注册表引用。

### 4.3 样式方案（最重要的一个决策）

**方案：直接消费 `tdesign-common` 的 less 源码，不自研。**

- 依赖方式二选一（P0 验证后定）：
  - **A（推荐）git submodule** 引入 `tdesign-common` 到 `vendor/tdesign-common`，构建期用 less 编译，**跟版本**用 submodule commit 锁定；
  - B npm 依赖（若 `tdesign-common` 已发布到 npm 且包含 less 源），否则退回 A。
- 库产物提供两套入口：`@tdesign-ng/styles/index.less`（源，供 less 用户）与 `@tdesign-ng/styles/index.css`（编译产物，供零配置用户），另出 `.../theme/default.css`、`.../theme/dark.css`。
- 组件 less 只写"结构性样式"，颜色/圆角/阴影一律取 `--td-*` 变量；组件 less 里出现的魔法值必须能在 common 的 token 里找到出处。
- 理由：Arco 的 less token 体系（`@btn-font-weight`、`@{prefix}-btn`、`~'@{arco-cssvars-prefix}-...'`）与 TDesign（`--td-*` CSS 变量 + less 混入）完全不同，改造成本 > 重写；而自研样式必然与官方视觉漂移，后续无同步机制。

### 4.4 构建与发布

- `ng-packagr` **多入口（secondary entry points）**：每个组件一个入口，`import { TButton } from '@tdesign-ng/components/button'`，主入口 `@tdesign-ng/components` 再全量 re-export。
- 产物：FESM2022 + ESM，`sideEffects: false`，全量/按需双通道；额外产出 `index.d.ts` 与 API 元数据 JSON（给文档站用）。
- 版本管理：`changesets`，`main` 分支 + `release` 流程；遵循 semver，库的破坏性变更与 vue-next 的 major 对齐。
- CI（GitHub Actions）：`lint → typecheck → unit test → build lib → build docs → e2e(可选) → 产物体积报告`；PR 必须过「API 对齐检查」人工项。

### 4.5 测试策略

| 层 | 选型 | 说明 |
| --- | --- | --- |
| 单元测试 | **Vitest**（Angular 官方 experimental vitest builder）替代 Karma | Karma 在 CI 里需 headless Chrome，慢且 2026 已属遗留；若迁移成本高则先保留 Karma 跑存量，新组件走 Vitest |
| 组件行为 | `@angular/core/testing` + `@testing-library/angular`（可选） | 覆盖 input/output/受控行为/禁用态/CVA |
| 视觉回归 | Playwright 截图对比（文档站 demo 页） | 与 vue-next 官方站对照取基线，允许阈值差异 |
| 可访问性 | `axe-core`（`@axe-core/playwright`） | 弹层/表单组件必须 0 violation |

---

## 5. 目标仓库结构

```
tdesign-ng/
├─ packages/
│  ├─ components/                  # @tdesign-ng/components
│  │  ├─ src/
│  │  │  ├─ shared/                # 跨组件：global-config、i18n、utils、animations、ripple
│  │  │  ├─ button/
│  │  │  │  ├─ button.component.ts
│  │  │  │  ├─ button-group.component.ts
│  │  │  │  ├─ button.types.ts
│  │  │  │  ├─ button.module.ts
│  │  │  │  ├─ style/index.less
│  │  │  │  └─ index.ts
│  │  │  ├─ ...（每个组件一个目录）
│  │  │  └─ public-api.ts
│  │  ├─ ng-package.json
│  │  └─ package.json
│  ├─ icons/                       # @tdesign-ng/icons（脚本生成）
│  ├─ styles/                      # @tdesign-ng/styles（common 编译产物 + 主题入口）
│  ├─ docs/                        # 文档站（由 arco-ng-docs 改造）
│  └─ shared/                      # 内部共享（demo 数据、dev 工具）
├─ vendor/tdesign-common/          # git submodule（若选方案 A）
├─ scripts/
│  ├─ gen-icons.mjs
│  ├─ build-styles.mjs
│  └─ gen-api-docs.mjs             # TSDoc → API 表 JSON
├─ docs/
│  ├─ plans/                       # 本计划、slot 映射规则、对齐检查表
│  └─ contributing.md
└─ .github/workflows/ci.yml
```

---

## 6. 组件清单与分期

按 `tdesign-vue-next` 的官网分组（General / Layout / Navigation / Data Entry / Data Display / Message / Others）排序，依赖优先。数量按 vue-next 当前组件表估算。

| 阶段 | 内容 | 组件 | 交付物 | 估时（1 人） |
| --- | --- | --- | --- | --- |
| **P0 骨架** | 改名、构建、样式管线、图标、CI、文档站壳 | — | 空库可 `build`/`publish --dry-run`；文档站能跑 | 3~4 周 |
| **P1 打样** | 最简单组件跑通全链路（含对齐检查表、API 自动文档） | `button`、`icon`、`divider`、`space`、`link`、`layout`、`grid` | `v0.1.0-alpha` 可发布，5 个 demo 页 | 2~3 周 |
| **P2 基础表单** | 输入类 + 校验基础 | `input`、`input-number`、`textarea`、`checkbox`、`radio`、`switch`、`tag`、`badge`、`loading` | 表单 demo 可用 | 3~4 周 |
| **P3 弹层与反馈** | overlay 能力沉淀（CDK） | `dialog`、`drawer`、`message`、`notification`、`popup`、`tooltip`、`popconfirm`、`dropdown` | 弹层基座复用 | 4~5 周 |
| **P4 数据展示** | 最重的两块之一 | `table`（含排序/筛选/固定列/多级表头/虚拟滚动可分阶段）、`pagination`、`tabs`、`collapse`、`list`、`avatar`、`empty`、`progress` | `v0.2.0` | 6~8 周 |
| **P5 复杂录入** | 最重的另一块 | `select`、`form`、`date-picker`、`time-picker`、`cascader`、`tree-select`、`upload`、`transfer`、`slider`、`rate`、`color-picker` | `v0.3.0` | 8~10 周 |
| **P6 其余与打磨** | 收口 | `menu`、`breadcrumb`、`steps`、`tree`、`watermark`、`image-viewer`、`comment`、`watermark`、`affix`、`back-top`、`guide`、`tour` 等 | `v1.0.0-rc` | 6~8 周 |

**总量估算**：单人 **10~12 人月** 到 `v1.0.0-rc`（约 45~55 个组件 + 文档站 + 工程化）；2 人并行可压到 **6~7 个月**，但 `table`/`select`/`date-picker` 三人以上并行收益低（强耦合样式与交互规范）。

**排期建议**：P0 与 P1 串行（一人主攻），从 P2 起按"组件族"分线并行——表单线 / 弹层线 / 数据展示线，共用 `shared/` 与 `styles/`。

---

## 7. 文档站方案

现状是"手写组件模板当文档"，不可持续（API 表要手抄、示例要手改）。目标：

1. **信息架构**照 TDesign 官网：`设计指南 / 组件 / 更新日志 / 资源`；组件页分「概览、示例、API、FAQ」。
2. **示例即代码**：demo 独立为 `docs/examples/<component>/<demo>.ts`（standalone component），文档页用懒加载 + 源码展示（构建期读取文件内容注入），示例与库源码同仓库同 PR 变更。
3. **API 表自动生成**：`scripts/gen-api-docs.mjs` 解析组件 `*.types.ts` 的 TSDoc（`@zh`/`@en`/`@defaultValue`/`@values`，沿用现有注释风格），产出 JSON，文档页渲染为表格。**这是必须做的**，否则 50 个组件的 API 表维护不可行。
4. **路由自动化**：由组件清单 manifest 生成路由与侧边栏，新增组件只改 manifest 一处（替掉现在 `app.routes.ts` 手写 5 条的做法）。
5. **i18n**：文档站中英双语后置，先把结构留好（`docs/{zh,en}` 目录或 locale 前缀），P4 之前不做。

---

## 8. 风险与对策

| 风险 | 影响 | 对策 |
| --- | --- | --- |
| 组件量巨大（70+），单人/小队长期消耗 | 进度崩塌 | 明确 `v1` 只承诺 P1~P5 的 ~40 个核心组件，其余列 backlog；每阶段可独立发版 |
| 与上游 vue-next 语义偏差（v-model、受控、异步校验） | 用户迁移成本高、返工 | 每个组件建「对齐检查表」+ 引用 vue-next 的 spec 链接与源码链接；review 必须逐项打勾 |
| 样式与 common 版本漂移 | 视觉不一致、主题失效 | submodule 锁 commit + CI 校验产物 hash；不允许组件内写死颜色 |
| 官方将来推出 Angular 实现 | 项目定位尴尬 | 提前接受"社区版"定位，把 API 对齐做到官方实现可平滑替换（只依赖公开 API，不依赖内部实现） |
| `table`/`date-picker` 工作量被低估 | 尾部拖期 | P0 期间就做技术预研 spike（虚拟滚动、日期计算库选型：dayjs 对齐 vue-next 还是自研） |
| Angular 大版本节奏（lib 需跨 3 个大版本兼容） | peer 冲突 | peer 范围 `>=20 <24`，CI 矩阵跑最低与最新；避免使用会破坏跨版本的新 API |
| Karma → Vitest 迁移影响存量测试 | 阻塞 | 存量先跑通，新组件强制 Vitest；迁移作为独立任务，不混在组件 PR 里 |

---

## 9. 验收标准（DoD）

**每个组件"完成"的定义：**

1. `input/output/model` 与 vue-next 逐项对齐，`docs/plans/align-check/<comp>.md` 全部打勾。
2. TSDoc 注释齐全（`@zh`/`@en`/`@defaultValue`/`@values`），API 表可自动生成。
3. 单测覆盖：props 渲染、事件触发、禁用/只读、CVA（表单类）、键盘可达。
4. 视觉回归基线通过；`axe` 无 violation（≤ P2 级）。
5. 文档站有：概览 + ≥3 个示例 + API 表 + FAQ。
6. 通过 SSR 渲染冒烟（`@angular/platform-server`）。
7. 体积预算：单组件入口 gzip 增量 ≤ 8KB（`table`/`select` 例外，单独定预算）。

**阶段验收**：每个 P 阶段末尾产出一个可发布版本（alpha/beta），并有一份"与上游对齐度报告"（组件数、API 覆盖率、已知差异清单）。

---

## 10. 下一步（本周可执行）

1. **确认三件事**：npm 包名/scope、是否引入 `@angular/cdk`、Angular 版本基线（见 §11 待决策）。
2. 跑通现状基线：`pnpm install && pnpm start`，记录当前能否构建（提交 `87deae3` 声称修了 Linux 报错，需确认 Windows 下也 OK）。
3. 新建分支 `feat/tdesign-port`，先做 **P0-1 改名**（纯机械工作，半小时量级）：
   - `packages/web-ng` → `packages/components`（包名、`ng-package.json`、`tsconfig` paths）
   - `packages/arco-ng-docs` → `packages/docs`
   - `_utils/global-config.ts`：`CLASS_PREFIX 'arco'→'t'`、`COMPONENT_PREFIX 'A'→'T'`、`GLOBAL_CONFIG_NAME '$arco'→'$td'`、`ArcoOptions→TDesignOptions`
   - 类名 `Arco*→T*`、selector `a-*→t-*`
4. **P0-2 样式管线 spike**（1~2 天）：验证 `tdesign-common` 的 less 能否在 Angular 19 的 less 编译链里跑通（`stylePreprocessorOptions.includePaths`、`~` 前缀解析、CSS 变量注入顺序），并产出 `vendor/tdesign-common` 的引入方案结论。
5. **P0-3 API 文档生成 spike**：写一个最小脚本，从 `button.types.ts` 的注释生成一张 API 表，验证可行性后再铺开。
6. 建立 `docs/plans/align-check/button.md` 对齐检查表模板（以 vue-next `button` 为第一个样板）。

---

## 11. 待决策（需要拍板）

| # | 问题 | 选项 | 建议 |
| --- | --- | --- | --- |
| D1 | npm 包名 | `tdesign-ng` / `@tdesign-ng/components`+`@tdesign-ng/icons`+`@tdesign-ng/styles` | 后者（多包），`@tdesign` scope 不可用 |
| D2 | 是否引入 `@angular/cdk` | 引入 / 自研 overlay | 引入，弹层与 a11y 收益远大于体积成本 |
| D3 | Angular 基线 | 19（现状）/ 20 / 21 / 22 | docs 站升到当前最新稳定版；lib peer `>=20 <24`，并在 CI 矩阵覆盖 |
| D4 | `tdesign-common` 引入方式 | git submodule / npm 依赖 / 复制源码 | 先 spike 验证 npm 是否可用，否则 submodule |
| D5 | 测试框架 | Karma 保留 / Vitest | 新组件 Vitest，存量逐步迁 |
| D6 | 首发范围 | P1 打样先发 / 一次到 P5 | 分阶段发版，每阶段可独立发布 |

---

## 12. P0 执行记录（已完成）

| 任务 | 结果 | 验证方式 |
| --- | --- | --- |
| P0-1 改名 | 目录、包名、类名、选择器、CSS 变量全部切到 TDesign 命名 | `pnpm build` 全绿 |
| P0-1 构建 | 库 `packages/dist/components`、文档站 `packages/docs/dist/docs` | `ng-packagr` + `ng build` |
| P0-2 样式 | `vendor/tdesign-common`（72 组件，上游 `develop` 快照）+ `@tdesign-ng/styles` | `pnpm build:styles` 产物断言 |
| P0-3 API 文档 | `scripts/gen-api-docs.mjs` → JSON → `<api-table>` | 7 组件 41 属性，`--check` 校验注释完备 |
| P0-4 对齐检查 | `scripts/align-check.mjs`，比对上游 props 契约 | 见 §13 |

**D4 结论**：`tdesign-common` 的 npm 包只有 `0.0.1-alpha.0` 占位版，不可用；改为 vendor 上游源码快照，用 `pnpm vendor:styles` 一条命令重新同步（默认 `develop` 分支，`main` 已停滞于 2021 年）。

**踩过的坑（避免重复）**
- 原 `tsconfig.lib.json` 继承不存在的 `../tsconfig.json`，这个库此前从未构建成功过。
- 各组件 `index.ts` 只导出 module、不导出组件类 → ng-packagr 报 `NG3001`。
- 上游 `style/web/components/a-template/` 是脚手架（选择器为 `<name>` 占位符），不能直接编译，同步时排除。
- 文档站的 `anyComponentStyle` 预算默认 4kB，组件库样式天然超限，已放宽到 20kB/32kB。

---

## 13. P1 起步：与上游的 API 差距

`node scripts/align-check.mjs` 当前输出（上游 `tdesign-vue-next@1.20.11`）：

| 组件 | 已对齐 | 缺失 | 多余 |
| --- | --- | --- | --- |
| Button | 6/18 | 8 | 4 |
| Divider | 1/6 | 3 | 4 |
| Link | 2/13 | 8 | 4 |
| Space | 3/5 | 2 | 2 |
| ButtonGroup | — | TDesign 无此组件 | 建议移除 |
| Scrollbar | — | TDesign 无此组件 | 建议移除 |

**关键语义差异**（P1 重写必须处理的）
- Button：上游用 `theme`（default/primary/danger/warning/success）+ `variant`（base/outline/dashed/text）两个正交维度；存量代码用单个 `type`（primary/secondary/dashed/outline/text）把两者混在一起。由于尚未发布、无外部用户，P1 直接采用上游两个属性，不做兼容层。
- Button：上游 `type` 是原生 `submit/reset/button`，对应我们的 `htmlType`；`loading` 还需支持 `loadingProps`。
- Divider：上游是 `layout`（horizontal/vertical）+ `align` + `dashed`；我们是 `direction` + `orientation` + `type`。
- Link：上游区分 `theme`/`hover`/`underline`/`size`/`prefixIcon`/`suffixIcon`/`target`/`download`。
- Space：上游是 `breakLine`/`separator`，我们是 `wrap`/`fill`。

结论：P1 不是「改注释」，而是按上游契约重写这 5 个组件的输入属性与样式类名（`.t-button--variant-*` / `.t-button--theme-*` 已经在 vendor 里，必须对得上）。

## 14. P1 执行记录（打样阶段已交付）

### 14.1 包结构

| 包 | 路径 | 说明 |
| --- | --- | --- |
| `@tdesign-ng/components` | `packages/ng-components` | 组件库。原名 `packages/components`，因目录 ACL 损坏迁到新路径，包名不变 |
| `@tdesign-ng/icons` | `packages/icons` | 图标组件 `TIcon` + 内置图标表（生成） |
| `@tdesign-ng/styles` | `packages/styles` | 上游 less 的单组件入口，全部由脚本生成 |
| `@tdesign-ng/docs` | `packages/docs` | 文档站，端口 4280 |

`vendor/tdesign-common` 保存上游 `style/web` 源码快照（72 个组件，`VERSION.json` 记录 ref 与同步日期），由 `pnpm vendor:styles` 更新。

### 14.2 已按上游契约重写的组件

| 组件 | 上游属性 | 关键实现点 |
| --- | --- | --- |
| Button | `variant` / `theme` / `shape` / `size` / `block` / `ghost` / `disabled` / `loading` / `tag` / `href` / `type` / `form` | `buildClasses()` 直接拼上游类名；`tag` 决定渲染 `<button>` / `<a>` / `<div>`；loading 用上游 `.t-loading__gradient` + `foreignObject` 纯 CSS 环 |
| Divider | `layout` / `align` / `dashed` / `size` | 是否带文字只能在运行期判断投影内容，故在 `ngAfterContentInit` 里补 `t-divider--with-text-*` |
| Link | `theme` / `size` / `hover` / `underline` / `disabled` / `target` / `download` / `href` / `hasPrefixIcon` / `hasSuffixIcon` | 前后缀图标用带属性的 `ng-content` 槽（`[tLinkPrefixIcon]` / `[tLinkSuffixIcon]`） |
| Space | `direction` / `size` / `align` / `breakLine` / `separator` | 用原生 flex `gap` 实现间距，不依赖上游 JS 计算的类名；`separator` 用伪元素 + `--td-space-separator` |

已删除 TDesign 不存在的 `button-group` 与 `scrollbar`。

### 14.3 样式接入

- 组件的视觉 100% 来自 `vendor/tdesign-common`，本仓库不写组件级 less。
- `packages/ng-components/src/bridge.less` 只做两件事：`t-button { display: contents; }`（消除宿主盒子，让上游相邻选择器与 `flex gap` 生效）、`<t-icon>` 与 `.t-button__text` 之间的 8px 桥接间距（上游用 `svg + .t-button__text` 相邻选择器，宿主元素隔断了它）。
- 文档站 `packages/docs/src/styles.less` 按需引入：主题变量 → 全局工具类 → 重置 → 用到的组件 → 桥接层。

### 14.4 待办（进入 P2 前）

- 图标：目前内置 65 个精选图标，`pnpm gen:icons --all` 可生成全量 2358 个；需要决定发布策略（精选 vs 全量 vs 两者）。
- `TIcon` 目前用 `DOMParser` 渲染，未做 SSR 兼容（`document` 直取），上 SSR 前需换成 `isPlatformBrowser` 分支。
- 文档站示例的视觉密度还可以再贴近官网（间距、代码块、右侧锚点导航）。
- 单测：P1 组件尚无 spec，P2 起新组件用 Vitest，存量 Karma 待迁移。

## 15. 文档站部署（GitHub Pages）

- 仓库：`https://github.com/yuanyong129/tdesign-ng`，站点地址为 `https://yuanyong129.github.io/tdesign-ng/`。
- `packages/docs/angular.json` 的 `production` 配置里 `baseHref` 为 `/tdesign-ng/`；开发服务器（`pnpm start`，端口 4280）不受影响，仍以 `/` 为根。
- `.github/workflows/pages.yml`：push 到 `main` 或手动 `workflow_dispatch` 时，安装依赖 → `pnpm run build:docs` → 复制 `index.html` 为 `404.html` → 用官方 Pages actions 上传并部署。产物目录是 `packages/docs/dist/docs/browser`（Angular 19 application builder 会多一层 `browser/`）。
- **首次启用（只需一次，必须人工操作）**：仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。之后推送即自动部署。
- SPA 深链接依赖 `404.html` 回退：GitHub Pages 不支持 history fallback，直接用 `index.html` 顶替 404 页，Angular 启动后按 `baseHref` 解析路径并路由到目标页面。
- 本地复现 Pages 行为：`pnpm build:docs && pnpm preview:pages`，然后访问 `http://127.0.0.1:4281/tdesign-ng/`。
