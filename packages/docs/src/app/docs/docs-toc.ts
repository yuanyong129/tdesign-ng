import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

interface TocItem {
  id: string;
  label: string;
}

/**
 * 页面右侧的「本页目录」。
 *
 * 页面本身不维护一份目录数据：演示标题（`.demo__title`）和章节标题
 * （`.docs-section__title`）就是唯一真源，组件在路由切换后从 DOM 里收集，
 * 因此新增/删除示例时目录会自动跟着变。
 *
 * 懒加载路由的组件在 NavigationEnd 之后才挂载，所以用 rAF 轮询等待
 * `.docs-page` 出现，最多等 3 秒；拿到内容后再接管滚动高亮。
 */
@Component({
  selector: 'docs-toc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (items().length) {
      <nav class="docs-toc" aria-label="本页目录">
        <ol class="docs-toc__list">
          @for (item of items(); track item.id) {
            <li>
              <a
                class="docs-toc__link"
                [class.docs-toc__link--active]="active() === item.id"
                [href]="'#' + item.id"
                (click)="jump($event, item.id)"
              >{{ item.label }}</a>
            </li>
          }
        </ol>
      </nav>
    }
  `,
  styles: `
    :host {
      flex: 0 0 240px;
      width: 240px;
      display: block;
    }

    .docs-toc {
      position: sticky;
      top: 64px;
      max-height: calc(100vh - 64px);
      padding: 56px 10px 48px 0;
      box-sizing: border-box;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
    }

    .docs-toc__list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .docs-toc__link {
      display: block;
      padding: 2px 0 2px 16px;
      border-left: 2px solid transparent;
      font-size: 12px;
      line-height: 20px;
      color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: color 0.2s, border-color 0.2s;
    }

    .docs-toc__link:hover {
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
    }

    .docs-toc__link--active {
      color: var(--td-brand-color, #0052d9);
      border-left-color: var(--td-brand-color, #0052d9);
      font-weight: 500;
    }

    @media (max-width: 1180px) {
      :host {
        display: none;
      }
    }
  `,
})
export class DocsToc {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<TocItem[]>([]);
  protected readonly active = signal<string | null>(null);

  private frame = 0;
  private scrollFrame = 0;
  private headings: HTMLElement[] = [];
  /** 已经处理过的 hash，避免 resize 重建目录时重复滚动。 */
  private handledHash: string | null = null;

  constructor() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.handledHash = null;
      this.scheduleRebuild();
    });

    afterNextRender(() => {
      this.scheduleRebuild();
      const onScroll = () => this.queueActiveUpdate();
      const onResize = () => this.scheduleRebuild();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onResize);
      this.destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(this.frame);
        cancelAnimationFrame(this.scrollFrame);
      });
    });
  }

  /**
   * 自己接管锚点跳转：Router 的 anchorScrolling 会贴到视口顶部，
   * 标题会被 64px 的 sticky 顶栏盖住；这里统一留出 88px。
   */
  protected jump(event: Event, id: string): void {
    const target = this.document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    this.handledHash = id;
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: window.scrollY + target.getBoundingClientRect().top - 88,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
    history.replaceState(null, '', `#${id}`);
  }

  /** 等懒加载页面挂载后再收集目录。 */
  private scheduleRebuild(): void {
    cancelAnimationFrame(this.frame);
    let attempts = 0;
    const tick = () => {
      const page = this.document.querySelector<HTMLElement>('.docs-page');
      const hasContent = page?.querySelector('.demo, .docs-section__title');
      if (page && hasContent) {
        this.rebuild(page);
        return;
      }
      if (++attempts < 180) {
        this.frame = requestAnimationFrame(tick);
      }
    };
    this.frame = requestAnimationFrame(tick);
  }

  private rebuild(page: HTMLElement): void {
    const collected: TocItem[] = [];
    const headings: HTMLElement[] = [];

    page.querySelectorAll<HTMLElement>('.demo, .docs-section__title').forEach((el) => {
      const id = el.id;
      if (!id) return;

      const label = el.classList.contains('docs-section__title')
        ? el.textContent
        : el.querySelector('.demo__title span')?.textContent;
      const text = label?.trim();
      if (!text) return;

      collected.push({ id, label: text });
      headings.push(el);
    });

    this.items.set(collected);
    this.headings = headings;
    this.active.set(collected[0]?.id ?? null);
    this.updateActive();
    this.applyHashOffset();
  }

  /** 深链（/#button-api）在懒加载页面挂载后补一次带偏移的滚动。 */
  private applyHashOffset(): void {
    const raw = window.location.hash.slice(1);
    if (!raw) return;
    const id = decodeURIComponent(raw);
    if (this.handledHash === id) return;
    if (!this.document.getElementById(id)) return;
    this.handledHash = id;
    // 让 Router 的 scrollPositionRestoration 先落位，再纠正偏移
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = this.document.getElementById(id);
        if (!target) return;
        window.scrollTo({
          top: window.scrollY + target.getBoundingClientRect().top - 88,
          behavior: 'auto',
        });
      });
    });
  }

  private queueActiveUpdate(): void {
    if (this.scrollFrame) return;
    this.scrollFrame = requestAnimationFrame(() => {
      this.scrollFrame = 0;
      this.updateActive();
    });
  }

  /** 以视口上方 88px 为「当前章节」的分界线。 */
  private updateActive(): void {
    if (!this.headings.length) return;
    const line = 88;
    let current = this.headings[0];

    for (const heading of this.headings) {
      if (heading.getBoundingClientRect().top <= line) {
        current = heading;
      } else {
        break;
      }
    }

    if (current.id && current.id !== this.active()) {
      this.active.set(current.id);
    }
  }
}
