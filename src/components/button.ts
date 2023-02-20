import { html, css, attr } from '@microsoft/fast-element';
import { FoundationElement } from '@microsoft/fast-foundation';
import { primaryColor } from '../style/index';

const template = html<ArcoButton>`
  <div class="${x => x.getClassName()}"> 
    <slot></slot>
  </div>
`

const prefix = 'arco-btn';

const styles = css`
  .${prefix} {
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
  .${prefix}-mini {
    padding: 0 11px;
    height: 24px;
    border-radius: 2px;
  }
  .${prefix}-small {
    padding: 0 15px;
    height: 28px;
    border-radius: 2px;
  }
  .${prefix}-medium {
    padding: 0 15px;
    height: 32px;
    border-radius: 2px;
  }
  .${prefix}-large {
    padding: 0 19px;
    height: 36px;
    border-radius: 2px;
  }
  
  .${prefix}-outline  {
    color: ${primaryColor};
    background-color: white;
    border: 1px solid ${primaryColor};
  }

  .${prefix}-outline:active  {
    color: rgb(14, 66, 210);
    border-color: rgb(14, 66, 210);
  }

  .${prefix}-primary {
    background-color: ${primaryColor};
    color: white;
    border: 1px solid transparent;
  }
  .${prefix}-primary:hover {
    background-color: rgb(64,128,255);
  }
  .${prefix}-primary:active {
    background-color: rgb(14, 66, 210);
  }
`

type ButtonType = 'primary' | 'secondary' | 'dashed' | 'outline' | 'text';
type ButtonSize = 'large' | 'medium' | 'small' | 'mini';

export class ArcoButton extends FoundationElement {

  @attr type: ButtonType = 'primary';

  @attr size: ButtonSize = 'medium';

  getClassName = () => {
    return `arco-btn arco-btn-${this.type} arco-btn-${this.size}`;
  }
}


export const arcoButton = ArcoButton.compose({
  baseName: 'button',
  template,
  styles,
})