import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SettingsComponent } from './settings.component';
import { AuthGuard } from '@library/interceptor/auth.guard';
import { AccountingSettingsComponent } from './accounting-settings/accounting-settings.component';
import { ImportExportComponent } from './import-export/import-export.component';
import { OrganizationComponent } from './organization/organization.component';

const routes: Routes = [
  {path: '', component: SettingsComponent, runGuardsAndResolvers: "paramsOrQueryParamsChange",
    data: {appId: 1, sidebarLoaderId: 'eag-settings',  title: 'titles.route_settings' },
    children: [
      {path: ':orgId',  component: OrganizationComponent, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        data: { title: "titles.my_organisation" },
        children:[
          {path: 'config', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  data: {title: null},
          loadChildren: () =>
            import('../settings/configuration/configuration.module').then((m) => m.ConfigurationModule),
          },
          {path: 'masterdata', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  data: {title: null},
          loadChildren: () =>
            import('../settings/master-data/master-data.module').then((m) => m.MasterDataModule),
          },
          {path: 'crm', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  data: {title: null},
          loadChildren: () =>
            import('../settings/crm-settings/crm-settings.module').then((m) => m.CrmSettingsModule),
          },
          {path: 'accounting', component: AccountingSettingsComponent, data: {title: 'titles.account', pluralCount: 2 }, runGuardsAndResolvers: "paramsOrQueryParamsChange" },
          {path: 'import_export', component: ImportExportComponent, data: {title: 'titles.import_export' }, runGuardsAndResolvers: "paramsOrQueryParamsChange" },

          {path: 'process', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  data: {title: null},
          loadChildren: () =>
            import('../settings/process/process.module').then((m) => m.ProcessModule),
          },
          {path: 'templates', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  data: {title: null},
          loadChildren: () =>
            import('../settings/templates/templates.module').then((m) => m.TemplatesModule),
          },
        ]
      }
    ]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SettingsRoutingModule { }
