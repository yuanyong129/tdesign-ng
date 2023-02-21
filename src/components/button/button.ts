import { html, attr } from '@microsoft/fast-element';
import { FoundationElement } from '@microsoft/fast-foundation';
import { prefixCls, styles } from './button.style';
import { Size, Status } from '../_utils/constant';
import { isString } from '../_utils/is';
import { ButtonShapes, ButtonTypes } from './constants';

/**
 * 加载图标
 **/
const loadingIcon = html<ArcoButton>`
  <span></span>
`

/**
 * 超链接按钮
 **/
const hrefButton = html<ArcoButton>`
  <a class="${x => x.getClassName().join(' ')}"
     href="${x => (x.disabled || x.loading ? undefined : x.href )}"
     click="${x => x.handleClick}">
     ${x => x.loading ? loadingIcon : '' }
    <slot></slot>
  </a>
`
/**
 * 正常按钮
 **/
const normalButton = html<ArcoButton>`
  <button class="${x => x.getClassName().join(' ')}"
          type="${x => x.htmlType}"
          disabled="${x => x.disabled}"
          onclick="${x => x.handleClick()}">
    ${x => x.loading ? loadingIcon : '' }
    <slot></slot>
  </button>
`

const template = html<ArcoButton>`
  ${ x=> x.href ? hrefButton : normalButton } 
`

export class ArcoButton extends FoundationElement {

  @attr type: ButtonTypes = 'primary';

  @attr shape: ButtonShapes = 'square';

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

  handleClick = () => {
    console.log('click')
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