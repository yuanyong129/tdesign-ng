# @tdesign-ng/styles

[TDesign](https://tdesign.tencent.com/) 的样式包，供 [`@tdesign-ng/components`](https://www.npmjs.com/package/@tdesign-ng/components) 使用。

它不是「自己写的一套 CSS」，而是把上游 [tdesign-common](https://github.com/Tencent/tdesign-common) 的 less 源码按组件拆成入口，让你能像用 TDesign 官方一样用 less 变量和组件样式。

> **状态：`0.1.x` 是首个公开预发布版本。**

## 安装

```bash
npm i @tdesign-ng/styles
```

## 用法

### 1. less 全量入口（推荐）

```less
// styles.less
@import '@tdesign-ng/styles/index.less';
```

`index.less` = 设计令牌 + 全局工具类 + reset + **全部组件样式**，一行引入即可让所有组件有样式。

其它粒度：

- 只想拿令牌、不想被 reset 影响 → `@tdesign-ng/styles/theme.less`
- 只要组件样式（自己引令牌与 reset）→ `@tdesign-ng/styles/components/index.less`

### 2. less 按需引入单个组件

```less
@import '@tdesign-ng/styles/theme.less';          // 令牌是前置依赖，必须先引
@import '@tdesign-ng/styles/components/button.less';
@import '@tdesign-ng/styles/components/table.less';
```

可用于按需引入的组件入口共 72 个，文件名即组件名：`button`、`input`、`select`、`table`、`date-picker`、`tree`、`upload` ……

### 3. 直接引预编译 CSS（不用 less 的项目）

```css
@import '@tdesign-ng/styles/dist/index.css';
```

`dist/` 下还有 `theme.css`、`reset.css`、`global.css`、`components.css`（全部组件），每个都有对应的 `.min.css`。

## 主题与暗色模式

所有颜色、圆角、字号都是 `--td-*` CSS 变量，手写样式请一律用 `var(--td-*)`，不要硬编码颜色。

暗色模式靠 `theme-mode` 属性切换：

```ts
document.documentElement.setAttribute('theme-mode', dark ? 'dark' : 'light');
```

## 包里有什么

```
index.less theme.less reset.less global.less   # 4 个聚合入口
components/<name>.less                        # 73 个单组件入口
vendor/tdesign-common/                        # 上游 less 源码快照（逐字节镜像，勿手改）
dist/*.css                                    # 预编译产物
```

`vendor/tdesign-common/VERSION.json` 记录了这份快照同步自上游哪个 ref、什么时候同步的。

> `components/*.less` 与 `components/index.less` 由 `scripts/vendor-tdesign-common.mjs` 生成，不要手改；`index.less`、`theme.less`、`reset.less`、`global.less` 是手写聚合入口。样式本身请改上游或在此之上覆写。

## 与组件包的配合

`@tdesign-ng/components` 渲染出的是 `<t-button>`、`<t-icon>` 这类宿主元素，而上游选择器是 `.t-button`。桥接层（`bridge.css`）由组件包提供：

```less
@import '@tdesign-ng/styles/index.less';
@import '@tdesign-ng/components/bridge.css';   // 或 bridge.less
```

详见 [组件包文档](https://www.npmjs.com/package/@tdesign-ng/components)。

## 许可

MIT。样式源来自 [tdesign-common](https://github.com/Tencent/tdesign-common)（Copyright 2021 TDesign, MIT License）。
