import { Component } from '@angular/core';
import { TAlertModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-alert-title',
  imports: [TAlertModule, TSpaceModule],
  template: `
    <ng-template #upgradeAction><span (click)="onUpgrade()">立即升级</span></ng-template>

    <t-space direction="vertical" [size]="16">
      <t-alert theme="success" title="创建成功" message="项目已经创建，正在初始化依赖。" />
      <t-alert
        theme="info"
        title="有新版本 v1.2.0"
        message="升级后可以使用告警分组与静默规则。"
        [operation]="upgradeAction"
      />
      <t-alert
        theme="warning"
        title="配额即将用尽"
        [maxLine]="2"
        message="当前实例的磁盘使用率已经达到 92%，继续写入会影响告警送达。建议先清理历史日志，或者扩容后继续使用；这条说明超出两行时会被截断。"
      />
    </t-space>
  `,
})
export class DemoAlertTitle {
  protected onUpgrade(): void {
    // 操作区内容由使用方提供，这里只演示它可以承载交互。
  }
}
