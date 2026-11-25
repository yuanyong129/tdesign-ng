# TDesign Angular 广度优先路线图（2026-11-23）

> 本文件是**执行计划**，取代 `docs/plans/tdesign-angular-plan.md` §6 的原始分期。
> 旧文件继续保留：P0~P4 的实现记录、样式方案、坑位说明仍然有效，只是"下一步"以本文件为准。
>
> 一句话：**先把 71 个组件全部做成可用（L1），再逐个把高级能力补齐（L2/L3）。**

---

## 0. TL;DR

| 项 | 现状 | 广度完成后 |
| --- | --- | --- |
| 已覆盖上游组件 | 34 / 71（48%） | 71 / 71（100%） |
| 组件目录 | 35 个（含 DateRangePicker 独立实现） | 72 个（71 个上游目录 + DateRangePicker） |
| API 条目（align-check） | 39 个 / 811 个上游属性 | 约 78 个 / 1626 个上游属性 |
| 属性实义覆盖率 | 452 / 811（56%） | 广度基线约 50%~60%（新组件先保主干），深度期到 90% |
| 文档示例 | 188 个 | 约 280 个（每组件 2~3 个） |

**新节奏**：

1. **B0 基建（0.5~1 天）**：L1 模板、债务标记、`depth-report` 脚本、共享能力清单。
2. **B1 布局与静态展示（15 项）** → **B2 弹层与媒体（8 项）** → **B3 数据录入补全（12 项）** → **B4 重型（4 项）**。
3. 组件覆盖 100% 后进入 **D0 横切工程 → D1 表格与选择线 → D2 录入与反馈线 → D3 其余**。

**预计**：广度 2~4 周（参照最近 4 天 42 个提交的节奏；保守按每项 0.5~2 天算 4~6 周），深度 8~12 周。

---

## 1. 现状盘点

### 1.1 已经交付什么

- **组件**：35 个目录 / 43 个 API 条目（含 `TFormItem`、`TTabPanel`、`TListItem` 等子组件），覆盖 P1 打样、P2 表单、P3 弹层反馈、P4 数据展示，以及 P5 的 Slider / Rate / Cascader / TreeSelect / DatePicker / DateRangePicker / TimePicker。
- **契约**：`align-check` 跟踪 39 个组件、811 个上游属性，当前 `missing 0 / extra 0`，已对齐 452 项（55.7%）。
- **基建**：pnpm workspace、`vendor/tdesign-common` 样式快照、TSDoc→API 表、demo 源码自动提取、GitHub Pages 部署、CDP 真实浏览器验证脚本。
- **质量**：`pnpm build` 的库与样式阶段通过；文档站构建在当前 DSH 沙箱下会因 Angular CLI `spawn EPERM` 失败（沙箱不允许 Node 用管道创建子进程），属环境限制，不是代码问题。

### 1.2 属性覆盖率分布（按缺口排序）

| 组件 | 上游 props | 已对齐 | 缺口 | 覆盖率 |
| --- | --- | --- | --- | --- |
| Table | 62 | 19 | 43 | 31% |
| Select | 55 | 20 | 35 | 36% |
| Cascader | 53 | 21 | 32 | 40% |
| Input | 46 | 22 | 24 | 48% |
| TreeSelect | 44 | 20 | 24 | 45% |
| DatePicker | 44 | 22 | 22 | 50% |
| DateRangePicker | 44 | 23 | 21 | 52% |
| TimePicker | 33 | 12 | 21 | 36% |
| Dialog | 37 | 22 | 15 | 59% |
| Drawer | 31 | 18 | 13 | 58% |
| Popup | 24 | 12 | 12 | 50% |
| Textarea | 21 | 12 | 9 | 57% |
| Tabs | 16 | 9 | 7 | 56% |
| Pagination | 23 | 16 | 7 | 70% |
| Button | 18 | 12 | 6 | 67% |
| Form | 21 | 15 | 6 | 71% |
| Link | 13 | 8 | 5 | 62% |
| Radio | 12 | 7 | 5 | 58% |
| Checkbox | 14 | 9 | 5 | 64% |
| Slider | 16 | 11 | 5 | 69% |
| CheckboxGroup | 10 | 6 | 4 | 60% |
| Tag | 14 | 10 | 4 | 71% |
| Avatar | 10 | 6 | 4 | 60% |
| Notification | 11 | 7 | 4 | 64% |
| Loading | 13 | 9 | 4 | 69% |
| Switch | 10 | 7 | 3 | 70% |
| RadioGroup | 13 | 10 | 3 | 77% |
| List | 10 | 7 | 3 | 70% |
| Rate | 14 | 11 | 3 | 79% |
| Message | 8 | 5 | 3 | 63% |
| Divider | 6 | 4 | 2 | 67% |
| Collapse | 11 | 9 | 2 | 82% |
| Empty | 7 | 6 | 1 | 86% |
| Badge | 10 | 9 | 1 | 90% |
| AvatarGroup | 5 | 4 | 1 | 80% |
| Space | 5 | 5 | 0 | 100% |
| Progress | 8 | 8 | 0 | 100% |
| FormItem | 13 | 13 | 0 | 100% |
| Tooltip | 6 | 6 | 0 | 100% |

