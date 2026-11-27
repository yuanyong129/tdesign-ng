import { Component, signal } from '@angular/core';
import { TRate } from '@tdesign-ng/components';

@Component({
  selector: 'demo-rate-icon',
  imports: [TRate],
  template: `
    <ng-template #heart>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
        <path d="M12 21 3 12C-3 5 6-2 12 5c6-7 15 0 9 7Z" />
      </svg>
    </ng-template>
    <t-rate [icon]="heart" allowHalf clearable [value]="value()" (change)="value.set($event.value)" />
    <p>当前评分：{{ value() }}；再次点击相同评分可以清空。</p>
    <t-rate icon="♥" [defaultValue]="3" disabled />
  `,
})
export class DemoRateIcon {
  readonly value = signal(2.5);
}
