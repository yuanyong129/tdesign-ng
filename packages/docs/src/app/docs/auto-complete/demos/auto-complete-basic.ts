import { Component } from '@angular/core';
import { TAutoCompleteModule, TSpaceModule, type AutoCompleteOption } from '@tdesign-ng/components';

@Component({
  selector: 'demo-auto-complete-basic',
  imports: [TAutoCompleteModule, TSpaceModule],
  styles: [':host { display: block; max-width: 384px; }'],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-auto-complete
        [options]="options"
        [(value)]="value"
        placeholder="请输入关键词，例如 vue"
        [clearable]="true"
      />
    </t-space>
  `,
})
export class DemoAutoCompleteBasic {
  protected readonly options: AutoCompleteOption[] = [
    'vue',
    'vue-router',
    'vuex',
    'react',
    'react-dom',
    'angular',
    'rxjs',
    'typescript',
    'tdesign-vue-next',
  ];

  protected value = '';
}
