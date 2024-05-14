import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectComponent } from './project.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { TaskComponent } from './task/task.component';
import { TaskDetailComponent } from './task/task-detail/task-detail.component';

const routes: Routes = [
  { path: 'project', component: ProjectComponent, data: { title: 'titles.project'},  runGuardsAndResolvers: "paramsOrQueryParamsChange",
    children: [{ path: ':id', component: ProjectDetailComponent, data: { title: "titles.project" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}] },

  { path: 'task', component: TaskComponent, data: { title: 'titles.task'},  runGuardsAndResolvers: "paramsOrQueryParamsChange",
      children: [{ path: ':id', component: TaskDetailComponent, data: { title: "titles.task" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectRoutingModule { }
