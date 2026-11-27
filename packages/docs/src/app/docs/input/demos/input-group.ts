import { Component, signal } from '@angular/core';
import { TButton, TInput, TInputGroup } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-group',
  imports: [TInput, TInputGroup, TButton],
  template: `
    <t-input-group [separate]="separate()" aria-label="姓名" style="max-width: 520px; width: 100%">
      <t-input defaultValue="张" label="姓" />
      <t-input defaultValue="三" label="名" />
    </t-input-group>
    <p class="demo-hint">每个输入框独立编辑，separate 控制组合边框或独立间距。</p>
    <t-button size="small" (click)="separate.set(!separate())">切换间距</t-button>
  `,
})
export class DemoInputGroup { protected readonly separate = signal(false); }
