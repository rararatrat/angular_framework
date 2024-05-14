import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigurationRoutingModule } from './configuration-routing.module';
import { BrandingComponent } from './branding/branding.component';
import { StructureComponent } from './structure/structure.component';
import { TeamComponent } from './team/team.component';
import { LibraryModule } from '@library/library.module';
import { DetailsComponent } from './details/details.component';
import { OrgDetailsComponent } from './org-details/org-details.component';


@NgModule({
  declarations: [
    BrandingComponent,
    TeamComponent,
    StructureComponent,
    DetailsComponent,
    OrgDetailsComponent,
  ],
  imports: [
    CommonModule,
    LibraryModule,
    ConfigurationRoutingModule
  ]
})
export class ConfigurationModule { }
