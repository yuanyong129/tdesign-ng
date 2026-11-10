# TDesign Angular

[TDesign](https://tdesign.tencent.com/) 的 Angular 实现。

> **状态：早期开发中（pre-alpha）。** 组件数量与 API 仍在快速变动，尚未发布到 npm。

本项目的两条硬性原则：

1. **API 以官方为准。** 组件的属性名、取值、默认值一律对齐 [tdesign-vue-next](https://github.com/Tencent/tdesign-vue-next)，不发明 Angular 特有的替代品。`pnpm check:align` 会拿上游 `type.d.ts` 与本仓库的 API 清单做机器比对，差异会被直接列出来。
2. **样式零自研。** 组件 CSS 100% 来自 [tdesign-common](https://github.com/Tencent/tdesign-common) 的 less 源码（以 `vendor/tdesign-common` 快照形式引入），本仓库只写必要的宿主元素桥接层。这样视觉与官方逐像素一致，也让上游样式更新可以直接同步。

## 组件进度

| 组件 | 状态 |
| --- | --- |
| Button | ✅ 已按上游契约实现 |
| Divider | ✅ |
| Link | ✅ |
| Space | ✅ |
| Icon | ✅（`@tdesign-ng/icons`，内置 65 个精选图标） |
| Input / Textarea / Select / Checkbox / Radio / Switch / Form | 🚧 计划中（P2） |

`ButtonGroup`、`Scrollbar` 在 TDesign 中没有对应组件，已从本仓库移除。

## 仓库结构

| 路径 | 说明 |
| --- | --- |
| `packages/ng-components` | 组件库 `@tdesign-ng/components` |
| `packages/icons` | 图标包 `@tdesign-ng/icons`，图标数据由脚本从 `tdesign-icons-svg` 生成 |
| `packages/styles` | 样式包 `@tdesign-ng/styles`，把上游 less 拆成单组件入口 |
| `packages/docs` | 文档站 `@tdesign-ng/docs`（Angular 应用） |
| `vendor/tdesign-common` | 上游样式源码快照，`VERSION.json` 记录同步版本 |
| `scripts` | 代码生成与校验脚本（API 文档、图标、样式构建、上游对齐） |
| `docs/plans` | 改造计划与技术决策记录 |

## 本地开发

需要 Node 22 与 pnpm 12（仓库 `packageManager` 字段已声明版本）。

```bash
pnpm install
pnpm start          # 文档站开发服务器 → http://localhost:4280/
```

### 常用脚本

| 命令 | 作用 |
| --- | --- |
| `pnpm start` | 启动文档站（端口 4280，热重载） |
| `pnpm build` | 完整流水线：API 文档 → 图标 → 组件库 → 样式 → 文档站 |
| `pnpm build:lib` | 只构建组件库（ng-packagr） |
| `pnpm build:icons` | 只构建图标包 |
| `pnpm build:styles` | 把上游 less 编译成 CSS 产物并做内容断言 |
| `pnpm gen:api` | 从组件源码的 TSDoc 生成 API 表格数据 |
| `pnpm gen:icons` | 生成内置图标表，`--all` 可生成全量 2358 个图标 |
| `pnpm check:api` | 校验每个输入属性都有中英文描述 |
| `pnpm check:align` | 比对组件 API 与 tdesign-vue-next 的差异 |
| `pnpm vendor:styles` | 重新同步 `vendor/tdesign-common` 到上游最新 |
| `pnpm preview:pages` | 本地预览 GitHub Pages 产物 |

## 文档站

- 开发：`http://localhost:4280/`
- 线上：`https://yuanyong129.github.io/tdesign-ng/`

文档站的 API 表格不是手写的：`scripts/gen-api-docs.mjs` 用 TypeScript 编译器 API 扫描组件源码，读取 `@Input` / `@Output` 上的 `@zh`、`@en`、`@defaultValue`、`@values` 注释生成。所以**给属性写注释就是在写文档**，漏写会被 `pnpm check:api` 拦下。

## 参与贡献

目前处于打样阶段，API 仍会变动，暂不接受新增组件类 PR。组件实现请参考 `packages/ng-components/src/components/button/` 的写法（standalone、信号输入、OnPush、`ViewEncapsulation.None`、类名直接使用上游的 `.t-*` 约定）。

## 许可

[MIT](./LICENSE)

样式与设计规范来自 TDesign（Copyright 2021-present TDesign, MIT License），图标来自 [tdesign-icons](https://github.com/Tencent/tdesign-icons)。
