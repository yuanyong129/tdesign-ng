import { css, cssPartial } from '@microsoft/fast-element';
import { getTypeColors, getDefaultColor } from '../../style/index';
import { getPrefixCls } from '../_utils/global-config';

export const prefixCls = getPrefixCls('btn');

const primary6 = cssPartial`color: ${getTypeColors('--primary-6')};`;
const bgPrimary6 = cssPartial`background-color: ${getTypeColors('--primary-6')};`;
const colorText2 = cssPartial`color: ${getDefaultColor('--color-text-2')};`;
const colorFill2 = cssPartial`background-color: ${getDefaultColor('--color-fill-2')};`;
const colorFill3 = cssPartial`background-color: ${getDefaultColor('--color-fill-3')};`;
const colorFill4 = cssPartial`background-color: ${getDefaultColor('--color-fill-4')};`;

/** 按钮大小样式表 */
const btnSizeStyles = css`
  .${prefixCls}-size-mini {
    padding: 0 11px;
    height: 24px;
    border-radius: 2px;
    font-size: 12px;
  }
  .${prefixCls}-size-small {
    padding: 0 15px;
    height: 28px;
    border-radius: 2px;
    font-size: 14px;
  }
  .${prefixCls}-size-medium {
    font-size: 14px;
    padding: 0 15px;
    height: 32px;
    border-radius: 2px;
  }
  .${prefixCls}-size-large {
    padding: 0 19px;
    height: 36px;
    border-radius: 2px;
    font-size: 14px;
  }
`;

const primaryStatusStyles = ['success', 'warning', 'danger'].map(item => css`
  .${prefixCls}-primary.${prefixCls}-status-${item} {
    background-color: ${getTypeColors('--'+ item + '-6')};
  }
  .${prefixCls}-primary.${prefixCls}-status-${item}:hover {
    background-color: ${getTypeColors('--'+ item + '-5')};
  }
  .${prefixCls}-primary.${prefixCls}-status-${item}:active {
    background-color: ${getTypeColors('--'+ item + '-7')};
  }
`);

/** 普通按钮样式 */
const primaryBtnStyles = css`
  .${prefixCls}-primary {
    ${bgPrimary6}
    color: white;
    border: 1px solid transparent;
  }
  .${prefixCls}-primary:hover {
    background-color: ${getTypeColors('--primary-5')};
  }
  .${prefixCls}-primary:active {
    background-color: ${getTypeColors('--primary-7')};
  }
  ${primaryStatusStyles[0]}
  ${primaryStatusStyles[1]}
  ${primaryStatusStyles[2]}
`

const secondaryStatusStyles = ['success', 'warning', 'danger'].map(item => css`
  .${prefixCls}-secondary.${prefixCls}-status-${item} {
    color: ${getTypeColors('--'+ item + '-6')};
    background-color: ${getDefaultColor('--color-'+ item + '-light-1')};
  }
  .${prefixCls}-secondary.${prefixCls}-status-${item}:hover {
    background-color: ${getDefaultColor('--color-'+ item + '-light-2')};
  }
  .${prefixCls}-secondary.${prefixCls}-status-${item}:active {
    background-color: ${getDefaultColor('--color-'+ item + '-light-3')};
  }
`);
console.log(secondaryStatusStyles)
/** 次级按钮样式 */
const secondaryBtnStyles = css`
  .${prefixCls}-secondary {
    ${colorText2}
    background-color: rgb(242, 243, 245);
    border: 1px solid transparent;
  }
  .${prefixCls}-secondary:hover {
    background-color: rgb(229, 230, 235);
    border-color: transparent;
  }
  .${prefixCls}-secondary:active {
    background-color: rgb(201, 205, 212);
    border-color: transparent;
  }
  ${secondaryStatusStyles[0]}
  ${secondaryStatusStyles[1]}
  ${secondaryStatusStyles[2]}
`
/** 边框按钮样式 */
const outlineBtnStyles = css`
  .${prefixCls}-outline  {
    ${primary6}
    background-color: transparent;
    border: 1px solid ${getTypeColors('--primary-6')};
  }
  .${prefixCls}-outline:hover {
    color: ${getTypeColors('--primary-5')};
    border-color: ${getTypeColors('--primary-5')};
  }

  .${prefixCls}-outline:active  {
    color: ${getTypeColors('--primary-7')};
    border-color: ${getTypeColors('--primary-7')};
  }
`;
/** 虚线按钮样式 */
const dashedBtnStyles = css`
  .${prefixCls}-dashed {
    ${colorText2}
    ${colorFill2}
    border: 1px dashed ${getDefaultColor('--color-neutral-3')};
  }
  .${prefixCls}-dashed:hover {
    ${colorFill3}
    border-color: ${getDefaultColor('--color-neutral-4')};
  }
  .${prefixCls}-dashed:active {
    ${colorFill4}
    border-color: ${getDefaultColor('--color-neutral-5')};
  }
`;
/** 文字按钮样式 */
const textBtnStyles = css`
  .${prefixCls}-text {
    ${primary6}
    background-color: transparent;
    border: 1px solid transparent;
  }
  .${prefixCls}-text:hover {
    ${colorFill2}
    border-color: transparent;
  }
  .${prefixCls}-text:active {
    ${colorFill3}
    border-color: transparent;
  }
`;

export const styles = css`
  .${prefixCls} {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    font-weight: 400;
    line-height: 1.5715;
    white-space: nowrap;
    outline: none;
    cursor: pointer;
    transition: all .1s cubic-bezier(0,0,1,1);
    user-select: none;
  }
  ${ btnSizeStyles }
  ${ primaryBtnStyles }
  ${ secondaryBtnStyles }
  ${ dashedBtnStyles }
  ${ outlineBtnStyles }
  ${ textBtnStyles }
`