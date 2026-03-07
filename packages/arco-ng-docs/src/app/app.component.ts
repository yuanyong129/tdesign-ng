import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ArcoButtonModule, ArcoButtonGroupModule, ArcoSpaceModule } from '@web-ng/index';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ArcoButtonModule,
    ArcoButtonGroupModule,
    ArcoSpaceModule
  ],
  template: `
    <div class="docs-container">
      <div class="docs-left">
        <div>通用</div>
        <a-button [long]="true" (click)="viewDocs('button')">按钮 Button</a-button>
        <a-button [long]="true" (click)="viewDocs('link')">链接 Link</a-button>
        <div>布局</div>
        <a-button [long]="true" (click)="viewDocs('divider')">分割线 Divider</a-button>
        <a-button [long]="true" (click)="viewDocs('space')">间距 Space</a-button>

        <a-button [long]="true" (click)="viewDocs('scrollbar')">滚动条 Scrollbar</a-button>
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
