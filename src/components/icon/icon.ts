import { FoundationElement } from '@microsoft/fast-foundation';
import { html } from '@microsoft/fast-element';
import { styles } from './icon.style';

const template = html<ArcoIcon>`
  <div></div>
`;

export class ArcoIcon extends FoundationElement {

}

export const arcoIcon = ArcoIcon.compose({
  baseName: 'icon',
  template,
  styles,
  shadowOptions: {
    delegatesFocus: false
  }
})