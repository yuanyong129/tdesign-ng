import { Component, computed, signal, viewChild, type TemplateRef } from '@angular/core';
import { TButton, TStepItem, TSteps, type StepOption, type StepSequence, type StepLayout, type StepSeparator, type StepTheme, type StepValue, type StepsChangeEvent } from '@tdesign-ng/components';

let stepCounterId = 0;

@Component({
  selector: 'demo-steps-sequence-counter',
  imports: [TButton],
  template: `<t-button size="small" variant="outline" type="button" (click)="increment($event)">实例 {{ instance }}，计数 {{ count() }}</t-button>`,
})
export class DemoStepsSequenceCounter {
  readonly instance = ++stepCounterId;
  readonly count = signal(0);
  increment(e: MouseEvent): void { e.stopPropagation(); this.count.update((n) => n + 1); }
}

@Component({
  selector: 'demo-steps-sequence',
  imports: [TSteps, TStepItem, TButton, DemoStepsSequenceCounter],
  template: `
    <ng-template #description><demo-steps-sequence-counter class="option-counter" /></ng-template>
    <ng-template #icon><span class="custom-step-icon">★</span></ng-template>
    <ng-template #title><span class="live-step-title">{{ titleText() }}</span></ng-template>
    <div style="display:grid;gap:32px">
      <t-steps class="sequence-options" [options]="options()" [current]="current()" [sequence]="sequence()" [layout]="layout()"
        [theme]="theme()" [separator]="separator()" [readonly]="readonly()" (currentChange)="accept($event)" (change)="record($event)">
        <t-step-item value="fallback" title="投影回退"><span class="fallback-content">数据为空时回退</span></t-step-item>
      </t-steps>
      <t-steps class="sequence-projected" [sequence]="sequence()" [layout]="layout()" [separator]="separator()" [theme]="theme()"
        [defaultCurrent]="initial()" [readonly]="readonly()" (currentChange)="projectedChanges.set(projectedChanges() + 1)">
        @for (item of projected(); track item) {
          <t-step-item [attr.data-key]="item" [title]="'投影步骤 ' + item" [extra]="item === 1 ? title : undefined">
            <demo-steps-sequence-counter />
          </t-step-item>
        }
      </t-steps>
    </div>
    <p class="demo-hint">当前 {{ current() }}；切换提案 {{ changes() }} 次；上次 {{ previous() }} → {{ proposed() }}（{{ eventType() }}）。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <t-button size="small" (click)="sequence.set(sequence() === 'positive' ? 'reverse' : 'positive')">切换正序/逆序</t-button>
      <t-button size="small" (click)="layout.set(layout() === 'horizontal' ? 'vertical' : 'horizontal')">切换方向</t-button>
      <t-button size="small" (click)="separator.set(separator() === 'arrow' ? 'line' : 'arrow')">切换箭头连接线</t-button>
      <t-button size="small" (click)="theme.set(theme() === 'dot' ? 'default' : 'dot')">切换圆点主题</t-button>
      <t-button size="small" (click)="readonly.set(!readonly())">切换只读</t-button>
      <t-button size="small" (click)="acceptChanges.set(!acceptChanges())">接收/拒绝提案</t-button>
      <t-button size="small" (click)="withIcon.set(!withIcon())">切换自定义图标</t-button>
      <t-button size="small" (click)="titleText.set(titleText() === '附加内容' ? '内容已更新' : '附加内容')">更新模板文字</t-button>
      <t-button size="small" (click)="projected.update(removeLast)">删除投影末项</t-button>
    </div>
  `,
})
export class DemoStepsSequence {
  private readonly description = viewChild<TemplateRef<unknown>>('description');
  private readonly icon = viewChild<TemplateRef<unknown>>('icon');
  readonly data = signal<StepOption[]>([{ value: 'one', title: '第一步' }, { value: 'two', title: '第二步' }, { value: 'three', title: '第三步' }]);
  readonly options = computed(() => this.data().map((item) => ({ ...item,
    content: item.value === 'one' ? this.description() : item.content,
    icon: item.value === 'two' && this.withIcon() ? this.icon() : item.icon,
  })));
  readonly current = signal<StepValue>('two');
  readonly initial = signal<StepValue>(1);
  readonly sequence = signal<StepSequence>('positive');
  readonly layout = signal<StepLayout>('horizontal');
  readonly separator = signal<StepSeparator>('line');
  readonly theme = signal<StepTheme>('default');
  readonly readonly = signal(false);
  readonly acceptChanges = signal(true);
  readonly withIcon = signal(false);
  readonly titleText = signal('附加内容');
  readonly changes = signal(0);
  readonly previous = signal<StepValue | undefined>(undefined);
  readonly proposed = signal<StepValue | undefined>(undefined);
  readonly eventType = signal('');
  readonly projectedChanges = signal(0);
  readonly projected = signal([1, 2, 3]);
  readonly removeLast = (items: number[]) => items.slice(0, -1);
  accept(value: StepValue): void { if (this.acceptChanges()) this.current.set(value); }
  record(event: StepsChangeEvent): void {
    this.changes.update((n) => n + 1); this.previous.set(event.previous); this.proposed.set(event.current); this.eventType.set(event.e?.type ?? 'programmatic');
  }
}
