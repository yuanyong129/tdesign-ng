import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TList, TListItem } from '@tdesign-ng/components';

@Component({
  selector: 'demo-list-async',
  standalone: true,
  imports: [TList, TListItem],
  template: `
    <t-list
      header="异步加载"
      [asyncLoading]="loading()"
      split
      (loadMore)="handleLoadMore()">
      @for (item of items(); track item) {
        <t-list-item [content]="item" />
      }
    </t-list>
    <p class="demo-list-hint">当前 {{ items().length }} 条，点击「加载更多」追加 3 条。</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoListAsync {
  protected readonly items = signal(Array.from({ length: 5 }, (_, index) => `列表项 ${index + 1}`));
  protected readonly loading = signal<string | undefined>('load-more');

  protected handleLoadMore(): void {
    if (this.loading() === 'loading') {
      return;
    }
    this.loading.set('loading');
    setTimeout(() => {
      const start = this.items().length;
      this.items.update((list) => [...list, ...Array.from({ length: 3 }, (_, index) => `列表项 ${start + index + 1}`)]);
      this.loading.set('load-more');
    }, 600);
  }
}
