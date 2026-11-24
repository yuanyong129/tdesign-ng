

export default {
    upstream: 'color-picker',
    upstreamInterface: 'TdColorPickerProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      onChange: "Angular 用 (change) 输出，参数 { value, color, trigger }",
      onClear: "Angular 用 (clear) 输出，参数 { e }",
      onPaletteBarChange: "Angular 用 (paletteBarChange) 输出，参数 { color }",
      onRecentColorsChange: "Angular 用 (recentColorsChange) 输出，参数 string[]",
    },
  };
