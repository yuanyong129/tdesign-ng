import { Component, signal } from '@angular/core';
import { TAvatar, TButton, TSpace } from '@tdesign-ng/components';

@Component({
  selector: 'demo-avatar-image-props',
  imports: [TAvatar, TButton, TSpace],
  template: `
    <ng-template #loading>…</ng-template>
    <ng-template #error>×</ng-template>
    <ng-template #overlay>查看</ng-template>
    <ng-template #fallback><strong>{{ fallbackText() }}</strong></ng-template>
    <t-space [size]="16">
      <t-avatar [image]="image()" alt="显式头像描述" size="64px"
        [imageProps]="{ fit: 'contain', position: 'top', referrerpolicy: 'no-referrer',
          loading: loading, error: error, overlayContent: overlay, overlayTrigger: 'hover',
          onLoad: recordLoad, onError: recordImageError }"
        (error)="errors.update(increment)" />
      <t-avatar [image]="image()" hideOnLoadFailed [content]="fallback" size="64px"
        (error)="hiddenErrors.update(increment)" />
      <t-avatar [image]="image()" size="64px" content="备"
        [imageProps]="{ fallback: fallbackImage(), fit: 'cover', onLoad: recordFallbackLoad }" />
      <t-avatar image="favicon.svg" [imageProps]="{ lazy: true, fit: 'contain' }" />
    </t-space>
    <p aria-live="polite">加载 {{ loads() }} 次；头像错误 {{ errors() }} 次；图片错误回调 {{ imageErrors() }} 次。</p>
    <t-button variant="text" (click)="retry()">更换地址重试</t-button>
    <p>hideOnLoadFailed 开启时，图片失败后显示头像内容；否则保留 Image 的失败提示。更换地址后恢复请求。</p>
  `,
})
export class DemoAvatarImageProps {
  readonly image = signal('favicon.svg?avatar=0');
  readonly fallbackImage = signal('favicon.svg?avatar-fallback=1');
  readonly fallbackText = signal('备');
  readonly loads = signal(0);
  readonly errors = signal(0);
  readonly imageErrors = signal(0);
  readonly hiddenErrors = signal(0);
  readonly fallbackLoads = signal(0);
  readonly increment = (value: number) => value + 1;
  readonly recordLoad = () => this.loads.update(this.increment);
  readonly recordImageError = () => this.imageErrors.update(this.increment);
  readonly recordFallbackLoad = () => this.fallbackLoads.update(this.increment);
  private retries = 0;

  retry(): void { this.image.set(`favicon.svg?avatar=${++this.retries}`); }
}
