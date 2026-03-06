import { Component, EventEmitter, Input, Output, computed } from "@angular/core";
import { CommonModule } from "@angular/common";
import { getPrefixCls } from "../../utils/global-config";
import { Status } from "../../utils/constant";
// <!-- <span v-if="loading || showIcon" :class="`${prefixCls}-icon`">
//       <icon-loading v-if="loading" />
//       <slot v-else name="icon">
//         <icon-link />
//       </slot>
//     </span> -->
@Component({
  selector: 'a-link',
  imports: [CommonModule],
  standalone: true,
  template: `
   <a
    [href]="disabled ? undefined : href"
    [class]="cls()"
    (click)="handleClick($event)">
    <ng-content></ng-content>
  </a>`,
})
export class ArcoLink {
  /**
   * @zh 链接地址
   * @en Link address
   */
  @Input() href?: string;
  /**
   * @zh 链接的状态
   * @en Link status
   * @values 'normal','warning','success','danger'
   */
  @Input() status: Status = 'normal';
  /**
   * @zh 鼠标悬浮时存在底色
   * @en Whether to hide background when hover
   * @defaultValue true
   */
  @Input() hoverable: boolean = true;

  /**
   * @zh 图标
   * @en icon
   */
  @Input() icon: boolean = false;
  /**
   * @zh 链接是否为加载中状态
   * @en Whether the link is in the loading state
   */
  @Input() loading: boolean = false;
  /**
   * @zh 链接是否禁用
   * @en Whether the link is disabled
   */
  @Input() disabled: boolean = false;

  @Output() click = new EventEmitter<MouseEvent>();

  cls = computed(() => {
    const prefixCls = getPrefixCls('link');

    return [
      prefixCls,
      `${prefixCls}-status-${this.status}`,
      this.disabled && `${prefixCls}-disabled`,
      this.loading && `${prefixCls}-loading`,
      !this.hoverable && `${prefixCls}-hoverless`,
      (this.loading || this.icon) && `${prefixCls}-with-icon`
    ];
  });

  handleClick = (ev: MouseEvent) => {
    if (this.disabled || this.loading) {
      ev.preventDefault();
      return;
    }
    this.click.emit(ev);
  }
}
