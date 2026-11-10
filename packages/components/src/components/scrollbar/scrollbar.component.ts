import { Component, computed, ElementRef, EventEmitter, Input, Output, signal, ViewChild } from "@angular/core";
import { TThumb } from './thumb.component';
import { getPrefixCls } from "../../_utils/global-config";
import { ThumbData } from "./interface";
import { CommonModule } from "@angular/common";
import { isObject } from "../../_utils/is";
// [attr]="attrs"

const THUMB_MIN_SIZE = 20;
const TRACK_SIZE = 15;

@Component({
  selector: 't-scrollbar',
  imports: [TThumb, CommonModule],
  template: `
    <div [class]="cls()" [style]="style()">
      <div
        #container
        class="{{prefixCls}}-container"
        [style]="containerStyle()"
        (scroll)="handleScroll($event)"
      >
        <ng-content></ng-content>
      </div>
    <t-thumb
      v-if="!hide && hasHorizontalScrollbar"
      #horizontalThumb
      [data]="horizontalData()"
      direction="horizontal"
      [both]="isBoth()"
      (scroll)="handleHorizontalScroll($event)"
    ></t-thumb>
    <t-thumb
      v-if="!hide && hasVerticalScrollbar"
      #verticalThumb
      [data]="verticalData()"
      direction="vertical"
      [both]="isBoth()"
      (scroll)="handleVerticalScroll($event)"
    ></t-thumb>
  </div>
  `,
  standalone: true,
})
export class TScrollbar {
  /**
   * @zh 类型
   * @en Type
   * @values 'track' | 'embed'
   * @defaultValue 'embed'
   */
  @Input() type: 'track' | 'embed' = 'embed';
  /**
   * @zh 外层的类名
   * @en Outer class
   */
  @Input() outerClass?: string;
  /**
   * @zh 外层的样式
   * @en Outer style
   */
  @Input() outerStyle?: string;
  /**
   * @zh 是否隐藏滚动条，仅供内部使用
   * @en Whether to hide the scrollbar, for internal use only
   * @defaultValue false
   * @internal
   */
  @Input() hide: boolean = false;
  /**
   * @zh 是否禁用横向滚动条，仅供内部使用
   * @en Whether to disable the horizontal scrollbar, for internal use only
   * @defaultValue false
   * @internal
   */
  @Input() disableHorizontal: boolean = false;
  /**
   * @zh 是否禁用纵向滚动条，仅供内部使用
   * @en Whether to disable the vertical scrollbar, for internal use only
   * @defaultValue false
   * @internal
   */
  @Input() disableVertical: boolean = false;

  /**
   * @zh 滚动时触发
   * @en Emits on scroll
   */
  @Output() scroll = new EventEmitter<Event>();

  prefixCls = getPrefixCls('scrollbar');

  @ViewChild('container')
  containerRef?: ElementRef<HTMLDivElement>;
  horizontalData = signal<ThumbData | undefined>(undefined);
  verticalData = signal<ThumbData | undefined>(undefined);
  @ViewChild('horizontalThumb')
  horizontalThumbRef?: TThumb;
  @ViewChild('verticalThumb')
  verticalThumbRef?: TThumb;
  _hasHorizontalScrollbar = signal(false);
  _hasVerticalScrollbar = signal(false);
  hasHorizontalScrollbar = computed(
    () => this._hasHorizontalScrollbar() && !this.disableHorizontal
  );
  hasVerticalScrollbar = computed(
    () => this._hasVerticalScrollbar() && !this.disableVertical
  );
  isBoth = signal(false);