**读法**：39 个条目里 4 个已经 100%，11 个在 70%~99%，18 个在 50%~69%，6 个低于 50%。缺口集中在两类——**数据密集型**（Table / Select / Cascader / TreeSelect / DatePicker）和**弹层基座**（Popup / Dialog / Drawer）。这两类正是深度阶段的主战场，广度阶段先不动它们。

### 1.3 缺口清单：37 个组件目录 + 2 个 tag 子组件

统计口径：`tdesign-vue-next@1.20.11` 的 `es/<component>/type.d.ts`，props 数含主接口与子组件接口（如 Row + Col）。

| 波次 | 组件（上游 props） | 小计 |
| --- | --- | --- |
| B1 布局与静态展示 | layout(6)、grid(17)、typography(20)、card(25)、alert(11)、skeleton(7)、comment(7)、breadcrumb(19)、steps(17)、timeline(12)、statistic(15)、descriptions(15)、sticky-tool(14)、affix(7)、back-top(11) | 15 项 / 203 props |
| B2 弹层与媒体 | popconfirm(16)、dropdown(23)、guide(21)、image(17)、image-viewer(23)、anchor(14)、qrcode(12)、watermark(17) | 8 项 / 143 props |
| B3 录入补全 | input-adornment(2)、select-input(43)、tag-input(39)、range-input(42)、input-number(31)、auto-complete(32)、calendar(22)、color-picker(38)、swiper(15)、config-provider(1)、check-tag(20，含 CheckTag + CheckTagGroup) | 12 项 / 285 props |
| B4 重型 | menu(45)、tree(50)、transfer(26)、upload(63) | 4 项 / 184 props |
| **合计** | **39 项** | **815 props** |

> 另有低优先项：**图标全量**（内置 65 → `pnpm gen:icons --all` 2358，脚本已支持）；`TIcon` 的 SSR 分支；文档站搜索、中英切换、右侧锚点。
>
> 口径说明：vendor 里还有 `chat`、`a-template` 的样式，但 `tdesign-vue-next@1.20.11` 没有公开 `Chat` / `ATemplate` 组件，**不纳入清单**；等上游正式发布再评估。

### 1.4 横切缺口（不影响广度计数，但影响"可发布"）

- **无单测**：全部依赖 CDP 行为验证 + `align-check` 契约验证，回归风险随组件数线性上升。
- **SSR 未验证**：`TIcon` 直接使用 `DOMParser`；弹层组件直接访问 `document` / `window`。
- **无 i18n / locale**：分页文案、日期面板文案仍是中文硬编码。
- **无主题切换演示**：暗色模式依赖 `[theme-mode='dark']`，但文档站没有开关。
- **文档站**：无搜索、无右侧锚点、无版本化。

---

## 2. 广度优先的规则

### 2.1 L1（Breadth-Ready）定义：六条门槛

一个组件只有同时满足下面六条，才算"广度完成"：

