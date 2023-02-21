import { css } from '@microsoft/fast-element';
import { primaryColor } from '../../style/index';
import { getPrefixCls } from '../_utils/global-config';

export const prefixCls = getPrefixCls('btn');

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
    .${prefixCls}-size-mini {
      padding: 0 11px;
      height: 24px;
      border-radius: 2px;
    }
    .${prefixCls}-size-small {
      padding: 0 15px;
      height: 28px;
      border-radius: 2px;
    }
    .${prefixCls}-size-medium {
      padding: 0 15px;
      height: 32px;
      border-radius: 2px;
    }
    .${prefixCls}-size-large {
      padding: 0 19px;
      height: 36px;
      border-radius: 2px;
    }
    
    .${prefixCls}-outline  {
      color: ${primaryColor};
      background-color: white;
      border: 1px solid ${primaryColor};
    }

    .${prefixCls}-outline:active  {
      color: rgb(14, 66, 210);
      border-color: rgb(14, 66, 210);
    }

    .${prefixCls}-primary {
      background-color: ${primaryColor};
      color: white;
      border: 1px solid transparent;
    }
    .${prefixCls}-primary:hover {
      background-color: rgb(64,128,255);
    }
    .${prefixCls}-primary:active {
      background-color: rgb(14, 66, 210);
    }
  `