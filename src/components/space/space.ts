import { FoundationElement } from '@microsoft/fast-foundation';
import { attr, html, children } from '@microsoft/fast-element';
import { prefixCls, styles } from './space.style';
import { isArray, isNumber } from '../_utils/is';
import { Direction, Size } from '../_utils/constant';

type SpaceAlign = 'start' | 'end' | 'center' | 'baseline';
type SpaceSize = number | Size;

const template = html<ArcoSpace>`
  <div class=${x => x.cls()}>
    ${children('getMargin')}
  </div>
`;

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
    console.log('space is now connected to the DOM');
  }

  cls = () => {
    return [
      prefixCls,
      this.direction && `${prefixCls}-${this.direction}`,
      this.align && `${prefixCls}-align-${this.align}`,
      this.wrap && `${prefixCls}-wrap`,
      this.fill && `${prefixCls}-fill`
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
    const style: { marginRight?: string, marginBottom?: string } = {};

    const marginRight = `${this.getMargin(
      isArray(this.size) ? this.size[0] : this.size
    )}px`;
    const marginBottom = `${this. getMargin(
      isArray(this.size) ? this.size[1] : this.size
    )}px`;

    if (isLast) {
      return this.wrap ? { marginBottom } : {};
    }

    if (this.direction === 'horizontal') {
      style.marginRight = marginRight;
    }
    if (this.direction === 'vertical' || this.wrap) {
      style.marginBottom = marginBottom;
    }
    
    return style;
  } 
}

export const arcoSpace  = () => {
  return ArcoSpace.compose({
    baseName: 'space',
    template,
    styles,
    shadowOptions: {
      delegatesFocus: true
    }
  }) 
} 