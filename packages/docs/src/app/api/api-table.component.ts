import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import apiData from './api.generated.json';

/** api.generated.json 的结构（由 scripts/gen-api-docs.mjs 生成）。 */
interface ApiInput {
  name: string;
  type: string;
  default?: string;
  required?: boolean;
  zh: string;
  en: string;
  values: string[];
  deprecated?: boolean;
  internal?: boolean;
}

interface ApiOutput {
  name: string;
  type: string;
  zh: string;
  en: string;
}

interface ApiComponent {
  className: string;
  selector: string;
  file: string;
  inputs: ApiInput[];
  outputs: ApiOutput[];
}

const COMPONENTS = (apiData as { components: Record<string, ApiComponent> }).components;

/**
 * 渲染组件 API 表格。
 *
 * 数据来自 scripts/gen-api-docs.mjs 解析组件源码的 TSDoc 生成，
 * 因此表格与源码永远一致 —— 新增输入属性只要写好注释，这里会自动出现。
 *
 * 用 `@internal` 标记的属性不会出现在表格里。
 */
@Component({
  selector: 'api-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (entry(); as component) {
      <div class="api-table__meta">
        <code>{{ component.selector }}</code>
        <span class="api-table__file">{{ component.file }}</span>
      </div>

      <table class="api-table">
        <caption>
          Props
        </caption>
        <thead>
          <tr>
            <th>属性</th>
            <th>类型</th>
            <th>默认值</th>
            <th>可选值</th>
            <th>说明</th>
          </tr>
        </thead>
        <tbody>
          @for (item of inputs(); track item.name) {
            <tr>
              <td>
                <code>{{ item.name }}</code>
                @if (item.required) {
                  <span class="api-table__required" title="必填">*</span>
                }
                @if (item.deprecated) {
                  <span class="api-table__deprecated">已废弃</span>
                }
              </td>
              <td><code class="api-table__type">{{ item.type }}</code></td>
              <td>
                @if (item.default && item.default !== 'undefined') {
                  <code class="api-table__type">{{ item.default }}</code>
                } @else {
                  <span class="api-table__empty">—</span>
                }
              </td>
              <td>
                @if (item.values.length) {
                  <span class="api-table__values">
                    @for (value of item.values; track value) {
                      <code>{{ value }}</code>
                    }
                  </span>
                } @else {
                  <span class="api-table__empty">—</span>
                }
              </td>
              <td>{{ text(item) }}</td>
            </tr>
          }
        </tbody>
      </table>

      @if (outputs().length) {
        <table class="api-table">
          <caption>
            Events
          </caption>
          <thead>
            <tr>
              <th>事件</th>
              <th>回调参数</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            @for (item of outputs(); track item.name) {
              <tr>
                <td><code>{{ item.name }}</code></td>
                <td><code class="api-table__type">{{ item.type }}</code></td>
                <td>{{ text(item) }}</td>
              </tr>
            }
          </tbody>
        </table>
      }
    } @else {
      <p class="api-table__empty">
        没有找到组件 <code>{{ component() }}</code> 的 API 数据，请检查 scripts/gen-api-docs.mjs 的解析结果。
      </p>
    }
  `,
  styles: [
    `
      .api-table__meta {
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 16px 0 8px;
        color: var(--td-text-color-secondary);
        font-size: 12px;
      }
      .api-table__meta code {
        color: var(--td-text-color-primary);
        font-size: 13px;
      }
      .api-table__file {
        opacity: 0.7;
      }
      .api-table {
        width: 100%;
        margin: 0 0 24px;
        border-collapse: collapse;
        font-size: 14px;
        border: 1px solid var(--td-component-border);
      }
      .api-table caption {
        text-align: left;
        font-weight: 600;
        padding: 0 0 8px;
        color: var(--td-text-color-primary);
      }
      .api-table th,
      .api-table td {
        padding: 10px 12px;
        text-align: left;
        vertical-align: top;
        border-bottom: 1px solid var(--td-component-border);
        color: var(--td-text-color-primary);
      }
      .api-table th {
        background: var(--td-bg-color-container-hover, #f3f3f3);
        font-weight: 500;
        color: var(--td-text-color-secondary);
        white-space: nowrap;
      }
      .api-table tr:last-child td {
        border-bottom: none;
      }
      .api-table code {
        font-family: var(--td-font-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace);
        background: var(--td-bg-color-container-hover, #f3f3f3);
        padding: 1px 5px;
        border-radius: 3px;
        font-size: 13px;
      }
      .api-table__type {
        background: none;
        padding: 0;
        font-size: 13px;
        word-break: break-word;
      }
      .api-table__values {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }
      .api-table__required {
        color: var(--td-error-color, #d54941);
        margin-left: 2px;
      }
      .api-table__deprecated {
        margin-left: 6px;
        font-size: 12px;
        color: var(--td-warning-color, #e37318);
        border: 1px solid currentColor;
        border-radius: 3px;
        padding: 0 4px;
      }
      .api-table__empty {
        color: var(--td-text-color-placeholder);
        margin: 8px 0;
      }
    `,
  ],
})
export class ApiTable {
  /** 组件类名，例如 `TButton`。 */
  readonly component = input.required<string>();

  /** 说明列的语言，默认中文。 */
  readonly locale = input<'zh' | 'en'>('zh');

  protected readonly entry = computed<ApiComponent | undefined>(() => COMPONENTS[this.component()]);

  protected readonly inputs = computed<ApiInput[]>(() => (this.entry()?.inputs ?? []).filter((i) => !i.internal));

  protected readonly outputs = computed<ApiOutput[]>(() => this.entry()?.outputs ?? []);

  protected text(item: ApiInput | ApiOutput): string {
    return (this.locale() === 'en' ? item.en : item.zh) || item.zh || item.en;
  }
}