1. **主干可交互**：不是静态壳。demo 能完成该组件最核心的一条流程（如 Steps 能切换 current、Upload 能选文件并显示进度、Tree 能展开勾选）。
2. **通用维度齐全**：上游的 `size` / `disabled` / `readonly` / `theme` / `variant` / `status` 等通用类名维度按需覆盖，类名与 vendor less 对得上。
3. **契约完整**：上游每个未实现属性都进 `ignoreUpstream`，reason 以 `[D1]` / `[D2]` / `[D3]` 开头 + 一句人话；`missing 0 / extra 0`。
4. **文档闭环**：docs 页 + 2~3 个 demo + API 表 + `nav.ts` + `app.routes.ts` + `styles.less` + README 组件表。
5. **质量闸门**：`pnpm build:lib` 绿；CDP 打开路由无 console error、关键 DOM 断言通过；样式 100% 来自 vendor（`bridge.less` 每条写原因）。
6. **明确允许的欠账**：返回值可以是字符串而不是 `TNode`；不支持 `*Props` 透传；不写单测；不保证 SSR/a11y 完整；虚拟滚动、拖拽、异步可后置。

### 2.2 为什么这样切

- 迁移用户的第一问是"有没有这个组件"，第二问才是"属性全不全"。广度直接决定项目可用性。
- 35 个组件的实践已经沉淀出弹层、CVA、标签、日期四套可复用能力，新增组件的边际成本远低于第一周。
- 深度工作如果有真实使用反馈再做，优先级会比现在拍脑袋更准；反之先深度会把 3 个最复杂的组件打磨到 90%，却仍让用户找不到 Card / Menu。

### 2.3 两条硬原则在广度期怎么守

- **API 以 tdesign-vue-next 为唯一真源**：L1 不发明 Angular 专属属性；`angularOnly` 只放 `[(value)]` 这类平台必需品并写明理由。
- **样式零自研**：每个组件开工前先确认 `vendor/tdesign-common/style/web/components/<name>/` 存在（37 项里 36 项有独立 less；`config-provider` 与上游一致，没有自身样式）；`bridge.less` 只允许宿主桥接与"上游选择器在 Angular 下失效"的等价规则。

### 2.4 债务要能自动统计

- `ignoreUpstream` 的 reason 统一前缀：
  - `[D1]` 表格与选择线（Table / Select / Cascader / Tree / DatePicker / TimePicker / InputNumber / AutoComplete）
  - `[D2]` 录入与反馈线（Input / Textarea / Form / Upload / Transfer / Dialog / Drawer / Popup / Menu / Dropdown / Guide）
  - `[D3]` 其余组件与边角能力
- B0 给 `align-check` 加 `--json`，并新增 `scripts/depth-report.mjs`：输出每个组件的「已实现 / 债务（按 D 分组）」与全局覆盖率。这样"广度完成"与"深度进度"都能用一条命令回答，而不是靠人记。**（已完成：`pnpm check:align:json` / `pnpm depth:report`）**
- 报表会把「Angular 惯用映射」从债务里剔除（`modelValue`/`onChange`/`default`/`content` 这类是 API 形态差异，reason 以「Angular 用 …」「双向绑定」「ng-content」等开头），否则工作单会被零工作量条目稀释。基线：359 项未实现中 143 项是映射，真实欠账 216 项（D1 159 / D2 40 / D3 17）。
- 已有组件的旧 reason 不强制一次性改写，在进入对应深度批次时顺手补前缀；无前缀的按组件默认归属统计（见 `depth-report.mjs` 的 `LINE_DEFAULTS`）。

---

## 3. 波次计划

### B0 基础设施（0.5~1 天）

| 任务 | 产出 | 说明 |
| --- | --- | --- |
| `align-check --json` | 结构化报告 | 供 `depth-report` 与未来文档站状态页消费 |
| `scripts/depth-report.mjs` | 覆盖率 + 债务清单 | 按 `[D*]` 分组，输出 markdown |
| L1 检查清单 | 本文件 §2.1 + `HANDOFF.md` §5 增补 | 每开一个组件照单执行 |
| 共享能力确认 | 5 条复用路径 | 见下表，禁止重复造 |

| 共享能力 | 现成实现 | 后续谁用 |
| --- | --- | --- |
| 弹层定位 / 12 方向 / popper placement | `popup` | popconfirm、dropdown、guide、color-picker、menu 子菜单 |
| CVA + 受控值同步 | `input` / `checkbox` / `select` | input-number、range-input、select-input、tag-input、calendar |
| 日期计算与面板网格 | `date-picker` 内部工具 | calendar |
| 标签回显与折叠 | `tag` + tree-select 内置 | tag-input、select-input、transfer |
| 键盘 / roving focus | `select` / `tabs` | menu、tree、dropdown、transfer |

