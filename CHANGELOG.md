# Changelog

本项目所有值得注意的变更都记在这里，格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

`0.x` 阶段按 `0.<minor>.<patch>` 发布：`minor` 可能带破坏性变更，`patch` 只修 bug。

## [0.2.0] - 未发布

本节为下一版本草稿，整理范围为 `v0.1.1` 之后的已提交改动；尚未发布到 npm。三个包计划继续统一版本号。

### Added

- **表格与分页**：Table 补齐行高亮、表尾、行属性与行事件，增加吸顶/吸底、显示列和展开内容配置；Pagination 补齐受控/非受控状态、总条数模板、选择器配置与折叠行为。
- **输入与表单**：Input 补齐编辑状态事件及输入框组合；Slider 增加数字编辑器与提示配置；SelectInput、AutoComplete 增加编辑器和弹层选项；RangeInput、TagInput 等复合输入补充配置透传；Form 向支持的控件传递只读状态。
- **展示与导航**：Avatar 补齐图片和折叠分组配置；Tag 增加配置透传；Tabs 支持数据驱动面板、操作区与无障碍导航；Breadcrumb 增加折叠路径与溢出提示；Steps 支持逆序；Statistic 支持可取消、可重播的数字动画。
- **内容定制**：Descriptions 增加内容定制，Rate 增加自定义图标，Textarea 增加校验配置，Typography 增加复制配置与交互。
- **Popup**：补充复合组件弹层配置契约、内容模板、自定义挂载、独立触发目标、样式和滚动事件；增加基于 CDK Overlay 的类型化定位配置子集。
- **Loading 与反馈**：Loading 补齐内容模板、挂载和服务实例生命周期；Message、Notification 补齐模板、关闭生命周期、自定义挂载和独立服务容器。
- **Card 与 Dialog**：Card 支持加载模板及持续的正文加载遮罩；Dialog 补齐受控显隐、生命周期通知、延迟渲染与关闭销毁、富内容模板、确认/取消按钮配置及全屏布局。

### Fixed

- 修复 Form 重置与异步校验生命周期，补齐表单控件默认值并稳定受控状态。
- 稳定 SelectInput、AutoComplete、Steps 和 Popup 等组件的状态与显隐生命周期。
- 修复 Input / InputNumber 在文档路由再次进入时边框、背景的初始过渡闪动；统一多类组件的首次样式绑定时序，保留后续交互过渡。

### Documentation

- 补充组件示例与交互回归脚本，新增按组件生成的开发进度文档。
- 调整文档导航顺序、组件中英文名称和配置入口，使其与官方文档保持一致。
- 更新站点品牌图标；页头和页脚展示从组件包读取的版本号。
- 新增站内更新日志页面，可从顶部导航直接查看各版本记录。

### Upgrade notes

- 本版本仍处于 pre-alpha 阶段，不代表全部上游 API 已实现；各组件的已实现范围和待完成项见 [组件进度](./docs/progress/README.md)。
- Popup 定位配置只支持已声明的子集；Dialog 自定义挂载、局部显示与拖动等能力尚未完成，不应根据新增配置推断已支持全部上游能力。
- 安装时请使用同版本的组件、样式和图标包。发布前仍需复核 API 行为变化、依赖范围并完成构建与打包校验。

## [0.1.1] - 2026-11-24

### Fixed

- `@tdesign-ng/styles` 的 `index.less` / `dist/index.css` 现在真的包含全部组件样式。0.1.0 里它只带设计令牌、全局工具类和 reset，按 README 一行引入后组件渲染出来是无样式的裸标签（消费端 `ng build` 实测复现）。选 `theme.less`（只要令牌）或 `components/index.less`（只要组件样式）的用法不变。
- `scripts/build-styles.mjs` 增加 `index` 入口的断言（必须含 `.t-button--variant-`），避免同类漏引再发生。

## [0.1.0] - 2026-11-24（首个公开预发布版本）

三个包同版本号一起发布：`@tdesign-ng/components`、`@tdesign-ng/styles`、`@tdesign-ng/icons`。

### Added

- **组件库**：73 个 Angular 组件，与上游 TDesign 组件清单一一对应 —— Button、Icon、Link、Divider、Space、Layout、Grid、Typography、Input、Textarea、InputNumber、InputAdornment、Select、SelectInput、AutoComplete、Cascader、Checkbox、Radio、Switch、Slider、Rate、Form、DatePicker、DateRangePicker、TimePicker、ColorPicker、RangeInput、TagInput、Transfer、Upload、TreeSelect、Avatar、Badge、Calendar、Card、Comment、Collapse、Descriptions、Empty、Image、ImageViewer、List、Loading、Progress、Skeleton、Statistic、Table、Tabs、Tag、Timeline、Tooltip、Watermark、QRCode、Affix、Anchor、BackTop、Breadcrumb、Dropdown、Menu、Pagination、Steps、StickyTool、Swiper、Alert、Dialog、Drawer、Message、Notification、Popconfirm、Popup、Guide、CheckTag、ConfigProvider。
  - 全部 standalone，同时为每个组件提供 `T<Name>Module` 薄包装，兼容 NgModule 项目
  - 属性命名与取值对齐 tdesign-vue-next
  - `@angular/cdk` peer 放宽为 `>=19.0.0 <24.0.0`，在 Angular 19/20/21 项目里都能装
- **样式包**：`@tdesign-ng/styles`
  - 4 个聚合 less 入口（`index` / `theme` / `reset` / `global`）与 72 个单组件入口
  - 上游 tdesign-common 的 less 源码作为包内快照一起发布（`vendor/tdesign-common`），因此 less 变量与按需引入在安装后即可用，不依赖仓库
  - 预编译 `dist/*.css` 与 `.min.css`，不用 less 的项目也能引
- **图标包**：`@tdesign-ng/icons`
  - `TIcon` standalone 组件，图标名与上游 TDesign 一致
  - 首版内置 65 个常用图标（组件库与文档站用到的集合），可用 `pnpm gen:icons --all` 重新生成全量集
- 发布流水线：`pnpm run release:check`（演练）/ `pnpm run release`（真发布），带产物与文件清单校验

### Known limitations

- 样式分两处引入：`@tdesign-ng/styles`（TDesign 视觉）+ `@tdesign-ng/components/bridge.css`（Angular 宿主元素桥接）。没有单文件聚合入口，原因是 bridge 属于组件包、令牌属于样式包。
- `TColorPicker` 的 `linear-gradient` 色板尚未实现。
- `TConfigProvider` 的 `classPrefix` / `attach` / `animation` 三项配置暂未生效。
- `@tdesign-ng/icons` 尚未内置全量图标集。
- 尚未提供聚合 NgModule（`TDesignModule` 之类），需要逐组件引入。
- 尚未提供单元测试与 e2e 测试。

[0.2.0]: https://github.com/yuanyong129/tdesign-ng/compare/v0.1.1...main
[0.1.1]: https://github.com/yuanyong129/tdesign-ng/releases/tag/v0.1.1
[0.1.0]: https://github.com/yuanyong129/tdesign-ng/releases/tag/v0.1.0
