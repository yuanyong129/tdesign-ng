import { CommonModule } from "@angular/common";
import { Component, computed, Input } from "@angular/core";
import { Direction } from "../../_utils/constant";
import { getPrefixCls } from "../../_utils/global-config";
import { isNumber, isUndefined } from "../../_utils";

@Component({
  selector: 't-divider',
  imports: [CommonModule],
  standalone: true,
  template: `
    <div role="separator" [class]="cls()" [style]="mergedStyles()">
      <span
        [class]="clsSpan()"
        *ngIf="children.length > 0 && isHorizontal()">
        <ng-content></ng-content>
      </span>
    </div>`,
})
export class TDivider {
  /**
   * @zh 分割线的方向，是水平还是竖直
   * @en The direction of the dividing line. Can be horizontal or vertical
   * @values 'horizontal','vertical'
   */
  @Input() direction: Direction = 'horizontal';
  /**
   * @zh 分割线文字的位置
   * @en The position of the dividing line text
   */
  @Input() orientation: 'left' | 'center' | 'right' = 'center';
  /**
   * @zh 分割线样式类型
   * @en Dividing line style type
   */
  @Input() type : 'solid' | 'dashed' | 'dotted' | 'double' = 'solid';
  /**
   * @zh 分割线宽度/高度
   * @en The wide/height of the dividing line
   */
  @Input() size?: number;
  /**
   * @zh 分割线上下 margin (垂直方向时为左右 margin)
   * @en Margin up and down the split line (left and right margin in vertical direction)
   */
  @Input() margin?: number | string;

  prefixCls = getPrefixCls('divider');

  isHorizontal = computed(() => this.direction === 'horizontal');

  children = []

  cls = computed(() => {
    return [
      this.prefixCls,
      `${this.prefixCls}-${this.direction}`,
      this.children?.length > 0 && this.isHorizontal()
        ? `${this.prefixCls}-with-text` : '',
    ];
  });

  clsSpan = computed(() => {
    return [
      `${this.prefixCls}-text`,
      `${this.prefixCls}-text-${this.orientation}`
    ];
  });

  mergedStyles = computed(() => {
    const styles: Record<string, string> = {};
    if (this.size) {
      styles[
        this.isHorizontal() ? 'border-bottom-width' : 'border-left-width'
      ] = isNumber(this.size) ? `${this.size}px` : this.size;
    }
    if (this.type) {
      styles[
        this.isHorizontal() ? 'border-bottom-style' : 'border-left-style'
      ] = this.type;
    }
    if (!isUndefined(this.margin)) {
      const margin = isNumber(this.margin)
        ? `${this.margin}px`
        : this.margin;
      styles['margin'] = this.isHorizontal() ? `${margin} 0` : `0 ${margin}`;
    }

    return styles;
  })
}
