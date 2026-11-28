# 组件完善计划：由易到难

制定日期：2026-11-27。范围：现有组件的功能、API、演示文档和质量完善。执行状态见第 7 节。

## 1. 排序与完成口径

以局部改动范围、状态复杂度、共享依赖和验证成本排序。D1/D2/D3 是债务分类，不是难度等级；债务少也可能涉及虚拟滚动、挂载容器等复杂能力。

- 先做属性、模板、事件等局部补齐，再做多组件组合，最后做拖拽、虚拟滚动和复杂状态机。
- 同一组件分批完善：例如 Tabs 的 action 先做，数据驱动 list 后做；List 的虚拟滚动放到后期。
- 公共能力在首个真实消费组件需要时提炼，不先进行全库重构；已有 Content、PopupOptions 优先复用。
- 每轮只处理一个组件或一组紧密关联组件，完成源码、契约配置、示例、验证后再进入下一项。
- Angular 的投影、事件名、双向绑定映射单独记录，不强求 Vue 属性的字面覆盖率达到 100%。defaultValue 不能仅以“已有 value”视为等价，必须核对非受控初始化行为。
- 不以修改 ignoreUpstream 原因来冒充功能完成；确属框架差异的项目需说明等价用法和验证依据。

## 2. 第 0 轮：校准基线

当前入库 `docs/progress/README.md` 记录：73 个目录、1576 个上游属性、1005 个已对齐、261 项深度债、31 个零债务目录。这是生成文档快照，不是本次运行校验的结论。

已发现该快照中 Table 有 19 项、Pagination 有 3 项未登记缺失；部分当前配置与快照也有差异。开始实施前必须重新核对，不能直接把这些数字当作待开发清单。

1. 使用 `pnpm verify:session` 生成隔离 API 并执行源码类型、文档模板和契约检查，记录实际失败项。
2. 将源码与每个组件配置逐条对照：区分已实现未同步、真实缺失、Angular 映射和过期原因。
3. 对真实缺失列出具体属性和工作量，暂缓项如实登记，保留后续实现任务；不把登记完成计入功能完成。
4. 在统一集成阶段更新 API、demo 和 progress 生成物，再运行 `pnpm depth:report` 形成新基线。

验收：未登记 missing 与 extra 均为 0；快照与当前源码一致；已有构建失败和功能缺陷有明确记录。已有真实缺陷优先修复，不受后续难度排序限制。

## 3. 分轮执行顺序

以下为待核对的候选工作，具体属性以第 0 轮结果和锁定上游契约为准；源码已经实现的项目直接验收，不重复开发。

| 轮次 | 难度 | 组件及顺序 | 主要交付 | 前置与边界 |
| --- | --- | --- | --- | --- |
| 1 | 易：局部模板与事件 | Textarea → Tabs（action）→ Rate → Typography（Text）→ DescriptionItem | Textarea 校验事件与载荷；Tabs 自定义操作区；Rate 自定义图标；Text 复制行为；DescriptionItem 富内容投影 | 复用 Content；复制需有成功/失败反馈与浏览器环境守卫；不把 keydown 冒充 keypress |
| 2 | 易到中：属性组合 | CheckTag/Group → Button/Card → StickyTool/Submenu → Avatar/Group → InputNumber/RangeInput/TagInput → Slider | 选中/未选中样式配置、loadingProps、popupProps、头像折叠面板与 imageProps；输入/标签属性透传；Slider 数字输入联动与提示配置 | 白名单类型先从实际接收组件提取；显式输入与透传对象优先级写清；涉及挂载能力的属性留到第 4 轮 |
| 3 | 中：基础录入状态 | Input → Textarea/Checkbox/Radio/Switch → Form → SelectInput → AutoComplete → Tabs（list）→ Breadcrumb/Steps/Statistic | 事件与输入限制；受控/非受控和 CVA；表单校验联动；组合输入能力；数据驱动页签；折叠、逆序、数值动画 | 已实现内容只回归；默认值仅初始化，不覆盖后续编辑；IME、清空、禁用、动态输入、reset/touched 都要验证；路由整合单独评估 |
| 4 | 中到难：弹层基础与反馈 | Popup → Loading → Message/Notification → Dialog → Drawer → ImageViewer | 挂载点与生命周期契约；内容模板化；开关前钩子、焦点恢复、滚动锁定；自定义容器；最后补 Dialog 拖动、Drawer 尺寸拖动 | 先完成 Popup/Loading 基础再让其他组件消费；处理嵌套弹层、多实例与销毁；钩子是否可阻止/异步须按上游核实 |
| 5 | 中到难：选择组件 | SelectInput 回归 → Select → Cascader → Tree 基础过滤/勾选 → TreeSelect | 先 label/tips/status/readonly 等外观输入与事件，再受控显隐、搜索、keys、折叠回显与类型化透传，最后补异步与树选择联动 | 依赖第 2～4 轮；Cascader 仅在实际共享树逻辑时等待 Tree；TreeSelect 需验证祖先/后代、半选、禁用、过滤与取值模式组合；虚拟滚动后置 |
| 6 | 难：日期与时间状态 | TimePicker → DatePicker → DateRangePicker → Calendar 回归 | 先常规属性/事件和 popupProps，再时间禁用与 timePickerProps；模板化单元格/回显；最后范围面板、确认/取消和模式组合 | 日期工具同一轮串行维护；覆盖格式解析、闰年、月末、跨年周、空值、非法输入与范围边界；范围时间能力在当前 API 契约范围内验收 |
| 7 | 难：文件与复合数据 | Upload → Transfer → Menu | Upload 模板/按钮配置、图片缩略图/预览、批量及取消/失败重试；Transfer 先 keys/分页，再树形与目标列表拖拽；Menu 路由和嵌套交互 | Upload 依赖 ImageViewer；Transfer 树形依赖 Tree；Menu 路由与 Breadcrumb 统一决定可选 peer/集成方式，保留无 router 消费场景 |
| 8 | 很难：大数据与重型交互 | 公共虚拟滚动最小能力 → Select/List → Tree → Tree 拖拽 → Table | 先固定行高窗口、滚动定位，再树展开与过滤联动；树落点校验与事件；最后完善 Table 剩余高级能力及其组合 | 每项先核实已有实现；Table 按当前缺口拆分，优先单功能再组合排序/筛选/选择/分页/固定列/多级表头/合并/虚拟滚动/列宽拖拽，不重写已完成部分 |

第 8 轮中可视窗口、树拖拽、表格能力分别交付，避免一次引入多个复杂状态机。若 Table 的残余项只是模板或事件，移到相应早期轮次完成，不因组件名而全部后置。

## 4. 贯穿各轮的质量任务

- **SSR**：首轮排查 Icon 的 DOMParser 与组件直接访问 window/document 的位置，修改相关组件时补环境守卫；后续完成服务端渲染与水合检查。零债务不代表 SSR 已通过。
- **无障碍**：每轮补语义、标签、焦点、键盘操作；弹层验证 Esc/Tab/焦点恢复，选择与树组件验证方向键、选中态和禁用态。
- **国际化**：沿用 ConfigProvider/TConfigService，先用一个组件确立缺省合并与动态更新规则，再随各轮迁移文案；日期格式与周起始日单独验证。
- **自动测试**：第 0 轮核实测试入口，确定最小可运行方案并接 CI；优先覆盖真实风险：CVA、异步取消、树勾选、日期边界、虚拟窗口。纯展示小改动以类型检查和页面验证为主。
- **样式**：始终使用 vendor 的真实类名；bridge 仅做必要宿主和等价选择器适配，说明原因。light/dark、尺寸、禁用和窄屏按涉及范围回归。
- **既有零债务组件**：Divider、Space、Link 等纳入全量回归，不为了清单完整而重写；新增缺陷或真实遗漏再进入对应轮次。

## 5. 每个任务的验收模板

