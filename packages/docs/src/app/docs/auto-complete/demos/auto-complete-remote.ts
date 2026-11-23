import { Component, computed, signal } from '@angular/core';
import {
  TAutoCompleteModule,
  TSpaceModule,
  type AutoCompleteFilter,
  type AutoCompleteOption,
} from '@tdesign-ng/components';

const CITIES = [
  '北京',
  '上海',
  '广州',
  '深圳',
  '杭州',
  '成都',
  '南京',
  '武汉',
  '西安',
  '重庆',
  '长沙',
  '苏州',
];

@Component({
  selector: 'demo-auto-complete-remote',
  imports: [TAutoCompleteModule, TSpaceModule],
  styles: [':host { display: block; max-width: 384px; }'],
  template: `
    <t-auto-complete
      [options]="options()"
      [filter]="filter"
      [value]="value"
      (valueChange)="handleValueChange($event)"
      [panelBottomContent]="panelBottomText()"
      placeholder="输入城市名，远程联想"
      [clearable]="true"
    />
  `,
})
export class DemoAutoCompleteRemote {
  protected readonly loading = signal(false);

  protected readonly options = signal<AutoCompleteOption[]>([]);

  protected value = '';

  private timer: ReturnType<typeof setTimeout> | undefined;

  /** 同一关键词只发一次请求，避免 options 变化再次触发过滤时重复取数。 */
  private lastKeyword: string | null = null;

  /**
   * 远程联想的取数发生在 valueChange 里（防抖后写入 options）。
   * 这里返回 Promise，组件按真值处理（与上游一致），因此不再做本地二次过滤。
   */
  protected readonly filter: AutoCompleteFilter = () => Promise.resolve(true);

  protected readonly panelBottomText = computed(() =>
    this.loading() ? '正在搜索…' : undefined,
  );

  protected handleValueChange(value: string): void {
    this.value = value;
    this.search(value);
  }

  private search(keyword: string): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    const words = keyword.trim();
    if (!words) {
      this.lastKeyword = null;
      this.loading.set(false);
      this.options.set([]);
      return;
    }
    if (words === this.lastKeyword) return;
    this.lastKeyword = words;
    this.loading.set(true);
    this.timer = setTimeout(() => {
      this.loading.set(false);
      this.options.set(CITIES.filter((city) => city.includes(words)));
    }, 300);
  }
}
