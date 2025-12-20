import { Component } from "@angular/core";
import { ArcoButtonModule } from "../../../../projects/components/src";

@Component({
  selector: 'button-docs',
  imports: [
    ArcoButtonModule
  ],
  template: `
    <a-button>间距</a-button>
  `,
  styles: [

  ]
})
export class SpaceDocs {

}
