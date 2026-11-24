import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
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
 * 文档示例容器。布局对齐 TDesign 官网：标题与说明在卡片外，
 * 卡片内是演示区 + 右下角「复制 / 查看代码」图标按钮 + 可展开的源码。
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
          <a
            class="demo__anchor"
            [attr.href]="'#' + id()"
            tabindex="-1"
            aria-hidden="true"
          >#</a><span>{{ title() }}</span>
        </h3>
      }
      @if (description()) {
        <p class="demo__desc">{{ description() }}</p>
      }

      <div class="demo__card">
        <div class="demo__stage" [class.demo__stage--dark]="dark()">
          <ng-content />
        </div>

        @if (hasSource()) {
          <div class="demo__footer">
            <button
              type="button"
              class="demo__icon-btn"
              [class.demo__icon-btn--on]="copied()"
              [attr.aria-label]="copied() ? '已复制' : '复制代码'"
              [attr.title]="copied() ? '已复制' : '复制代码'"
              (click)="copy()"
            >
              @if (copied()) {
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="m3.5 8.5 3 3 6-6.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              } @else {
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <rect
                    x="5.5"
                    y="5.5"
                    width="8"
                    height="8"
                    rx="1.2"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                  />
                  <path
                    d="M10.5 3.5v-.3A1.2 1.2 0 0 0 9.3 2H3.7a1.2 1.2 0 0 0-1.2 1.2v5.6a1.2 1.2 0 0 0 1.2 1.2h.3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                  />
                </svg>
              }
            </button>

            <button
              type="button"
              class="demo__icon-btn"
              [class.demo__icon-btn--on]="showCode()"
              [attr.aria-label]="showCode() ? '收起代码' : '查看代码'"
              [attr.aria-expanded]="showCode()"
              [attr.title]="showCode() ? '收起代码' : '查看代码'"
              (click)="toggleCode()"
            >
              @if (showCode()) {
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="m6 4-4 4 4 4M10 4l4 4-4 4"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              } @else {
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    d="m5.5 4.5-4 3.5 4 3.5M10.5 4.5l4 3.5-4 3.5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
            </button>
          </div>
        }

        @if (showCode()) {
          <pre class="demo__code"><code class="hljs" [innerHTML]="highlighted()"></code></pre>
        }
      </div>
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
  protected readonly hasSource = computed(() => Boolean(DEMO_SOURCES[this.id()]));

  /** 未高亮的纯文本（转义后），高亮加载完成前先显示它。 */
  private readonly plain = computed(() => escapeHtml(DEMO_SOURCES[this.id()] ?? ''));
  private readonly highlightedCode = signal<string | null>(null);
  protected readonly highlighted = computed(() => this.highlightedCode() ?? this.plain());

  private copyTimer = 0;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.copyTimer));
  }

  protected async toggleCode(): Promise<void> {
    const next = !this.showCode();
    this.showCode.set(next);
    if (!next) return;

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
      clearTimeout(this.copyTimer);
      this.copyTimer = window.setTimeout(() => this.copied.set(false), 1600);
    } catch {
      // 剪贴板不可用（非 https 或未授权）时静默失败
    }
  }
}
