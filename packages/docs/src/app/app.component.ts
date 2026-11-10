import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TButtonModule, TButtonGroupModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TButtonModule,
    TButtonGroupModule,
    TSpaceModule
  ],
  template: `
    <div class="docs-container">
      <div class="docs-left">
        <div>通用</div>
        <t-button [long]="true" (click)="viewDocs('button')">按钮 Button</t-button>
        <t-button [long]="true" (click)="viewDocs('link')">链接 Link</t-button>
        <div>布局</div>
        <t-button [long]="true" (click)="viewDocs('divider')">分割线 Divider</t-button>
        <t-button [long]="true" (click)="viewDocs('space')">间距 Space</t-button>

        <t-button [long]="true" (click)="viewDocs('scrollbar')">滚动条 Scrollbar</t-button>
      </div>
      <div class="docs-right">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: `
    .docs-container {
      display: flex;
      gap: 20px;
    }
    .docs-left {
      width: 200px;
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .docs-right {
      flex: 1;
      height: 100%;
    }
  `
})
export class AppComponent {
  constructor(private router: Router) { }
  viewDocs(component: string) {
    this.router.navigate([`/${component}`]);
  }
}
