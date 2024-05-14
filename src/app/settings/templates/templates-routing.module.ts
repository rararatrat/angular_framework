import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@library/interceptor/auth.guard';
import { DocTemplateComponent } from './doc-template/doc-template.component';
import { MailComponent } from '../crm-settings/mail/mail.component';
import { MailDetailComponent } from '../crm-settings/mail/mail-detail/mail-detail.component';

const routes: Routes = [
  { path: 'document', data: {title: "titles.doc_template", item: 'Document'}, component: DocTemplateComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange"
  },
  /* { path: 'email',
    data: {title: "titles.email_templte", item: 'Email'},
    component:EmailTemplateComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: "paramsOrQueryParamsChange"
  } */
  {path: 'email_templates', data: { title: 'titles.email_template', pluralCount: 2 }, component: MailComponent, canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",
      children: [{ path: ':id', component: MailDetailComponent, data: {title: "titles.mail_detail"}, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplatesRoutingModule { }
