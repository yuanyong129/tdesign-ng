import { FoundationElement } from '@microsoft/fast-foundation';
import { html } from '@microsoft/fast-element';
import { styles, prefixCls } from './divider.style';

const template = html<ArcoDivider>`
  <div class="${x => x.cls()}">
  </div>
`;

export class ArcoDivider extends FoundationElement {
  cls = () => {
    return [
      prefixCls
    ].join('')
  }
}

export const arcoDivider = ArcoDivider.compose({
  baseName: 'divider',
  baseClass: ArcoDivider,
  template,
  styles
})