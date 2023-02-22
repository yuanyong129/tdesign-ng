import { html, attr, observable, when } from '@microsoft/fast-element';
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

const template = html<ArcoButton>`
  <!-- 超链接按钮 -->
  ${when(x => x.href,
    html<ArcoButton>`
      <a class="${x => x.getClassName()}"
        href="${x => (x.disabled || x.loading ? undefined : x.href )}"
        @click=${x => x.handleClick()}>
        ${x => x.loading ? loadingIcon : '' }
        <slot></slot>
      </a>
    `)}
  <!-- 普通按钮 -->
  ${when(x => !x.href,
    html<ArcoButton>`
      <button class="${x => x.getClassName()}"
              type="${x => x.htmlType}"
              :disabled=${x => x.disabled}
              @click=${x => x.handleClick()}>
        ${x => x.loading ? loadingIcon : '' }
        <slot></slot>
      </button>
    `)}
`;

export class ArcoButton extends FoundationElement {

  @attr type: ButtonTypes = 'secondary';

  @attr shape: ButtonShapes = 'square';

  @attr status: Status = 'normal';

  @attr size: Size = 'medium';
   
  @attr long: Boolean = false;

  @attr
  @observable
  loading: Boolean = false;

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
    ].join(' ');
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
    delegatesFocus: true
  }
})