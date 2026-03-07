# Arco Design Angular 组件库

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.0.

## 介绍

Arco Design Angular 是一套企业级 UI 组件库，基于 Angular 框架开发，提供了丰富的组件和工具，帮助开发者快速构建高质量的 Web 应用。

## 特性

- **组件丰富**：提供了按钮、表单、弹窗、导航等常用组件
- **主题定制**：支持自定义主题，满足不同品牌需求
- **易于使用**：提供详细的文档和示例
- **质量保证**：完善的单元测试和集成测试
- **响应式设计**：适配不同屏幕尺寸

## 快速开始

### 安装

```bash
npm install @arco-design/ng
```

### 引入

在 `app.module.ts` 中引入组件库模块：

```typescript
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ButtonModule } from '@arco-design/ng/button';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, ButtonModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
```

### 使用

在组件模板中使用：

```html
<arco-button type="primary">按钮</arco-button>
```

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the library, run:

```bash
ng build components
```

This command will compile your project, and the build artifacts will be placed in the `dist/` directory.

### Publishing the Library

Once the project is built, you can publish your library by following these steps:

1. Navigate to the `dist` directory:
   ```bash
   cd dist/components
   ```

2. Run the `npm publish` command to publish your library to the npm registry:
   ```bash
   npm publish
   ```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## 组件列表

- Button 按钮
- Input 输入框（待开发）
- Select 选择器（待开发）
- DatePicker 日期选择器（待开发）
- Modal 弹窗（待开发）
- Table 表格（待开发）
- Form 表单（待开发）
- Tree 树（待开发）
- ...

## 目录结构

```
src/
├── components/     # 组件目录
│   └── button/    # 按钮组件
├── styles/        # 样式文件
├── types/         # 类型定义
├── utils/         # 工具函数
└── public-api.ts  # 公共 API 入口
```

## 浏览器支持

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