1. 核对锁定上游 `tdesign-vue-next@1.20.11` 的类型、默认值与实际行为，列出本次实现属性及不涉及的残余项。
2. 完成源码、`@zh/@en` 注释、对应 align-check 配置和可操作 demo；新增能力至少展示正常情况和一个重要边界。
3. 执行 `pnpm verify:session -- TComponent`；关联多个组件时分别验证或运行完整 session 校验。
4. 用独立文档端口与 CDP 端口验证页面，要求 `issues: []`、`badResources: []`；同时操作功能验证，不能仅检查页面成功加载。
5. 复杂行为加入有意义的自动测试；报告受控/非受控、键盘、异步/销毁等实际检查结果及残余风险。
6. 由统一集成流程生成 API/demo/progress，运行 `pnpm verify` 与 `pnpm build`；按变更范围执行页面回归，记录新增 warnings 与既有 warnings。

## 6. 执行与里程碑

默认按单线执行上述顺序；每次实现前重新检查工作区与本轮组件状态。若后续安排多会话，沿用 `depth-parallel-plan.md` 的共享文件归属、生成物隔离与独立端口约定。

| 里程碑 | 达成条件 |
| --- | --- |
| M0 基线可信 | 当前 API、债务、映射与缺失清单相符，校验失败有明确原因 |
| M1 局部能力补齐 | 第 1～2 轮验收；形成可复用的内容与透传范式 |
| M2 基础交互稳定 | 第 3～4 轮验收；CVA、弹层焦点和生命周期通过回归 |
| M3 业务组件完整 | 第 5～7 轮验收；选择、日期、上传、穿梭的主要组合场景可用 |
| M4 重型能力稳定 | 第 8 轮验收；大数据、拖拽与 Table 组合场景有性能和正确性证据 |
| M5 发布候选 | 完整构建、契约校验、全站回归与消费项目 smoke 通过；剩余框架差异和限制明确记录 |

每轮记录：已完成行为、剩余真实债务、框架映射、回归结果与风险。不按删除 ignore 条数衡量产出；未核对源码前不承诺精确工期。

**首批执行单**：第 0 轮基线校准 → Textarea 校验事件 → Tabs.action → Rate.icon → Text.copyable。先用这批任务跑通完整交付流程，再推进组合型组件。

## 7. 执行记录

### 2026-11-27：第 0 轮及第 1 轮

- **基线核实完成**：`pnpm verify:session` 通过，missing 0 / extra 0。旧 progress 的 Table/Pagination 缺失源于入库 API 过期，源码已分别对齐 45/62、19/23；本轮没有修改这两个组件的实现。修正生成物前的实际基线是已对齐 1033、深度债 255，不能把旧快照到当前的差额都算成本轮产出。
- **Textarea**：新增 validate 与原生 keypress 事件；超限状态切换和程序写值都参与校验；allowInputOverMax 不再被原生 maxlength 提前拦截；maxcharacter 对齐上游 ASCII/非 ASCII 计数，截断保留完整 Unicode 码点；IME 组合输入结束后仅提交一次。
- **Tabs**：action 支持字符串和 Content 模板，复用 vendor 的 nav-action 类，可与新增按钮共存；测量操作区宽度，为长导航预留空间，避免末尾页签被遮挡。
- **Rate**：icon 支持字符串和 Content 模板，保留双层图标颜色、半星、清空和禁用行为。
- **Text**：copyable 支持 text、suffix（copied 模板上下文）、当前 Tooltip 的类型化配置和 onCopy；包含浏览器环境守卫、禁用、异步销毁与失败反馈。
- **DescriptionItem**：将 textContent 静态快照替换为模板投影；保留组件事件与动态绑定，显式 content 优先。
- **文档与回归**：新增 5 个可交互 demo、`scripts/qa-component-completion.mjs`；源码/模板校验、`pnpm verify`、完整 `pnpm build` 与 5 个页面交互回归通过。最终导航调整后又通过交互回归、组件库构建及文档站生产构建。页面探针均无 console 异常、无失败资源。生成后的指标：已对齐 1036（65.7%）、深度债 250、零债务目录 35/73。

交互回归命令（先启动独立开发服务与 Edge）：

```powershell
pnpm --filter @tdesign-ng/docs exec ng serve --port 4307
# 另一终端
$env:CDP_PORT='9477'
node scripts/headless-edge.mjs start
$env:PORT='4307'
node scripts/qa-component-completion.mjs
```

测试使用独立页面中的剪贴板 mock，覆盖成功、拒绝、禁用和成功回调，不读写用户剪贴板；实际系统权限差异仍需消费环境验证。测试依赖开发模式的 Angular 调试 API，不用于生产构建。

已知既有告警：Dialog/Drawer 未使用的 footer slot imports；Browserslist 数据过期；文档站首包超过 500 kB 告警线（当前 791.13 kB）；qrcode 的 CommonJS 依赖提示。Icon 源码已有 DOMParser/document 守卫，不重复补守卫；完整 SSR/水合验证仍待后续质量任务。

**接续任务**：第 2 轮 CheckTag/CheckTagGroup 的 checkedProps/uncheckedProps → Button/Card 的 loadingProps → StickyTool/Submenu 的 popupProps。其余轮次尚未实施；不将首轮完成等同于全计划完成。

### 2026-11-27：第 2 轮首批（6 个组件入口）

- **CheckTag / CheckTagGroup**：新增 checkedProps / uncheckedProps，覆盖主题、变体、形状、尺寸、颜色、图标、文字宽度、title、禁用和关闭回调。声明 `CheckTagTagProps`，不接收会覆盖选择、内容及点击逻辑的任意 Tag 配置。显式 size 优先，显式禁用和表单禁用不能被状态配置解除。保留宿主结构，确保 vendor 的组内相邻间距规则继续生效；补齐 CVA 的 setDisabledState。
- **Button / Card**：新增 loadingProps，复用现有 LoadingOptions，透传当前可实现的文字、尺寸、颜色继承、延迟、全屏、遮罩、滚动锁定及 zIndex；loading 状态由父组件输入控制，不接收未实现的 attach/indicator 等键。Button 默认继承颜色，延迟期间仍拦截提交。补一条 bridge 等价选择器，恢复 Loading 宿主打断的图标/文字间距，并验证延迟显示前没有空白间距。
- **关联修复**：Card 的投影槽改为常驻，解决初始 loading=false 时主体无法被探测和显示的问题；加载切换保留子组件状态。Loading 延迟变化会重新等待；滚动锁按 Document 计数，每个实例只释放自己的锁，保留外部原有锁，销毁行内 Loading 不影响全屏实例。
- **StickyTool**：整组与单项均支持 PopupOptions；默认值 → 整组配置 → 单项配置 → 单项显式 trigger，语义类与自定义类合并。
- **Submenu**：浮层模式支持 PopupOptions，保留菜单自动定位、主题类和显式禁用；选中菜单项后关闭浮层，内联模式不使用弹层配置。
- **进度同步**：API、demo-sources 与 `docs/progress/` 均由脚本更新。新增 5 个 demo，全部示例共 319 个；已对齐 1036 → 1044（66.2%），真实深度债 250 → 242，零债务目录 35 → 38。CheckTag 仍保留已有的原生 click 差异记录，不把整个目录宣称为全面完成。
- **回归范围**：交互脚本继续覆盖首轮 5 个组件，并新增 CheckTag/Group 的单多选、键盘、关闭回调及表单禁用，Button/Card 的延迟与内容保留，Loading 的多个/外部滚动锁，StickyTool 的配置优先级，Submenu 的主题类、定位、选中关闭与内联模式。5 个本批文档页面均通过页面探针，无 console 异常与失败资源。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、`pnpm build`、交互回归及 `pnpm check:progress` 全部通过，missing 0 / extra 0。完整构建保留既有 footer slot、Browserslist、qrcode CommonJS 与首包预算告警（当前首包 791.20 kB），无构建错误。

