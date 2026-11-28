

export default {
    upstream: 'tabs',
    upstreamInterface: 'TdTabsProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'modelValue': 'Angular 用 value（受控）/ defaultValue',
      'onAdd': 'Angular 用 (add) 输出，payload { e }',
      'onChange': 'Angular 用 (change) 输出',
      'onDragSort': 'Angular 用 (dragSortChange) 输出',
      'onRemove': 'Angular 用 (remove) 输出，payload { value, index, e }',
    },
  };
