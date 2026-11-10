import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { groupNav } from './docs/nav';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="docs-header">
      <a class="docs-brand" routerLink="/button">
        <span class="docs-brand__mark">T</span>
        <span class="docs-brand__name">TDesign Angular</span>
        <span class="docs-brand__badge">pre-alpha</span>
      </a>

      <nav class="docs-header__nav">
        <a href="https://tdesign.tencent.com/" target="_blank" rel="noreferrer">设计规范</a>
        <a href="https://github.com/yuanyong129/tdesign-ng" target="_blank" rel="noreferrer">GitHub</a>
      </nav>
    </header>

    <div class="docs-body">
      <aside class="docs-side">
        @for (group of menu; track group.title) {
          <div class="docs-side__group">
            <div class="docs-side__title">{{ group.title }}</div>
            @for (item of group.items; track item.path) {
              <a
                class="docs-side__link"
                [routerLink]="item.path"
                routerLinkActive="docs-side__link--active"
              >{{ item.label }}</a>
            }
          </div>
        }
      </aside>

      <main class="docs-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    :host {
      display: block;
      background: var(--td-bg-color-page, #f3f3f3);
      min-height: 100vh;
    }

    .docs-header {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 16px;
      height: 64px;
      padding: 0 24px;
      background: var(--td-bg-color-container, #fff);
      border-bottom: 1px solid var(--td-component-border, #e7e7e7);
      box-sizing: border-box;
    }

    .docs-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--td-text-color-primary, #000000e6);
    }

    .docs-brand__mark {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      background: var(--td-brand-color, #0052d9);
      color: #fff;
      font: 600 15px/1 var(--td-font-family-medium, sans-serif);
    }

    .docs-brand__name {
      font: var(--td-font-title-medium, 600 16px/24px sans-serif);
    }

    .docs-brand__badge {
      padding: 1px 6px;
      border-radius: var(--td-radius-round, 999px);
      background: var(--td-brand-color-light, #f2f3ff);
      color: var(--td-brand-color, #0052d9);
      font: var(--td-font-body-small, 12px/20px sans-serif);
    }

    .docs-header__nav {
      display: flex;
      gap: 20px;
      margin-left: auto;
    }

    .docs-header__nav a {
      color: var(--td-text-color-secondary, #00000099);
      font: var(--td-font-body-small, 14px/22px sans-serif);
      text-decoration: none;
    }

    .docs-header__nav a:hover {
      color: var(--td-brand-color, #0052d9);
    }

    .docs-body {
      display: flex;
      align-items: flex-start;
    }

    .docs-side {
      position: sticky;
      top: 64px;
      flex: 0 0 220px;
      width: 220px;
      height: calc(100vh - 64px);
      padding: 16px 12px 48px;
      background: var(--td-bg-color-container, #fff);
      border-right: 1px solid var(--td-component-border, #e7e7e7);
      box-sizing: border-box;
      overflow-y: auto;
    }

    .docs-side__title {
      padding: 16px 12px 6px;
      font: var(--td-font-body-small, 12px/20px sans-serif);
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-side__link {
      display: block;
      padding: 7px 12px;
      border-radius: var(--td-radius-default, 3px);
      font: var(--td-font-body-medium, 14px/22px sans-serif);
      color: var(--td-text-color-primary, #000000e6);
      text-decoration: none;
    }

    .docs-side__link:hover {
      background: var(--td-bg-color-container-hover, #f3f3f3);
    }

    .docs-side__link--active {
      color: var(--td-brand-color, #0052d9);
      background: var(--td-brand-color-light, #f2f3ff);
      font-weight: 500;
    }

    .docs-main {
      flex: 1;
      min-width: 0;
      padding: 32px 48px 96px;
      box-sizing: border-box;
    }

    /* 窄屏：侧边栏改成横向滚动的一条，避免挤压正文 */
    @media (max-width: 960px) {
      .docs-header {
        padding: 0 16px;
      }

      .docs-brand__name {
        display: none;
      }

      .docs-body {
        flex-direction: column;
      }

      .docs-side {
        position: static;
        flex: none;
        width: 100%;
        height: auto;
        display: flex;
        gap: 4px;
        padding: 8px 12px;
        border-right: 0;
        border-bottom: 1px solid var(--td-component-border, #e7e7e7);
        overflow-x: auto;
      }

      .docs-side__group {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .docs-side__title {
        display: none;
      }

      .docs-side__link {
        white-space: nowrap;
      }

      .docs-main {
        padding: 24px 16px 64px;
      }
    }
  `,
})
export class AppComponent {
  protected readonly menu = groupNav();
}
