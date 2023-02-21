import { html, attr } from '@microsoft/fast-element';
import { FoundationElement } from '@microsoft/fast-foundation';
import { prefixCls, styles } from './button.style';
import { Size, Status } from '../_utils/constant';
import { isString } from '../_utils/is';

const template = html<ArcoButton>`
  <div class="${x => x.getClassName().join(' ')}"> 
    <slot></slot>
  </div>
`

type ButtonType = 'primary' | 'secondary' | 'dashed' | 'outline' | 'text';
type ButtonShape = 'square' | 'round' | 'circle';

export class ArcoButton extends FoundationElement {

  @attr type: ButtonType = 'primary';

  @attr shape: ButtonShape = 'square';

  @attr status: Status = 'normal';

  @attr size: Size = 'medium';
   
  @attr long: Boolean = false;

  @attr loading: Boolean = false;

  @attr disabled: Boolean = false;

  @attr htmlType: String = 'button';

  @attr href?: String = undefined;

  getClassName = () => {
    return [
      prefixCls,
      `${prefixCls}-${this.type}`,
      `${prefixCls}-shape-${this.shape}`,
      `${prefixCls}-size-${this.size}`,
      `${prefixCls}-status-${this.status}`,
      this.long ? `${prefixCls}-long` : '',
      this.loading ? `${prefixCls}-loading`: '',
      this.disabled ? `${prefixCls}-disabled` : '',
      isString(this.href) ? `${prefixCls}-link` : ''
    ];
  }
}

export const arcoButton = ArcoButton.compose({
  baseName: 'button',
  template,
  styles,
  shadowOptions: {
    mode: 'closed',
    delegatesFocus: true
  }
})