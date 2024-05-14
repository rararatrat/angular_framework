import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BrandingComponent } from './branding/branding.component';
import { AuthGuard } from '@library/interceptor/auth.guard';
import { TeamComponent } from './team/team.component';
import { StructureComponent } from './structure/structure.component';
import { DetailsComponent } from './details/details.component';
import { OrgDetailsComponent } from './org-details/org-details.component';


const routes: Routes = [
  {path: '', runGuardsAndResolvers: "paramsOrQueryParamsChange", data:{title:null},
    children:[
      {path: 'details', data: {title: "titles.org_details"}, component:OrgDetailsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  },
      {path: 'branding', data: { title: 'titles.branding' }, component:BrandingComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'manage_team', data: { title: 'titles.manage_team' }, component:TeamComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},
      {path: 'org_structure', data: { title: 'titles.org_structure' }, component:StructureComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"},

    ]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationRoutingModule { }
