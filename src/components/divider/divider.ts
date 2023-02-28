import { FoundationElement } from '@microsoft/fast-foundation';
import { html, slotted, attr, observable } from '@microsoft/fast-element';
import { styles, prefixCls } from './divider.style';
import { Direction } from '../_utils/constant';
import { isNumber } from '../_utils/is';

const template = html<ArcoDivider>`
  <div class="${x => x.cls()}" :style=${x => x.mergedStyles()}>
    <slot ${slotted('items')}></slot>
  </div>
`;

export class ArcoDivider extends FoundationElement {

  @attr direction: Direction = 'horizontal';

  @attr orientation: 'left' | 'center' | 'right' = 'center';

  @attr type: 'solid' | 'dashed' | 'dotted' | 'double' = 'solid';

  @attr size: Number = 2;

  @attr margin: number | string = '';

  @observable isHorizontal: boolean = false;

  items: HTMLElement[] = []

  connectedCallback() {
    super.connectedCallback();
    this.isHorizontal = this.direction === 'horizontal';
  }

  mergedStyles () {
    let styles: string = '';
    const size = isNumber(this.size) ? `${this.size}px` : this.size;
    styles += this.isHorizontal ? `border-left-width: ${size};` : `border-bottom-width: ${size};`
    styles += this.isHorizontal ? `border-left-style: ${this.type}` : `border-bottom-style: ${this.type}`;
    const margin = isNumber(this.margin)
          ? `${this.margin}px`
          : this.margin;
    styles += this.isHorizontal ? `${margin} 0` : `0 ${margin}`;

    return styles
  }

  cls = () => {
    return [
      prefixCls,
      `${prefixCls}-${this.direction}`,
    ].join('')
  }
}

export const arcoDivider = ArcoDivider.compose({
  baseName: 'divider',
  baseClass: ArcoDivider,
  template,
  styles
})