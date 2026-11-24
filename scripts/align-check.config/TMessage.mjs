

export default {
    upstream: 'message',
    upstreamInterface: 'TdMessageProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      'onClose': 'Angular 用 (close) 输出，携带 trigger 与原始事件',
      'onCloseBtnClick': 'Angular 用 (closeBtnClick) 输出',
      'onDurationEnd': '到时关闭会触发 (close)，trigger 为 duration-end',
    },
  };
