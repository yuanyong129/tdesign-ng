import { Component, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TButton, TCheckbox, TForm, TFormItem, TInput, TInputNumber, TTagInput, type FormResetType, type FormRule, type FormRules, type FormValidateResult } from '@tdesign-ng/components';

@Component({
  selector: 'demo-form-lifecycle',
  imports: [TForm, TFormItem, TInput, TInputNumber, TTagInput, TCheckbox, TButton, ReactiveFormsModule, FormsModule],
  template: `
    @if (mounted()) {
      <t-form #form [id]="formId()" [disabled]="disabled()" [resetType]="resetType()" [rules]="rules()"
        [errorMessage]="errorMessage()" [submitWithWarningMessage]="allowWarnings()"
        (submit)="submits.set(submits() + 1)" (reset)="resets.set(resets() + 1)" (validate)="validates.set(validates() + 1)">
        <t-form-item label="名称" [name]="fieldName()" [rules]="ownRules()">
          <t-input [formControl]="name" />
          <t-button size="small" type="button">同项内辅助操作</t-button>
        </t-form-item>
        <t-form-item label="数量" name="count"><t-input-number [formControl]="count" /></t-form-item>
        <t-form-item label="是否启用" name="enabled"><t-checkbox [formControl]="enabled">启用</t-checkbox></t-form-item>
        <t-form-item label="预先禁用" name="locked"><t-input [formControl]="locked" /></t-form-item>
        <t-form-item label="标签" name="tags"><t-tag-input [formControl]="tags" /></t-form-item>
        @if (extra()) { <t-form-item label="动态字段" name="extra"><t-input [formControl]="extraControl" /></t-form-item> }
        <t-form-item>
          <t-button type="submit" theme="primary">提交</t-button>
          <t-button type="reset">重置</t-button>
        </t-form-item>
      </t-form>
      <t-button size="small" (click)="form.clearValidate()">清除校验</t-button>
    }
    <p class="demo-hint">resetType：{{ resetType() }}；提交 {{ submits() }} 次；重置 {{ resets() }} 次。异步校验待确认时可继续编辑，旧结果不会覆盖新值；字段变化或重置会取消本次提交。</p>
    <t-button size="small" (click)="disabled.set(!disabled())">整体禁用</t-button>
    <t-button size="small" (click)="resetType.set(resetType() === 'empty' ? 'initial' : 'empty')">切换重置方式</t-button>
    <t-button size="small" (click)="extra.set(!extra())">增删字段</t-button>
    <t-button size="small" (click)="useAsyncRules()">使用异步规则</t-button>
    <t-button size="small" (click)="finish(true)">校验通过</t-button>
    <t-button size="small" (click)="finish(false)">校验失败</t-button>
    <t-button size="small" (click)="fail()">校验请求失败</t-button>
    <t-form class="ngmodel-form" resetType="initial">
      <t-form-item label="模板表单初值" name="text"><t-input name="text" [(ngModel)]="model" /></t-form-item>
    </t-form>
    @if (mirror()) {
      <t-form class="mirror-form" [disabled]="mirrorDisabled()">
        <t-form-item label="共享控件"><t-input [formControl]="name" /></t-form-item>
      </t-form>
    }
  `,
})
export class DemoFormLifecycle {
  readonly name = new FormControl('初始名称', { nonNullable: true });
  readonly count = new FormControl<number | null>(3);
  readonly enabled = new FormControl(true, { nonNullable: true });
  readonly locked = new FormControl({ value: '保留禁用', disabled: true }, { nonNullable: true });
  readonly tags = new FormControl<string[]>(['a'], { nonNullable: true });
  readonly extraControl = new FormControl('动态初始值', { nonNullable: true });
  readonly mounted = signal(true);
  readonly extra = signal(false);
  readonly mirror = signal(false);
  readonly mirrorDisabled = signal(false);
  readonly formId = signal('lifecycle-native-form');
  readonly disabled = signal(false);
  readonly resetType = signal<FormResetType>('empty');
  readonly fieldName = signal('name');
  readonly errorMessage = signal<string | undefined>(undefined);
  readonly allowWarnings = signal(false);
  readonly ownRules = signal<FormRule[] | undefined>(undefined);
  readonly rules = signal<FormRules>({ name: [{ required: true, message: '名称必填', trigger: 'blur' }] });
  readonly submits = signal(0);
  readonly resets = signal(0);
  readonly validates = signal(0);
  readonly requests: { resolve: (result: FormValidateResult | boolean) => void; reject: (error: Error) => void }[] = [];
  model = '模板初始值';
  useAsyncRules(): void {
    this.rules.set({ name: [{ validator: () => new Promise((resolve, reject) => this.requests.push({ resolve, reject })), message: '异步校验失败' }] });
  }
  finish(result: boolean): void { this.requests.shift()?.resolve(result); }
  fail(): void { this.requests.shift()?.reject(new Error('模拟校验请求失败')); }
}
