

export default {
    upstream: 'select-input',
    upstreamInterface: 'TdSelectInputProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      prefixIcon: 'Angular 用内容投影指令 [tSelectInputPrefixIcon] 传入模板，避免与字符串类 input 冲突',
      suffixIcon: 'Angular 用内容投影指令 [tSelectInputSuffixIcon] 传入模板，同上',
      onBlur: 'Angular 用 (blur) 输出',
      onClear: 'Angular 用 (clear) 输出',
      onEnter: 'Angular 用 (enter) 输出',
      onFocus: 'Angular 用 (focus) 输出',
      onInputChange: 'Angular 用 (inputChange) 输出',
      onPaste: 'Angular 用 (paste) 输出',
      onPopupVisibleChange: 'Angular 用 (popupVisibleChange) 输出，支持 [(popupVisible)]',
      onTagChange: 'Angular 用 (tagChange) 输出',
      onMouseenter: 'Angular 用宿主原生 (mouseenter)，参数 MouseEvent，包含提示区',
      onMouseleave: 'Angular 用宿主原生 (mouseleave)，参数 MouseEvent，包含提示区',
    },
  };
