import { FASTElement, customElement, html, css, attr } from '@microsoft/fast-element';

let prefix = 'primary';

const btnPrefixCls = `${prefix}-btn`;

const template = html<ArcoButton>`
  <div class="${btnPrefixCls}" style="color: ${x => x.color};"> 
    <slot></slot>
  </div>
`

const styles = css`
  \.${btnPrefixCls} {
    position: relative;
    color: red;
  }
`

@customElement({
  name: 'a-button',
  template,
  styles
})
export class ArcoButton extends FASTElement {
  @attr color: string = '#BFC';
}