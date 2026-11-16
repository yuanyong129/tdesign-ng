import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoAvatarBasic } from './demos/avatar-basic';
import { DemoAvatarGroup } from './demos/avatar-group';
import { DemoAvatarShape } from './demos/avatar-shape';

@Component({
  selector: 'avatar-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoAvatarBasic, DemoAvatarShape, DemoAvatarGroup],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">头像 Avatar</h1>
      <p class="docs-page__lead">
        头像用于展示用户或对象，支持图片、文字、图标三种内容，以及形状、尺寸与层叠分组。
      </p>

      <docs-demo id="avatar-basic" title="基础用法" description="image 优先，加载失败时回退到 content。">
        <demo-avatar-basic />
      </docs-demo>

      <docs-demo id="avatar-shape" title="形状" description="circle / round / square 三种形状。">
        <demo-avatar-shape />
      </docs-demo>

      <docs-demo id="avatar-group" title="头像组" description="max 控制显示数量，超出折叠成 +N。">
        <demo-avatar-group />
      </docs-demo>

      <h2 class="docs-section__title" id="avatar-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TAvatar" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TAvatarGroup" />
      </div>

      <docs-page-nav current="/avatar" />
    </div>
  `,
})
export class AvatarDocs {}
