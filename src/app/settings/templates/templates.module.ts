import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocTemplateComponent } from './doc-template/doc-template.component';
import { LibraryModule } from '@library/library.module';
import { TemplatesRoutingModule } from './templates-routing.module';
import { CrmModule } from 'src/app/crm/crm.module';
import { PosPreviewComponent } from './pos-preview/pos-preview.component';
import { TplDesignerComponent } from './tpl-designer/tpl-designer.component';

@NgModule({
  declarations: [
    DocTemplateComponent,
    PosPreviewComponent,
    TplDesignerComponent
  ],
  imports: [
    CommonModule,
    LibraryModule,
    CrmModule,
    TemplatesRoutingModule
  ]
})
export class TemplatesModule { }
