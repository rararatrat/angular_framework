import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@eagna-io/core';
import { LibraryModule } from '@library/library.module';
import { DocumentFlowComponent } from './document-flow.component';

@NgModule({
  declarations: [
    DocumentFlowComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    LibraryModule
  ],
  exports:[
    DocumentFlowComponent
  ]
})
export class DocumentFlowModule { }
