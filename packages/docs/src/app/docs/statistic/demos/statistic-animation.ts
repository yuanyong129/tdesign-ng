import { Component, signal, viewChild } from '@angular/core';
import { TButton, TStatistic, type StatisticAnimation } from '@tdesign-ng/components';

@Component({
  selector: 'demo-statistic-animation',
  imports: [TStatistic, TButton],
  template: `
    <ng-template #unit><span class="animation-unit">元</span></ng-template>
    <div style="display:flex;gap:48px;flex-wrap:wrap">
      <t-statistic #automatic class="animation-auto" title="自动播放" [value]="value()" [animation]="animation()" [animationStart]="auto()"
        [decimalPlaces]="places()" [separator]="separator()" [format]="format()" [loading]="loading()" [unit]="unit" trend="increase" color="blue" />
      <t-statistic #manual class="animation-manual" title="手动播放" [value]="manualValue()" [animation]="manualAnimation()" [decimalPlaces]="2" />
      @if (showTemporary()) {
        <t-statistic class="animation-temporary" title="可销毁实例" [value]="500" [animation]="{ valueFrom: 0, duration: 2000 }" animationStart />
      }
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:24px">
      <t-button size="small" (click)="automatic.start()">重播自动实例</t-button>
      <t-button size="small" (click)="manual.start()">手动 start()</t-button>
      <t-button size="small" (click)="value.set(value() === 12345.67 ? -321.25 : 12345.67)">切换目标值</t-button>
      <t-button size="small" (click)="auto.set(!auto())">自动播放 {{ auto() ? '开启' : '关闭' }}</t-button>
      <t-button size="small" (click)="loading.set(!loading())">切换加载</t-button>
      <t-button size="small" (click)="showTemporary.set(!showTemporary())">创建/销毁实例</t-button>
    </div>
    <p class="demo-hint">动画只改变展示值，value 仍为 {{ value() }}。重播从配置 valueFrom 重新开始，目标变化会取消旧动画。</p>
  `,
})
export class DemoStatisticAnimation {
  readonly automatic = viewChild.required<TStatistic>('automatic');
  readonly manual = viewChild.required<TStatistic>('manual');
  readonly value = signal<number | undefined>(12345.67);
  readonly animation = signal<StatisticAnimation | undefined>({ valueFrom: 0, duration: 1200 });
  readonly auto = signal(true);
  readonly loading = signal(false);
  readonly places = signal<number | undefined>(2);
  readonly separator = signal(',');
  readonly format = signal<((value: number) => number) | undefined>(undefined);
  readonly manualValue = signal(100);
  readonly manualAnimation = signal<StatisticAnimation | undefined>({ valueFrom: 20, duration: 800 });
  readonly showTemporary = signal(false);
}
