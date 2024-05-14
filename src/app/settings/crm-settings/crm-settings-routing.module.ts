import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentComponent } from './payment/payment.component';
import { AuthGuard } from '@library/interceptor/auth.guard';
import { ReminderLevelsComponent } from './reminder-levels/reminder-levels.component';
import { ReminderLevelsDetailComponent } from './reminder-levels/reminder-levels-detail/reminder-levels-detail.component';

const routes: Routes = [
  {path: '', runGuardsAndResolvers: "paramsOrQueryParamsChange", data:{title: "titles.crm"},
    children:[
      {path: 'payment', data: {title: "titles.payment", pluralCount: 2}, component: PaymentComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  },
      /* {path: 'email_templates', data: { title: 'titles.email_template', pluralCount: 2 }, component: MailComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",
        children: [{ path: ':id', component: MailDetailComponent, data: {title: "titles.mail_detail"}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]
      }, */
      {path: 'reminder_levels', data: { title: 'titles.reminder_level', pluralCount: 2 }, component: ReminderLevelsComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",
        children: [{ path: ':id', component: ReminderLevelsDetailComponent, data: {title: "titles.reminder_levels_detail"}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]
      },
      //{path: 'notification', component: NotificationComponent, data: {title: 'titles.route_notification' }, runGuardsAndResolvers: "paramsOrQueryParamsChange" },
    ]
  },
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CrmSettingsRoutingModule { }
