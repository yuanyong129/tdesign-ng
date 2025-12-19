import { Component, computed, Input } from '@angular/core';
import { getPrefixCls } from '../../utils/global-config';

@Component({
  selector: 'a-space',
  template: `
    <div [class]="cls()">
      <ng-content></ng-content>
    </div>
  `,
})
export class ArcoSpace {
  @Input() direction: 'horizontal' | 'vertical' = 'horizontal';

  cls = computed(() => {
    const prefixCls = getPrefixCls('space');
    return [
      prefixCls,
      `${prefixCls}-${this.direction}`
    ];
  });
}