**三个依赖决策（默认值已给，可在开工时推翻）**：

1. **QRCode**：默认引入 `qrcode`（MIT，约 20KB gzip）作为库依赖；若坚持零依赖，则 B2 先做占位并标 `[D3]`，深度期自研编码器。
2. **ColorPicker**：颜色转换（hex/rgb/hsv/hsl/alpha）自研约 150 行，不引依赖。
3. **Calendar**：复用现有日期工具，不引 dayjs。

**B0 状态（2026-11-23）**：4 项全部完成。`pnpm check:align:json` 输出结构化报告，`pnpm depth:report` 输出 D 阶段工作单。B1 落地后的新基线：上游 1009 props、已对齐 610（60.5%），未实现 399 项里 168 项是 Angular 惯用映射，**真实欠账 231 项**（D1 159 / D2 41 / D3 31），其中 15 项已显式带 `[D#]` 前缀。

### B1 布局与静态展示（15 项 / 203 props）

目标：把"纯展示 + 布局"类组件一次清零，组件目录从 35 推到 50。**进度 15/15（2026-11-23 完成）**：全部落地、接线、跑过 `gen:api` / `align-check` / `ngc` / `build:lib` / 本地 CDP 实拍。

| 组件 | 上游 | 关键点 | 量级 |
| --- | --- | --- | --- |
| layout ✅ | 1+4 | Header/Aside/Content/Footer，纯结构类 | S |
| grid ✅ | 4+13 | 12 栅格（上游 `@grid-columns: 12`）、gutter（数字/数组/断点对象）、offset/order/pull/push、六断点响应式 | S |
| typography ✅ | 13+7 | Text/Title/Paragraph；copyable/editable/ellipsis 标 `[D3]` | M |
| card ✅ | 25 | header/footer/actions/cover/loading，插槽多；加载态复用 `t-loading` | M |
| alert ✅ | 11 | 主题、图标、关闭（`t-alert--closing` → `t-is-hidden`）、滚动（marquee 标 `[D3]`） | S |
| skeleton ✅ | 7 | 行/列组合、六种 theme 预设、gradient/flashed、`delay` | S |
| comment ✅ | 7 | 头像、作者、时间、操作区 | S |
| breadcrumb ✅ | 8+11 | 分隔符、当前项、跳转；折叠标 `[D3]` | S |
| steps ✅ | 10+7 | 水平/垂直、点状、当前态、错误态 | M |
| timeline ✅ | 5+7 | 模式、标签、自定义节点/圆点 | S |
| statistic ✅ | 15 | 前缀后缀、精度、颜色 | S |
| descriptions ✅ | 11+4 | 边框、列数、布局、跨列 | M |
| sticky-tool ✅ | 9+5 | 侧边固定、弹出层（复用 popup） | S |
| affix ✅ | 7 | 滚动固定、容器、偏移 | S |
| back-top ✅ | 11 | 滚动阈值、容器、可见回调 | S |

- **依赖**：无硬依赖（sticky-tool 用 popup）。
- **验收**：15 个路由可打开，demo 主流程可操作；`align-check` 新增 15 条且 missing 0。（2026-11-23 已达成：15 个页面本地 CDP 实拍 0 console error、0 4xx；`align-check` missing 0 / extra 0。）
- **估算**：2~4 天。

### B2 弹层与媒体（8 项 / 143 props）

目标：把弹层基座从"能用"扩到"可组合"，同时补齐媒体类组件。**进度 8/8（2026-11-23 完成）**：8 项全部落地、接线，`align-check` missing 0 / extra 0，`tsc` / `ngc` / `build:lib` 全绿，8 个页面本地 CDP 实拍无 console error。

