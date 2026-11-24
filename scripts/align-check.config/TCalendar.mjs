

export default {
    upstream: 'calendar',
    upstreamInterface: 'TdCalendarProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      onCellClick: "Angular 用 (cellClick) 输出表达单元格点击事件",
      onCellDoubleClick: "Angular 用 (cellDoubleClick) 输出表达单元格双击事件",
      onCellRightClick: "Angular 用 (cellRightClick) 输出表达单元格右键事件",
      onControllerChange: "Angular 用 (controllerChange) 输出表达视图切换",
      onMonthChange: "Angular 用 (monthChange) 输出表达月份变化",
    },
  };
