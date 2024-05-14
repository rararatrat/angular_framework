import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { SettingsService } from '../../settings.service';
import { ProcessNameComponent } from '../process-name/process-name.component';
import { FlowDetailComponent } from './flow-detail/flow-detail.component';

@Component({
  selector: 'eg-flow',
  templateUrl: './flow.component.html',
  styleUrls: ['./flow.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FlowComponent implements OnInit, OnDestroy {

  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;

  @Input('param') param : any = {};
  @Output('paramChange') paramChange : any = new EventEmitter();
  @Input() data: any;

  constructor(private _settings: SettingsService){


  }


  ngOnInit(): void {
    this.config = {
      reloaded : true,
      viewtype: "grid",
      params : this.param,
      apiService : (p, m, n?) => this._settings.process_flow(p, m, n),
      title : "Process Flow",
      noModalHeight: true,
      withDetailRoute: false
      /* detailComponent: ProcessNameComponent, */
      /* detailComponent: FlowDetailComponent */
      /* formProperties: pf.formProperties,
      formStructure: pf.formStructure, */
    }
  }

  ngOnDestroy(): void {

  }
}
