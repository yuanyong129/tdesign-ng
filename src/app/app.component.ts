import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ArcoButtonModule, ArcoButtonGroupModule, ArcoSpaceModule } from '../../projects/components/src/index';
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    ArcoButtonModule,
    ArcoButtonGroupModule,
    ArcoSpaceModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less'
})
export class AppComponent {

  render() {
    return `
      <a-space direction="vertical">
        <a-button>Button 1</a-button>
        <a-button>Button 2</a-button>
        <a-button>Button 3</a-button>
      </a-space>
    `;
  }
}