| 组件 | 上游 | 关键点 | 量级 |
| --- | --- | --- | --- |
| popconfirm ✅ | 16 | popup + button，确认/取消回调、异步确认 | M |
| dropdown ✅ | 23 | popup + 菜单项、分割线、禁用、方向 | M |
| guide ✅ | 21 | 分步引导、目标定位、上一步/下一步 | L |
| image ✅ | 17 | 加载/错误占位、懒加载、点击预览 | M |
| image-viewer ✅ | 23 | overlay、缩放/旋转/拖拽、键盘、缩略图 | L |
| anchor ✅ | 14 | scroll spy、容器、偏移、平滑滚动 | M |
| qrcode ✅ | 12 | 编码、canvas/svg、下载、纠错级别 | M |
| watermark ✅ | 17 | canvas 平铺、透明度/旋转、防篡改观察 | M |

- **依赖**：popup、button、image → image-viewer；anchor 复用 scroll 工具。
- **验收**：8 个路由 + 弹层打开/关闭/键盘关闭无 console error；image-viewer 的缩放拖拽在 CDP 里可断言。
- **落地要点（2026-11-23）**：
  - popconfirm：复用 `t-popup` 定位；`visibleChange` 带 `{ visible, trigger, e }`，不提供 `[(visible)]`；`popupProps` 标 `[D2]`
  - dropdown：options 数据驱动 + 子菜单（`children`）；默认 `trigger="hover"`；`popupProps` 标 `[D2]`
  - guide：不套 CDK Overlay（z-index 低于 999999）：手写 fixed 定位 + 视口夹紧；气泡/对话框两种模式
  - image：`src` 支持 `string | File`；形状/`fit`/`position`/浮层；点击预览交给使用方监听原生 click
  - image-viewer：modal / modeless 两种形态；`attach` 与 `viewerScale` 标 `[D2]`/`[D3]`
  - anchor：只有一个默认投影槽，吸顶改用 `position: sticky`；自写 300ms 缓动滚动
  - qrcode：引入 `qrcode`（可选 peer 依赖）；图标挖空 + 过期/已扫描/加载遮罩；文案接 `ConfigProvider`
  - watermark：复用单个 `<style>` 元素注入 keyframes；图片 onerror 也计入加载完成
  - 新增共享能力：`ConfigProvider`（`globalConfig` + `TConfigService`）先只接二维码文案，其余分组在 D0 统一接。
- **估算**：3~5 天。

### B3 数据录入补全（12 项 / 285 props）— **进度 12/12（2026-11-23 完成）**

目标：补齐"输入类组件矩阵"，为深度线的 Select/TreeSelect/AutoComplete 打地基。

| 组件 | 上游 | 关键点 | 量级 |
| --- | --- | --- | --- |
| input-adornment ✅ | 2 | 前置/后置内容，尺寸与状态类 | S |
| select-input ✅ | 43 | 组合选择器基座：标签回显、折叠、面板、清空 | L |
| tag-input ✅ | 39 | 标签输入：增删、折叠、拖拽排序（拖拽标 `[D3]`） | L |
| range-input ✅ | 42 | 双输入框、分隔符、清空、面板 | M |
| input-number ✅ | 31 | CVA、步进、精度、格式化、键盘、长按 | L |
| auto-complete ✅ | 32 | 基于 select-input + 输入过滤、异步 | L |
| calendar ✅ | 22 | 月/年视图、单元格自定义、事件 | L |
| color-picker ✅ | 38 | 颜色转换、面板、透明度、预设、最近使用 | XL |
| swiper ✅ | 15 | 轮播、自动播放、指示点、触摸/拖拽 | L |
| config-provider ✅ | 1 | 全局配置/前缀/主题，影响面大但 API 小 | S |
| check-tag ✅ | 20 | CheckTag + CheckTagGroup，复用 tag 样式 | M |

