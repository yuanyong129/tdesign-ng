import { FASTElement, html, css, customElement } from '@microsoft/fast-element';

const template = html<IconTest>`
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
      <icon-dashboard></icon-dashboard>
      <span>icon-dashboard</span>
    </div>
    <div class="icon-item">
      <icon-desktop></icon-desktop>
      <span>icon-desktop</span>
    </div>
    <div class="icon-item">
      <icon-dice></icon-dice>
      <span>icon-dice</span>
    </div>
    <div class="icon-item">
      <icon-drag-dot-vertical></icon-drag-dot-vertical>
      <span>icon-drag-dot-vertical</span>
    </div>
    <div class="icon-item">
      <icon-drag-dot></icon-drag-dot>
      <span>icon-drag-dot</span>
    </div>
    <div class="icon-item">
      <icon-drive-file></icon-drive-file>
      <span>icon-drive-file</span>
    </div>
    <div class="icon-item">
      <icon-ear></icon-ear>
      <span>icon-ear</span>
    </div>
    <div class="icon-item">
      <icon-email></icon-email>
      <span>icon-email</span>
    </div>
    <div class="icon-item">
      <icon-empty></icon-empty>
      <span>icon-empty</span>
    </div>
    <div class="icon-item">
      <icon-experiment></icon-experiment>
      <span>icon-experiment</span>
    </div>
    <div class="icon-item">
      <icon-file-audio></icon-file-audio>
      <span>icon-file-audio</span>
    </div>
    <div class="icon-item">
      <icon-file-image></icon-file-image>
      <span>icon-file-image</span>
    </div>
    <div class="icon-item">
      <icon-file-pdf></icon-file-pdf>
      <span>icon-file-pdf</span>
    </div>
    <div class="icon-item">
      <icon-file-video></icon-file-video>
      <span>icon-file-video</span>
    </div>
    <div class="icon-item">
      <icon-file></icon-file>
      <span>icon-file</span>
    </div>
    <div class="icon-item">
      <icon-fire></icon-fire>
      <span>icon-fire</span>
    </div>
    <div class="icon-item">
      <icon-folder-add></icon-folder-add>
      <span>icon-folder-add</span>
    </div>
    <div class="icon-item">
      <icon-folder-delete></icon-folder-delete>
      <span>icon-folder-delete</span>
    </div>
    <div class="icon-item">
      <icon-folder></icon-folder>
      <span>icon-folder</span>
    </div>
    <div class="icon-item">
      <icon-gift></icon-gift>
      <span>icon-gift</span>
    </div>
    <div class="icon-item">
      <icon-idcard></icon-idcard>
      <span>icon-idcard</span>
    </div>
    <div class="icon-item">
      <icon-image-close></icon-image-close>
      <span>icon-image-close</span>
    </div>
    <div class="icon-item">
      <icon-image></icon-image>
      <span>icon-image</span>
    </div>
    <div class="icon-item">
      <icon-interaction></icon-interaction>
      <span>icon-interaction</span>
    </div>
    <div class="icon-item">
      <icon-language></icon-language>
      <span>icon-language</span>
    </div>
    <div class="icon-item">
      <icon-layers></icon-layers>
      <span>icon-layers</span>
    </div>
    <div class="icon-item">
      <icon-layout></icon-layout>
      <span>icon-layout</span>
    </div>
    <div class="icon-item">
      <icon-loading></icon-loading>
      <span>icon-loading</span>
    </div>
    <div class="icon-item">
      <icon-location></icon-location>
      <span>icon-location</span>
    </div>
    <div class="icon-item">
      <icon-lock></icon-lock>
      <span>icon-lock</span>
    </div>
    <div class="icon-item">
      <icon-loop></icon-loop>
      <span>icon-loop</span>
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