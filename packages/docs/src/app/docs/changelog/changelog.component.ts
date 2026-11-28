import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'changelog-docs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="docs-page docs-changelog">
      <h1 class="docs-page__title">更新日志</h1>
      <p class="docs-page__lead">记录 TDesign Angular 的版本变更、修复和升级说明。</p>
      <pre class="docs-changelog__content">正在加载更新日志…</pre>
    </article>
  `,
  styles: `
    .docs-changelog__content {
      margin: 24px 0 48px;
      padding: 24px;
      overflow-x: auto;
      color: var(--td-text-color-primary);
      background: var(--td-bg-color-container);
      border: 1px solid var(--td-border-level-1-color);
      border-radius: 8px;
      font: 14px/1.8 var(--td-font-family);
      white-space: pre-wrap;
    }
  `,
})
export class ChangelogDocs {
  constructor() {
    fetch('changelog.md')
      .then((response) => response.text())
      .then((content) => {
        const element = document.querySelector('.docs-changelog__content');
        if (element) element.textContent = content;
      });
  }
}
