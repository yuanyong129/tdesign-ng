# @tdesign-ng/components

[TDesign](https://tdesign.tencent.com/) 的 Angular 组件库。

> **状态：早期开发中（pre-alpha），尚未发布到 npm。**
> 属性命名与取值对齐 [tdesign-vue-next](https://github.com/Tencent/tdesign-vue-next)，样式直接消费 [tdesign-common](https://github.com/Tencent/tdesign-common) 源码。

## 已实现组件

| 组件 | 选择器 | 说明 |
| --- | --- | --- |
| Button | `t-button` | 支持 `variant` × `theme` 自由组合、`shape`、`size`、`block`、`ghost`、`loading`、`tag="a"` 等 |
| Divider | `t-divider` | 水平/垂直、虚线、带文字（左中右对齐）、自定义间距 |
| Link | `t-link` | 主题色、尺寸、下划线、hover 效果、前后缀图标、禁用、下载 |
| Space | `t-space` | 水平/垂直、预设与自定义间距、分隔符、自动换行、对齐 |

图标请配合 [`@tdesign-ng/icons`](../icons) 使用。

## 使用

组件都是 standalone 的，可以直接 import 单个组件：

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

也可以按模块引入（适合 NgModule 项目）：

```ts
import { TButtonModule } from '@tdesign-ng/components';
```

### 引入样式

组件的视觉来自上游 less，需要通过样式入口引入一次：

```less
// 全量引入
@import '@tdesign-ng/styles/index.less';

// 或按需引入单个组件
@import '@tdesign-ng/styles/components/button.less';
```

> 这些入口由 `scripts/build-styles.mjs` 从 `vendor/tdesign-common` 生成；包内 `src/` 还包含一层 `bridge.less`，用于让 Angular 宿主元素（`<t-button>` 等）与上游的类名选择器正确衔接，样式入口已自动带上，无需额外处理。

## 文档

- 在线文档（GitHub Pages）：https://yuanyong129.github.io/tdesign-ng/
- 本地开发：`pnpm start` → http://localhost:4280/
- 改造计划与设计决策：见仓库根目录 [`docs/plans`](../../docs/plans)

## 许可

MIT。样式与设计规范来自 TDesign（Copyright 2021-present TDesign, MIT License）。
