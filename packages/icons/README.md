# @tdesign-ng/icons

[TDesign](https://tdesign.tencent.com/) 图标集，Angular 版。

图标名与上游 [TDesign](https://github.com/Tencent/tdesign-icons) 完全一致，可以直接照抄 TDesign 文档里的名字。

> **状态：`0.1.0` 是首个公开预发布版本。**

## 安装

```bash
npm i @tdesign-ng/icons
```

需要在 Angular 19 及以上使用。

## 使用

`TIcon` 是 standalone 组件：

```ts
import { Component } from '@angular/core';
import { TIcon } from '@tdesign-ng/icons';

@Component({
  selector: 'app-demo',
  imports: [TIcon],
  template: `
    <t-icon name="add" />
    <t-icon name="loading" size="24px" />
  `,
})
export class DemoComponent {}
```

- 颜色走 CSS `color`（图标内部是 `fill: currentcolor`），可直接用 `--td-brand-color` 之类的令牌。
- 尺寸用 `size`，或直接给宿主元素设 `font-size`；只写数字时按 `px` 处理。
- 图标渲染为 `<t-icon class="t-icon t-icon-add">` 内嵌 SVG，可用 `.t-icon-add` 精确命中单个图标。

## 图标范围

`0.1.0` **只内置了组件库与文档站用到的常用图标子集（当前 65 个，见 `TD_ICON_NAMES`）**，不是上游全量图标集。命中上层未内置的名字时，组件会在控制台打印一条 `[tdesign-ng] 未找到名为 "xxx" 的图标` 警告，页面不渲染任何图形。

全量图标（2000+）需要重新生成一次：

```bash
# 下载上游 tdesign-icons-svg 压缩包并解压到 .local-cache/icons-extract 后
pnpm gen:icons --all
```

生成的 `packages/icons/src/icons.generated.ts` 会显著变大（这是只发布子集的原因）。如果你的项目依赖全量图标，请提 issue，我们会把全量集作为独立入口发布。

也可以用代码按名字查询：

```ts
import { TD_ICONS, TD_ICON_NAMES } from '@tdesign-ng/icons';

TD_ICONS['add']; // { viewBox, content } | undefined
TD_ICON_NAMES; // 当前内置的全部图标名
```

## 文档与仓库

- 在线文档：https://yuanyong129.github.io/tdesign-ng/
- 仓库：https://github.com/yuanyong129/tdesign-ng

## 许可

MIT。图标源来自 [tdesign-icons](https://github.com/Tencent/tdesign-icons)（Copyright 2021 TDesign, MIT License）。