本批按用户要求验证后自动提交，并保持 progress 生成物同步。**接续任务**：第 2 轮 Avatar/AvatarGroup → InputNumber/RangeInput/TagInput → Slider；第 2 轮整体与 M1 尚未全部完成。

### 2026-11-27：第 2 轮 Avatar / AvatarGroup

- **Avatar.imageProps**：图片分支复用 TImage，提供 AvatarImageProps 类型，覆盖 fit、position、shape、referrerpolicy、gallery、lazy、srcset、加载/错误/占位/浮层内容、备用图片及 onLoad/onError。image/alt 由头像显式输入管理；内容与 collapseAvatar 统一支持 Content 模板。
- **失败行为**：按锁定上游行为修正 hideOnLoadFailed：false 保留 Image 错误态，true 隐藏失败图片并显示内容；更换 image 重置失败状态。原有“总是回退内容”的说明已同步修正。
- **AvatarGroup.popupProps**：复用 PopupOptions，提供折叠头像列表与可聚焦触发器，支持点击/悬浮、键盘、禁用、关闭销毁及类名等配置。锁定的上游 1.20.11 声明了此属性，但 group.mjs 未消费；本库按完善计划提供实际折叠弹层，不能称为对该版本运行行为的完全复刻。
- **组件保留**：通过 CDK DomPortal 移动原头像宿主到弹层，关闭时恢复原位置；不复制头像，不丢失宿主 click、投影图标、内部按钮和原组件状态。动态删除头像时解绑 Portal 并清理节点，组内成员与 max/size 变化实时更新。max 未设置、0 或负数时全部展示。
- **样式适配**：更新 bridge 中因头像宿主隔开的层叠规则，使用 vendor 的 -8px 对应尺寸变量和初始 z-index 50；折叠触发器补必要的宿主桥接。可见项与折叠列表中已验证无重复头像。
- **关联 Image 修复**：空字符串 loading 明确表示不显示加载占位；缓存探测不再把解码失败误报为 load；同资源缓存探测/原生 load 去重，新 srcset 资源仍可通知；备用图片再次失败时进入错误态，不无限重试。
- **交互回归**：通过 HTTP 200 的无效图片 fixture 验证真实解码失败、事件各一次、备用图片成功/失败、地址更新恢复；验证折叠模板、原宿主 click、投影按钮及图标、动态增删、反复开关、max/size、键盘、动态禁用关闭、aria-expanded 重置及组销毁清理。扩展脚本保留前两批所有回归。
- **生成进度**：新增 2 个 demo，总计 321 个；`docs/progress/avatar.md` 与总表由脚本同步，Avatar 目录真实债务 2 → 0；全库已对齐 1044 → 1046（66.4%）、深度债 242 → 240、零债务目录 38 → 39。
- **页面检查**：Avatar 页面无 console 异常或失败资源；Image 页面原有失败演示请求 `/not-exists.png` 返回 404，属于现有示例行为，未算成本批新增错误。系统剪贴板等其他既有回归仍使用隔离 fixture。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、全部组件交互回归及 `pnpm check:progress` 通过；missing 0 / extra 0。保留已有 footer slot、Browserslist、qrcode CommonJS 和首包预算告警，本批首包约 795.23 kB。浏览器验证已完成，完整 SSR/水合验证仍属后续质量任务。

**接续任务**：第 2 轮 InputNumber / RangeInput / TagInput 的类型化属性透传 → Slider；第 2 轮与 M1 尚未全部完成。

### 2026-11-27：第 2 轮复合录入属性透传

- **共享配置**：新增公开类型 InputOptions 和内部 InputOptionsDirective，只接受实际支持的原生编辑区属性：name、autocomplete、spellCheck、autofocus、disabled、readonly、maxlength、maxcharacter、allowInputOverMax，以及输入/焦点/键盘/组合输入回调。回调参数为 `(value, { e })`。不接受 value、defaultValue、type、format、clearable、size、status、任意 DOM 属性或外框模板；这不是完整 Vue InputProps 的复制。
- **InputNumber.inputProps**：原生配置、键盘/焦点回调与数值处理共存。输入长度限制作用于用户键入，程序写值和步进仍按原数值逻辑处理。显式禁用、表单禁用及 inputProps.disabled 取并集；readonly 同样合并，步进按钮和键盘修改路径同时受保护。
- **RangeInput.inputProps**：支持公共单对象或左右配置数组；左右 readonly/disabled 独立合并。任一侧不可编辑时隐藏整体清空并保护清空入口，避免修改受保护侧。动态替换配置后，原生属性、长度限制及只读立即更新。IME 期间不截断，compositionend 后归一化并避免浏览器紧接着派发的同值 input 导致重复事件。
- **TagInput.inputProps / tagProps**：输入区使用 InputOptions；TagInputTagProps 支持主题、变体、形状、颜色、title、maxWidth、disabled、closable 和 onClose。标签内容/尺寸、输入值、标签数组和删除流程由 TagInput 管理；关闭回调与 remove 各触发一次，折叠计数标签保留默认样式。不接收未接入的任意 TagProps。
- **关联交互修复**：TagInput 只读/禁用时回车、删除与清空均不可改值；IME 回车不清空草稿也不创建标签，组合输入结束后再按长度限制提交。InputNumber 非法字符继续回退到上次合法文本；RangeInput 回车事件继续带位置信息。
- **文档与进度**：新增 3 个可操作 demo，示例共 324 个；生成 API、demo-sources、`docs/progress/input-number.md`、`range-input.md`、`tag-input.md` 和总表。已对齐 1046 → 1050（66.6%），真实深度债 240 → 236，零债务目录 39 → 40；这些是顶层属性登记口径，不代表完整 Vue 透传对象的所有字段已经实现。
- **交互回归**：覆盖原生属性、单对象/左右数组、中文限制、IME 单次提交、非法数字恢复、键盘步进、关闭回调、动态配置、单侧保护、显式禁用优先、Reactive Forms 禁用/启用及 reset。保留之前所有批次的回归；3 个文档页面探针均无 console 异常与失败资源。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、交互回归及 `pnpm check:progress` 通过；missing 0 / extra 0。构建保留既有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 795.23 kB），无构建错误。

**接续任务**：第 2 轮 Slider 的 inputNumberProps / tooltipProps；其他轮次仍按原顺序，M1 尚未全部完成。

### 2026-11-27：第 2 轮 Slider，M1 验收

- **数字输入联动**：inputNumberProps 支持 true / false / SliderInputNumberProps；单值、区间与竖向复用现有 InputNumber。Slider 管理 value、min、max、step；配置支持当前实际接入的尺寸、主题、对齐、宽度、格式、小数位、富内容、inputProps、只读、禁用及 onChange。禁用取并集；数字框只读不影响滑块轨道。数字输入触发 change 和配置回调，不触发 changeEnd；清空不写入非法 Slider 值。
- **提示配置**：SliderTooltipProps 支持纯文本 content、placement、theme、showArrow、delay、duration、disabled、destroyOnClose、zIndex；显示状态由 hover / focus / drag 管理，显式 label 优先，false 强制隐藏。延迟任务在交互结束、禁用与销毁时取消，拖动即时显示。Tooltip 的受控模式不再被宿主 hover / focus 或面板离开事件擅自覆盖。
- **关联修复**：区间任一端交叉均排序，拖动交叉后切换活动端，避免后续指针继续移动错误端；步长相对 min 对齐；点击滑块按钮不再冒泡成轨道点击。拖动中禁用会移除 document 监听且不继续发出 change / changeEnd；受控拖动结束携带最后提交值。每个滑块分别提供 role、当前值、方向、禁用状态与可聚焦性。
- **InputNumber 受控展示**：父级拒绝或归一化编辑且绑定值不变时，也重新同步显示文本，修复区间输入交叉后两侧文本与实际区间不同步；保留合法输入中间态和已有 CVA 回归。
- **范围说明**：上述对象是实际支持字段的白名单，不是完整 Vue Props；不支持 Vue 渲染函数、Tooltip.visible 或任意透传。label 的字符串 / boolean 边界保留，零债务目录不代表框架差异、SSR 或所有质量任务已经完成。本批没有增加样式覆盖，使用现有 vendor 类。
- **交互与页面**：新增 1 个可操作 demo，覆盖受控单值、非受控区间、竖向小数、动态显示/只读/禁用。回归覆盖数字输入、事件次数、清空、键盘、双向交叉及连续拖动、非零 min 步长、拖动中禁用、提示延迟/时长/焦点/配置优先级/取消及区间编辑文本同步；所有前批回归保留并通过。Slider 页面探针 issues / badResources 均为空，截图已检查。
- **生成进度**：API、demo-sources 和 progress 由脚本同步。示例 324 → 325；已对齐 1050 → 1052（66.8%），真实深度债 236 → 234，零债务目录 40 → 41。Slider 目录真实债务 2 → 0。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、所有批次交互回归、`pnpm check:progress` 与 `git diff --check` 通过，missing 0 / extra 0。库构建发现 replaceAll 不属于当前 ES 目标，已改为 split/join；保留既有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 795.40 kB）。

