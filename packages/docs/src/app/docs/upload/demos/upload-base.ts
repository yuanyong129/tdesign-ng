import { Component, signal } from '@angular/core';
import { TUploadModule, type RequestMethodResponse } from '@tdesign-ng/components';

/** 示例用自定义上传：不发起真实请求，延时后返回成功，进度由 mock 进度驱动。 */
function mockUpload(): Promise<RequestMethodResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        response: { url: 'data:text/plain;charset=utf-8,upload-base', uploadTime: '2026-01-01 10:00:00' },
      });
    }, 900);
  });
}

@Component({
  selector: 'demo-upload-base',
  imports: [TUploadModule],
  template: `
    <div style="display: flex; flex-direction: column; gap: 12px; max-width: 520px">
      <t-upload
        multiple
        accept=".txt,.md,.pdf,.png,.jpg"
        [max]="5"
        [sizeLimit]="sizeLimit"
        [requestMethod]="requestMethod"
        [mockProgressDuration]="120"
        (success)="handleResult(true)"
        (fail)="handleResult(false)"
      />
      <p style="margin: 0; font-size: 13px">最近一次上传结果：{{ result() }}</p>
    </div>
  `,
})
export class DemoUploadBase {
  protected readonly sizeLimit = { size: 2, unit: 'MB' as const };

  protected readonly result = signal('尚未上传');

  protected readonly requestMethod = mockUpload;

  protected handleResult(success: boolean): void {
    this.result.set(success ? '上传成功' : '上传失败');
  }
}
