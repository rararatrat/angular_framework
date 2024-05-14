import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FlowComponent } from './flow/flow.component';
import { AuthGuard } from '@library/interceptor/auth.guard';
import { ProcessNameComponent } from './process-name/process-name.component';
import { FlowDetailComponent } from './flow/flow-detail/flow-detail.component';

const routes: Routes = [
  {path: '', runGuardsAndResolvers: "paramsOrQueryParamsChange", data:{title: "Process"},
    component:FlowComponent, canActivate: [AuthGuard],
    children:[
      {path: ':id', data: {title: "titles.process_flow"}, component:FlowDetailComponent,
        canActivate: [AuthGuard], runGuardsAndResolvers: "paramsOrQueryParamsChange",  },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProcessRoutingModule { }
