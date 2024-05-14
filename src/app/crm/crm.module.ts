import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrmRoutingModule } from './crm-routing.module';
import { CrmComponent } from './crm.component';
import { CoreModule } from '@eagna-io/core';
import { LibraryModule } from '@library/library.module';
import { PositionPreviewComponent } from '../position-preview/position-preview.component';
import { DocumentFlowComponent } from './document-flow/document-flow.component';
import { DocumentFlowModule } from './document-flow/document-flow.module';

const _components = [PositionPreviewComponent];

@NgModule({
  declarations: [
    CrmComponent,
    ..._components,
  ],
  imports: [
    CommonModule,
    CrmRoutingModule,
    CoreModule,
    DocumentFlowModule,
    LibraryModule
  ],
  exports: _components
})
export class CrmModule { }
