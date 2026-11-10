import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface MenuItem {
  path: string;
  label: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="docs-container">
      <aside class="docs-side">
        @for (group of menu; track group.title) {
          <div class="docs-group">{{ group.title }}</div>
          @for (item of group.items; track item.path) {
            <a class="docs-link" [routerLink]="item.path" routerLinkActive="docs-link--active">{{ item.label }}</a>
          }
        }
      </aside>
      <main class="docs-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .docs-container {
      display: flex;
      min-height: 100vh;
      background: var(--td-bg-color-page, #f3f3f3);
    }

    .docs-side {
      width: 220px;
      flex: 0 0 220px;
      padding: 24px 12px;
      background: var(--td-bg-color-container, #fff);
      border-right: 1px solid var(--td-component-border, #e7e7e7);
      box-sizing: border-box;
    }

    .docs-group {
      padding: 16px 12px 8px;
      font-size: 12px;
      color: var(--td-text-color-placeholder, #a6a6a6);
    }

    .docs-link {
      display: block;
      padding: 8px 12px;
      border-radius: 3px;
      font-size: 14px;
      color: var(--td-text-color-primary, #000000e6);
      text-decoration: none;
      cursor: pointer;
    }

    .docs-link:hover {
      background-color: var(--td-bg-color-container-hover, #f3f3f3);
    }

    .docs-link--active {
      color: var(--td-brand-color, #0052d9);
      background-color: var(--td-brand-color-light, #f2f3ff);
    }

    .docs-main {
      flex: 1;
      min-width: 0;
      padding: 24px 32px 64px;
    }
  `,
})
export class AppComponent {
  protected readonly menu: MenuGroup[] = [
    {
      title: '通用',
      items: [
        { path: '/button', label: '按钮 Button' },
        { path: '/link', label: '链接 Link' },
      ],
    },
    {
      title: '布局',
      items: [
        { path: '/divider', label: '分割线 Divider' },
        { path: '/space', label: '间距 Space' },
      ],
    },
  ];
}
