import { Component, computed, signal, viewChild } from '@angular/core';
import {
  TButtonModule,
  TUpload,
  TUploadModule,
  type RequestMethodResponse,
  type UploadFile,
} from '@tdesign-ng/components';

/** 示例用自定义上传：不发起真实请求，延时后返回成功，进度由 mock 进度驱动。 */
function mockUpload(): Promise<RequestMethodResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        status: 'success',
        response: { url: 'data:text/plain;charset=utf-8,upload-list', uploadTime: '2026-01-01 10:00:00' },
      });
    }, 1000);
  });
}

@Component({
  selector: 'demo-upload-list',
  imports: [TUploadModule, TButtonModule],
  template: `
    <div style="display: flex; flex-direction: column; gap: 12px; max-width: 560px">
      <t-upload
        [(files)]="files"
        multiple
        [autoUpload]="false"
        [requestMethod]="requestMethod"
        [mockProgressDuration]="100"
        [fileListDisplay]="fileList"
      />
      <ng-template #fileList let-files="files">
        <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px">
          @for (file of files; track $index) {
            <div style="display: flex; align-items: center; gap: 8px; font-size: 13px">
              <span style="flex: 1">{{ file.name }}</span>
              <span>{{ statusText(file) }}</span>
            </div>
          }
        </div>
      </ng-template>
      <div style="display: flex; gap: 8px">
        <t-button [disabled]="pendingCount() === 0" (click)="uploader().uploadFiles()">上传全部</t-button>
        <t-button theme="danger" variant="outline" (click)="uploader().triggerUpload($event)">继续选择</t-button>
      </div>
      <p style="margin: 0; font-size: 13px">待上传 {{ pendingCount() }} 个，已完成 {{ successCount() }} 个</p>
    </div>
  `,
})
export class DemoUploadList {
  protected readonly files = signal<UploadFile[]>([]);

  protected readonly requestMethod = mockUpload;

  private readonly uploaderRef = viewChild.required(TUpload);

  protected readonly pendingCount = computed(
    () => this.files().filter((file) => file.status === 'waiting' || file.status === 'progress').length,
  );

  protected readonly successCount = computed(() => this.files().filter((file) => file.status === 'success').length);

  /** 模板里取组件实例，避免在模板表达式里直接访问 viewChild 签名。 */
  protected uploader(): TUpload {
    return this.uploaderRef();
  }

  /** 文件状态的中文文案。 */
  protected statusText(file: UploadFile): string {
    switch (file.status) {
      case 'progress':
        return `上传中 ${file.percent ?? 0}%`;
      case 'waiting':
        return '待上传';
      case 'success':
        return '上传成功';
      case 'fail':
        return '上传失败';
      default:
        return '待上传';
    }
  }
}
