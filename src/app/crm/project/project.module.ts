import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectComponent } from './project.component';
import { ProjectRoutingModule } from './project-routing.module';
import { LibraryModule } from '@library/library.module';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { TaskComponent } from './task/task.component';
import { TaskDetailComponent } from './task/task-detail/task-detail.component';
import { TimeTrackingComponent } from './time-tracking/time-tracking.component';
import { TimeTrackingDetailComponent } from './time-tracking/time-tracking-detail/time-tracking-detail.component';
import { ActivitiesComponent } from './activities/activities.component';
import { ConditionsComponent } from './conditions/conditions.component';
import { ConditionsDetailComponent } from './conditions/conditions-detail/conditions-detail.component';
import { ExpensesComponent } from './expenses/expenses.component';
import { GanttChartComponent } from './gantt-chart/gantt-chart.component';
import { GanttChartDetailComponent } from './gantt-chart/gantt-chart-detail/gantt-chart-detail.component';
import { ProjectTeamsComponent } from './project-teams/project-teams.component';
import { DocumentFlowModule } from '../document-flow/document-flow.module';

@NgModule({
  declarations: [
    ProjectComponent,
    ProjectDetailComponent,
    TaskComponent,
    TaskDetailComponent,
    TimeTrackingComponent,
    TimeTrackingDetailComponent,
    ActivitiesComponent,
    ConditionsComponent,
    ConditionsDetailComponent,
    ExpensesComponent,
    GanttChartComponent,
    GanttChartDetailComponent,
    ProjectTeamsComponent,
  ],
  exports: [
    ProjectComponent,
    ProjectDetailComponent,
    TaskComponent,
    TaskDetailComponent,
    TimeTrackingComponent,
    TimeTrackingDetailComponent
  ],
  imports: [
    CommonModule,
    LibraryModule,
    DocumentFlowModule,
    ProjectRoutingModule
  ]
})
export class ProjectModule { }
