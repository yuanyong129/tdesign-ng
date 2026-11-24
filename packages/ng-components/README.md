# @tdesign-ng/components

[TDesign](https://tdesign.tencent.com/) 的 Angular 组件库。

> **状态：`0.1.0` 是首个公开预发布版本（pre-release）。** API 仍可能在小版本内调整，生产使用请锁版本。
> 属性命名与取值对齐 [tdesign-vue-next](https://github.com/Tencent/tdesign-vue-next)，视觉直接消费 [tdesign-common](https://github.com/Tencent/tdesign-common) 的上游 less 源码，所以长得和 TDesign 官网一致。

- 要求 Angular >= 19（standalone / signal 输入）
- 全部组件 `ViewEncapsulation.None`，样式统一由 [`@tdesign-ng/styles`](https://www.npmjs.com/package/@tdesign-ng/styles) 提供
- 图标由 [`@tdesign-ng/icons`](https://www.npmjs.com/package/@tdesign-ng/icons) 提供

## 安装

```bash
npm i @tdesign-ng/components @tdesign-ng/styles
# 需要图标时
npm i @tdesign-ng/icons
```

`@angular/core`、`@angular/common`、`@angular/forms`、`@angular/cdk` 是 peer 依赖，随你的 Angular 版本自备（`>=19.0.0 <24.0.0`）。

## 使用

组件都是 standalone 的，直接 import 组件类：

```ts
import { Component } from '@angular/core';
import { TButton } from '@tdesign-ng/components';

@Component({
  selector: 'app-demo',
  imports: [TButton],
  template: `
    <t-button theme="primary" variant="base">主要按钮</t-button>
    <t-button theme="danger" variant="outline" [ghost]="true">危险按钮</t-button>
  `,
})
export class DemoComponent {}
```

NgModule 项目可以按组件引入对应的薄包装模块（一一对应，没有聚合模块）：

```ts
import { TButtonModule } from '@tdesign-ng/components';

@NgModule({ imports: [TButtonModule] })
export class AppModule {}
```

## 引入样式

这一步不能省：组件自身不带任何内联样式，不引样式就是裸 DOM。两行，顺序无关但都要有：

```less
// styles.less
@import '@tdesign-ng/styles/index.less';   // 设计令牌 + 全局 + reset
@import '@tdesign-ng/components/bridge.less';  // 把 <t-button> 这类宿主元素桥接到上游 .t-button
```

不想用 less 的项目直接引预编译 CSS：

```css
@import '@tdesign-ng/styles/dist/index.css';
@import '@tdesign-ng/components/bridge.css';
```

按需引入组件样式见 [`@tdesign-ng/styles` 文档](https://www.npmjs.com/package/@tdesign-ng/styles)。

> 为什么需要 bridge：Angular 组件渲染出的是 `<t-button>` 宿主元素，上游 TDesign 的选择器是 `.t-button` 类名。bridge 就是这两者之间的映射层，缺了它页面会「有结构没样子」。

## 组件

已实现 73 个组件（与上游 TDesign 组件清单一一对应）：

| 分类 | 组件 |
| --- | --- |
| 基础 | Button、Icon、Link、Divider、Space、Layout、Grid、Typography |
| 数据录入 | Input、Textarea、InputNumber、InputAdornment、Select、SelectInput、AutoComplete、Cascader、Checkbox、Radio、Switch、Slider、Rate、Form、DatePicker、DateRangePicker、TimePicker、ColorPicker、RangeInput、TagInput、Transfer、Upload、TreeSelect |
| 数据展示 | Avatar、Badge、Calendar、Card、Comment、Collapse、Descriptions、Empty、Image、ImageViewer、List、Loading、Progress、Skeleton、Statistic、Table、Tabs、Tag、Timeline、Tooltip、Watermark、QRCode、Affix |
| 导航 | Anchor、BackTop、Breadcrumb、Dropdown、Menu、Pagination、Steps、StickyTool、Swiper |
| 反馈 | Alert、Dialog、Drawer、Message、Notification、Popconfirm、Popup、Guide、CheckTag |
| 配置 | ConfigProvider |

选择器统一是 `t-<组件名>`，例如 `t-button`、`t-date-picker`。

## 版本策略

`0.x` 阶段按 `0.<minor>.<patch>` 发布：`minor` 可能带破坏性变更（会在 [CHANGELOG](https://github.com/yuanyong129/tdesign-ng/blob/main/CHANGELOG.md) 里写清楚），`patch` 只修 bug。`1.0.0` 之后再按 semver 走。

## 文档

- 在线文档（GitHub Pages）：https://yuanyong129.github.io/tdesign-ng/
- 本地开发：`pnpm start` → http://localhost:4280/
- 仓库与问题反馈：https://github.com/yuanyong129/tdesign-ng

## 许可

MIT。样式与设计规范来自 TDesign（Copyright 2021 Bytedance, Inc. and its affiliates, MIT License）。
