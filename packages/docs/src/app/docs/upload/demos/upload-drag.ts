import { Component, signal } from '@angular/core';
import { TUploadModule, type RequestMethodResponse } from '@tdesign-ng/components';

/** 示例用自定义上传：不发起真实请求，延时后返回成功，进度由 mock 进度驱动。 */
function mockUpload(): Promise<RequestMethodResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        response: { url: 'data:text/plain;charset=utf-8,upload-drag', uploadTime: '2026-01-01 10:00:00' },
      });
    }, 1200);
  });
}

@Component({
  selector: 'demo-upload-drag',
  imports: [TUploadModule],
  template: `
    <div style="max-width: 420px">
      <t-upload
        style="display: block"
        draggable
        accept=".txt,.md,.pdf,.png,.jpg"
        [requestMethod]="requestMethod"
        [mockProgressDuration]="150"
        (success)="handleResult(true)"
        (fail)="handleResult(false)"
      />
      <p style="margin: 12px 0 0; font-size: 13px">最近一次上传结果：{{ result() }}</p>
    </div>
  `,
})
export class DemoUploadDrag {
  protected readonly result = signal('尚未上传');

  protected readonly requestMethod = mockUpload;

  protected handleResult(success: boolean): void {
    this.result.set(success ? '上传成功' : '上传失败');
  }
}
