import { Component } from '@angular/core';

import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoColorPickerBase } from './demos/color-picker-base';
import { DemoColorPickerControlled } from './demos/color-picker-controlled';
import { DemoColorPickerSwatches } from './demos/color-picker-swatches';

@Component({
  selector: 'color-picker-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoColorPickerBase,
    DemoColorPickerSwatches,
    DemoColorPickerControlled,
  ],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">颜色选择器 ColorPicker</h1>
      <p class="docs-page__lead">
        颜色选择器用于选择颜色，支持面板取色、格式切换、预设色与最近使用颜色。
      </p>

      <docs-demo
        id="color-picker-base"
        title="基础用法"
        description="点击触发器打开面板，拖拽饱和度与明度面板、色相滑条即可取色，输入框实时回显 HEX 值。"
      >
        <demo-color-picker-base />
      </docs-demo>

      <docs-demo
        id="color-picker-swatches"
        title="预设色与最近使用"
        description="通过 swatchColors 自定义预设色板，recentColors 开启最近使用颜色记录。"
      >
        <demo-color-picker-swatches />
      </docs-demo>

      <docs-demo
        id="color-picker-controlled"
        title="受控与禁用"
        description="value 与 change 配合实现受控取色；disabled 会禁用触发器与整个面板。"
      >
        <demo-color-picker-controlled />
      </docs-demo>

      <h2 class="docs-section__title" id="color-picker-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TColorPicker" />
      </div>

      <docs-page-nav current="/color-picker" />
    </article>
  `,
})
export class ColorPickerDocs {}
