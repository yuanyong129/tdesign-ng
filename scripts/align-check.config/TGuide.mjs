

export default {
    upstream: 'guide',
    upstreamInterface: 'TdGuideProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      modelValue: '[D3] Angular 用 current 单项绑定 + (change)/(currentChange) 表达向导当前步，未提供双向绑定语法糖',
      onChange: 'Angular 用 (change) 输出，参数 GuideChangeContext',
      onFinish: 'Angular 用 (finish) 输出，参数 GuideFinishContext',
      onNextStepClick: 'Angular 用 (next) 输出',
      onPrevStepClick: 'Angular 用 (prev) 输出',
      onSkip: 'Angular 用 (skip) 输出',
    },
  };
