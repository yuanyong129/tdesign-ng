

export default {
    upstream: 'select-input',
    upstreamInterface: 'TdSelectInputProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      inputProps: '[D2] 把任意 TInput 属性透传到内部输入框，需要重构输入框渲染；当前按 t-input 结构复刻',
      tagInputProps: '[D2] 同上，多选标签区用 t-tag-input 类结构手写，标签能力已由 tagProps/minCollapsedNum/collapsedItems/tag 覆盖',
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
      onMouseenter: '[D3] 宿主是原生元素，直接监听 (mouseenter)',
      onMouseleave: '[D3] 宿主是原生元素，直接监听 (mouseleave)',
    },
  };
