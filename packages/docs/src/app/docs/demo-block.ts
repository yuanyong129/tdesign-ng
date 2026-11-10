import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import demoSources from './demo-sources.generated.json';

/**
 * 示例源码表，由 scripts/gen-demo-sources.mjs 从 demos 目录里的组件模板生成。
 */
const DEMO_SOURCES = demoSources as Record<string, string>;

type Highlighter = {
  highlight: (code: string, options: { language: string }) => { value: string };
};

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * 代码高亮按需加载：只有用户第一次点「查看代码」时才把
 * highlight.js 与用到的语法一起拉下来，不进首屏包。
 */
async function loadHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= (async () => {
    const [core, xml, typescript] = await Promise.all([
      import('highlight.js/lib/core'),
      import('highlight.js/lib/languages/xml'),
      import('highlight.js/lib/languages/typescript'),
    ]);
    const hljs = core.default as unknown as Highlighter & {
      registerLanguage: (name: string, language: unknown) => void;
    };
    hljs.registerLanguage('html', xml.default);
    hljs.registerLanguage('typescript', typescript.default);
    return hljs;
  })();
  return highlighterPromise;
}

function escapeHtml(code: string): string {
  return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 文档示例容器：演示区 + 「查看代码」+ 代码高亮 + 复制。
 *
 * 用法：
 *   <docs-demo id="button-theme" title="按钮主题" description="…">
 *     <t-button theme="primary">主要</t-button>
 *   </docs-demo>
 *
 * 展示的源码来自 demos 目录里对应的示例组件，不需要另写一份。
 */
@Component({
  selector: 'docs-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="demo" [attr.id]="id()">
      @if (title()) {
        <h3 class="demo__title">
          <a class="demo__anchor" [attr.href]="'#' + id()" [attr.aria-label]="'链接到「' + title() + '」'">#</a>
          {{ title() }}
        </h3>
      }
      @if (description()) {
        <p class="demo__desc">{{ description() }}</p>
      }

      <div class="demo__stage" [class.demo__stage--dark]="dark()">
        <ng-content />
      </div>

      <div class="demo__toolbar">
        <button type="button" class="demo__action" (click)="toggleCode()">
          {{ showCode() ? '收起代码' : '查看代码' }}
        </button>
        @if (showCode()) {
          <button type="button" class="demo__action" (click)="copy()">{{ copied() ? '已复制' : '复制代码' }}</button>
        }
      </div>

      @if (showCode()) {
        <pre class="demo__code"><code class="hljs" [innerHTML]="highlighted()"></code></pre>
      }
    </section>
  `,
})
export class DemoBlock {
  readonly id = input.required<string>();
  readonly title = input<string>();
  readonly description = input<string>();
  /** 演示区用深色底（幽灵按钮这类示例需要）。 */
  readonly dark = input(false);

  protected readonly showCode = signal(false);
  protected readonly copied = signal(false);

  /** 未高亮的纯文本（转义后），高亮加载完成前先显示它。 */
  private readonly plain = computed(() => escapeHtml(DEMO_SOURCES[this.id()] ?? ''));
  private readonly highlightedCode = signal<string | null>(null);
  protected readonly highlighted = computed(() => this.highlightedCode() ?? this.plain());

  protected async toggleCode(): Promise<void> {
    const next = !this.showCode();
    this.showCode.set(next);
    if (!next) {
      this.copied.set(false);
      return;
    }

    const source = DEMO_SOURCES[this.id()];
    if (!source || this.highlightedCode()) return;

    try {
      const highlighter = await loadHighlighter();
      this.highlightedCode.set(highlighter.highlight(source, { language: 'html' }).value ?? '');
    } catch {
      // 高亮失败不影响阅读，保持纯文本
    }
  }

  protected async copy(): Promise<void> {
    const source = DEMO_SOURCES[this.id()];
    if (!source) return;
    try {
      await navigator.clipboard.writeText(source);
      this.copied.set(true);
    } catch {
      // 剪贴板不可用（非 https 或未授权）时静默失败
    }
  }
}
