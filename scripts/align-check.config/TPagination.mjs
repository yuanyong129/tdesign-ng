

export default {
    upstream: 'pagination',
    upstreamInterface: 'TdPaginationProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'modelValue': 'Angular 用 [(current)] 双向绑定',
      'defaultCurrent': 'Angular 用 [current] 作为受控初始值',
      'defaultPageSize': 'Angular 用 [pageSize] 作为受控初始值',
      'selectProps': '每页条数选择器用内置 t-select，暂不透传属性',
      'onChange': 'Angular 用 (change) 输出，携带 PageInfo',
      'onCurrentChange': 'Angular 用 (currentChange) 输出',
      'onPageSizeChange': 'Angular 用 (pageSizeChange) 输出',
    },
  };
