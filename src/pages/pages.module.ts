import { NgModule } from '@angular/core';
import { IonicModule } from 'ionic-angular';
import {nonamePage} from "./noname-page/noname-page";

@NgModule({
  declarations: [
    nonamePage,
  ],
  imports: [ IonicModule ],
  exports: [
    nonamePage,
  ],
  entryComponents: [],
  providers: [ ],
})

export class PagesModule {}
