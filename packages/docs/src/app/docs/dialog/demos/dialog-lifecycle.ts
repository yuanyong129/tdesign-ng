import { Component, signal, viewChild, type TemplateRef } from '@angular/core';
import { TButton, TDialog, TInput, TTextarea, type DialogMode } from '@tdesign-ng/components';

@Component({
  selector: 'demo-dialog-lifecycle',
  imports: [TButton, TDialog, TInput, TTextarea],
  template: `
    <ng-template #content>
      <span class="dialog-live">{{ label() }}</span>
      <label>名称<t-input class="dialog-input" /></label>
      <t-textarea class="dialog-textarea" placeholder="Enter 不触发确认" />
      <t-button class="dialog-counter" variant="outline" (click)="count.set(count() + 1)">计数 {{ count() }}</t-button>
      <t-button class="dialog-nested" variant="outline" (click)="second.show()">打开第二层</t-button>
      <t-button variant="text" (click)="accept.set(!accept())">接收关闭提案：{{ accept() }}</t-button>
    </ng-template>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <t-button class="dialog-open" variant="outline" (click)="visible.set(true)">打开受控对话框</t-button>
      <t-button variant="outline" (click)="accept.set(!accept())">接收/拒绝关闭提案</t-button>
      <t-button variant="outline" (click)="defaults.show()">非受控 show()</t-button>
      <t-button variant="outline" (click)="destroy.set(!destroy())">关闭时销毁模板</t-button>
    </div>
    <p class="demo-hint">提案 {{ proposals() }} 次；确认 {{ confirms() }} 次；事件 {{ events.join(' → ') }}。</p>
    @if (mounted()) {
      <t-dialog #controlled class="dialog-lifecycle-controlled" [visible]="visible()" header="生命周期与受控关闭" [body]="content"
        [lazy]="lazy()" [destroyOnClose]="destroy()" [mode]="mode()" [preventScrollThrough]="prevent()" [zIndex]="zIndex()"
        [confirmOnEnter]="enter()" [confirmLoading]="confirmLoading()" [closeOnEscKeydown]="escape()" [closeOnOverlayClick]="mask()"
        [dialogStyle]="style()" [dialogClassName]="className()"
        (visibleChange)="propose($event)" (close)="record('close:' + $event.trigger)" (confirm)="confirms.set(confirms() + 1)"
        (cancel)="record('cancel')" (overlayClick)="record('overlay')" (escKeydown)="record('esc')" (closeBtnClick)="record('button')"
        (beforeOpen)="record('beforeOpen')" (opened)="record('opened')" (beforeClose)="record('beforeClose')" (closed)="record('closed')" />
    }
    <t-dialog #defaults class="dialog-lifecycle-default" header="实例管理的对话框" [body]="content" [destroyOnClose]="destroy()" (visibleChange)="defaultProposals.set(defaultProposals() + 1)" />
    <t-dialog #second class="dialog-lifecycle-second" header="第二层" body="关闭这一层后，第一层滚动锁仍保留" [zIndex]="secondZ()" />
  `,
})
export class DemoDialogLifecycle {
  readonly controlled = viewChild<TDialog>('controlled');
  readonly defaults = viewChild.required<TDialog>('defaults');
  readonly second = viewChild.required<TDialog>('second');
  readonly content = viewChild.required<TemplateRef<unknown>>('content');
  readonly visible = signal(false);
  readonly accept = signal(true);
  readonly lazy = signal(true);
  readonly destroy = signal(false);
  readonly mounted = signal(true);
  readonly mode = signal<DialogMode>('modal');
  readonly prevent = signal(true);
  readonly zIndex = signal(2600);
  readonly secondZ = signal(2700);
  readonly enter = signal(true);
  readonly escape = signal(true);
  readonly mask = signal(true);
  readonly confirmLoading = signal(false);
  readonly label = signal('模板内容');
  readonly count = signal(0);
  readonly confirms = signal(0);
  readonly proposals = signal(0);
  readonly defaultProposals = signal(0);
  readonly style = signal<Record<string, string>>({ borderRadius: '12px', backgroundColor: 'white' });
  readonly className = signal<string | string[] | Record<string, boolean>>('dialog-demo-panel');
  readonly events: string[] = [];
  record(event: string): void { this.events.push(event); }
  propose(visible: boolean): void { this.proposals.update(n => n + 1); if (this.accept()) this.visible.set(visible); }
}
