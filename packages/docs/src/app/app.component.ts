import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { DocsSearch } from './docs/docs-search';
import { DocsToc } from './docs/docs-toc';
import { DOCS_NAV, groupNav } from './docs/nav';

type Theme = 'light' | 'dark';

const THEME_KEY = 'tdesign-docs-theme';

/** 首屏内联脚本已经设过一次，这里只负责把 signal 的初值对齐。 */
function readInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // 隐私模式下 localStorage 可能不可用
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function isMacPlatform(): boolean {
  return /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DocsToc, DocsSearch],
  template: `
    <a class="docs-skip" href="#docs-main">跳到正文</a>

    <header class="docs-header">
      <button
        type="button"
        class="docs-header__toggle"
        aria-label="打开组件导航"
        (click)="navOpen.set(true)"
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M2 4h12M2 8h12M2 12h12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
      </button>

      <a class="docs-brand" routerLink="/button" aria-label="TDesign Angular 首页">
        <svg class="docs-brand__mark" viewBox="0 0 26 30" aria-hidden="true">
          <path d="M0 3a3 3 0 0 1 3-3h9.5v9.5H3A3 3 0 0 1 0 6.5Z" fill="#0052D9" />
          <path d="M12.5 0H23a3 3 0 0 1 3 3v6.5H12.5Z" fill="#00D95A" />
          <path d="M7.5 9.5h7V26a3.5 3.5 0 0 1-7 0Z" fill="#0052D9" />
          <path d="M7.5 9.5h7v6l-7 5Z" fill="#2F7CF6" />
        </svg>
        <span class="docs-brand__name">TDesign</span>
        <span class="docs-brand__sub">Angular</span>
        <span class="docs-brand__badge">pre-alpha</span>
      </a>

      <button type="button" class="docs-search-trigger" aria-label="搜索文档" (click)="searchOpen.set(true)">
        <svg class="docs-search-trigger__icon" viewBox="0 0 16 16" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" stroke-width="1.5" />
          <path d="m10.5 10.5 3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span class="docs-search-trigger__text">搜索文档</span>
        <kbd class="docs-search-trigger__kbd">{{ shortcut }}</kbd>
      </button>

      <nav class="docs-nav" aria-label="主导航">
        <a class="docs-nav__link docs-nav__link--active" routerLink="/button">组件</a>
        <a
          class="docs-nav__link"
          href="https://tdesign.tencent.com/design/"
          target="_blank"
          rel="noreferrer"
        >设计规范</a>
        <a
          class="docs-nav__link"
          href="https://github.com/yuanyong129/tdesign-ng/releases"
          target="_blank"
          rel="noreferrer"
        >更新日志</a>
        <a
          class="docs-nav__link"
          href="https://github.com/yuanyong129/tdesign-ng"
          target="_blank"
          rel="noreferrer"
        >关于</a>
      </nav>

      <div class="docs-header__actions">
        <div class="docs-theme" role="group" aria-label="主题模式">
          <button
            type="button"
            class="docs-theme__btn"
            [class.docs-theme__btn--active]="theme() === 'light'"
            aria-label="浅色模式"
            title="浅色模式"
            (click)="setTheme('light')"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="8" cy="8" r="3.1" fill="currentColor" />
              <path
                d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.05 3.05l1.13 1.13M11.82 11.82l1.13 1.13M12.95 3.05l-1.13 1.13M4.18 11.82l-1.13 1.13"
                fill="none"
                stroke="currentColor"
                stroke-width="1.3"
                stroke-linecap="round"
              />
            </svg>
          </button>
          <button
            type="button"
            class="docs-theme__btn"
            [class.docs-theme__btn--active]="theme() === 'dark'"
            aria-label="深色模式"
            title="深色模式"
            (click)="setTheme('dark')"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M13.6 9.6A6 6 0 0 1 6.4 2.4a6 6 0 1 0 7.2 7.2Z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <a
          class="docs-icon-link"
          href="https://github.com/yuanyong129/tdesign-ng"
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub 仓库"
          title="GitHub"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.4 4.7 18.4 5 18.4 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
    </header>

    <div class="docs-body">
      @if (navOpen()) {
        <div class="docs-nav-mask" (click)="navOpen.set(false)"></div>
      }

      <aside class="docs-side" [class.docs-side--open]="navOpen()" aria-label="组件导航">
        <nav class="docs-side__inner">
          @for (group of menu; track group.title) {
            <div class="docs-side__group">
              <div class="docs-side__title">{{ group.title }}</div>
              @for (item of group.items; track item.path) {
                <a
                  class="docs-side__link"
                  [routerLink]="item.path"
                  routerLinkActive="docs-side__link--active"
                  (click)="navOpen.set(false)"
                >{{ item.label }}</a>
              }
            </div>
          }
        </nav>
      </aside>

      <div class="docs-content">
        <div class="docs-layout">
          <main class="docs-main" id="docs-main">
            <router-outlet />
          </main>
          <docs-toc />
        </div>

        <footer class="docs-footer">
          <div class="docs-footer__top">
            <div class="docs-footer__intro">
              <a class="docs-footer__brand" routerLink="/button">
                <svg viewBox="0 0 26 30" aria-hidden="true">
                  <path d="M0 3a3 3 0 0 1 3-3h9.5v9.5H3A3 3 0 0 1 0 6.5Z" fill="#0052D9" />
                  <path d="M12.5 0H23a3 3 0 0 1 3 3v6.5H12.5Z" fill="#00D95A" />
                  <path d="M7.5 9.5h7V26a3.5 3.5 0 0 1-7 0Z" fill="#0052D9" />
                </svg>
                <span>TDesign <em>Angular</em></span>
              </a>
              <p class="docs-footer__tagline">
                按 TDesign 设计规范实现的 Angular 组件库。组件样式直接来自 tdesign-common，
                与上游共用同一套设计令牌，文档站的布局与交互尽量与官网保持一致。
              </p>
            </div>

            <div class="docs-footer__cols">
              <div class="docs-footer__col">
                <h4>资源</h4>
                <a href="https://tdesign.tencent.com/design/" target="_blank" rel="noreferrer">设计规范</a>
                <a href="https://tdesign.tencent.com/" target="_blank" rel="noreferrer">TDesign 官网</a>
                <a href="https://github.com/yuanyong129/tdesign-ng" target="_blank" rel="noreferrer">GitHub 仓库</a>
              </div>
              <div class="docs-footer__col">
                <h4>生态</h4>
                <a href="https://angular.dev/" target="_blank" rel="noreferrer">Angular</a>
                <a href="https://tdesign.tencent.com/vue-next/overview" target="_blank" rel="noreferrer">TDesign Vue Next</a>
                <a href="https://tdesign.tencent.com/react/overview" target="_blank" rel="noreferrer">TDesign React</a>
              </div>
              <div class="docs-footer__col">
                <h4>关于</h4>
                <a href="https://github.com/yuanyong129/tdesign-ng/issues" target="_blank" rel="noreferrer">问题反馈</a>
                <a href="https://github.com/yuanyong129/tdesign-ng/blob/main/LICENSE" target="_blank" rel="noreferrer">MIT License</a>
                <a routerLink="/button">组件总览</a>
              </div>
            </div>
          </div>

          <div class="docs-footer__bottom">
            <span>© 2026 TDesign Angular</span>
            <span class="docs-footer__sep">·</span>
            <span>基于 TDesign 设计规范构建</span>
            <span class="docs-footer__spacer"></span>
            <span class="docs-footer__badge">pre-alpha</span>
          </div>
        </footer>
      </div>
    </div>

    @if (searchOpen()) {
      <docs-search (closed)="searchOpen.set(false)" />
    }
  `,
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: var(--td-bg-color-container, #fff);
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
    }

    .docs-skip {
      position: fixed;
      top: -48px;
      left: 16px;
      z-index: 2000;
      padding: 8px 16px;
      border-radius: 0 0 6px 6px;
      background: var(--td-brand-color, #0052d9);
      color: #fff;
      font-size: 14px;
      text-decoration: none;
      transition: top 0.15s;
    }

    .docs-skip:focus {
      top: 0;
    }

    // ---------------------------------------------------------------- header
    .docs-header {
      position: sticky;
      top: 0;
      z-index: 60;
      display: flex;
      align-items: center;
      gap: 16px;
      height: 64px;
      padding: 0 24px;
      box-sizing: border-box;
      background: var(--td-bg-color-container, #fff);
      border-bottom: 1px solid var(--td-component-stroke, #e7e7e7);
    }

    .docs-header__toggle {
      display: none;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      cursor: pointer;
    }

    .docs-header__toggle:hover {
      background: var(--td-bg-color-container-hover, #f3f3f3);
    }

    .docs-header__toggle svg {
      width: 18px;
      height: 18px;
    }

    .docs-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      text-decoration: none;
    }

    .docs-brand__mark {
      width: 21px;
      height: 24px;
      flex: none;
    }

    .docs-brand__name {
      font-size: 20px;
      line-height: 28px;
      font-weight: 700;
      letter-spacing: -0.4px;
    }

    .docs-brand__sub {
      font-size: 14px;
      line-height: 22px;
      font-weight: 500;
      color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
    }

    .docs-brand__badge {
      padding: 0 6px;
      border-radius: 9px;
      background: var(--td-brand-color-light, #f2f3ff);
      color: var(--td-brand-color, #0052d9);
      font-size: 10px;
      line-height: 18px;
      font-weight: 500;
      letter-spacing: 0.2px;
    }

    .docs-search-trigger {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
      width: 200px;
      height: 32px;
      margin-inline: auto;
      padding: 0 10px;
      border: 1px solid var(--td-component-border, #e7e7e7);
      border-radius: 4px;
      background: transparent;
      color: var(--td-text-color-placeholder, #a6a6a6);
      font-size: 13px;
      text-align: left;
      cursor: pointer;
      transition: border-color 0.2s, color 0.2s;
    }

    .docs-search-trigger:hover {
      border-color: var(--td-brand-color, #0052d9);
      color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
    }

    .docs-search-trigger__icon {
      width: 15px;
      height: 15px;
      flex: none;
    }

    .docs-search-trigger__text {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
    }

    .docs-search-trigger__kbd {
      flex: none;
      padding: 0 4px;
      border: 1px solid var(--td-component-border, #e7e7e7);
      border-radius: 3px;
      font: 10px/16px var(--td-font-family, sans-serif);
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-nav {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-left: auto;
    }

    .docs-nav__link {
      padding: 5px 12px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 22px;
      color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
      text-decoration: none;
      white-space: nowrap;
      transition: color 0.2s, background-color 0.2s;
    }

    .docs-nav__link:hover {
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
    }

    .docs-nav__link--active {
      background: var(--td-bg-color-container-hover, #f3f3f3);
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      font-weight: 500;
    }

    .docs-header__actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
    }

    .docs-theme {
      display: flex;
      align-items: center;
      gap: 2px;
      height: 28px;
      padding: 2px;
      border-radius: 6px;
      background: var(--td-bg-color-secondarycontainer, #f3f3f3);
      box-sizing: border-box;
    }

    .docs-theme__btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      padding: 0;
      border: 0;
      border-radius: 4px;
      background: transparent;
      color: var(--td-text-color-placeholder, #a6a6a6);
      cursor: pointer;
    }

    .docs-theme__btn svg {
      width: 14px;
      height: 14px;
    }

    .docs-theme__btn:hover {
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
    }

    .docs-theme__btn--active {
      background: var(--td-bg-color-container, #fff);
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
    }

    .docs-icon-link {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 4px;
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      transition: background-color 0.2s;
    }

    .docs-icon-link:hover {
      background: var(--td-bg-color-container-hover, #f3f3f3);
    }

    .docs-icon-link svg {
      width: 20px;
      height: 20px;
    }

    // ------------------------------------------------------------------ body
    .docs-body {
      display: flex;
      align-items: flex-start;
    }

    .docs-side {
      position: sticky;
      top: 64px;
      flex: 0 0 260px;
      width: 260px;
      height: calc(100vh - 64px);
      padding: 16px 0 48px;
      box-sizing: border-box;
      overflow-y: auto;
      overscroll-behavior: contain;
      scrollbar-width: thin;
      background: var(--td-bg-color-container, #fff);
      border-right: 1px solid var(--td-component-stroke, #e7e7e7);
    }

    .docs-side__title {
      padding: 16px 36px 6px;
      font-size: 12px;
      line-height: 20px;
      font-weight: 500;
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-side__link {
      display: block;
      height: 44px;
      margin: 0 16px;
      padding: 0 20px;
      border-radius: 3px;
      box-sizing: border-box;
      font-size: 14px;
      line-height: 44px;
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: background-color 0.15s, color 0.15s;
    }

    .docs-side__link:hover {
      background: var(--td-bg-color-container-hover, #f3f3f3);
    }

    .docs-side__link--active {
      background: var(--td-brand-color, #0052d9);
      color: #fff;
    }

    .docs-side__link--active:hover {
      background: var(--td-brand-color-active, #003cab);
      color: #fff;
    }

    .docs-nav-mask {
      display: none;
    }

    // --------------------------------------------------------------- content
    .docs-content {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .docs-layout {
      display: flex;
      align-items: flex-start;
      gap: 24px;
      padding: 0 24px 0 48px;
    }

    .docs-main {
      flex: 1 1 auto;
      min-width: 0;
      max-width: 780px;
    }

    // ---------------------------------------------------------------- footer
    .docs-footer {
      margin-top: 96px;
      padding: 56px 48px 24px;
      background: var(--td-bg-color-secondarycontainer, #f5f5f5);
      border-top: 1px solid var(--td-component-stroke, #e7e7e7);
    }

    .docs-footer__top {
      display: flex;
      gap: 48px;
    }

    .docs-footer__intro {
      flex: 1 1 300px;
      max-width: 380px;
    }

    .docs-footer__brand {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
      font-size: 22px;
      line-height: 30px;
      font-weight: 700;
      letter-spacing: -0.4px;
      text-decoration: none;
    }

    .docs-footer__brand svg {
      width: 18px;
      height: 21px;
    }

    .docs-footer__brand em {
      font-style: normal;
      font-size: 16px;
      font-weight: 500;
      color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
    }

    .docs-footer__tagline {
      margin: 16px 0 0;
      font-size: 13px;
      line-height: 22px;
      color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
    }

    .docs-footer__cols {
      flex: 1 1 auto;
      display: grid;
      grid-template-columns: repeat(3, minmax(120px, 1fr));
      gap: 32px;
      max-width: 560px;
      margin-left: auto;
    }

    .docs-footer__col h4 {
      margin: 0 0 14px;
      font-size: 14px;
      line-height: 22px;
      font-weight: 700;
      color: var(--td-text-color-primary, rgba(0, 0, 0, 0.9));
    }

    .docs-footer__col a {
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
      line-height: 22px;
      color: var(--td-text-color-secondary, rgba(0, 0, 0, 0.6));
      text-decoration: none;
      transition: color 0.2s;
    }

    .docs-footer__col a:hover {
      color: var(--td-brand-color, #0052d9);
    }

    .docs-footer__bottom {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid var(--td-component-stroke, #e7e7e7);
      font-size: 12px;
      line-height: 20px;
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-footer__sep {
      color: var(--td-component-stroke, #e7e7e7);
    }

    .docs-footer__spacer {
      flex: 1;
    }

    .docs-footer__badge {
      padding: 0 6px;
      border-radius: 9px;
      background: var(--td-bg-color-container-hover, #ebebeb);
      font-size: 10px;
      line-height: 18px;
    }

    // ------------------------------------------------------------ 响应式
    @media (max-width: 1180px) {
      .docs-search-trigger {
        width: 180px;
      }

      .docs-layout {
        padding: 0 32px;
      }
    }

    @media (max-width: 1080px) {
      .docs-header__toggle {
        display: flex;
      }

      .docs-side {
        position: fixed;
        top: 64px;
        bottom: 0;
        left: 0;
        z-index: 55;
        height: auto;
        transform: translateX(-100%);
        transition: transform 0.2s ease;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16);
      }

      .docs-side--open {
        transform: none;
      }

      .docs-nav-mask {
        display: block;
        position: fixed;
        inset: 64px 0 0;
        z-index: 50;
        background: rgba(0, 0, 0, 0.45);
      }
    }

    @media (max-width: 960px) {
      .docs-nav {
        display: none;
      }

      .docs-search-trigger {
        margin-left: auto;
      }

      .docs-layout {
        padding: 0 24px;
      }

      .docs-footer {
        padding: 40px 24px 20px;
      }

      .docs-footer__top {
        flex-direction: column;
        gap: 32px;
      }

      .docs-footer__intro {
        max-width: none;
      }

      .docs-footer__cols {
        max-width: none;
        margin-left: 0;
      }
    }

    @media (max-width: 720px) {
      .docs-header {
        gap: 8px;
        padding: 0 12px;
      }

      .docs-brand__sub,
      .docs-brand__badge {
        display: none;
      }

      .docs-brand__name {
        font-size: 18px;
      }

      .docs-search-trigger {
        width: auto;
        margin-left: auto;
        border-color: transparent;
        padding: 0 6px;
      }

      .docs-search-trigger__text,
      .docs-search-trigger__kbd {
        display: none;
      }

      .docs-layout {
        padding: 0 16px;
      }

      .docs-footer__cols {
        grid-template-columns: repeat(2, minmax(120px, 1fr));
      }

      .docs-footer__bottom {
        flex-wrap: wrap;
      }
    }
  `,
})
export class AppComponent {
  private readonly document = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly menu = groupNav();
  protected readonly shortcut = isMacPlatform() ? '⌘ K' : 'Ctrl K';

  protected readonly theme = signal<Theme>(readInitialTheme());
  protected readonly navOpen = signal(false);
  protected readonly searchOpen = signal(false);

  constructor() {
    effect(() => {
      const theme = this.theme();
      const root = this.document.documentElement;
      root.setAttribute('theme-mode', theme);
      root.classList.toggle('dark', theme === 'dark');

      try {
        localStorage.setItem(THEME_KEY, theme);
      } catch {
        // 忽略隐私模式下的写入失败
      }
    });

    effect(() => {
      this.document.body.classList.toggle('docs-nav-open', this.navOpen());
    });

    const onKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        this.searchOpen.set(true);
      } else if (event.key === 'Escape') {
        this.navOpen.set(false);
      }
    };

    this.document.addEventListener('keydown', onKeydown);
    this.destroyRef.onDestroy(() => this.document.removeEventListener('keydown', onKeydown));

    // 路由切换后同步浏览器标签页标题，便于多标签浏览与历史记录识别
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        const path = this.router.url.split('?')[0].split('#')[0];
        const item = DOCS_NAV.find((entry) => entry.path === path);
        this.document.title = item
          ? `${item.label} · TDesign Angular`
          : 'TDesign Angular · 面向 Angular 的 TDesign 组件库';
      });
  }

  protected setTheme(theme: Theme): void {
    this.theme.set(theme);
  }
}
