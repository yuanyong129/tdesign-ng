import { css } from '@microsoft/fast-element';
import { getPrefixCls } from '../_utils/global-config';

export const prefixCls = getPrefixCls('space');

export const styles = css`
  .${prefixCls} {
    display: inline-flex;
  }
  .${prefixCls}-horizontal .${prefixCls}-item {
    display: flex;
    align-items: center;
  }

  .${prefixCls}-vertical {
    flex-direction: column;
  }
  .${prefixCls}-fill {
    display: flex;
  }
  .${prefixCls}-align-baseline {
    align-items: baseline;
  }

  .${prefixCls}-align-start {
    align-items: flex-start;
  }

  .${prefixCls}-align-end {
    align-items: flex-end;
  }

  .${prefixCls}-align-center {
    align-items: center;
  }

  .${prefixCls}-wrap {
    flex-wrap: wrap;
  }
`;