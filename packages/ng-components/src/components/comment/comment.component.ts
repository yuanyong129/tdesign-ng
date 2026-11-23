import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  input,
} from '@angular/core';
import { TButton } from '../button/button.component';

/** 评论的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type CommentContent = string | TemplateRef<unknown> | undefined;

/** 单个操作项：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type CommentAction = string | TemplateRef<unknown>;

/** 操作区：整体一个模板，或一组操作项（逐项渲染为 size=small、variant=text 的按钮）。 */
export type CommentActions = TemplateRef<unknown> | ReadonlyArray<CommentAction> | undefined;

/**
 * 评论。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类：
 * 头像、作者与时间、正文、引用、操作区按上游顺序拼装，`reply` 作为根节点的第二个子节点
 * 渲染（用于回复框或嵌套评论）。
 */
@Component({
  selector: 't-comment',
  standalone: true,
  imports: [NgTemplateOutlet, TButton],
  template: `
    <!-- 富文本属性统一渲染入口：模板走 ngTemplateOutlet，其余按文本输出（等价于上游的 renderTNodeJSX）。 -->
    <ng-template #renderNode let-value>
      @if (asTemplate(value); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (value !== undefined && value !== null) {
        {{ value }}
      }
    </ng-template>

    <div class="t-comment__inner">
      @if (avatar()) {
        <div class="t-comment__avatar">
          @if (avatarSrc(); as src) {
            <img class="t-comment__avatar-image" [src]="src" alt="" />
          } @else {
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: avatar() }" />
          }
        </div>
      }

      <div class="t-comment__content">
        @if (author() || datetime()) {
          <div class="t-comment__author">
            @if (author()) {
              <span class="t-comment__name">
                <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: author() }" />
              </span>
            }
            @if (datetime()) {
              <span class="t-comment__time">
                <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: datetime() }" />
              </span>
            }
          </div>
        }

        @if (content()) {
          <div class="t-comment__detail">
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: content() }" />
          </div>
        }

        @if (quote()) {
          <div class="t-comment__quote">
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: quote() }" />
          </div>
        }

        @if (actions()) {
          <div class="t-comment__actions">
            @if (actionTemplate(); as actionTpl) {
              <ng-container *ngTemplateOutlet="actionTpl" />
            } @else {
              @for (action of actionItems(); track $index) {
                <t-button size="small" variant="text">
                  <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: action }" />
                </t-button>
              }
            }
          </div>
        }
      </div>
    </div>

    @if (reply()) {
      <div class="t-comment__reply">
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: reply() }" />
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class TComment {
  /** 操作区，传数组时每项渲染为文字按钮，传模板时整体渲染。 @zh 操作区 @en actions */
  readonly actions = input<CommentActions>(undefined);

  /** 作者。 @zh 作者 @en author */
  readonly author = input<CommentContent>(undefined);

  /** 头像，字符串按图片地址渲染。 @zh 头像 @en avatar */
  readonly avatar = input<CommentContent>(undefined);

  /** 正文内容。 @zh 正文内容 @en content */
  readonly content = input<CommentContent>(undefined);

  /** 评论时间。 @zh 评论时间 @en datetime */
  readonly datetime = input<CommentContent>(undefined);

  /** 引用内容，显示在正文下方。 @zh 引用内容 @en quote */
  readonly quote = input<CommentContent>(undefined);

  /** 回复内容，显示在评论下方。 @zh 回复内容 @en reply */
  readonly reply = input<CommentContent>(undefined);

  protected readonly classes = computed(() => 't-comment');

  /** 头像是字符串时按图片渲染，与上游一致。 */
  protected readonly avatarSrc = computed(() => {
    const avatar = this.avatar();
    return typeof avatar === 'string' ? avatar : null;
  });

  /** 操作区整体是一个模板时优先整体渲染。 */
  protected readonly actionTemplate = computed<TemplateRef<unknown> | null>(() => {
    const actions = this.actions();
    return actions instanceof TemplateRef ? actions : null;
  });

  /** 数组写法的操作项。 */
  protected readonly actionItems = computed<ReadonlyArray<CommentAction>>(() => {
    const actions = this.actions();
    return Array.isArray(actions) ? actions : [];
  });

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: CommentContent | CommentAction): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }
}
