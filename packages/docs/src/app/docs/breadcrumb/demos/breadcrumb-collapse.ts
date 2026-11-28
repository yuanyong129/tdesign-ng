import { Component, signal } from '@angular/core';
import { TBreadcrumb, TBreadcrumbItem, TButton, type BreadcrumbOption } from '@tdesign-ng/components';

@Component({
  selector: 'demo-breadcrumb-collapse',
  imports: [TBreadcrumb, TBreadcrumbItem, TButton],
  template: `
    <div style="display:grid;gap:24px">
      <t-breadcrumb class="collapse-options" [options]="options()" [maxItems]="max()" [itemsBeforeCollapse]="before()" [itemsAfterCollapse]="after()"
        [separator]="separator()" [maxItemWidth]="width()" [ellipsis]="custom() ? ellipsisTemplate : undefined" />
      <ng-template #ellipsisTemplate let-items="items" let-separator="separator"><span class="custom-ellipsis">还有 {{ items.length }} 项 {{ separator }}</span></ng-template>
      @if (showProjected()) {
        <t-breadcrumb class="collapse-projected" [maxItems]="3" [itemsBeforeCollapse]="1" [itemsAfterCollapse]="1">
          <t-breadcrumb-item href="#project-home" (click)="$event.preventDefault()">首页</t-breadcrumb-item>
          @for (item of projected(); track item) {
            <t-breadcrumb-item [attr.data-key]="item" [disabled]="item === 2" (click)="projectClick($event)">
              <span class="project-label">{{ label() }} {{ item }}</span>
              <t-button size="small" variant="outline" type="button" class="project-counter" [disabled]="item === 2" (click)="increment($event)">计数 {{ count() }}</t-button>
            </t-breadcrumb-item>
          }
          <t-breadcrumb-item>当前页面</t-breadcrumb-item>
        </t-breadcrumb>
      }
      <t-breadcrumb class="collapse-mixed" [options]="mixed" [maxItems]="3" [itemsBeforeCollapse]="1" [itemsAfterCollapse]="1">
        <t-breadcrumb-item content="投影尾项" />
      </t-breadcrumb>
    </div>
    <p class="demo-hint">选项回调 {{ clicks() }} 次；投影宿主回调 {{ projectedClicks() }} 次。弹层关闭后保留原组件和计数。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <t-button size="small" (click)="max.set(max() ? undefined : 3)">切换折叠</t-button>
      <t-button size="small" (click)="custom.set(!custom())">自定义省略内容</t-button>
      <t-button size="small" (click)="separator.set(separator() === '/' ? '>' : '/')">切换分隔符</t-button>
      <t-button size="small" (click)="label.set(label() === '投影路径' ? '标题实时更新' : '投影路径')">更新投影文字</t-button>
      <t-button size="small" (click)="removeProjected()">删除末个投影项</t-button>
      <t-button size="small" (click)="showProjected.set(!showProjected())">销毁/恢复投影面包屑</t-button>
    </div>
  `,
})
export class DemoBreadcrumbCollapse {
  readonly max = signal<number | undefined>(3);
  readonly before = signal<number | undefined>(1);
  readonly after = signal<number | undefined>(1);
  readonly width = signal('100');
  readonly custom = signal(false);
  readonly separator = signal('/');
  readonly clicks = signal(0);
  readonly projectedClicks = signal(0);
  readonly count = signal(0);
  readonly label = signal('投影路径');
  readonly projected = signal([1, 2, 3]);
  readonly showProjected = signal(true);
  readonly options = signal<BreadcrumbOption[]>([
    { content: '首页', href: '#home', onClick: (e) => this.optionClick(e) },
    { content: '组件目录', href: '#components', target: '_blank', onClick: (e) => this.optionClick(e) },
    { content: '禁用路径', href: '#disabled', disabled: true, onClick: (e) => this.optionClick(e) },
    { content: '这是会被截断并显示完整提示的超长路径', href: '#long', onClick: (e) => this.optionClick(e) },
    { content: '当前页面' },
  ]);
  readonly mixed: BreadcrumbOption[] = [{ content: '数据首页' }, { content: '数据中间一' }, { content: '数据中间二' }];
  optionClick(e: MouseEvent): void { e.preventDefault(); this.clicks.update((n) => n + 1); }
  projectClick(e: MouseEvent): void { e.preventDefault(); this.projectedClicks.update((n) => n + 1); }
  increment(e: MouseEvent): void { e.preventDefault(); e.stopPropagation(); this.count.update((n) => n + 1); }
  removeProjected(): void { this.projected.update((items) => items.slice(0, -1)); }
}
