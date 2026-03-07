import {
  Component,
  ElementRef,
  Renderer2,
  computed,
  Input,
  AfterViewChecked,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { getPrefixCls } from '../../_utils/global-config';
import { isArray, isNumber } from '../../_utils/is';

type SpaceSize = number | 'mini' | 'small' | 'medium' | 'large';

@Component({
  selector: 'a-space',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cls()" [style]="getSpaceStyle()" id="host">
      <ng-content></ng-content>
    </div>
    <div id="splitContent" style="display: none;">
      <ng-content select="[split]"></ng-content>
    </div>
  `,
})
export class ArcoSpace implements AfterViewChecked, OnDestroy {
  /**
   * @zh 对齐方式
   * @en Alignment
   * @values 'start', 'end', 'center', 'baseline'
   */
  @Input() align?: 'start' | 'end' | 'center' | 'baseline';
  /**
   * @zh 间距方向
   * @en Spacing direction
   */
  @Input() direction: 'vertical' | 'horizontal' = 'horizontal';
  /**
   * @zh 间距大小，支持分别制定横向和竖向的间距
   * @en Spacing size, support for setting horizontal and vertical spacing separately
   */
  @Input() size: number | 'mini' | 'small' | 'medium' | 'large' | [SpaceSize, SpaceSize] = 'small';
  /**
   * @zh 环绕类型的间距，用于折行的场景。
   * @en The spacing of the wrapping type, used in the scene of wrapping.
   */
  @Input() wrap?: boolean;
  /**
   * @zh 充满整行
   * @en fill the block
   */
   @Input() fill?: boolean;

  private prefixCls = getPrefixCls('space');
  // 保存所有动态创建的wrapper，用于后续清理
  private wrapperList: HTMLElement[] = [];
  private splitCloneList: HTMLElement[] = [];

  hostRef!: HTMLElement;
  splitContentRef!: HTMLElement;

   getSize(size: SpaceSize) {
    if (isNumber(size)) {
      return size;
    }
    switch (size) {
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

  getSpaceStyle = computed(() => {
    const style: Record<string, string> = {};
    const sizeArray = isArray(this.size)
      ? this.size
      : [this.size, this.size];
    const [colGap, rowGap] = sizeArray.map(this.getSize);

    style['columnGap'] = `${colGap}px`;
    style['rowGap'] = `${rowGap}px`;
    return style;
  });

  private rtl = computed(() => {
    return false;
  });

  private mergedAlign = computed(() => {
    return this.align ?? (this.direction === 'horizontal' ? 'center' : '');
  });

  cls = computed(() => {
    return [
      this.prefixCls,
      this.direction ? `${this.prefixCls}-${this.direction}` : '',
      this.mergedAlign() ? `${this.prefixCls}-align-${this.mergedAlign()}` : '',
      this.wrap ? `${this.prefixCls}-wrap` : '',
      this.fill ? `${this.prefixCls}-fill` : '',
      this.rtl() ? `${this.prefixCls}-rtl` : '',
    ];
  });

  constructor(private elRef: ElementRef, private renderer: Renderer2) { }

  ngAfterViewChecked(): void {
    this.wrapChildren();
  }

  private wrapChildren(): void {
    const container  = this.elRef?.nativeElement;
    if (!container) return;
    this.hostRef = container.querySelector('#host') as HTMLElement;
    this.splitContentRef = container.querySelector('#splitContent') as HTMLElement;

    // 先清理旧的节点（避免重复渲染）
    this.clearOldNodes(this.hostRef);

    // 获取有效子元素（过滤空文本节点）
    const originalChildren = Array.from(this.hostRef?.childNodes).filter(
      (node) => !this.isEmptyTextNode(node)
    );
    if (originalChildren.length === 0) return;

    // 获取 split 有效模板（非 null 时才插入分隔符）
    const splitTemplate = this.getSplitTemplate();
    const hasSplit = !!splitTemplate;

    // 遍历子元素，包裹 + 插入分隔符
    originalChildren.forEach((child, index) => {
      // 1. 保留原有包裹逻辑
      const wrapper = this.renderer.createElement('div');
      this.renderer.addClass(wrapper, `${this.prefixCls}-item`);
      this.renderer.removeChild(this.hostRef, child);
      this.renderer.appendChild(wrapper, child);
      this.renderer.appendChild(this.hostRef, wrapper);
      this.wrapperList.push(wrapper);

      // 2. 插入 split 分隔符（非最后一个元素 + 有 split 模板）
      if (hasSplit && index < originalChildren.length - 1) {
        // 修复：使用原生 cloneNode 克隆 split 模板
        const splitWrapper = this.renderer.createElement('div');
        this.renderer.addClass(splitWrapper, `${this.prefixCls}-item-split`);
        const splitClone = splitTemplate.cloneNode(true) as HTMLElement;
        // 插入到当前 wrapper 后方
        this.renderer.appendChild(splitWrapper, splitClone);
        this.renderer.appendChild(this.hostRef, splitWrapper);
        this.splitCloneList.push(splitWrapper);
      }
    });
  }

   /**
   * 辅助：获取 split 插槽的有效内容（过滤空节点）
   */
  private getSplitTemplate(): Node | null {
    if (!this.splitContentRef) return null;

    // 获取 split 插槽的第一个有效子节点（过滤空文本）
    const validSplitNode = Array.from(this.splitContentRef?.childNodes).find(
      (node) => !this.isEmptyTextNode(node)
    );

    return validSplitNode || null;
  }

  /** 辅助：判断是否是空文本节点 */
  private isEmptyTextNode(node: Node): boolean {
    return node.nodeType === Node.TEXT_NODE && !node.textContent?.trim();
  }

   /**
   * 清理所有动态创建的节点（wrapper + split克隆体）
   */
  private clearOldNodes(host: HTMLElement): void {
    // 清理 split 克隆体
    this.splitCloneList.forEach((clone) => {
      this.renderer.removeChild(host, clone);
    });
    this.splitCloneList = [];

    // 清理 wrapper，恢复原元素
    this.wrapperList.forEach((wrapper) => {
      const originalChild = wrapper.firstChild;
      if (originalChild) {
        this.renderer.insertBefore(host, originalChild, wrapper);
      }
      this.renderer.removeChild(host, wrapper);
    });
    this.wrapperList = [];
  }

  /**
   * 组件销毁时清理资源
   */
  ngOnDestroy(): void {
    if (this.hostRef) {
      this.clearOldNodes(this.hostRef);
    }
  }
}
