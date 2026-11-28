

export default {
    upstream: 'message',
    upstreamInterface: 'TdMessageProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'onClose': 'Angular 用 (close) 输出，携带 trigger 与原始事件',
      'onCloseBtnClick': 'Angular 用 (closeBtnClick) 输出',
      'onDurationEnd': 'Angular 用独立 (durationEnd) 输出，仅自动到时触发',
    },
  };
