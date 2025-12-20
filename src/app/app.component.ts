import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ArcoButtonModule, ArcoButtonGroupModule, ArcoSpaceModule } from '../../projects/components/src/index';
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
        <div>布局</div>
        <a-button [long]="true" (click)="viewDocs('space')">间距 Space</a-button>
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