- **顺序（已完成）**：input-adornment → config-provider → select-input → tag-input → range-input → input-number → auto-complete → calendar → color-picker → swiper → check-tag。
- **验收**：CVA 组件同时支持 `[(value)]`、`ngModel`、`formControl`；金额/百分比类 demo 可交互。
- **验收结论（2026-11-23）**：11 个组件页面本地 CDP 实拍 0 console error、0 4xx；`align-check` missing 0 / extra 0（TInputNumber 31、TRangeInput 28、TTagInput 39、TCheckTag 20、TCheckTagGroup 10、TSelectInput 43、TAutoComplete 32、TCalendar 22、TSwiper 15、TColorPicker 22、TInputAdornment 2）。
- **落地要点**：
  - InputNumber / RangeInput / TagInput / SelectInput / AutoComplete / Calendar / ColorPicker 均实现 `ControlValueAccessor`，同时支持 `[(value)]`、`ngModel`、`formControl`。
  - `t-input__tips` 在 vendor 里是绝对定位（依赖表单容器），bridge 已把 `t-input` / `t-input-number` / `t-select` / `t-tag-input` 的 tips 统一改为文档流。
  - 新增宿主 block 规则：`t-range-input`、`t-tag-input`、`t-auto-complete`、`t-calendar`、`t-swiper`、`t-select-input`；`t-color-picker` 用 `inline-block`（触发器是色块）。
  - ColorPicker 的颜色转换（hex/rgb/hsl/hsv/cmyk 互转）自研在 `color-picker.utils.ts`，零新增依赖；渐变面板与吸管标 `[D3]`。
  - Calendar 复用 `date-picker-utils` 的 `formatDate`/`parseDateByFormat`/`isSameDay`/`startOfDay`，未引 dayjs；月/年网格自写（固定 6 行）。
  - Swiper 用 `translate3d` + transition 自实现，无第三方库；loop 首尾跳转为「瞬时归位」，单步动画与 autoplay 与上游一致。
- **估算**：5~8 天。

### B4 重型组件（4 项 / 184 props）

**进度 4/4（2026-11-23 完成）**：menu、tree、transfer、upload 全部落地并接线，已通过 gen:api / align-check / tsc / ngc / build:lib / 本地 CDP 实拍。

目标：啃掉最后四块硬骨头，允许两层交付。

| 组件 | 上游 | 第一层（必须） | 第二层（可后置，标 `[D1]`/`[D2]`） | 量级 |
| --- | --- | --- | --- | --- |
| menu ✅ | 45 | 递归菜单、展开/收起、选中、子菜单弹层 | 折叠态、键盘导航、主题 | XL |
| tree ✅ | 50 | 展开/选中/勾选、父子联动、禁用、异步加载 | 拖拽、虚拟滚动、懒加载、自定义图标 | XL |
| transfer ✅ | 26 | 双列表、勾选、搜索、移动 | 树形穿梭、分页、拖拽排序 | L |
| upload ✅ | 63 | 选择/拖拽、文件列表、进度、删除、自定义请求 | 图片预览、多选、目录、请求头、失败重试 | XL |

- **顺序**：tree 优先（TreeSelect 深度工作依赖它抽公共核心）→ menu → transfer → upload。
- **验收**：每项至少 2 个 demo（基础 + 一个高级），主链路在 CDP 可跑通；未实现能力全部进 `[D1]/[D2]`。
- **估算**：6~10 天。
- **落地要点（2026-11-23）**：
  - tree：32 input / 8 output，父子联动与半选、`load` 懒加载返回 Promise、`line` 用 box-shadow 画祖先线、`[tTreeLabel]`/`[tTreeIcon]`/`[tTreeEmpty]` 三个模板指令；拖拽与过滤标 `[D1]`。
  - menu：上游 TMenu 与 THeadMenu 合并为 `mode: vertical | horizontal`，子组件 `t-menu-item` / `t-submenu` / `t-menu-group`，父子用 `contentChildren` + `inject(T_MENU)`，水平与折叠态子菜单复用 `t-popup`（不用 CDK Overlay）。
  - transfer：`targetValue` + `[(targetValue)]`，两侧搜索/过滤/勾选/全选，`oneWay` 为 Angular 增量，列表项用外层 div 承载 `role=option` 以避开 `t-checkbox` 内联 DOM。
  - upload：`files` 用 `model()`（`[(files)]`），XHR 真实进度 + `requestMethod` 自定义请求（demo 零网络），`theme` 仅实现 `file`/`custom`，图片形态与预览标 `[D2]`。
  - 基建补丁：`gen-api-docs.mjs` 支持 `model()` 入参（此前 `files` 不会进 API 表）；`align-check` 对 `angularOnly` 仍按字符串数组登记，理由写在注释。

### 广度完成标志（B-Exit）— 2026-11-23 已达成