本批结束第 2 轮，第 1～2 轮达到计划 M1 的局部能力验收口径。**接续任务**：第 3 轮 Input → Textarea / Checkbox / Radio / Switch → Form，按原计划核实已有实现、补齐真实缺口；M2～M5 仍未完成。

### 2026-11-27：第 3 轮 Input / InputGroup

- **状态契约**：Input 新增 defaultValue，首次初始化读取，后续修改不覆盖用户编辑；value 未绑定时维护内部值，绑定时保留父级控制权，父级拒绝修改会恢复原生展示。CVA 写值优先于默认值，验证 disable / enable / reset / touched；不建议同时绑定 value 与表单。
- **输入与校验**：组合输入期间保留草稿，结束后统一格式化和截断，去重浏览器紧接着的同值 input；IME 回车不发 enter。maxcharacter 对齐 ASCII 计 1、非 ASCII 每个 UTF-16 单元计 2，截断保留完整码点；maxlength 按码点计数，二者同时设置时 maxlength 优先。组件主动处理长度以保留 emoji、IME 和 allowInputOverMax，不再由原生 maxlength 提前拦截。validate 在初始超限及超限状态切换时输出 { error }，覆盖程序写值；默认状态自动呈现长度错误，并提供 aria-invalid / aria-describedby。
- **事件**：新增 compositionstart / compositionend（{ value, e }）、keypress（原生 KeyboardEvent）、paste（{ e, pasteValue }）和 wheel（{ e }）。保持既有 change / focus / blur / enter 等参数，内部阻止同名冒泡事件导致重复回调；paste 不主动改值，允许回调取消默认行为。真实鼠标验证发现同名 mouseenter / mouseleave 输出会与宿主原生事件重复，最终保留宿主原生 MouseEvent，明确其范围包含标签和提示区域。
- **自动宽度与类名**：autoWidth 复用 vendor 的隐藏文本镜像与自动宽度类，随值、草稿、占位文字、尺寸变化测量；ResizeObserver 处理字体/布局变化并在销毁或关闭时断开。inputClass 支持字符串、数组、条件对象，写入内层 .t-input，保留宿主 class；动态替换会清理旧类名。
- **InputGroup**：核实 separate 属于 TdInputGroupProps，新增独立 TInputGroup 及模块导出；TInput / TInputGroup 分别对齐明确接口，总上游属性仍为 46，不通过减少分母改善进度。组内输入保持各自值及表单状态。bridge 仅补 Angular 宿主隔开的上游相邻、首尾和分离间距选择器，沿用 vendor 的 -1px、圆角与 comp-margin-xxxl 变量。
- **AutoComplete 消费修复**：改为消费 Input 组合事件的 e，记录组合状态，阻止组合期间 Enter / 方向键选项操作；组合结束与键盘选项选择各只发一次预期事件。本批不替代后续 AutoComplete 独立完善任务。
- **生成进度与边界**：新增 2 个 demo，总数 325 → 327；已对齐 1052 → 1056（67.0%）、真实深度债 234 → 223、零债务目录 41 → 42。11 项债务减少中，8 项对应新增行为（autoWidth、6 类事件、InputGroup.separate），另 3 项是经验证的原生鼠标事件和已存在 suffixIcon 投影映射修正；defaultValue / inputClass 此前被误列为映射，本批实际补齐。标签 / tips 仍为字符串，图标和 suffix 使用投影，零债务不代表所有 Vue 渲染函数或完整 SSR 已实现。
- **交互与页面验证**：所有前批回归保留并通过；新增受控拒绝、默认值不重写、CVA 禁用/恢复/reset/touched、格式化、加权截断、初始及程序超限/恢复、IME 单次提交、只读/禁用、动态类名、自动宽度（含组合草稿、占位与尺寸）、组合边框/分离间距与独立编辑。真实 CDP 鼠标移动验证宿主 enter / leave 各一次；AutoComplete 验证 IME Enter 不选项、组合结束单次提交、方向键与 Enter 选项提交。Input / AutoComplete / Form 页面探针 issues / badResources 均为空，Input 页面截图已检查。
- **检查结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、交互回归、`pnpm check:progress` 和 `git diff --check` 通过，missing 0 / extra 0。保留既有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 799.52 kB）。生成 API / demo 时开发服务可能触发整页重载，最终回归在文件稳定后运行通过。

**接续任务**：第 3 轮 Textarea / Checkbox / Radio / Switch → Form → SelectInput，先核实已有实现。第 3 轮整体与 M2 尚未完成。

### 2026-11-27：第 3 轮 Textarea / Checkbox / Radio / Switch 状态

- **默认值与受控/CVA**：新增 Textarea.defaultValue、Checkbox.defaultChecked、CheckboxGroup.defaultValue、Radio.defaultChecked、RadioGroup.defaultValue、Switch.defaultValue。六个入口复用内部 createControllableState：默认值只初始化一次；绑定值时修改只发提案，父级拒绝后恢复显示；CVA 写值优先于默认值，支持 disable / enable / reset。未设置受控值的输入默认改为 undefined，非受控仍保持原空值/未选中默认行为。使用表单时不同时绑定 value / checked。
- **Textarea**：组合输入保留草稿，结束后统一归一化并去重尾随 input；受控拒绝不遗留原生草稿。maxlength 按 Unicode 码点限制并优先于 maxcharacter，移除原生 maxlength 对 emoji 和 IME 的提前拦截；零上限、计数、超限校验同步。autosize 现在响应程序写值、默认值、草稿与配置变化，关闭时清理行内高度；补 getComputedStyle 环境守卫。keydown / keyup 不再与原生冒泡事件重复触发，禁用下不发键盘输出。
- **Checkbox / Group**：全选只修改可编辑项，保留禁用/只读及当前未渲染项，并遵守 max；达到上限后禁用未选中项。动态 value、checkAll、禁用与只读变化参与组内同步；组 name 下发到原生 input；订阅在成员移除/销毁时释放。原生 change 在内部停止冒泡，组 change 一次编辑只发一次；受控拒绝和 max 拒绝恢复原生 checked / indeterminate。
- **Radio / Group**：组 allowUncheck 实际下发子项；取消选中事件值明确为 undefined。原生 input 承担可聚焦的 radio 语义；组提供 radiogroup 语义和单一 Tab 入口，方向键循环跳过禁用项，Home / End 定位首尾可编辑项。只读阻止原生方向键改值；补 aria-readonly。bridge 将 vendor 的 label:focus-visible 轮廓等价映射到 input 聚焦状态，保留键盘焦点提示；组内焦点移动不误报 touched；背景动画帧去重并在销毁时取消。
- **表单失焦语义**：Checkbox、Radio、Switch 改为失焦通知 touched；组通过焦点离开整组通知。验证 updateOn: 'blur' 编辑时模型不提前提交，离焦后提交；整组内部换焦点保持未 touched。Textarea 保留失焦语义并验证相同流程。
- **Switch 异步拦截**：等待时显示内置 loading 与 aria-busy，重复点击不重复调用 beforeChange；同步 false/抛错、Promise false/拒绝均不切换。值、禁用/加载、customValue、beforeChange、CVA 写值或销毁使旧请求失效；版本检查保证旧请求不会覆盖新请求或清除新请求的等待状态。键盘重复按下不重复切换；CVA 空值归一到自定义未选中值。加载图标补齐 vendor 的 t-icon 类，使用开关的图标尺寸规则，避免继承 Loading 的 36px 默认尺寸。
- **进度与边界**：新增 4 个可操作 demo，共 327 → 331 个；已对齐 1056 → 1062（67.4%）。六项默认值此前误记为 Angular 映射，本批补齐真实功能；真实债务仍为 223，零债务目录仍为 42/73，不将映射修正冒充债务清零。Checkbox / Group 的 lazyLoad 两项继续保留，富内容与完整 SSR/水合等差异不在本批声称完成。
- **交互与页面**：新增默认值不覆盖编辑、受控拒绝、CVA disable / enable / reset / updateOn blur / touched、Unicode / IME、动态 autosize、组全选上限与保护项、动态成员和值、单次 change、allowUncheck、Tab 入口与方向键 / Home / End、焦点轮廓、Switch 同步/异步拒绝及多种失效取消、销毁、防重和旧新请求隔离回归，保留前批全部交互检查并通过。四个页面探针均 issues / badResources 为空；Radio / Switch 截图已检查。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、交互回归、`pnpm check:progress` 和 `git diff --check` 通过，missing 0 / extra 0。保留既有 footer slot、Browserslist、qrcode CommonJS 和首包预算告警（约 799.66 kB）。

