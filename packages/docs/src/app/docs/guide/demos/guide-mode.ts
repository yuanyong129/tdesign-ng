import { Component, signal } from '@angular/core';
import { TButtonModule, TGuideModule } from '@tdesign-ng/components';
import type { GuideMode, GuideStep } from '@tdesign-ng/components';

@Component({
  selector: 'demo-guide-mode',
  imports: [TGuideModule, TButtonModule],
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <div id="guide-mode-primary" style="display: inline-flex">
          <t-button theme="primary">发布应用</t-button>
        </div>
        <div
          id="guide-mode-config"
          style="padding: 6px 12px; border: 1px dashed var(--td-component-border); border-radius: 3px"
        >
          环境配置
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <t-button variant="outline" (click)="start('popup')">气泡模式</t-button>
        <t-button variant="outline" (click)="start('dialog')">对话框模式</t-button>
        @if (current() >= 0) {
          <span class="demo-hint">当前第 {{ current() + 1 }} / {{ steps.length }} 步</span>
        }
      </div>
    </div>

    <t-guide
      [steps]="steps"
      [mode]="mode()"
      [current]="current()"
      (currentChange)="current.set($event)"
    />
  `,
})
export class DemoGuideMode {
  protected readonly current = signal(-1);
  protected readonly mode = signal<GuideMode>('popup');

  protected readonly steps: GuideStep[] = [
    {
      element: '#guide-mode-primary',
      title: '发布应用',
      body: '完成配置后从这里发布，发布过程会保留历史版本。',
      placement: 'bottom',
    },
    {
      element: '#guide-mode-config',
      title: '环境配置',
      body: '这一步单独指定了 dialog 模式并居中展示，用于需要用户确认的重要说明。',
      mode: 'dialog',
      placement: 'center',
    },
  ];

  protected start(mode: GuideMode): void {
    this.mode.set(mode);
    this.current.set(0);
  }
}
