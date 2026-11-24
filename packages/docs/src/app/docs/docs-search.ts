import { DOCUMENT } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { DOCS_NAV, DocsNavItem } from './nav';

/**
 * 顶部搜索的弹层。
 *
 * 数据源就是侧边栏的 DOCS_NAV，输入时按「名称 / 路由 / 分组」做子串匹配，
 * 方向键选择、回车跳转、Esc 关闭。组件按需挂载（父模板里的 @if），
 * 因此每次打开都是全新状态。
 */
@Component({
  selector: 'docs-search',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="docs-search__mask" (click)="close()">
      <div
        class="docs-search__panel"
        role="dialog"
        aria-modal="true"
        aria-label="搜索文档"
        (click)="$event.stopPropagation()"
      >
        <div class="docs-search__field">
          <svg class="docs-search__icon" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
            <path d="m10.5 10.5 3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          <input
            #input
            type="search"
            class="docs-search__input"
            placeholder="搜索组件，例如「按钮」「table」"
            autocomplete="off"
            spellcheck="false"
            [value]="query()"
            (input)="onInput($event)"
            (keydown)="onKeydown($event)"
          />
          <kbd class="docs-search__kbd">Esc</kbd>
        </div>

        @if (results().length) {
          <ul class="docs-search__list" role="listbox">
            @for (item of results(); track item.path; let index = $index) {
              <li>
                <button
                  type="button"
                  class="docs-search__item"
                  [class.docs-search__item--active]="index === activeIndex()"
                  role="option"
                  [attr.aria-selected]="index === activeIndex()"
                  (mouseenter)="activeIndex.set(index)"
                  (click)="go(item)"
                >
                  <span class="docs-search__label">{{ item.label }}</span>
                  <span class="docs-search__group">{{ item.group }}</span>
                </button>
              </li>
            }
          </ul>
        } @else {
          <p class="docs-search__empty">没有找到「{{ query() }}」相关的组件</p>
        }

        <div class="docs-search__footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> 选择</span>
          <span><kbd>↵</kbd> 打开</span>
          <span><kbd>Esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  `,
  styles: `
    .docs-search__mask {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 88px 16px 24px;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(2px);
      animation: docs-search-fade 0.15s ease-out;
    }

    .docs-search__panel {
      width: min(560px, 100%);
      max-height: min(640px, calc(100vh - 120px));
      display: flex;
      flex-direction: column;
      border: 1px solid var(--td-component-border, #e7e7e7);
      border-radius: 8px;
      background: var(--td-bg-color-container, #fff);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.22);
      overflow: hidden;
      animation: docs-search-rise 0.16s ease-out;
    }

    .docs-search__field {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--td-component-stroke, #e7e7e7);
    }

    .docs-search__icon {
      width: 18px;
      height: 18px;
      flex: none;
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-search__input {
      flex: 1;
      min-width: 0;
      border: 0;
      outline: none;
      background: transparent;
      font: 15px/24px var(--td-font-family, sans-serif);
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
    }

    .docs-search__input::-webkit-search-cancel-button {
      display: none;
    }

    .docs-search__input::placeholder {
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-search__kbd,
    .docs-search__footer kbd {
      padding: 1px 5px;
      border: 1px solid var(--td-component-border, #e7e7e7);
      border-radius: 4px;
      background: var(--td-bg-color-secondarycontainer, #f3f3f3);
      font: 11px/16px var(--td-font-family, sans-serif);
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-search__list {
      flex: 1;
      margin: 0;
      padding: 8px;
      list-style: none;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .docs-search__item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      width: 100%;
      padding: 9px 12px;
      border: 0;
      border-radius: 4px;
      background: transparent;
      font: 14px/22px var(--td-font-family, sans-serif);
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      text-align: left;
      cursor: pointer;
    }

    .docs-search__item--active {
      background: var(--td-brand-color-light, #f2f3ff);
      color: var(--td-brand-color, #0052d9);
    }

    .docs-search__label {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    .docs-search__group {
      flex: none;
      font-size: 12px;
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-search__empty {
      margin: 0;
      padding: 40px 24px;
      text-align: center;
      font-size: 14px;
      color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
    }

    .docs-search__footer {
      display: flex;
      gap: 16px;
      padding: 8px 16px;
      border-top: 1px solid var(--td-component-stroke, #e7e7e7);
      background: var(--td-bg-color-secondarycontainer, #fafafa);
      font-size: 12px;
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-search__footer span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    @keyframes docs-search-fade {
      from {
        opacity: 0;
      }
    }

    @keyframes docs-search-rise {
      from {
        transform: translateY(-6px);
        opacity: 0.6;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .docs-search__mask,
      .docs-search__panel {
        animation: none;
      }
    }
  `,
})
export class DocsSearch {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly inputRef = viewChild.required<ElementRef<HTMLInputElement>>('input');

  readonly closed = output<void>();

  protected readonly query = signal('');
  protected readonly activeIndex = signal(0);

  protected readonly results = computed<DocsNavItem[]>(() => {
    const query = this.query().trim().toLowerCase();
    if (!query) return DOCS_NAV.slice(0, 12);
    return DOCS_NAV.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.path.toLowerCase().includes(query) ||
        item.group.toLowerCase().includes(query),
    ).slice(0, 20);
  });

  constructor() {
    this.document.documentElement.classList.add('docs-modal-open');
    inject(DestroyRef).onDestroy(() => {
      this.document.documentElement.classList.remove('docs-modal-open');
    });

    afterNextRender(() => this.inputRef().nativeElement.focus());
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(0);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const results = this.results();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (results.length) {
          this.activeIndex.set((this.activeIndex() + 1) % results.length);
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (results.length) {
          this.activeIndex.set((this.activeIndex() - 1 + results.length) % results.length);
        }
        break;
      case 'Enter': {
        event.preventDefault();
        const item = results[this.activeIndex()];
        if (item) this.go(item);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        break;
    }
  }

  protected go(item: DocsNavItem): void {
    void this.router.navigateByUrl(item.path);
    this.close();
  }

  protected close(): void {
    this.closed.emit();
  }
}
