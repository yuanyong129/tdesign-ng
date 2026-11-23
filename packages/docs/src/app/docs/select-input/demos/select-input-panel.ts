import { Component, computed, signal } from '@angular/core';
import { TSelectInputModule, TSpaceModule, TTagModule } from '@tdesign-ng/components';
import type { SelectInputInputChangeEvent, SelectInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-input-panel',
  imports: [TSelectInputModule, TSpaceModule, TTagModule],
  template: `
    <t-space direction="vertical" [size]="16" style="width: 360px">
      <t-select-input
        [value]="value()"
        [inputValue]="keyword()"
        [panel]="panelTpl"
        [allowInput]="true"
        [clearable]="true"
        placeholder="点击选择标签，可直接输入过滤"
        [popupVisible]="popupVisible()"
        (popupVisibleChange)="popupVisible.set($event)"
        (valueChange)="handleValueChange($event)"
        (inputChange)="handleInputChange($event)"
      />

      <ng-template #panelTpl>
        <div class="demo-select-input__panel">
          @for (option of filteredOptions(); track option) {
            <t-tag theme="primary" variant="light" (click)="select(option)">{{ option }}</t-tag>
          }
          @if (filteredOptions().length === 0) {
            <span class="demo-select-input__empty">无匹配项</span>
          }
        </div>
      </ng-template>

      <p class="demo-select-input__state">value：{{ valueText() }}；过滤器关键字：{{ keyword() || '（空）' }}</p>
    </t-space>
  `,
  styles: [
    `
      .demo-select-input__panel {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        box-sizing: border-box;
        width: 328px;
        padding: 12px;
      }

      .demo-select-input__empty {
        color: var(--td-text-color-placeholder);
        font-size: 13px;
      }

      .demo-select-input__state {
        margin: 0;
        color: var(--td-text-color-secondary);
        font-size: 13px;
      }
    `,
  ],
})
export class DemoSelectInputPanel {
  protected readonly options = ['广西壮族自治区', '广东省', '浙江省', '江苏省', '四川省'];

  protected readonly value = signal<SelectInputValue | undefined>('广东省');

  protected readonly popupVisible = signal(false);

  protected readonly keyword = signal('');

  protected readonly filteredOptions = computed(() => {
    const keyword = this.keyword();
    return keyword ? this.options.filter((option) => option.includes(keyword)) : this.options;
  });

  protected readonly valueText = computed(() => {
    const value = this.value();
    return value === undefined || value === null || value === '' ? '（空）' : String(value);
  });

  protected handleValueChange(value: SelectInputValue): void {
    this.value.set(value);
  }

  protected handleInputChange(event: SelectInputInputChangeEvent): void {
    this.keyword.set(event.value);
  }

  protected select(option: string): void {
    this.value.set(option);
    this.keyword.set('');
    this.popupVisible.set(false);
  }
}
