import { Component, signal, viewChild, type TemplateRef } from '@angular/core';
import { TPopup, TButton, type PopupAttachNode, type PopupTriggerElement, type PopupTrigger } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popup-attachment',
  imports: [TPopup, TButton],
  template: `
    <div class="attach-scroll" style="height:200px;overflow:auto;border:1px solid var(--td-component-border);padding:16px">
      <div style="height:320px">
        <button id="popup-external-a" class="attach-trigger-a" type="button" style="margin-right:80px">外部触发器 A</button>
        @if (showB()) { <button id="popup-external-b" class="attach-trigger-b" type="button">外部触发器 B</button> }
        <t-popup #popup class="attachment-popup" [attach]="attach()" [triggerElement]="selectedTrigger()" [trigger]="trigger()" placement="bottom-left"
          [destroyOnClose]="destroy()" overlayClassName="attachment-panel" (visibleChange)="changes.set(changes() + 1)">
          <button type="button" class="attach-default-trigger">默认投影触发器</button>
          <div tPopupContent class="attach-content"><button type="button" class="attach-counter" (click)="count.set(count() + 1)">原组件计数 {{ count() }}</button><input class="attach-input" aria-label="弹层内编辑" /></div>
        </t-popup>
        <ng-template #templateTrigger><button type="button" class="attach-template-trigger">模板触发器 {{ label() }}</button></ng-template>
        <div id="popup-attach-a" class="attach-target-a" style="margin-top:24px;padding:12px;background:var(--td-bg-color-secondarycontainer)">挂载区 A</div>
        <div id="popup-attach-b" class="attach-target-b" style="margin-top:24px;padding:12px;transform:translate(24px, 12px) scale(0.8);transform-origin:top left;background:var(--td-bg-color-secondarycontainer)">挂载区 B（位移、缩放）</div>
      </div>
    </div>
    <t-popup #other class="attachment-other" trigger="click" content="独立实例不受影响" overlayClassName="attachment-other-panel"><button type="button">另一实例</button></t-popup>
    @if (temporary()) {
      <t-popup class="attachment-temporary" [attach]="attach()" triggerElement="#popup-external-b" trigger="click" defaultVisible content="可销毁的挂载实例"
        overlayClassName="attachment-temporary-panel" (visibleChange)="temporaryEvents.set(temporaryEvents() + 1)" />
    }
    <p class="demo-hint">开关提案 {{ changes() }} 次；计数 {{ count() }}。切换挂载区不销毁当前内容。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <t-button size="small" (click)="attach.set('#popup-attach-a')">挂载 A</t-button>
      <t-button size="small" (click)="attach.set('#popup-attach-b')">挂载 B</t-button>
      <t-button size="small" (click)="attach.set(undefined)">挂载 body</t-button>
      <t-button size="small" (click)="selectedTrigger.set('#popup-external-a')">触发器 A</t-button>
      <t-button size="small" (click)="selectedTrigger.set('#popup-external-b')">触发器 B</t-button>
      <t-button size="small" (click)="useTemplate()">模板触发器</t-button>
      <t-button size="small" (click)="selectedTrigger.set(undefined)">默认投影</t-button>
      <t-button size="small" (click)="label.set(label() + '!')">更新模板</t-button>
      <t-button size="small" (click)="popup.update()">重新解析和定位</t-button>
      <t-button size="small" (click)="showB.set(!showB())">创建/删除 B</t-button>
      <t-button size="small" (click)="temporary.set(!temporary())">创建/销毁挂载实例</t-button>
    </div>
  `,
})
export class DemoPopupAttachment {
  readonly popup = viewChild.required<TPopup>('popup');
  readonly other = viewChild.required<TPopup>('other');
  readonly template = viewChild.required<TemplateRef<unknown>>('templateTrigger');
  readonly attach = signal<PopupAttachNode>('#popup-attach-a');
  readonly selectedTrigger = signal<PopupTriggerElement | undefined>('#popup-external-a');
  readonly trigger = signal<PopupTrigger>('click');
  readonly destroy = signal(false);
  readonly count = signal(0);
  readonly changes = signal(0);
  readonly label = signal('内容');
  readonly showB = signal(true);
  readonly temporary = signal(false);
  readonly temporaryEvents = signal(0);
  useTemplate(): void { this.selectedTrigger.set(this.template()); }
}