**接续任务**：第 3 轮 Form → SelectInput → AutoComplete → Tabs.list → Breadcrumb / Steps / Statistic，继续核实已有实现。第 3 轮整体与 M2 尚未完成。

### 2026-11-27：第 3 轮 Form 重置与校验生命周期

- **原生 form id**：id 输入指向实际原生 form，宿主不保留同名 id，动态修改生效；外部 button 的 form 属性可以引用并提交。原生 submit / reset 在内部拦截冒泡，避免同名输出重复通知；reset 阻止浏览器再执行一次默认重置。
- **重置语义**：此前 resetType 虽已登记但始终恢复初值，现接入 empty / initial。empty 将字符串、布尔、数组分别置为 ''、false、[]，数字及对象置为 null；initial 恢复控件首次就绪时的值。初始值在控件就绪微任务捕获，覆盖 ngModel 延迟初始化与动态字段；数组、普通对象和 Date 保存/恢复副本，避免编辑污染初值。重置清除 touched / dirty 和提示，保持禁用状态，输出重置后的字段值；不额外触发 valueChanges 自动校验。
- **禁用所有权**：表单只释放自己持有的禁用锁，预先禁用的控件不会被顺带启用。相同 Angular Control 被多个表单项引用时按 WeakMap 计数，最后一个锁释放后才恢复；成员移除/销毁释放自己的锁。外部 FormGroup.disable/enable 与 t-form.disabled 同时管理同一周期的优先级仍有限制，文档明确建议采用单一来源。
- **规则与提示**：提交检查全部规则，包括配置 blur / change 的规则；交互时仍按 trigger 过滤。显式空 rules 数组可覆盖表单规则。全局正则每次校验重置 lastIndex，非法正则按失败结果返回；whitespace=false 不再被空值短路，自定义 validator 可以检查空值。同步抛错和 Promise 拒绝返回规则失败文案，不产生未处理异常。errorMessage 同时作用于界面和 validateAll / validateField 返回结果。
- **异步失效**：每个 FormItem 的校验有版本控制，后发校验、字段改值/改名、规则变化、clearValidate、重置或销毁使旧结果失效，不覆盖当前界面。过期结果返回 { result: false, stale: true }，明确不能用于提交。重复 submitForm 在等待期间返回 null；字段值、规则、成员或操作版本改变时取消本次提交。validate 回调同步修改字段也不会提交未经校验的新值。失效只忽略返回结果，不主动中止用户自定义请求。
- **动态字段与焦点**：移除成员不再参与取值/校验，新增成员不会随旧提交一并放行；初始重置值按新控件捕获。FormItem 内部输入框到辅助按钮的焦点切换不触发 blur 校验，焦点离开整项才触发。
- **进度与限制**：新增 Form 生命周期 demo，示例 331 → 332；对齐 1062 → 1063（67.4%），真实债务 223 → 222，零债务目录仍为 42/73。id 债务实际实现，resetType 等属于已有登记行为修复。表单级 readonly 仍保留为 1 项真实债务，需要跨控件统一上下文，本批不将它改列映射。每项当前管理首个 Angular 表单控件；errorMessage 仍为统一字符串，scrollToFirstError 仍为布尔，statusIcon 与富内容等既有边界未在本批扩展，不宣称完整上游运行语义或 SSR/水合验收完成。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、全部前批及本批交互回归、`pnpm check:progress` 和 `git diff --check` 通过，missing 0 / extra 0。交互覆盖两种 reset、原生 reset/submit 单次输出、外部按钮按 id 提交、ngModel 初值、数组副本、动态字段、禁用所有权及共享锁、trigger/空规则覆盖/全局及非法正则/空值/warning、统一提示、内部换焦点、异步结果乱序/拒绝/清除、重复提交及各类失效。Form 页面 issues / badResources 为空，截图已检查。保留既有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 799.66 kB）。

**接续任务**：Form.readonly 跨控件上下文 → SelectInput → AutoComplete → Tabs.list → Breadcrumb / Steps / Statistic。Form 整体、第 3 轮与 M2 尚未完成。

### 2026-11-28：第 3 轮 Form.readonly

- **上下文与优先级**：新增内部 FORM_READONLY 注入契约及 useFormReadonly，通过最近的 TForm 提供动态只读信号，避免组件反向引用 Form。表单只读与控件本地只读取并集，显式 false 不会解除表单只读；表单 false 不会解除显式 true。程序写值、表单取值、提交、reset 和 Angular Control 的 enabled / disabled 状态不受只读改变。
- **消费范围**：接入 Input、Textarea、InputNumber、RangeInput、TagInput、Checkbox / CheckboxGroup、Radio / RadioGroup、SelectInput、Select、AutoComplete、DateRangePicker 共 13 个现有 readonly 入口，包含直接投影、动态字段和复合控件内部原组件。锁定上游 Switch 使用 useDisabled、不消费 readonly，本库 Switch 保持独立行为；同样不为没有 readonly 语义的控件伪造禁用，也不自动改写原生或第三方 CVA。文档列明支持范围，后续新增只读组件可复用上下文。
- **编辑与显示**：继承后的只读参与原生 readOnly、只读样式、勾选/键盘/全选、输入限制、步进、标签关闭/拖拽和清空判断；隐藏 Select 的不可用关闭图标。Input / Textarea 切到只读时取消组合草稿，RangeInput 恢复受保护侧的展示并清理组合状态，避免只读切换遗留未提交文本。
- **弹层保护**：Select、AutoComplete、SelectInput、DateRangePicker 动态只读或禁用时关闭现有弹层；阻止重新打开、搜索、清空、标签移除与日期提交。SelectInput 的受控可见值也由只读状态约束，不能靠 popupVisible=true 打开只读面板。DateRangePicker 的日期、时间、确认、清空与输入提交均有只读守卫；自定义面板中的业务回调仍由调用方管理。
- **进度与边界**：新增表单只读 demo，示例 332 → 333；对齐 1063 → 1064（67.5%）、真实债务 222 → 221、零债务目录 42 → 43。Form 已登记的 readonly 债务实际实现，保留前批记录的 errorMessage / statusIcon / scrollToFirstError / 富内容等实现边界；零债务不代表完整 Vue 运行语义或 SSR/水合验收完成。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、所有前批及新增交互回归、`pnpm check:progress` 与 `git diff --check` 通过，missing 0 / extra 0。新增覆盖 13 个入口的只读编辑保护、本地 true/false 优先级、动态字段、解除恢复、IME 草稿取消、CVA 保持 enabled、程序写值及提交/reset、表单外隔离、Switch 独立行为，以及四类弹层从打开到只读后的实际关闭；受控 popupVisible=true 也不能绕过只读。Form / SelectInput / Select / AutoComplete / DateRangePicker 页面探针 issues / badResources 均为空，Form 截图已检查。保留已有 footer slot、Browserslist、qrcode CommonJS 和首包预算告警（约 799.66 kB）。

