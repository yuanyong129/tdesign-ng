import { getPrefixCls } from '../_utils/global-config';
import { getDefaultColor } from '../../style/color';
import { css } from '@microsoft/fast-element';

export const prefixCls = getPrefixCls('divider');

export const styles = css`
  .${prefixCls}-horizontal {
    position: relative;
    clear: both;
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    border-color: ${getDefaultColor('--color-neutral-3')};
  }

  .${prefixCls}-vertical {
    display: inline-block;
    min-width: 1px;
    max-width: 1px;
    height: 1em;
    margin: 0 12px;
    vertical-align: middle;
    border-left: 1px solid ${getDefaultColor('--color-neutral-3')};
  }
`;