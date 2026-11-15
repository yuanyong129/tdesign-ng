import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDialogBasic } from './demos/dialog-basic';
import { DemoDialogCustom } from './demos/dialog-custom';
import { DemoDialogPlacement } from './demos/dialog-placement';
import { DemoDialogTheme } from './demos/dialog-theme';

@Component({
  selector: 'dialog-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoDialogBasic, DemoDialogTheme, DemoDialogPlacement, DemoDialogCustom],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">对话框 Dialog</h1>
      <p class="docs-page__lead">
        对话框用于在页面之上承载需要用户确认或填写的临时内容，默认带遮罩、焦点陷阱与背景滚动锁定。
      </p>

      <docs-demo id="dialog-basic" title="基础用法" description="用 [(visible)] 控制显隐，遮罩、Esc、关闭按钮都能关闭。">
        <demo-dialog-basic />
      </docs-demo>

      <docs-demo id="dialog-theme" title="主题" description="theme 为非 default 时，头部会显示对应颜色的图标。">
        <demo-dialog-theme />
      </docs-demo>

      <docs-demo id="dialog-placement" title="位置与宽度" description="placement 控制垂直位置，width 控制宽度。">
        <demo-dialog-placement />
      </docs-demo>

      <docs-demo id="dialog-custom" title="自定义内容与底部" description="默认投影是内容，[tDialogFooter] 可以完全接管底部按钮。">
        <demo-dialog-custom />
      </docs-demo>

      <h2 class="docs-section__title" id="dialog-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TDialog" />
      </div>

      <docs-page-nav current="/dialog" />
    </div>
  `,
})
export class DialogDocs {}