**接续任务**：第 3 轮 SelectInput → AutoComplete → Tabs.list → Breadcrumb / Steps / Statistic，第 3 轮整体与 M2 尚未完成。

### 2026-11-28：第 3 轮 SelectInput 配置与状态

- **inputProps**：复用 InputOptions / InputOptionsDirective，将 name、autocomplete、spellCheck、autofocus、长度限制及焦点/键盘/组合输入/onChange 回调接入两种原生编辑区。长度限制由组件处理，不使用原生 maxlength 提前拦截 emoji/IME；maxlength 按码点、maxcharacter 按加权长度，多个限制共同约束，allowInputOverMax 可放行。新增 directive 内部开关默认保留其他消费方原行为。
- **tagInputProps / tagProps**：新增 SelectInputTagInputProps 白名单，支持 inputProps、tagProps、disabled、readonly、onInputChange、onChange，仅 multiple 生效；多选嵌套 inputProps 覆盖共享配置同名键，禁用和只读取所有来源并集。顶层 tagProps 覆盖嵌套默认值，扩展实际接入的 shape、color、title、closable、disabled、onClose；关闭回调、tagChange 与配置回调各按一次编辑通知。选择值、输入文本、显隐、模板和创建流程仍由 SelectInput 管理，不宣称完整 Vue InputProps / TagInputProps 透传。
- **受控与表单**：选择值复用 createControllableState，修复受控 value 被内部修改及 CVA 初次写值被 value 同步覆盖的问题；父级拒绝删除后保留原标签。inputValue 受控值优先，编辑被拒绝时恢复原生文本。CVA reset 清理内部关键字/组合草稿并恢复表单标签，disable/enable 沿用表单禁用并集。单选 clear 仍只清输入文本，多选 clear 同时提案清空标签。
- **IME 与事件**：组合输入期间保留草稿、忽略 IME Enter，结束时统一限制，去重紧接着的同值 input；输入/标签配置回调保留原上下文。paste 阻止同名原生事件冒泡，外部只收到一次 { e, pasteValue }；禁用不发 paste/enter/输入修改。mouseenter / mouseleave 保留宿主原生 MouseEvent（范围包含提示区域），经真实 CDP 鼠标验证各一次，两项旧 D3 记录修正为映射，不计新功能产出。
- **面板与焦点**：Popup 新增 containsTarget / isVisible 查询辅助方法，SelectInput 用本浮层边界判断失焦，不再把任意其它 Popup 当作自身面板。焦点从输入进入自己的面板不触发 touched，离开面板后通知，验证 updateOn: 'blur'。受控 popupVisible 被父级拒绝时恢复实际浮层显示；多选仅在面板确实关闭后按 reserveKeyword 清理关键字，拒绝关闭不误清。disabled / readonly / Form.readonly 继续阻止打开、清空和删除。
- **进度与限制**：新增 1 个 demo，总数 333 → 334；对齐 1064 → 1066（67.6%），真实债务 221 → 217，零债务目录 43 → 44。债务减少包括两项属性实际实现及两项原生鼠标映射校准。保留现有 popupProps 四字段白名单、模板/框架差异和 autoWidth 等既有能力边界；没有引入完整 TagInput 自动创建、排序或上游所有透传键，不把零债务等同于完整 Vue 行为或 SSR/水合验收。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、所有前批及新增交互回归、`pnpm check:progress` 和 `git diff --check` 通过，missing 0 / extra 0。新增验证原生属性/动态配置、Unicode 与加权限制、IME 单次提交、paste/enter 单次回调、嵌套配置/禁用只读优先级、标签外观和关闭回调、受控删除/输入/显隐拒绝、关键字保留/清理、默认输入值仅初始化、CVA 禁用/恢复/reset/updateOn blur、本面板与其它浮层的焦点边界、真实鼠标 enter/leave 各一次。SelectInput / Form / Popup 页面探针 issues / badResources 为空，SelectInput 截图已检查。保留已有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 799.96 kB）。

**接续任务**：第 3 轮 AutoComplete → Tabs.list → Breadcrumb / Steps / Statistic，第 3 轮整体与 M2 尚未完成。

### 2026-11-28：第 3 轮 AutoComplete 配置与状态

- **输入与弹层配置**：新增 AutoCompleteInputProps（InputOptions 白名单）及 AutoCompletePopupProps（PopupOptions 排除 trigger / delay），接入原生属性、长度限制、焦点/键盘/组合输入/onChange 回调，以及位置、语义类合并、内层类名、箭头、层级、禁用、关闭销毁和空内容隐藏。显隐与即时焦点反馈由组件管理；popupProps.disabled 仅关闭联想，仍允许编辑。禁用/只读与显式输入、Form.readonly 和 CVA 状态取并集，不接受任意 Vue InputProps / PopupProps 键。
- **受控与表单**：复用 createControllableState，value 修改只发提案，拒绝输入或选择后恢复显示；defaultValue 仅初始化一次。CVA write/reset 清理活动候选、弹层和组合状态，disable / enable 可恢复；选择不提前触发 touched，焦点进入自己的辅助面板不提交 updateOn: 'blur'，离开整个组件才提交。
- **键盘与生命周期**：活动项改用 null 哨兵，空字符串候选不再被默认选中；动态移除活动项后 Enter 不选择旧数据，选择后与关闭后的 Enter 不重复提交。Esc 清空活动项并关闭，自定义触发器支持方向键与 Enter。原生输入补 combobox / listbox / option 语义和展开、控制、活动后代关联；宽度观察器随触发器生命周期清理。受控组合输入事件使用 Input 携带的最终文本，避免父级信号尚未回传时输出旧值。
- **边界与进度**：锁定上游声明但未消费 textareaProps，继续保留该项真实债务；filter 返回 Promise 仍按上游真值处理，不冒充异步过滤。远程请求通过 valueChange 更新 options，由调用方处理取消/乱序。新增 1 个 demo，总数 334 → 335；对齐 1066 → 1068（67.8%），真实债务 217 → 215，零债务目录仍为 44/73。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、所有前批及新增交互回归通过，missing 0 / extra 0。新增覆盖原生属性/Unicode 限制、IME 单次回调、受控输入及选择拒绝、默认值不重写、动态候选/空字符串、方向键/Enter/Esc/ARIA、自定义触发器、配置类名/箭头/层级/销毁、禁用只读、CVA 失焦提交/reset/禁用恢复。AutoComplete / Form / Input / Popup 页面探针 issues / badResources 均为空，AutoComplete 截图已检查。保留既有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 799.96 kB）。API / demo / progress 已生成同步。

**接续任务**：第 3 轮 Tabs.list → Breadcrumb / Steps / Statistic，第 3 轮整体与 M2 尚未完成。

### 2026-11-28：第 3 轮 Tabs.list

