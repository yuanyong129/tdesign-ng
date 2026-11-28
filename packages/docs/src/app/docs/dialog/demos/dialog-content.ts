import { Component, signal, viewChild, type TemplateRef } from '@angular/core';
import { TButton, TDialog, TDialogFooterSlot, TInput, type DialogActionButton, type DialogContent, type DialogMode, type DialogTheme } from '@tdesign-ng/components';

@Component({
  selector: 'demo-dialog-content',
  imports: [TButton, TDialog, TDialogFooterSlot, TInput],
  template: `
    <ng-template #header><span class="dialog-rich-header">{{ label() }}</span></ng-template>
    <ng-template #body><label>备注<t-input class="dialog-rich-input" /></label><p>{{ label() }}</p></ng-template>
    <ng-template #close><t-button class="dialog-rich-close" variant="text">关闭</t-button></ng-template>
    <ng-template #footer let-confirm="confirm" let-cancel="cancel"><t-button class="dialog-rich-cancel" variant="outline" (click)="cancel($event)">模板取消</t-button><t-button class="dialog-rich-confirm" theme="primary" (click)="confirm($event)">模板确认 {{ count() }}</t-button></ng-template>
    <ng-template #confirm let-confirm="confirm"><t-button class="dialog-replacement-confirm" theme="success" (click)="confirm($event)">替换确认</t-button></ng-template>
    <ng-template #cancel let-cancel="cancel"><t-button class="dialog-replacement-cancel" variant="text" (click)="cancel($event)">替换取消</t-button></ng-template>
    <ng-template #buttonLabel><span class="dialog-button-label">{{ label() }}</span></ng-template>
    <t-button class="dialog-rich-open" variant="outline" (click)="visible.set(true)">打开富内容对话框</t-button>
    <p class="demo-hint">确认 {{ count() }} 次；取消 {{ cancels() }} 次；配置回调 {{ callbacks() }} 次；关闭 {{ closes() }} 次。</p>
    @if (mounted()) {
      <t-dialog #dialog class="dialog-rich" [visible]="visible()" (visibleChange)="accept() && visible.set($event)" [header]="headerValue()" [body]="body" [footer]="footerValue()"
        [closeBtn]="closeValue()" [confirmBtn]="confirmValue()" [cancelBtn]="cancelValue()" [confirmLoading]="loading()"
        [confirmOnEnter]="true" [mode]="mode()" [theme]="theme()" [destroyOnClose]="destroy()" [width]="width()"
        (confirm)="count.set(count() + 1)" (cancel)="cancels.set(cancels() + 1)" (close)="closes.set(closes() + 1)">
        @if (showProjected()) { <div tDialogFooter><t-button class="dialog-projected-footer" variant="outline" (click)="projected.set(projected() + 1)">投影计数 {{ projected() }}</t-button></div> }
      </t-dialog>
    }
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
      <t-button variant="outline" (click)="configure()">标题/关闭/底部模板</t-button>
      <t-button variant="outline" (click)="buttonOptions()">配置确认与取消</t-button>
      <t-button variant="outline" (click)="replacements()">替换完整按钮</t-button>
      <t-button variant="outline" (click)="mode.set(mode() === 'full-screen' ? 'modal' : 'full-screen')">切换全屏</t-button>
      <t-button variant="outline" (click)="label.set('内容已更新')">更新模板文字</t-button>
    </div>
  `,
})
export class DemoDialogContent {
  readonly dialog = viewChild<TDialog>('dialog');
  readonly header = viewChild.required<TemplateRef<unknown>>('header');
  readonly close = viewChild.required<TemplateRef<unknown>>('close');
  readonly footer = viewChild.required<TemplateRef<unknown>>('footer');
  readonly confirm = viewChild.required<TemplateRef<unknown>>('confirm');
  readonly cancel = viewChild.required<TemplateRef<unknown>>('cancel');
  readonly buttonLabel = viewChild.required<TemplateRef<unknown>>('buttonLabel');
  readonly visible = signal(false);
  readonly accept = signal(true);
  readonly mounted = signal(true);
  readonly destroy = signal(false);
  readonly headerValue = signal<boolean | DialogContent>('富内容与按钮配置');
  readonly footerValue = signal<boolean | DialogContent>(true);
  readonly closeValue = signal<boolean | DialogContent>(true);
  readonly confirmValue = signal<DialogActionButton>('确定');
  readonly cancelValue = signal<DialogActionButton>('取消');
  readonly mode = signal<DialogMode>('modal');
  readonly theme = signal<DialogTheme>('default');
  readonly width = signal<string | number>(480);
  readonly loading = signal(false);
  readonly label = signal('可编辑对话框');
  readonly count = signal(0);
  readonly cancels = signal(0);
  readonly closes = signal(0);
  readonly projected = signal(0);
  readonly showProjected = signal(true);
  readonly callbacks = signal(0);
  configure(): void { this.headerValue.set(this.header()); this.closeValue.set(this.close()); this.footerValue.set(this.footer()); this.visible.set(true); }
  buttonOptions(): void { this.showProjected.set(false); this.footerValue.set(true); this.confirmValue.set({content:this.buttonLabel(),theme:'success',variant:'outline',size:'small',onClick:()=>this.callbacks.update(n=>n+1)}); this.cancelValue.set({content:'稍后处理',variant:'text'}); this.visible.set(true); }
  replacements(): void { this.showProjected.set(false); this.footerValue.set(true); this.confirmValue.set(this.confirm()); this.cancelValue.set(this.cancel()); this.visible.set(true); }
}
