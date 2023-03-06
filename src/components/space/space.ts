/**
 * @todo 优化space为子元素嵌套父级div的渲染方式
 */

import { FoundationElement } from '@microsoft/fast-foundation';
import { attr, html } from '@microsoft/fast-element';
import { prefixCls, styles } from './space.style';
import { isArray, isNumber } from '../_utils/is';
import { Direction, Size } from '../_utils/constant';
import { getAllElements } from '../_utils/web-utils';

type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';
type SpaceSize = number | Size;

class ArcoSpace extends FoundationElement {
  /**
   * @zh 对齐方式
   */
  @attr align: SpaceAlign = 'start';
  /**
   * @zh 间距方向
   */
  @attr direction: Direction = 'horizontal';
  /**
   * @zh 间距大小，支持分别制定横向和竖向的间距
   */
  @attr size: SpaceSize = 'small';

  @attr wrap: boolean = false;

  @attr fill: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    this.render();
  }

  render () {
    const children = getAllElements(Array.from(this.childNodes), true) as Element[];

    this.template = html`
      <div class="${this.cls()}">
        ${children.map((item, index) => html`
          <div
            class="${prefixCls}-item"
            style="${this.getMarginStyle(index === children.length - 1)}"
          >
            ${item.outerHTML ?? item.textContent}
          </div>
        `.html).join(' ') }
      </div>
    `
  }
  
  mergedAlign = () => {
    return this.align ?? (this.direction === 'horizontal' ? 'center' : '');
  }

  domChildren () {
    return Array.from(this.children);
  }

  cls = () => {
    return [
      prefixCls,
      this.direction && `${prefixCls}-${this.direction}`,
      this.align ? `${prefixCls}-align-${this.mergedAlign()}` : '',
      this.wrap ? `${prefixCls}-wrap` : '',
      this.fill ? `${prefixCls}-fill` : ''
    ].join(' ');
  }

  getMargin = (size: SpaceSize) => {
    if(isNumber(size)) {
      return size;
    }
    switch(size) {
      case 'mini':
        return 4;
      case 'small':
        return 8;
      case 'medium':
        return 16;
      case 'large':
        return 24;
      default:
        return 8;
    }
  }

  getMarginStyle = (isLast: boolean) => {
    let style = '';

    const marginRight = `${this.getMargin(
      isArray(this.size) ? this.size[0] : this.size
    )}px`;
    const marginBottom = `${this. getMargin(
      isArray(this.size) ? this.size[1] : this.size
    )}px`;

    if (isLast) {
      return this.wrap ? { marginBottom } : '';
    }

    if (this.direction === 'horizontal') {
      style = `margin-right: ${marginRight};`;
    }
    if (this.direction === 'vertical' || this.wrap) {
      style = `margin-bottom: ${marginBottom};`;
    }

    return style;
  }
}

export const arcoSpace = ArcoSpace.compose({
  baseName: 'space',
  styles,
  shadowOptions: {
    delegatesFocus: true
  }
});