import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProcessRoutingModule } from './process-routing.module';
import { FlowComponent } from './flow/flow.component';
import { ProcessNameComponent } from './process-name/process-name.component';
import { SequenceComponent } from './sequence/sequence.component';
import { LibraryModule } from '@library/library.module';
import { FlowDetailComponent } from './flow/flow-detail/flow-detail.component';


@NgModule({
  declarations: [
    FlowComponent,
    ProcessNameComponent,
    SequenceComponent,
    FlowDetailComponent
  ],
  imports: [
    CommonModule,
    LibraryModule,
    ProcessRoutingModule
  ]
})
export class ProcessModule { }
