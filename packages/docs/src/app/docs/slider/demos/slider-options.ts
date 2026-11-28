import { Component, signal } from '@angular/core';
import { TSlider, TButton } from '@tdesign-ng/components';
import type { SliderInputNumberProps, SliderTooltipProps, SliderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-slider-options',
  imports: [TSlider, TButton],
  template: `
    <div class="demo-slider-list">
      <t-slider class="configured-single" [value]="value()" [min]="1" [max]="21" [step]="2"
        [disabled]="disabled()" [inputNumberProps]="numberProps()" [tooltipProps]="tooltipProps()"
        [label]="label()" (change)="update($event)" (changeEnd)="ends.set(ends() + 1)" />
      <t-slider class="configured-range" range [defaultValue]="[3, 15]" [min]="1" [max]="21" [step]="2"
        [inputNumberProps]="true" [label]="true" (change)="rangeValue.set($event)" />
      <div style="height: 220px; margin: 24px 0">
        <t-slider class="configured-vertical" layout="vertical" [defaultValue]="0.4" [step]="0.1" [max]="1"
          [inputNumberProps]="true" [label]="true" />
      </div>
    </div>
    <p class="demo-hint">当前 {{ value() }}；change {{ changes() }} 次，changeEnd {{ ends() }} 次；数字框回调 {{ callbacks() }} 次。</p>
    <t-button size="small" variant="outline" type="button" (click)="disabled.set(!disabled())">切换禁用</t-button>
    <t-button size="small" variant="outline" type="button" (click)="toggleReadonly()">切换数字框只读</t-button>
    <t-button size="small" variant="outline" type="button" (click)="numberProps.set(numberProps() === false ? true : false)">切换数字框显示</t-button>
  `,
})
export class DemoSliderOptions {
  protected readonly value = signal<SliderValue>(5);
  protected readonly rangeValue = signal<SliderValue>([3, 15]);
  protected readonly changes = signal(0);
  protected readonly ends = signal(0);
  protected readonly callbacks = signal(0);
  protected readonly disabled = signal(false);
  protected readonly label = signal<string | boolean | undefined>(undefined);
  protected readonly numberProps = signal<boolean | SliderInputNumberProps>({
    theme: 'column', size: 'small', suffix: '份', disabled: false,
    inputProps: { name: 'slider-quantity', autocomplete: 'off' },
    onChange: () => this.callbacks.update((count) => count + 1),
  });
  protected readonly tooltipProps = signal<SliderTooltipProps>({
    content: '选择份数', placement: 'bottom', theme: 'primary', showArrow: false,
    delay: 120, destroyOnClose: true, zIndex: 2200,
  });
  protected update(value: SliderValue): void {
    this.value.set(value);
    this.changes.update((count) => count + 1);
  }
  protected toggleReadonly(): void {
    const props = this.numberProps();
    this.numberProps.set({ ...(typeof props === 'object' ? props : {}), readonly: !(typeof props === 'object' && props.readonly) });
  }
}
