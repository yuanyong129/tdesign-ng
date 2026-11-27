import { Component, signal } from '@angular/core';
import { TAvatar, TAvatarGroup, TButton } from '@tdesign-ng/components';

@Component({
  selector: 'demo-avatar-group-popup',
  imports: [TAvatar, TAvatarGroup, TButton],
  template: `
    <ng-template #collapse><strong>+{{ max() > 0 ? 3 + extras().length - max() : 0 }}</strong></ng-template>
    @if (showGroup()) {
      <t-avatar-group [max]="max()" [size]="size()" [cascading]="cascading()" [collapseAvatar]="collapse"
        [popupProps]="{ trigger: 'click', placement: 'bottom', destroyOnClose: true, disabled: disabled(),
          zIndex: 2350, overlayClassName: 'avatar-custom-panel', overlayInnerClassName: 'avatar-custom-inner' }">
        <t-avatar [content]="'A' + suffix()" />
        <t-avatar image="favicon.svg" [imageProps]="{ fit: 'cover' }" (error)="imageErrors.update(increment)" />
        <t-avatar (click)="hostClicks.update(increment)">
          <span tAvatarIcon class="t-icon" aria-hidden="true">★</span>
          <t-button variant="text" size="small" (click)="clicks.update(increment)">{{ clicks() }}</t-button>
        </t-avatar>
        @for (name of extras(); track name) {
          <t-avatar [content]="name + suffix()" />
        }
      </t-avatar-group>
    }
    <p aria-live="polite">原头像按钮点击 {{ clicks() }} 次。</p>
    <t-button variant="text" (click)="max.set(max() === 2 ? 20 : 2)">切换折叠</t-button>
    <t-button variant="text" (click)="add()">增加头像</t-button>
    <t-button variant="text" (click)="showGroup.set(!showGroup())">显示或移除头像组</t-button>
    <p>正数 max 限制显示数量；0、负数或未设置时全部显示。折叠触发器支持 Enter、空格与方向下键。</p>
  `,
})
export class DemoAvatarGroupPopup {
  readonly max = signal(2);
  readonly size = signal('large');
  readonly cascading = signal<'left-up' | 'right-up'>('left-up');
  readonly extras = signal(['D', 'E']);
  readonly suffix = signal('');
  readonly disabled = signal(false);
  readonly showGroup = signal(true);
  readonly clicks = signal(0);
  readonly hostClicks = signal(0);
  readonly imageErrors = signal(0);
  readonly increment = (value: number) => value + 1;
  add(): void { this.extras.update((names) => [...names, String.fromCharCode(68 + names.length)]); }
}
