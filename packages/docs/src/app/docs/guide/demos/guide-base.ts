import { Component, signal } from '@angular/core';
import { TButtonModule, TGuideModule } from '@tdesign-ng/components';
import type { GuideStep } from '@tdesign-ng/components';

@Component({
  selector: 'demo-guide-base',
  imports: [TGuideModule, TButtonModule],
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <div id="guide-base-create" style="display: inline-flex">
          <t-button theme="primary">新建任务</t-button>
        </div>
        <div
          id="guide-base-search"
          style="padding: 6px 12px; border: 1px dashed var(--td-component-border); border-radius: 3px"
        >
          搜索任务
        </div>
        <div id="guide-base-share" style="display: inline-flex">
          <t-button variant="outline">分享</t-button>
        </div>
      </div>

      <div>
        <t-button variant="outline" (click)="start()">开始引导</t-button>
        @if (current() >= 0) {
          <p class="demo-hint">当前第 {{ current() + 1 }} / {{ steps.length }} 步</p>
        }
      </div>
    </div>

    <t-guide
      [steps]="steps"
      [current]="current()"
      (currentChange)="current.set($event)"
    />
  `,
})
export class DemoGuideBase {
  protected readonly current = signal(-1);

  protected readonly steps: GuideStep[] = [
    {
      element: '#guide-base-create',
      title: '新建任务',
      body: '从这里创建一个新任务，创建后会出现在任务列表中。',
      placement: 'bottom',
    },
    {
      element: '#guide-base-search',
      title: '搜索与筛选',
      body: '输入关键字即可筛选任务，支持按状态与负责人组合查询。',
      placement: 'bottom',
    },
    {
      element: '#guide-base-share',
      title: '分享任务',
      body: '把当前任务分享给团队成员，对方会收到站内通知。',
      placement: 'left',
    },
  ];

  protected start(): void {
    this.current.set(0);
  }
}
