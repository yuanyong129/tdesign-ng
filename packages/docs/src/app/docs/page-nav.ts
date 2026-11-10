import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DOCS_NAV } from './nav';

/**
 * 页面底部的上一页 / 下一页导航，顺序取自 DOCS_NAV。
 */
@Component({
  selector: 'docs-page-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="page-nav">
      @if (prev(); as item) {
        <a class="page-nav__link page-nav__link--prev" [routerLink]="item.path">
          <span class="page-nav__label">上一页</span>
          <span class="page-nav__title">{{ item.label }}</span>
        </a>
      }
      @if (next(); as item) {
        <a class="page-nav__link page-nav__link--next" [routerLink]="item.path">
          <span class="page-nav__label">下一页</span>
          <span class="page-nav__title">{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
})
export class PageNav {
  /** 当前页面的路由路径，例如 `/button`。 */
  readonly current = input.required<string>();

  private readonly index = computed(() => DOCS_NAV.findIndex((item) => item.path === this.current()));

  protected readonly prev = computed(() => {
    const index = this.index();
    return index > 0 ? DOCS_NAV[index - 1] : null;
  });

  protected readonly next = computed(() => {
    const index = this.index();
    const item = DOCS_NAV[index + 1];
    return index >= 0 && item ? item : null;
  });
}