  getContainerSize = () => {
    if (this.containerRef?.nativeElement) {
      const {
        clientWidth,
        clientHeight,
        offsetWidth,
        offsetHeight,
        scrollWidth,
        scrollHeight,
        scrollTop,
        scrollLeft,
      } = this.containerRef.nativeElement;
      this._hasHorizontalScrollbar.set(scrollWidth > clientWidth);
      this._hasVerticalScrollbar.set(scrollHeight > clientHeight);
      this.isBoth.set(
        this.hasHorizontalScrollbar() && this.hasVerticalScrollbar()
      );
      const horizontalTrackWidth =
        this.type === 'embed' && this.isBoth()
          ? offsetWidth - TRACK_SIZE
          : offsetWidth;
      const verticalTrackHeight =
        this.type === 'embed' && this.isBoth()
          ? offsetHeight - TRACK_SIZE
          : offsetHeight;

      const horizontalThumbWidth = Math.round(
        horizontalTrackWidth /
          Math.min(
            scrollWidth / clientWidth,
            horizontalTrackWidth / THUMB_MIN_SIZE
          )
      );
      const maxHorizontalOffset = horizontalTrackWidth - horizontalThumbWidth;
      const horizontalRatio =
        (scrollWidth - clientWidth) / maxHorizontalOffset;
      const verticalThumbHeight = Math.round(
        verticalTrackHeight /
          Math.min(
            scrollHeight / clientHeight,
            verticalTrackHeight / THUMB_MIN_SIZE
          )
      );
      const maxVerticalOffset = verticalTrackHeight - verticalThumbHeight;
      const verticalRatio = (scrollHeight - clientHeight) / maxVerticalOffset;

      this.horizontalData.set({
        ratio: horizontalRatio,
        thumbSize: horizontalThumbWidth,
        max: maxHorizontalOffset,
      });
      this.verticalData.set({
        ratio: verticalRatio,
        thumbSize: verticalThumbHeight,
        max: maxVerticalOffset,
      });
      if (scrollTop > 0) {
        const verticalOffset = Math.round(
          scrollTop / (this.verticalData()?.ratio ?? 1)
        );
        this.verticalThumbRef?.setOffset(verticalOffset);
      }
      if (scrollLeft > 0) {
        const horizontalOffset = Math.round(
          scrollLeft / (this.horizontalData()?.ratio ?? 1)
        );
        this.horizontalThumbRef?.setOffset(horizontalOffset);
      }
    }
  };

  constructor(private elRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit() {
    this.getContainerSize();
  };

  handleResize = () => {
    this.getContainerSize();
  };

  handleScroll = (ev: Event) => {
    if (this.containerRef?.nativeElement) {
      if (this.hasHorizontalScrollbar() && !this.disableHorizontal) {
        const horizontalOffset = Math.round(
          this.containerRef.nativeElement.scrollLeft / (this.horizontalData()?.ratio ?? 1)
        );
        this.horizontalThumbRef?.setOffset(horizontalOffset);
      }
      if (this.hasVerticalScrollbar() && !this.disableVertical) {
        const verticalOffset = Math.round(
          this.containerRef.nativeElement.scrollTop / (this.verticalData()?.ratio ?? 1)
        );
        this.verticalThumbRef?.setOffset(verticalOffset);
      }
    }
    this.scroll.emit(ev);
  };

  handleHorizontalScroll = (offset: number) => {
    if (this.containerRef?.nativeElement) {
      this.containerRef.nativeElement.scrollTo({
        left: offset * (this.horizontalData()?.ratio ?? 1),
      });
    }
  };

  handleVerticalScroll = (offset: number) => {
    if (this.containerRef?.nativeElement) {
      this.containerRef.nativeElement.scrollTo({
        top: offset * (this.verticalData()?.ratio ?? 1),
      });
    }
  };

  style = computed(() => {
    let style: string = '';
    if (this.type === 'track') {
      if (this.hasHorizontalScrollbar()) {
        style += `padding-bottom: ${TRACK_SIZE}px;`;
      }
      if (this.hasVerticalScrollbar()) {
        style += `padding-right: ${TRACK_SIZE}px;`;
      }
    }
    return [style, this.outerStyle].filter(item => Boolean(item)).join('');
  });

  containerStyle = computed(() => {
    return this.elRef.nativeElement.getAttribute('style');
  })

  cls = computed(() => [
    `${this.prefixCls}`,
    `${this.prefixCls}-type-${this.type}`,
    this.isBoth() ? `${this.prefixCls}-both-${this.type}` : '',
    this.outerClass || '',
  ]);

  /**
   * @zh 滚动
   * @en scrollTo
   * @public
   * @param {number | {left?: number;top?: number}} options
   * @param {number} y
   */
  scrollTo(
    options?:
      | number
      | {
          left?: number;
          top?: number;
        },
    y?: number
  ) {
    if (isObject(options)) {
      (this.containerRef?.nativeElement as HTMLElement)?.scrollTo(options);
    } else if (options || y) {
      (this.containerRef?.nativeElement as HTMLElement)?.scrollTo(
        options as number,
        y as number
      );
    }
  }
  /**
   * @zh 纵向滚动
   * @en scroll vertically
   * @public
   * @param {number} top
   * @version 2.40.0
   */
  scrollTop(top: number) {
    (this.containerRef?.nativeElement as HTMLElement)?.scrollTo({
      top,
    });
  }
  /**
   * @zh 横向滚动
   * @en scroll horizontal
   * @public
   * @param {number} left
   * @version 2.40.0
   */
  scrollLeft(left: number) {
    (this.containerRef?.nativeElement as HTMLElement)?.scrollTo({
      left,
    });
  }
}
