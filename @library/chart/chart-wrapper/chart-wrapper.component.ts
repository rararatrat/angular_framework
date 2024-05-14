import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IStatsChart } from '@library/library.interface';

@Component({
  selector: 'eg-chart-wrapper',
  templateUrl: './chart-wrapper.component.html',
  styleUrls: ['./chart-wrapper.component.scss']
})
export class ChartWrapperComponent implements OnInit, OnDestroy{

  @Input('config')    config    : IStatsChart;
  @Output('callback') callback  : any = new EventEmitter();

  public isLoading : boolean = true;
  public stateOptions: any[] = [{label: 'This Week', value: 'off'}, {label: 'Last Week', value: 'on'}];

  constructor(){}

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
