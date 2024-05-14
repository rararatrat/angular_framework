import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SubSink } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { FormStructure, objArrayType } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';

@Component({
  selector: 'eg-form-renderer',
  templateUrl: './form-renderer.component.html',
  styleUrls: ['./form-renderer.component.scss']
})
export class FormRendererComponent implements OnInit, OnDestroy {

  @Input('detailsConfig') detailsConfig : DetailsConfig;
  @Output('detailsConfigChange') detailsConfigChange : any = new EventEmitter();

  @Input('mode') mode                   : 'view' | 'add' | 'edit' = 'add'; //default to view

  public formStructure          : (string | FormStructure)[] = undefined;
  public formGroup              : FormGroup;
  public objArray               : objArrayType = {};
  private _subs                 : SubSink = new SubSink();
  public isReadonly             : boolean;
  public editingField           ?: string;

  public isLoading : boolean = true;

  constructor(private _wr:WrapperService){ }


  ngOnInit(): void {

    this.formStructure = this.detailsConfig.config.formProperty.formStructure;
    this.objArray = this.detailsConfig.objArray;
    this.formGroup = this.detailsConfig.formGroup;

    setTimeout(() => {
        this.isLoading = false;
    }, 100);

  }


  typeof(val){
    return typeof(val);
  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }
  hasObjInArr(arr: any[]): boolean {
    return arr.some(item => typeof item === 'object');
  }

  collapsedChange(event, fs){
    fs['collapsed'] = event;
  }

  ngOnDestroy(): void {

  }

}
