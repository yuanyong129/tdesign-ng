# Changelog

本项目所有值得注意的变更都记在这里，格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。

`0.x` 阶段按 `0.<minor>.<patch>` 发布：`minor` 可能带破坏性变更，`patch` 只修 bug。

## [0.1.0] - 未发布（首个公开预发布版本）

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

[0.1.0]: https://github.com/yuanyong129/tdesign-ng/releases/tag/v0.1.0
