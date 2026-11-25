export default {
  upstream: 'pagination',
  upstreamInterface: 'TdPaginationProps',
  renames: {},
  angularOnly: [],
  ignoreUpstream: {
    // Vue 的 v-model 在 Angular 用「值输入 + 变化输出」表达，不是功能缺口
    modelValue: 'Angular 用 [current]/[(current)] 与 (currentChange) 表达 v-model 语义',
    onChange: 'Angular 用 (change) 输出，携带 PageInfo',
    onCurrentChange: 'Angular 用 (currentChange) 输出',
    onPageSizeChange: 'Angular 用 (pageSizeChange) 输出',
  },
};
