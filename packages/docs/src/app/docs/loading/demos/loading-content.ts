import { Component, inject, signal, viewChild, type TemplateRef } from '@angular/core';
import { TLoading, TLoadingService, TButton, TInput, type LoadingAttachNode, type LoadingContent, type LoadingInstance } from '@tdesign-ng/components';

@Component({
  selector: 'demo-loading-content',
  imports: [TLoading, TButton, TInput],
  template: `
    <ng-template #indicator><span class="custom-loading-indicator">◌</span></ng-template>
    <ng-template #text><span class="custom-loading-text">{{ label() }}</span></ng-template>
    <ng-template #business><t-button size="small" variant="outline" type="button" class="explicit-business" (click)="explicitCount.set(explicitCount() + 1)">模板业务 {{ explicitCount() }}</t-button></ng-template>
    <div style="display:grid;gap:24px">
      <t-loading class="loading-wrapped" [loading]="loading()" [delay]="delay()" [content]="content()" [indicator]="indicatorValue()" [text]="text" [showOverlay]="overlay()" [size]="size()" [attach]="attach()">
        <div style="height:100px;padding:16px;border:1px solid var(--td-component-border)">
          <t-button size="small" variant="outline" type="button" class="projected-business" (click)="count.set(count() + 1)">投影业务 {{ count() }}</t-button>
          <label style="display:inline-flex;align-items:center;gap:8px;margin-left:8px">业务草稿<t-input class="business-draft" placeholder="加载切换后保留内容" style="width:240px" /></label>
        </div>
      </t-loading>
      <div id="loading-target-a" class="loading-target-a" style="height:100px;border:1px solid var(--td-component-border);padding:16px">挂载区域 A</div>
      <div id="loading-target-b" class="loading-target-b" style="height:100px;position:relative;border:1px solid var(--td-component-border);padding:16px">挂载区域 B</div>
      <t-loading #attached class="loading-attached" [loading]="attachedLoading()" [attach]="attach()" [delay]="delay()" [indicator]="indicatorValue()" text="局部加载" [showOverlay]="overlay()" />
      <t-loading class="loading-independent" [loading]="false" content="hideAll 不应删除组件式实例" />
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
      <t-button size="small" (click)="loading.set(!loading())">切换包裹加载</t-button>
      <t-button size="small" (click)="attachedLoading.set(!attachedLoading())">切换局部加载</t-button>
      <t-button size="small" (click)="indicatorValue.set(indicator)">模板图标</t-button>
      <t-button size="small" (click)="indicatorValue.set(false)">隐藏图标</t-button>
      <t-button size="small" (click)="content.set(business)">模板内容</t-button>
      <t-button size="small" (click)="content.set(undefined)">恢复投影</t-button>
      <t-button size="small" (click)="attach.set(attach() === '#loading-target-a' ? '#loading-target-b' : '#loading-target-a')">切换挂载</t-button>
      <t-button size="small" (click)="showService()">服务局部加载</t-button>
      <t-button size="small" (click)="service.hideAll()">关闭本服务所有实例</t-button>
    </div>
  `,
})
export class DemoLoadingContent {
  readonly service = inject(TLoadingService);
  readonly attached = viewChild.required<TLoading>('attached');
  readonly business = viewChild.required<TemplateRef<unknown>>('business');
  readonly indicator = viewChild.required<TemplateRef<unknown>>('indicator');
  readonly loading = signal(false);
  readonly attachedLoading = signal(false);
  readonly delay = signal(0);
  readonly overlay = signal(true);
  readonly size = signal('medium');
  readonly label = signal('数据加载中');
  readonly count = signal(0);
  readonly explicitCount = signal(0);
  readonly content = signal<LoadingContent>(undefined);
  readonly indicatorValue = signal<boolean | LoadingContent>(true);
  readonly attach = signal<LoadingAttachNode>('#loading-target-a');
  lastInstance?: LoadingInstance;
  showService(): void { this.lastInstance = this.service.show({ attach: this.attach(), fullscreen: false, text: '服务局部加载', indicator: this.indicator() }); }
}
