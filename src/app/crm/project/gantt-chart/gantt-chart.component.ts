import { Component, Input } from '@angular/core';

@Component({
  selector: 'eg-gantt-chart',
  templateUrl: './gantt-chart.component.html',
  styleUrls: ['./gantt-chart.component.scss']
})
export class GanttChartComponent {
  @Input() project: number;
}
