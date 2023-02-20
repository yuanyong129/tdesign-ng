import { html, css, attr } from '@microsoft/fast-element';
import { FoundationElement } from '@microsoft/fast-foundation';
import { primaryColor } from '../style/index';

const template = html<ArcoButton>`
  <div class="arco-btn ${x => x.type}" style="color: ${x => x.color};"> 
    <slot></slot>
  </div>
`

const styles = css`
  .arco-btn {
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
  .primary {
    padding: 0 15px;
    height: 32px;
    line-height: 32px;
    border-radius: 2px;
    background-color: ${primaryColor};
    border: 1px solid transparent;
  }
  .primary:hover {
    background-color: rgb(64,128,255) !important;
  }
`

type ButtonType = 'primary' | 'secondary' | 'dashed' | 'outline' | 'text'

export class ArcoButton extends FoundationElement {
  @attr color: string = '#FFFFFF';

  @attr type: ButtonType = 'primary';
}


export const arcoButton = ArcoButton.compose({
  baseName: 'button',
  template,
  styles,
})