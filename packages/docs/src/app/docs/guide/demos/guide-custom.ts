import { Component, TemplateRef, computed, signal, viewChild } from '@angular/core';
import { TButtonModule, TGuideModule } from '@tdesign-ng/components';
import type { GuideStep } from '@tdesign-ng/components';

@Component({
  selector: 'demo-guide-custom',
  imports: [TGuideModule, TButtonModule],
  template: `
    <div style="display: flex; flex-direction: column; gap: 16px">
      <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap">
        <div id="guide-custom-upload" style="display: inline-flex">
          <t-button theme="primary">上传文件</t-button>
        </div>
        <div
          id="guide-custom-list"
          style="padding: 6px 12px; border: 1px dashed var(--td-component-border); border-radius: 3px"
        >
          文件列表
        </div>
      </div>

      <div>
        <t-button variant="outline" (click)="start()">自定义内容</t-button>
        @if (current() >= 0) {
          <p class="demo-hint">当前第 {{ current() + 1 }} / {{ steps().length }} 步</p>
        }
      </div>
    </div>

    <ng-template #customStep let-ctx>
      <div class="t-guide__tooltip">
        <div class="t-guide__title">完全自定义的气泡</div>
        <div class="t-guide__desc">
          内容通过 content 传入模板，可以自由组合组件，并通过上下文里的方法控制流程。
        </div>
        <div class="t-guide__footer t-guide__footer--popup">
          <div class="t-guide__counter">{{ ctx.current + 1 }} / {{ ctx.total }}</div>
          <div class="t-guide__action">
            <t-button size="small" variant="text" (click)="ctx.skip($event)">跳过</t-button>
            <t-button size="small" theme="primary" (click)="ctx.finish($event)">完成</t-button>
          </div>
        </div>
      </div>
    </ng-template>

    <ng-template #customHighlight>
      <div class="t-guide__tooltip">
        <div class="t-guide__title">重点区域</div>
      </div>
    </ng-template>

    <t-guide
      [steps]="steps()"
      [current]="current()"
      (currentChange)="current.set($event)"
    />
  `,
})
export class DemoGuideCustom {
  protected readonly current = signal(-1);

  private readonly customStep = viewChild<TemplateRef<unknown>>('customStep');
  private readonly customHighlight = viewChild<TemplateRef<unknown>>('customHighlight');

  protected readonly steps = computed<GuideStep[]>(() => [
    {
      element: '#guide-custom-upload',
      title: '上传文件',
      body: '点击按钮选择本地文件，支持批量上传。',
      placement: 'bottom',
    },
    {
      element: '#guide-custom-list',
      title: '文件列表',
      body: '上传完成的文件会出现在这里，可以预览、下载或删除。',
      placement: 'right',
      highlightContent: this.customHighlight(),
    },
    {
      element: '#guide-custom-list',
      title: '自定义内容',
      body: '这一步使用 content 渲染完全自定义的内容。',
      placement: 'right',
      content: this.customStep(),
    },
  ]);

  protected start(): void {
    this.current.set(0);
  }
}
