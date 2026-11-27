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