- **数据驱动**：新增公开 TabsListItem 和 list，沿用锁定上游规则：非空数据优先于投影，空数组回退到 t-tab-panel。列表生成真实 TTabPanel，复用选择、关闭、拖拽、导航滚动及面板生命周期；不复制内容 DOM。支持 value、label、panel、default、disabled、removable、draggable、lazy、destroyOnHide 和单项 onRemove；default 优先于 panel，标题和内容使用 Content 字符串/模板，字符串按文本插值，不执行 Vue 渲染函数。TabPanel 同时开放模板 label 和显式 panel 内容。
- **状态与生命周期**：使用 createControllableState，defaultValue 只初始化一次，受控拒绝保持原面板。稳定且唯一的 value 用于跟踪数据，重排保留原面板实例与模板内部状态；省略 value 使用下标，文档明确不适合可重排数据。数据模板实际验证首次激活创建、隐藏保留和隐藏销毁/重建；投影子组件仍由 Angular 创建，不把投影的条件展示宣称为延迟构造。失效激活值不自动跳转；删除当前项后的替代值由调用方决定。
- **交互与无障碍**：导航增加 tablist / tab / tabpanel、选中/禁用/方向及双向 id 关联、单一 Tab 入口；方向键按横纵方向切换并跳过禁用项，Home / End、Enter / 空格和 Delete 可操作。键盘关闭后将焦点移到保留项或邻近可用项；remove.e 因键盘关闭扩展为 MouseEvent | KeyboardEvent。add / remove / dragSortChange 仍只通知调用方维护数据，单项关闭回调各一次。拖拽保留源面板身份，动态删除源项、全局禁用、源不可拖拽或目标禁用时不发排序事件。
- **导航关联修复**：动态导航和上下位置切换后重新绑定尺寸观察器，观察页签尺寸以响应模板标题变化，销毁时断开。截图检查发现原有内联 SVG 未使用 vendor 图标类，导致关闭图标压缩不可见及操作图标偏大；补 t-icon 使用原尺寸规则，无新增样式覆盖。
- **生成进度**：新增 1 个含状态计数的 demo，示例 335 → 336；对齐 1068 → 1069（67.8%）、真实债务 215 → 214、零债务目录 44 → 45。Tabs 已登记债务为 0，仍保留 Angular 事件/模型映射与上述模板/投影边界，不代表完整 Vue 行为、SSR 或水合验收完成。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、全部前批及新增交互回归、`pnpm check:progress`、`git diff --check` 通过，missing 0 / extra 0。覆盖投影回退、模板标题/内容及文本转义、三种生命周期、重排保留实例、受控拒绝/默认值仅初始化、数值/字符串/空字符串/下标取值、失效值、横纵方向键与 ARIA、增删和单项回调、排序载荷与动态失效保护；真实 CDP 鼠标点击验证可见关闭图标仅通知一次。Tabs 页面 issues / badResources 为空，最终截图已检查。保留既有 footer slot、Browserslist、qrcode CommonJS 和首包预算告警（约 799.96 kB）。

**接续任务**：第 3 轮 Breadcrumb → Steps → Statistic，第 3 轮整体与 M2 尚未完成。

### 2026-11-28：第 3 轮 Breadcrumb 折叠与提示

- **折叠契约**：新增 maxItems、itemsBeforeCollapse、itemsAfterCollapse、ellipsis；阈值和前后保留数均为正数、总项数超过阈值且前后总数小于总项数时才折叠。对小数向下取整，未设置、0、负数和非有限值不折叠；maxItems 是触发阈值，不保证最终含省略号的数量不超过阈值。options 排在投影项之前，共同参与计算，校准此前两者顺序不一致的问题。
- **原组件与访问入口**：默认省略号使用 Popup 打开隐藏路径，DomPortal 移动原面包屑宿主，保留链接、投影、宿主事件与内部按钮状态，关闭后不复制/销毁原组件；取消折叠恢复原位，动态删除与父级销毁时清理 Portal。仅通过 bridge 补原宿主在导航内隐藏和弹层内纵向布局规则。锁定上游默认只显示省略图标，本库弹层属于补充的可访问入口，不宣称完全复刻该版本运行行为。
- **模板与点击**：ellipsis 支持字符串或模板，模板上下文为 items / separator；数据项描述保留配置回调，投影文字使用实时测量文本描述，原交互内容仍通过默认弹层访问。options 新增 onClick(MouseEvent)，可 preventDefault 取消导航；禁用项阻止原生链接与宿主回调，投影内业务控件的禁用仍由调用方管理。链接 target 保留，_blank 添加 rel；显式空 content 不再错误回退到投影。
- **提示与无障碍**：对实际溢出文本启用 Tooltip，ResizeObserver / MutationObserver 跟踪宽度和文字变化，销毁时断开；提示使用纯文本，不复制交互模板，折叠弹层关闭时同步关闭子项提示。面包屑增加 navigation 语义，最后一项 aria-current；省略触发器支持 Enter / 空格、方向下键进入，弹层方向键及 Home / End 移动焦点，Esc 关闭并返回触发器，焦点离开本弹层时关闭。实例使用独立 id 和自己的 Popup 边界。
- **进度与边界**：新增 1 个 demo，示例 336 → 337；对齐 1069 → 1073（68.1%）、真实债务 214 → 210，零债务目录仍为 45/73。保留 to / replace / router 三项路由整合债务，不以 href 或原生点击映射冒充 Router 实现；SSR / 水合仍待后续验收。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、全部前批及新增交互回归、`pnpm check:progress`、`git diff --check` 通过，missing 0 / extra 0。新增覆盖折叠阈值/前后数量/非法及小数参数、自定义上下文、混合来源顺序、原宿主/按钮/事件保留、动态文字和宽度、取消折叠恢复、投影删除与整组销毁、禁用链接与回调、target/rel、键盘进入/移动/Esc/焦点恢复；真实 CDP 鼠标验证省略触发、隐藏链接单次回调、取消导航及外部点击关闭。Breadcrumb 页面 issues / badResources 为空，截图已检查。保留既有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 800.20 kB）。

**接续任务**：第 3 轮 Steps → Statistic，第 3 轮整体与 M2 尚未完成。

### 2026-11-28：第 3 轮 Steps 逆序与状态

- **逆序与原实例**：新增 sequence（positive / reverse）及公开 StepSequence，区分原流程顺序和显示顺序；步骤取值、默认下标及序号保持原流程含义，完成状态不随显示反转。渲染后通过 Renderer2 移动原宿主，使真实 DOM、键盘焦点顺序和 vendor 的 :last-child / 连接线规则一致，不通过 CSS order 伪造逆序，不复制投影或重建模板。移动期间保留并恢复原焦点，无新增样式覆盖。动态增删或重排后重新读取最新逻辑查询，避免重排已移除的旧节点。
- **数据来源与状态**：沿用上游非空 options 优先、空数组回退投影的规则；数据项按稳定 value 或原对象身份跟踪，不修改调用方数组。复用 createControllableState，defaultCurrent 只初始化一次，受控点击只发提案，父级拒绝时保留原状态。每次重新建立严格类型 Map，区分数值 0 / 字符串 0 并清理已删除项；显式 status 优先于 FINISH，FINISH 优先于自动下标/取值判断，失效 current 不自动跳首项。
- **事件与只读**：保留 currentChange 值事件用于双向绑定，新增 change({ current, previous, e }) 完整上下文，覆盖鼠标及键盘；previous 在发送提案前捕获，受控拒绝仍报告实际前值。父容器和子项共同保护 readonly / process，重复选择不输出。程序设置 current 不被只读阻止，Steps 不作为 CVA 表单输入。
- **图标与无障碍**：修复容器强制 default 主题后子项仍读取原 dot 主题的问题，统一读取 effectiveTheme；icon=true 显示默认图标、false 隐藏、文本或模板自定义，任一显式 icon 都按上游触发统一 default 主题。显式空 content 不回退到投影。增加 list / listitem、显示位置/总数、aria-current=step 和操作禁用语义；可操作项支持 Tab、Enter / 空格，按横纵显示方向的箭头及 Home / End 移动焦点，跳过 process 项，模板内部控件的键盘事件不冒充步骤操作。
- **生成进度与边界**：新增 1 个含独立计数器的 demo，示例 337 → 338；对齐 1073 → 1074（68.1%）、真实债务 210 → 209、零债务目录 45 → 46。Steps 已登记债务为 0，仍保留模型/事件/投影映射，不代表完整 Vue 渲染函数或 SSR / 水合验收；渲染后的宿主移动尚未作为完整 SSR 支持发布。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、所有前批及新增交互回归、`pnpm check:progress`、`git diff --check` 通过，missing 0 / extra 0。新增覆盖两种来源的实际 DOM 逆序/原序号、实例与计数/焦点保留、尾项 flex 和连接线、横向箭头旋转/纵向点状虚线、受控拒绝/默认值仅初始化、显式状态/FINISH/失效值、数值与字符串键/隐式下标、完整事件前值/触发上下文、键盘/只读/当前项保护、主题及图标优先级、动态插入/删除与 options 清空回退/恢复。Steps 页面 issues / badResources 为空，截图已检查。保留既有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 800.20 kB）。

