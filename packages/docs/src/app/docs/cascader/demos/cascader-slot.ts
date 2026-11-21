import { Component, signal } from '@angular/core';
import {
  TCascader,
  TCascaderPanelBottom,
  TCascaderPanelTop,
  TCascaderValueDisplay,
  TTag,
} from '@tdesign-ng/components';
import type { CascaderOption, CascaderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-cascader-slot',
  imports: [TCascader, TTag, TCascaderPanelTop, TCascaderPanelBottom, TCascaderValueDisplay],
  template: `
    <div class="demo-cascader-row" style="max-width: 420px">
      <t-cascader
        [options]="options"
        [value]="value()"
        [multiple]="true"
        [clearable]="true"
        placeholder="请选择省份"
        (change)="value.set($event.value)"
      >
        <ng-template tCascaderPanelTop>
          <div class="demo-cascader-panel-tip" style="padding: 8px 12px; border-bottom: 1px solid #e7e7e7">
            面板顶部：常用的两个省份
          </div>
        </ng-template>

        <ng-template tCascaderPanelBottom>
          <div class="demo-cascader-panel-tip" style="padding: 8px 12px; border-top: 1px solid #e7e7e7">
            面板底部：共 {{ options.length }} 个省份，{{ count() }} 个已选
          </div>
        </ng-template>

        <ng-template
          tCascaderValueDisplay
          let-value
          let-selected="selectedOptions"
          let-onClose="onClose"
        >
          @for (option of selected; track option['value']; let index = $index) {
            <t-tag theme="primary" variant="light" [closable]="true" (close)="onClose(index)">
              {{ option['label'] }}
            </t-tag>
          }
        </ng-template>
      </t-cascader>
      <p class="demo-hint">值：{{ value() }}；自定义回显里点标签上的 × 会通过上下文的 onClose(index) 删除。</p>
    </div>
  `,
})
export class DemoCascaderSlot {
  protected readonly value = signal<CascaderValue | undefined>([]);

  protected readonly options: CascaderOption[] = [
    {
      label: '广东省',
      value: 'guangdong',
      children: [
        { label: '深圳市', value: 'shenzhen', isLeaf: true },
        { label: '广州市', value: 'guangzhou', isLeaf: true },
      ],
    },
    {
      label: '浙江省',
      value: 'zhejiang',
      children: [
        { label: '杭州市', value: 'hangzhou', isLeaf: true },
        { label: '宁波市', value: 'ningbo', isLeaf: true },
      ],
    },
  ];

  protected count(): number {
    const value = this.value();
    return Array.isArray(value) ? value.length : 0;
  }
}
