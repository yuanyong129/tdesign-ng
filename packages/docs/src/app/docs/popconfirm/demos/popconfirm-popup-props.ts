import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { TButtonModule, TPopconfirmModule } from '@tdesign-ng/components';
import type { PopupOptions } from '@tdesign-ng/components';

@Component({
  selector: 'demo-popconfirm-popup-props',
  imports: [TPopconfirmModule, TButtonModule],
  // 弹层渲染在 body 下的 overlay 容器里，不在本组件的模板 DOM 内，
  // 默认的样式封装（属性选择器）够不到它，因此这个 demo 用 None + 前缀唯一的类名。
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      .demo-popconfirm-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      /* popupProps 透传到弹层根节点：这里给面板加一条虚线边框，证明类名确实落在了浮层上。 */
      .demo-popup-outline {
        outline: 1px dashed var(--td-brand-color);
        outline-offset: 4px;
        border-radius: var(--td-radius-default);
      }
    `,
  ],
  template: `
    <div class="demo-popconfirm-row">
      <t-popconfirm content="浮层加了虚线边框（overlayClassName）。" [popupProps]="outlined">
        <span><t-button variant="outline">自定义类名</t-button></span>
      </t-popconfirm>

      <t-popconfirm content="显式 placement 优先于 popupProps。" placement="right" [popupProps]="forcedLeft">
        <span><t-button variant="outline">placement 优先</t-button></span>
      </t-popconfirm>
    </div>
  `,
})
export class DemoPopconfirmPopupProps {
  protected readonly outlined: PopupOptions = {
    overlayClassName: 'demo-popup-outline',
    zIndex: 2000,
  };

  /** placement 被组件显式属性覆盖，最终仍渲染在右侧。 */
  protected readonly forcedLeft: PopupOptions = {
    placement: 'left',
    delay: [0, 120],
  };
}
