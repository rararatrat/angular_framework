import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@eagna-io/core';
import { LibraryModule } from '@library/library.module';
import { ItemComponent } from './item.component';

@NgModule({
  declarations: [
    ItemComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    LibraryModule
  ],
  exports:[
    ItemComponent
  ]
})
export class ItemModule { }
