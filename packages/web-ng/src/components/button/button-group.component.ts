import { Component, InjectionToken, Input, forwardRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { getPrefixCls } from "../../_utils/global-config";
import { ButtonTypes } from './button.types';
import { BorderShape, Size, Status } from "../../_utils/constant";

export const ARCO_BUTTON_GROUP = new InjectionToken<ArcoButtonGroup>(
  'ArcoButtonGroup',
);

export const ARCO_BUTTON_GROUP_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ArcoButtonGroup),
  multi: true,
};

@Component({
  selector: 'a-button-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="prefixCls">
      <ng-content></ng-content>
    </div>
  `,
  providers: [
    ARCO_BUTTON_GROUP_VALUE_ACCESSOR,
    { provide: ARCO_BUTTON_GROUP, useExisting: ArcoButtonGroup }
  ],
})
export class ArcoButtonGroup {
  prefixCls = getPrefixCls('btn-group');
  /**
   * @zh 按钮的类型，分为五种：次要按钮、主要按钮、虚框按钮、线性按钮、文字按钮。
   * @en Children button types are divided into five types: secondary, primary, dashed, outline and text.
   */
  @Input() type?: ButtonTypes;
  /**
   * @zh 按钮的状态
   * @en Children button state
   * @values 'normal','warning','success','danger'
   */
   @Input() status?: Status;
  /**
   * @zh 按钮的形状
   * @en Button shape
   */
  @Input() shape?: BorderShape;
  /**
   * @zh 按钮的尺寸
   * @en Children button size
   * @values 'mini','small','medium','large'
   */
  @Input() size?: Size;
  /**
   * @zh 全部子按钮是否禁用
   * @en All children whether the button is disabled
   */
  @Input() disabled?: boolean;
}