- `align-check`：**94 个组件 / 上游 1576 个属性 / 已对齐 1001（63.5%）/ missing 0 / extra 0**（条目数比预估的 78 多，因为 TMenu / TTree / TTransfer / TUpload 之外的子组件也各自登记）。
- 上游公开组件目录 + CheckTag / CheckTagGroup 全部有实现、有文档页（`gen:api`：99 个组件、1052 个输入属性、301 个示例），每项至少 2 个 demo。
- 73 个组件目录（含独立实现的 DateRangePicker）、73 条 barrel 导出；README 组件表完整。
- `depth:report` 基线：真实欠账 **298**（D1 180 / 60.4%、D2 71 / 23.8%、D3 47 / 15.8%），显式 `[D#]` 前缀 82 项。
- 里程碑：**0.4（广度完成）**，2026-11-23，记录见 [`milestones.md`](./milestones.md)（原 tag `v0.4.0-alpha` 已删除，里程碑不再打 tag）。

---

## 4. 深度阶段（D）

### 4.1 D0 横切工程（1~2 周，先做）

> 进度（2026-11-25）：`Content` 契约与 `popupProps` 契约已完成（见 HANDOFF §5 第 9/10 条、`docs/plans/depth-parallel-plan.md` §3），剩下的模板渲染指令、受控统一、SSR、a11y、测试、i18n 仍在深度阶段推进。

| 项 | 内容 | 影响 |
| --- | --- | --- |
| 模板化（TNode 映射） | `cell` / `label` / `content` / `title` 统一 `TemplateRef` 或 `string`；作用域参数用 `ngTemplateOutlet` context | ✅ `Content` 类型 + `isTemplateContent()`/`isContentEmpty()` 已落地，23 个组件别名已统一；渲染指令（`tContent`）待抽 |
| `*Props` 透传 | `inputProps` / `popupProps` / `tagProps` / `treeProps` 等按上游语义透传 | ✅ `PopupOptions` + `mergePopupOptions()`/`mergePopupClassNames()` 已落地，Popconfirm/Dropdown/Cascader 已接入；其余透传待做 |
| 受控/非受控统一 | `value` + `defaultValue` + `(change)`，内部 `innerValue` 单一来源 | 修掉各组件各写一套的隐患 |
| SSR | `TIcon` 的 `isPlatformBrowser` 分支；弹层 portal / document 访问审计 | 支持 Angular Universal / 预渲染 |
| a11y | 键盘（roving focus）、aria 属性、focus trap 复用 | 弹层/表单类达到可用标准 |
| 测试 | Vitest 落地；核心组件 spec；关键 demo 的 Playwright 视觉基线可选 | 回归保护 |
| i18n | `provideTDesignLocale()`，日期/分页/空态文案 | 对齐上游 locale 能力 |

### 4.2 深度分批

| 批次 | 组件 | 理由 |
| --- | --- | --- |
| **D1 表格与选择线** | Table(62)、Select(55)、SelectInput(43)、Cascader(53)、Tree(50)、TreeSelect(44)、DatePicker(44)、DateRangePicker(44)、TimePicker(33)、InputNumber(31)、AutoComplete(32) | 缺口最大（合计约 490 props），也是业务系统使用频率最高的一组 |
| **D2 录入与反馈线** | Input(46)、Textarea(21)、Form(21)、Upload(63)、Transfer(26)、Dialog(37)、Drawer(31)、Popup(24)、Menu(45)、Dropdown(23)、Guide(21) | 表单与弹层是第二条高频链路 |
| **D3 其余** | Tabs、Pagination、Tag/CheckTag、Calendar、ColorPicker、ImageViewer、Swiper、Watermark、Descriptions、Steps、Anchor 等 | 补齐边角能力与高级交互 |

### 4.3 深度完成定义（L2/L3）

- 核心 20 个组件：上游属性 **≥90%** 有实义实现；其余 ≥75%。
- `ignoreUpstream` 只保留真正的平台差异（例如 Vue render prop → `TemplateRef` 的说明），不再有"后续版本实现"。
- 事件、插槽、受控/非受控、禁用/只读、键盘、SSR 全部覆盖。
- 每组件 ≥5 个 demo，覆盖高级能力；Vitest 覆盖 props/事件/CVA/键盘。
- 里程碑：D1 → `v0.5.0-beta`；D2 → `v0.9.0-rc`；D3 + 文档/i18n/测试 → `v1.0.0`。

