import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TButton, TSwitch, type SwitchValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-switch-guard',
  imports: [TSwitch, TButton, ReactiveFormsModule],
  template: `
    <div style="display: flex; gap: 24px; align-items: center">
      @if (mounted()) {
        <t-switch class="guarded-switch" [value]="value()" [beforeChange]="guard" [disabled]="disabled()" [loading]="loading()"
          [customValue]="customValue()" [label]="['开', '关']" (valueChange)="accept($event)" (change)="changes.set(changes() + 1)" />
      }
      <t-switch class="default-switch" [defaultValue]="initial()" [customValue]="['on', 'off']" [label]="['默认开', '默认关']" />
      <t-switch class="form-switch" [formControl]="control" [customValue]="['on', 'off']" [label]="['表单开', '表单关']" />
    </div>
    <p class="demo-hint">待确认时重复点击不会再次请求；禁用、程序改值、配置变化或销毁后，旧确认不再生效。当前 {{ value() }}；请求 {{ calls() }} 次；change {{ changes() }} 次。</p>
    <t-button size="small" (click)="finish(true)">同意切换</t-button>
    <t-button size="small" (click)="finish(false)">拒绝切换</t-button>
    <t-button size="small" (click)="fail()">模拟请求失败</t-button>
    <t-button size="small" (click)="disabled.set(!disabled())">切换禁用</t-button>
    <t-button size="small" (click)="mounted.set(!mounted())">挂载/销毁</t-button>
    <t-button size="small" (click)="control.reset()">重置表单</t-button>
  `,
})
export class DemoSwitchGuard {
  readonly value = signal<SwitchValue>(false);
  readonly initial = signal<SwitchValue>('on');
  readonly customValue = signal<[SwitchValue, SwitchValue]>([true, false]);
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly mounted = signal(true);
  readonly acceptChanges = signal(true);
  readonly mode = signal<'async' | 'allow' | 'deny' | 'throw'>('async');
  readonly calls = signal(0);
  readonly changes = signal(0);
  readonly control = new FormControl<SwitchValue>('off', { nonNullable: true, updateOn: 'blur' });
  private resolve?: (allowed: boolean) => void;
  private reject?: (reason: Error) => void;
  readonly guard = (): boolean | Promise<boolean> => {
    this.calls.update((count) => count + 1);
    if (this.mode() === 'allow') return true;
    if (this.mode() === 'deny') return false;
    if (this.mode() === 'throw') throw new Error('模拟拦截器失败');
    return new Promise<boolean>((resolve, reject) => { this.resolve = resolve; this.reject = reject; });
  };
  accept(value: SwitchValue): void { if (this.acceptChanges()) this.value.set(value); }
  finish(allowed: boolean): void { this.resolve?.(allowed); this.resolve = undefined; this.reject = undefined; }
  fail(): void { this.reject?.(new Error('模拟请求失败')); this.resolve = undefined; this.reject = undefined; }
}
