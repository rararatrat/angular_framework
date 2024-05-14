import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';
import { NotificationComponent } from './notification/notification.component';
import { CoreModule } from '@eagna-io/core';
import { LibraryModule } from '@library/library.module';
import { ActivitiesComponent } from './activities/activities.component';
import { SecurityComponent } from './security/security.component';
import { ApprovalListComponent } from './approval-list/approval-list.component';
import { GroupsComponent } from './groups/groups.component';
import { AccountComponent } from './account/account.component';
import { PreferencesComponent } from './preferences/preferences.component';


@NgModule({
  declarations: [
    ProfileComponent,
    NotificationComponent,
    ActivitiesComponent,
    SecurityComponent,
    ApprovalListComponent,
    GroupsComponent,
    AccountComponent,
    PreferencesComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    LibraryModule,
    ProfileRoutingModule
  ]
})
export class ProfileModule { }
