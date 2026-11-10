import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule, TDividerModule } from '@tdesign-ng/components';
import { ApiTable } from '../../api/api-table.component';

@Component({
  selector: 'space-docs',
  imports: [TButtonModule, TSpaceModule, TDividerModule, ApiTable],
  template: `
    <h2>间距 Space</h2>
    <p class="description">间距组件用于设置相邻组件之间的间隔。</p>

    <h3 class="description">水平间距</h3>
    <p class="description">size 支持 small / medium / large 预设值，也支持数字或 CSS 长度。</p>
    <div class="docs-block">
      <t-space>
        <t-button theme="primary">按钮</t-button>
        <t-button theme="primary">按钮</t-button>
        <t-button theme="primary">按钮</t-button>
      </t-space>
    </div>

    <h3 class="description">不同间距大小</h3>
    <div class="docs-block">
      <t-space size="small">
        <t-button size="small">small</t-button>
        <t-button size="small">small</t-button>
      </t-space>
      <t-divider />
      <t-space size="medium">
        <t-button size="small">medium</t-button>
        <t-button size="small">medium</t-button>
      </t-space>
      <t-divider />
      <t-space size="large">
        <t-button size="small">large</t-button>
        <t-button size="small">large</t-button>
      </t-space>
      <t-divider />
      <t-space [size]="40">
        <t-button size="small">40px</t-button>
        <t-button size="small">40px</t-button>
      </t-space>
    </div>

    <h3 class="description">垂直间距</h3>
    <div class="docs-block">
      <t-space direction="vertical" align="start">
        <t-button theme="primary">按钮</t-button>
        <t-button theme="primary">按钮</t-button>
        <t-button theme="primary">按钮</t-button>
      </t-space>
    </div>

    <h3 class="description">分隔符</h3>
    <p class="description">separator 目前支持字符串。</p>
    <div class="docs-block">
      <t-space separator="|">
        <span>文本</span>
        <span>文本</span>
        <span>文本</span>
      </t-space>
    </div>

    <h3 class="description">自动换行</h3>
    <div class="docs-block" style="width: 320px">
      <t-space [breakLine]="true" [size]="8">
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
        <t-button variant="outline">按钮</t-button>
      </t-space>
    </div>

    <h3 class="description">对齐方式</h3>
    <div class="docs-block">
      <t-space align="start" [size]="16" style="height: 80px">
        <t-button size="small">start</t-button>
        <t-button size="large">start</t-button>
      </t-space>
      <t-divider />
      <t-space align="center" [size]="16" style="height: 80px">
        <t-button size="small">center</t-button>
        <t-button size="large">center</t-button>
      </t-space>
      <t-divider />
      <t-space align="end" [size]="16" style="height: 80px">
        <t-button size="small">end</t-button>
        <t-button size="large">end</t-button>
      </t-space>
    </div>

    <h3 class="description">API</h3>
    <api-table component="TSpace" />
  `,
})
export class SpaceDocs {}
