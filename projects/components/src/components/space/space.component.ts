import {
  Component,
  ElementRef,
  Renderer2,
  computed,
  Input,
  ContentChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { getPrefixCls } from '../../utils/global-config';
import { isArray, isNumber } from '../../utils/is';

type SpaceSize = number | 'mini' | 'small' | 'medium' | 'large';

@Component({
  selector: 'a-space',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="cls()" [style]="getSpaceStyle()" id="host">
      <ng-content></ng-content>
    </div>
    <ng-content #splitContent select="[split]" hidden></ng-content>
  `,
})
export class ArcoSpace {
  /**
   * @zh 对齐方式
   * @en Alignment
   * @values 'start', 'end', 'center', 'baseline'
   */
  @Input() align: 'start' | 'end' | 'center' | 'baseline' = 'center';
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

  @ContentChild('splitContent') splitContentRef!: ElementRef<HTMLElement>;

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

  ngAfterContentInit(): void {
    this.wrapChildren();
  }

  private wrapChildren(): void {
     // 1. 获取容器
    const container = this.elRef.nativeElement.querySelector('#host');
    if (!container) return; // 容错：容器不存在则直接返回

    // 2. 关键：将动态 NodeList 转为静态数组，避免遍历错乱
    const children = Array.from(container.childNodes) as Node[];

    // 3. 先清理旧的wrapper（避免重复包裹）
    this.clearOldWrappers(container);

    // 4. 遍历静态数组，避免DOM变化影响遍历
    for (const child of children) {
      // 过滤空文本节点（换行/空格/制表符）
      if (this.isEmptyTextNode(child)) continue;

      // 5. 创建wrapper
      const wrapper = this.renderer.createElement('div');
      this.renderer.addClass(wrapper, `${this.prefixCls}-item`);

      // 6. 保存child的原位置信息（避免插入错乱）
      const nextSibling = child.nextSibling; // 下一个兄弟节点

      // 7. 先将child从容器中移除，再加入wrapper
      this.renderer.removeChild(container, child);
      this.renderer.appendChild(wrapper, child);

      // 8. 将wrapper插入到child原来的位置（保持原有顺序）
      if (nextSibling) {
        this.renderer.insertBefore(container, wrapper, nextSibling);
      } else {
        this.renderer.appendChild(container, wrapper);
      }

      // 9. 保存wrapper引用，用于后续清理
      this.wrapperList.push(wrapper);
    }
  }

  /** 辅助：判断是否是空文本节点 */
  private isEmptyTextNode(node: Node): boolean {
    return node.nodeType === Node.TEXT_NODE && !node.textContent?.trim();
  }

  /** 清理旧的wrapper，恢复原元素 */
  private clearOldWrappers(container: HTMLElement): void {
    if (this.wrapperList.length === 0) return;

    this.wrapperList.forEach((wrapper) => {
      // 取出wrapper中的原元素
      const originalChild = wrapper.firstChild;
      if (originalChild) {
        // 将原元素移回wrapper的原位置
        this.renderer.insertBefore(container, originalChild, wrapper);
      }
      // 移除旧wrapper
      this.renderer.removeChild(container, wrapper);
    });

    // 清空wrapper列表
    this.wrapperList = [];
  }

  /** 组件销毁时清理，防止内存泄漏 */
  ngOnDestroy(): void {
    const container = this.elRef.nativeElement.querySelector('#host');
    if (container) {
      this.clearOldWrappers(container);
    }
  }
}
