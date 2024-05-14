import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForceDirectedComponent } from './force-directed/force-directed.component';
import { OrgChartComponent } from './org-chart/org-chart.component';

import { CoreModule } from '@eagna-io/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InfoCardComponent } from './info-card/info-card.component';
import { ChartXyComponent } from './chart-xy/chart-xy.component';
import { ChartPieComponent } from './chart-pie/chart-pie.component';
import { ChartClusteredComponent } from './chart-clustered/chart-clustered.component';
import { ChartSparklineComponent } from './chart-sparkline/chart-sparkline.component';
import { ChartWrapperComponent } from './chart-wrapper/chart-wrapper.component';
import { NoDataFoundComponent } from '@library/content-display/no-data-found/no-data-found.component';
import { ContentDisplayModule } from '@library/content-display/content-display.module';



@NgModule({
  declarations: [
    ForceDirectedComponent,
    OrgChartComponent,
    InfoCardComponent,
    ChartXyComponent,
    ChartPieComponent,
    ChartClusteredComponent,
    ChartSparklineComponent,
    ChartWrapperComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    ContentDisplayModule
  ],
  exports: [ForceDirectedComponent,
            OrgChartComponent,
            InfoCardComponent,
            ChartXyComponent,
            ChartPieComponent,
            ChartClusteredComponent,
            ChartSparklineComponent,
            ChartWrapperComponent]
})
export class ChartModule { }
