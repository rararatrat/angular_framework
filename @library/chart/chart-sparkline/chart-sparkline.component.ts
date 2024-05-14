import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { EditableComponent } from '@library/library.interface';

@Component({
  selector: 'eg-chart-sparkline',
  templateUrl: './chart-sparkline.component.html',
  styleUrls: ['./chart-sparkline.component.scss']
})
export class ChartSparklineComponent implements OnInit, OnDestroy {
  @Input("config")    config    : EditableComponent;
  @Input("topic")     topic     : any;
  @Input("topicId")   topicId   : any;
  @Input("data")      data      : any = null;
  @Input("id")        id        : any = "chartdiv";
  @Output("callback") callback  = new EventEmitter();

  public root       : any;
  public container  : any;
  public series     : any;
  public icon       : any;
  public chart      : any;

  public isLoading  : boolean = true;
  constructor(private _cdr: ChangeDetectorRef){}

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }

}
