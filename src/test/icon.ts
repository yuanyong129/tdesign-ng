import { FASTElement, html, css, customElement } from '@microsoft/fast-element';

const template = html`
  <div style="display: grid; width: 100%; grid-template-columns: repeat(18, 1fr);">
    <div class="icon-item">
      <icon-apps></icon-apps>
      <span>icon-apps</span>
    </div>
    <div class="icon-item">
      <icon-archive></icon-archive>
      <span>icon-archive</span>
    </div>
    <div class="icon-item">
      <icon-bar-chart></icon-bar-chart>
      <span>icon-bar-chart</span>
    </div>
    <div class="icon-item">
      <icon-book></icon-book>
      <span>icon-book</span>
    </div>
    <div class="icon-item">
      <icon-bookmark></icon-bookmark>
      <span>icon-bookmark</span>
    </div>
    <div class="icon-item">
      <icon-branch></icon-branch>
      <span>icon-branch</span>
    </div>
    <div class="icon-item">
      <icon-bug></icon-bug>
      <span>icon-bug</span>
    </div>
    <div class="icon-item">
      <icon-bulb></icon-bulb>
      <span>icon-bulb</span>
    </div>
    <div class="icon-item">
      <icon-calendar-clock></icon-calendar-clock>
      <span>icon-calendar-clock</span>
    </div>
    <div class="icon-item">
      <icon-calendar></icon-calendar>
      <span>icon-calendar</span>
    </div>
    <div class="icon-item">
      <icon-camera></icon-camera>
      <span>icon-camera</span>
    </div>
    <div class="icon-item">
      <icon-cloud></icon-cloud>
      <span>icon-cloud</span>
    </div>
    <div class="icon-item">
      <icon-command></icon-command>
      <span>icon-command</span>
    </div>
    <div class="icon-item">
      <icon-common></icon-common>
      <span>icon-common</span>
    </div>
    <div class="icon-item">
      <icon-compass></icon-compass>
      <span>icon-compass</span>
    </div>
    <div class="icon-item">
      <icon-computer></icon-computer>
      <span>icon-computer</span>
    </div>
    <div class="icon-item">
      <icon-copyright></icon-copyright>
      <span>icon-copyright</span>
    </div>
    <div class="icon-item">
      <icon-loading></icon-loading>
      <span>icon-loading</span>
    </div>
  </div>
`;

const styles = css`
  .icon-item {
    display: flex;
    align-items: center;
    flex-direction: column;
    font-size: 14px;
    text-align: center;
  }
`;

@customElement({
  name: 'icon-test',
  template,
  styles
})
export class IconTest extends FASTElement {


}