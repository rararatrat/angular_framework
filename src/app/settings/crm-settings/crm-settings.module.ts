import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CrmSettingsRoutingModule } from './crm-settings-routing.module';
import { PaymentComponent } from './payment/payment.component';
import { MailComponent } from './mail/mail.component';
import { LibraryModule } from '@library/library.module';
import { MailDetailComponent } from './mail/mail-detail/mail-detail.component';
/* import { PaymentRemindersComponent } from './payment-reminders/payment-reminders.component'; */
import { ReminderLevelsComponent } from './reminder-levels/reminder-levels.component';
import { ReminderLevelsDetailComponent } from './reminder-levels/reminder-levels-detail/reminder-levels-detail.component';
import { CrmModule } from 'src/app/crm/crm.module';

@NgModule({
  declarations: [
    PaymentComponent,
    MailComponent,
    MailDetailComponent,
    /* PaymentRemindersComponent, */
    ReminderLevelsComponent,
    ReminderLevelsDetailComponent
  ],
  imports: [
    CommonModule,
    CrmModule,
    LibraryModule,
    CrmSettingsRoutingModule
  ]
})
export class CrmSettingsModule { }
