import { Component, computed, viewChild, type TemplateRef } from '@angular/core';
import { TAutoCompleteModule, TSpaceModule, type AutoCompleteOption } from '@tdesign-ng/components';

interface FrameworkItem {
  text: string;
  desc: string;
}

const FRAMEWORKS: FrameworkItem[] = [
  { text: 'vue', desc: '渐进式框架' },
  { text: 'react', desc: '用于构建用户界面的库' },
  { text: 'angular', desc: '一站式前端框架' },
  { text: 'svelte', desc: '编译期框架' },
  { text: 'solid', desc: '细粒度响应式框架' },
];

@Component({
  selector: 'demo-auto-complete-custom-option',
  imports: [TAutoCompleteModule, TSpaceModule],
  styles: [
    ':host { display: block; max-width: 384px; }',
    '.demo-option { display: flex; gap: 12px; align-items: center; justify-content: space-between; width: 100%; }',
    '.demo-option__desc { color: var(--td-text-color-placeholder); font-size: 12px; }',
  ],
  template: `
    <t-auto-complete
      [options]="options()"
      [(value)]="value"
      placeholder="输入关键词，选项内容来自模板"
    />
    <!-- 选项模板：text 用于过滤与选中，模板只负责展示 -->
    <ng-template #optionLabel let-option>
      <div class="demo-option">
        <span>{{ option.text }}</span>
        <span class="demo-option__desc">{{ option.raw.desc }}</span>
      </div>
    </ng-template>
  `,
})
export class DemoAutoCompleteCustomOption {
  /** 自定义选项内容：label 传模板，模板里通过 option 拿到归一化后的选项。 */
  private readonly optionLabel = viewChild<TemplateRef<unknown>>('optionLabel');

  protected value = '';

  protected readonly options = computed<AutoCompleteOption[]>(() => {
    const label = this.optionLabel();
    if (!label) return [];
    return FRAMEWORKS.map((item) => ({ text: item.text, desc: item.desc, label }));
  });
}