---

## 5. 执行节奏

### 5.1 单组件工作流（8 步）

1. 确认 vendor less 存在 + 读上游 `type.d.ts` / 官方 demo 清单。
2. 写组件（standalone、OnPush、signal、`ViewEncapsulation.None`）。
3. 写 module / index，库入口导出。
4. 写 docs 页 + 2~3 个 demo（`demo-<name>-*`）。
5. 同步 `nav.ts`、`app.routes.ts`、`styles.less`、`bridge.less`、README。
6. 加 `align-check` CONFIG（未实现项全部 `[D*]`）。
7. `pnpm gen:api && pnpm gen:demos && node scripts/align-check.mjs --component TXxx`。
8. `pnpm build:lib` + CDP 冒烟 + 提交（一个组件一个 commit）。

### 5.2 每波退出标准

- `pnpm check:api` / `pnpm check:demos` / `align-check` 全绿。
- `pnpm build:lib` 绿；本波所有路由 CDP 冒烟无 console error。
- README / HANDOFF / 本文件的进度表更新。
- 里程碑：向 [`milestones.md`](./milestones.md) 追加一条（发布 tag 只对应 npm 版本号，见 `RELEASING.md`）。

### 5.3 并行策略

- B1 可按「布局（layout/grid）、展示（card/descriptions/statistic）、导航（breadcrumb/steps/timeline/sticky-tool/affix/back-top）」三条线并行。
- B2 与 B3 可交叉（B2 依赖 popup，B3 依赖 input/select，互不冲突）。
- B4 串行：tree → menu → transfer → upload；tree 先做，D1 的 TreeSelect 直接受益。

---

## 6. 风险与对策

| 风险 | 表现 | 对策 |
| --- | --- | --- |
| 广度变"名义完成" | 组件能渲染但主流程不可用，`ignoreUpstream` 写得含糊 | L1 六条门槛 + 每波抽检 2 个组件做 CDP 深测 + reason 必须带 `[D*]` |
| 组件变多后构建/文档站变慢 | `pnpm build` 时间线性增长 | 路由已懒加载；监控构建时间；必要时拆分 docs 构建或按需生成示例 |
| 共享逻辑复制 | 每个新组件各写一套 overlay / CVA | B0 固化 5 条复用路径；评审时看到重复实现直接打回 |
| 无单测导致回归 | 改 A 组件坏 B 组件 | 广度期 CDP 冒烟 + demo 快照；D0 起 Vitest，核心组件先补 spec |
| 依赖引入失控 | qrcode / color / dayjs 越加越多 | 默认零新依赖；qrcode 单点决策；color/date 自研 |
| 上游版本漂移 | 属性对不上、样式快照过期 | 锁 `1.20.11`，广度期不升级；升级作为独立任务 |
| 重型组件拖尾 | tree/upload 卡住整波 | 允许两层交付，第一层保主链路，第二层进 D1/D2 |
| 文档站规模 | 70+ 页面后导航与 API 表维护变重 | `nav.ts` 单一数据源 + 生成式 API 表已具备；状态页自动生成 |

---

## 7. 立即可执行（下一次会话）

1. **B0**：`align-check --json` + `scripts/depth-report.mjs` + L1 清单落进 HANDOFF。
2. **B1 首批 5 个**：layout → grid → card → alert → skeleton（预计 1 天）。
3. 每完成 5 个组件，更新 README 组件表，并在 §3 对应波次下记一行进度（完成项 / 剩余项）。
4. 波次结束：`pnpm build:lib` + CDP 冒烟 + 提交 + 更新 HANDOFF。

---

## 附录 A：与旧计划的关系

- `tdesign-angular-plan.md` §6 的 P1~P4 已完成，P5 的剩余深度项（DatePicker / DateRangePicker / TimePicker / Cascader / TreeSelect 的高级 props）**转入深度债**，不再占用广度窗口。
- 旧 P6 的 `menu`、`breadcrumb`、`steps`、`tree`、`watermark`、`image-viewer`、`comment`、`affix`、`back-top`、`guide` 被本计划的 B1~B4 重新排序。
- 旧计划的 §7 文档站方案、§8 风险、§9 DoD 仍然有效；本文件只改变**顺序与验收颗粒度**。
