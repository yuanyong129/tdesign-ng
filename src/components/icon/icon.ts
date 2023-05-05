import { attr, ViewTemplate } from '@microsoft/fast-element';
import { FoundationElement } from '@microsoft/fast-foundation';
import { isNumber } from '../_utils/is';
import { prefixCls, styles } from './icon.style';

export class ArcoIcon extends FoundationElement {
  @attr
  type?: string = undefined;
  @attr
  size?: number | string = undefined;
  @attr
  rotate?: number = 0;
  @attr
  spin?: boolean = false;

  cls = () => {
    return [
      prefixCls,
      this.spin ? `${prefixCls}-loading` : '',
      this.type || ''
    ].join(' ');
  }

  innerStyle = () => {
    let styles = '';

    if (this.size) {
      const size = isNumber(this.size) ? `${this.size}px` : this.size;
      styles += `width: ${size}; height: ${size}`;
    }
    if (this.rotate) {
      styles += `transform: rotate(${this.rotate}deg);`;
    }

    return styles;
  }
}

export const arcoIcon = (baseName: string, template: ViewTemplate) =>  ArcoIcon.compose({
  baseName,
  styles,
  template,
  shadowOptions: {
    delegatesFocus: false
  }
});