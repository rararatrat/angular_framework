import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { QuicklinkStrategy } from "ngx-quicklink";
import { HomeComponent } from './home/home.component';
import { AuthGuard } from '@library/interceptor/auth.guard';
import { ErrorComponent } from '@eagna-io/core';

const routes: Routes = [
  {path: '', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange", component: HomeComponent, data: { appId: 1, sidebarLoaderId: 'eag-parent' }},

  {path: 'error', component: ErrorComponent},

  {path: 'auth', canActivate: [/* TODO */], runGuardsAndResolvers: "paramsOrQueryParamsChange", data: { title: 'Authentication', APP_ROUTE: false},
  loadChildren: () =>
    import('../app/auth/auth.module').then((m) => m.AuthModule),
  },

  {path: 'profile', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  data: {title: null},
  loadChildren: () =>
    import('../app/profile/profile.module').then((m) => m.ProfileModule),
  },

  {path: 'crm', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  data: {title: null},
  loadChildren: () =>
    import('../app/crm/crm.module').then((m) => m.CrmModule),
  },

  {path: 'settings', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  data: {title: null},
  loadChildren: () =>
    import('../app/settings/settings.module').then((m) => m.SettingsModule),
  },

  {path: 'search', canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  data: {title: null},
  loadChildren: () =>
    import('../app/search/search.module').then((m) => m.SearchModule),
  },


];

@NgModule({
  imports:  [ RouterModule.forRoot(routes, {
    preloadingStrategy: QuicklinkStrategy,
    onSameUrlNavigation: "reload"})
  ],
exports: [RouterModule]
})
export class AppRoutingModule { }
