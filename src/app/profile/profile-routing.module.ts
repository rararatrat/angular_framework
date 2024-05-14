import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotificationComponent } from './notification/notification.component';
import { ProfileComponent } from './profile.component';

import { ActivitiesComponent } from './activities/activities.component';
import { SecurityComponent } from './security/security.component';
import { ApprovalListComponent } from './approval-list/approval-list.component';
import { GroupsComponent } from './groups/groups.component';

const routes: Routes = [
  {path: '', component: ProfileComponent, runGuardsAndResolvers: "paramsOrQueryParamsChange",
    data: {appId: 1, sidebarLoaderId: 'eag-profile',  title: 'titles.profile' },
    children:[
      {path: 'notification', component: NotificationComponent, data: {title: 'titles.notification', pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange" },
      {path: 'activities', component: ActivitiesComponent, data: {title: 'titles.activity', pluralCount: 2 }, runGuardsAndResolvers: "paramsOrQueryParamsChange" },
      {path: 'security', component: SecurityComponent, data: {title: 'titles.security' }, runGuardsAndResolvers: "paramsOrQueryParamsChange" },
      {path: 'approvals', component: ApprovalListComponent, data: {title: 'titles.approval_history' }, runGuardsAndResolvers: "paramsOrQueryParamsChange" },
      {path: 'groups', component: GroupsComponent, data: {title: 'titles.group', pluralCount: 2 }, runGuardsAndResolvers: "paramsOrQueryParamsChange" },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ProfileRoutingModule { }
