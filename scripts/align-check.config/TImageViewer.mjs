

export default {
    upstream: 'image-viewer',
    upstreamInterface: 'TdImageViewerProps',
    renames: {},
    angularOnly: ['visibleChange'],
    ignoreUpstream: {
      attach: '[D2] Angular 不做 Teleport，预览层本身就是 position: fixed 全屏层',
      viewerScale: '[D3] 上游桌面端 image-viewer 未消费该属性，属旧版死配置',
      modelValue: 'Angular 用 [(visible)] 双向绑定 + (visibleChange) 表达同一语义',
      onClose: 'Angular 用 (close) 输出，参数 { trigger, e }',
      onDownload: 'Angular 用 (download) 输出，参数 string | File',
      onIndexChange: 'Angular 用 (indexChange) 输出，参数 { index, trigger }',
    },
  };