**接续任务**：第 3 轮 Statistic；第 3 轮整体与 M2 尚未完成。

### 2026-11-28：第 3 轮 Statistic 数值动画

- **动画能力**：新增公开 StatisticAnimation（duration 毫秒 / valueFrom）、animation、animationStart 和实例 start()。使用 requestAnimationFrame 时间戳及四次缓出曲线，不引入通用 tween 依赖；动画只改变展示值，不改写 value。初次配置动画但不自动播放时显示 valueFrom，start() 从配置起点重播，结束精确落到目标。加载骨架仅控制显示，后台动画继续。
- **生命周期与边界**：目标/配置/自动开关变化时取消旧帧，自动开启时播放新目标，关闭时显示目标；重复 start() 只保留最新一轮，generation 保护已排队旧回调，销毁取消帧且之后调用无效。未配置、起止相同、非正/非有限时长、非有限起点或目标、无浏览器 rAF 或系统减少动态效果时直接显示目标。关闭/动态配置取消语义属于本库明确的生命周期约定，不复制锁定上游的旧 tween 残留。未设置 value 回退 0，非有限目标只展示、不做插值。
- **精度与格式**：中间值按显式小数位或目标精度舍入，科学计数法计算指数后的实际精度，最终值不因动画舍入改变。decimalPlaces 有限值统一限制在 0～20 并截为整数，避免负数或超大位数抛出 RangeError；非有限小数配置按缺省处理。format 接收每帧展示值，覆盖分组/小数格式，其他情况保持现有运行环境的区域格式。富内容模板检测复用共享工具。
- **生成进度与轮次交接**：新增 1 个自动/手动/动态销毁 demo，示例 338 → 339；对齐 1074 → 1076（68.3%）、真实债务 209 → 207、零债务目录 46 → 47。Statistic 已登记债务为 0；第 3 轮顺序任务至此走完，但 Breadcrumb 路由整合、AutoComplete.textareaProps、Checkbox.lazyLoad 及 SSR / 水合、国际化等后续任务继续保留，M2 仍需第 4 轮弹层与反馈验收，不将生成零债务等同于完整发布验收。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、全部前批及新增交互回归通过，missing 0 / extra 0。新增覆盖真实自动播放落点、手动起点/中间缓出值/精确结束、重复启动和已取消旧回调、负数下降、新目标/配置切换/自动关闭取消、加载切换、无配置/起止相同/非法时长与非有限值、销毁后回调和调用、科学计数精度、非法小数位保护、自定义分组及逐帧 format 优先、减少动态效果和无 rAF 环境。可控帧调度仅作用于独立测试页面中的动画回调，并保留 Angular 原有调度；真实播放另行验证。Statistic 页面 issues / badResources 为空，截图已检查；生成文件稳定后重跑最终回归通过。保留既有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 800.20 kB）。

**接续任务**：第 4 轮 Popup → Loading → Message / Notification；先核实 Popup 受控/默认显隐、挂载、样式和生命周期的真实缺口，再推进上层反馈组件。

### 2026-11-28：第 4 轮 Popup 显隐与生命周期首批

- **真实默认值与受控**：新增 defaultVisible，复用 createControllableState 仅初始化一次，纠正此前把受控 visible 当作默认值等价映射的记录。用户触发和 show / hide / toggle 在受控下只发修改提案，拒绝后保持实际显隐；程序输入同步不输出 visibleChange，重复同值操作不重复通知。保留布尔 visibleChange 双向绑定，新增 Angular 专有 visibleChangeContext({ visible, trigger, e })，保留本库现有 hover / click / focus / api / outside / escape 等来源字符串，不伪造完全相同的 Vue 回调参数。
- **生命周期修复**：渲染就绪后再挂载 CDK 浮层；动态禁用关闭实际显示、取消延迟且阻止打开，但不修改请求的受控/非受控状态，解除禁用后按当前请求恢复。触发模式/延迟变化取消旧计时，关闭取消底部回调并清理指针状态，销毁移除文档监听器、延迟任务和 Overlay；销毁后实例方法不再创建浮层。文档事件使用宿主 ownerDocument。focus 触发的输入→本面板不误关，面板→外部补焦点离开处理。
- **样式与查询**：新增 overlayStyle / overlayInnerStyle（对象或函数），分别绑定 .t-popup / .t-popup__content，NgStyle 替换会删除旧属性；函数接收解析后的真实触发节点与内容节点，每次打开、配置变化或 update() 时重新计算。支持 NgStyle 的带单位键，不宣称数字值自动等同上游任意 Styles。新增 getOverlay()、getOverlayState() 和 update()，仍使用原 CDK 定位，不提供伪造的 getPopper() 实例；复合组件 PopupOptions 保持既有白名单，不自动承诺新样式已透传。
- **滚动与空态**：内容节点真实 scroll 输出 { e: Event }，依据锁定上游运行时修正类型声明中 WheelEvent 的误导；滚到底仅在有可滚动溢出时 100ms 去抖，重复到底事件合并、离开底部/关闭/销毁取消。hideEmptyPopup 在请求显示但文本为空时隐藏实际浮层并移除外部监听，内容到达后按请求显示；文本清空重新隐藏，不把默认箭头当内容。
- **生成进度与余项**：新增 1 个 demo，总数 339 → 340；对齐 1076 → 1079（68.5%）、真实债务 207 → 203，零债务目录仍为 47/73。债务减少是两项样式与两项滚动事件实际实现；defaultVisible 原先被列为映射，本批补齐真实行为。保留 attach / triggerElement / popperOptions 三项债务，嵌套焦点栈、完整 SSR / 水合仍待后续，第 4 轮及 M2 尚未完成。
- **验证结果**：`pnpm verify:session`、`pnpm verify`、完整 `pnpm build`、全部前批及新增交互回归、`pnpm check:progress`、`git diff --check` 通过，missing 0 / extra 0。覆盖默认值仅初始化/受控优先、拒绝开关/程序同步/重复通知、上下文、样式函数节点与动态属性清理、原生滚动输出次数与原事件一致/到底去抖/关闭取消、关闭保留与销毁、禁用恢复/延迟取消/触发方式变化、面板内外焦点、动态空文本显隐、销毁后计时器/文档监听清理及实例方法无效。Popup / SelectInput / AutoComplete / Breadcrumb 页面 issues / badResources 均为空，Popup 截图已检查。页面探针会复用已有 CDP 页面，最终按交互回归→页面探针串行运行通过。保留既有 footer slot、Browserslist、qrcode CommonJS 及首包预算告警（约 805.67 kB）。

**接续任务**：Popup 挂载点 / 独立触发元素 / 定位配置评估 → Loading → Message / Notification，按共享能力逐批验收。
