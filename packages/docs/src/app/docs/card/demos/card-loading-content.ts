import { Component, signal, viewChild, type TemplateRef } from '@angular/core';
import { TButton, TCard, TInput, type CardContent, type CardLoading, type CardLoadingOptions, type CardStyles, type CardTheme } from '@tdesign-ng/components';

@Component({
  selector: 'demo-card-loading-content',
  imports: [TCard, TButton, TInput],
  template: `
    <ng-template #custom><div class="custom-card-loading" style="padding:24px;background:var(--td-bg-color-secondarycontainer)">自定义加载 {{ label() }}<t-button class="custom-card-action" size="small" variant="outline" (click)="customCount.set(customCount() + 1)">重试 {{ customCount() }}</t-button></div></ng-template>
    <ng-template #indicator><span class="card-indicator">◌</span></ng-template>
    <ng-template #text><span class="card-loading-text">{{ label() }}</span></ng-template>
    <ng-template #header><t-button class="card-custom-header" variant="text" (click)="headerCount.set(headerCount() + 1)">自定义头部 {{ headerCount() }}</t-button></ng-template>
    <ng-template #footer><t-button class="card-footer-action" variant="text" (click)="footerCount.set(footerCount() + 1)">底部 {{ footerCount() }}</t-button></ng-template>
    <ng-template #actions><t-button class="card-header-action" variant="text" (click)="actionCount.set(actionCount() + 1)">操作 {{ actionCount() }}</t-button></ng-template>
    @if (mounted()) {
      <t-card class="card-loading-business" title="保留业务内容" subtitle="加载期间保持布局" description="默认遮罩仅覆盖主体" bordered headerBordered
        [loading]="loading()" [loadingProps]="options()" [theme]="theme()" [header]="headerValue()" [footer]="footer" [actions]="actions"
        [bodyClassName]="bodyClass()" [bodyStyle]="bodyStyle()" [headerStyle]="headerStyle()" [footerStyle]="footerStyle()">
        <div style="display:flex;gap:8px;align-items:center;min-height:80px">
          <t-button class="card-business-counter" variant="outline" (click)="count.set(count() + 1)">业务计数 {{ count() }}</t-button>
          <label>草稿<t-input class="card-business-input" placeholder="切换加载后保留" style="width:180px" /></label>
        </div>
      </t-card>
    }
    <t-card class="card-dynamic-content" title="动态主体" bordered [loading]="dynamicLoading()" style="margin-top:16px">
      @if (dynamicShown()) { <t-button class="card-dynamic-action" variant="text">异步业务内容</t-button> }
      {{ dynamicText() }}
    </t-card>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:16px">
      <t-button variant="outline" (click)="loading.set(loading() ? false : true)">切换默认加载</t-button>
      <t-button variant="outline" (click)="loading.set(custom)">自定义加载模板</t-button>
      <t-button variant="outline" (click)="options.set({indicator:indicator,text:text,delay:300})">模板图标与文字</t-button>
      <t-button variant="outline" (click)="label.set('内容已更新')">更新加载文字</t-button>
      <t-button variant="outline" (click)="dynamicShown.set(!dynamicShown())">创建/删除主体</t-button>
      <t-button variant="outline" (click)="dynamicText.set(dynamicText() ? '' : '异步文字')">切换纯文字主体</t-button>
      <t-button variant="outline" (click)="dynamicLoading.set(!dynamicLoading())">切换空主体加载</t-button>
      <t-button variant="outline" (click)="theme.set(theme() === 'poster2' ? 'normal' : 'poster2')">切换底部操作区</t-button>
    </div>
  `,
})
export class DemoCardLoadingContent {
  readonly custom = viewChild.required<TemplateRef<unknown>>('custom');
  readonly indicator = viewChild.required<TemplateRef<unknown>>('indicator');
  readonly text = viewChild.required<TemplateRef<unknown>>('text');
  readonly header = viewChild.required<TemplateRef<unknown>>('header');
  readonly loading = signal<CardLoading>(false);
  readonly options = signal<CardLoadingOptions>({ delay: 0 });
  readonly label = signal('正在读取');
  readonly count = signal(0);
  readonly customCount = signal(0);
  readonly headerCount = signal(0);
  readonly footerCount = signal(0);
  readonly actionCount = signal(0);
  readonly mounted = signal(true);
  readonly dynamicShown = signal(false);
  readonly dynamicText = signal('');
  readonly dynamicLoading = signal(false);
  readonly theme = signal<CardTheme>('normal');
  readonly headerValue = signal<CardContent>(undefined);
  readonly bodyClass = signal('card-demo-body');
  readonly bodyStyle = signal<CardStyles>({ padding: '24px' });
  readonly headerStyle = signal<CardStyles>({ backgroundColor: 'transparent' });
  readonly footerStyle = signal<CardStyles>({ backgroundColor: 'transparent' });
}
