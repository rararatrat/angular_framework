import { ChangeDetectorRef, Component, EventEmitter, Injector, Input, OnDestroy, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ComponentLookupRegistry, GridResponse, ResponseObj, apiMethod } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, IProcessForm } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SubSink } from 'subsink2';

@Component({
  selector: 'eg-process-form',
  templateUrl: './process-form.component.html',
  styleUrls: ['./process-form.component.scss']
})
export class ProcessFormComponent implements OnInit, OnDestroy {

  @Input('config')          detailsConfig : DetailsConfig = null;

  @Input('process')         process       : IProcessForm[];
  @Output('processChange')  processChange : any = new EventEmitter();

  @Input('data')            data          : ResponseObj<GridResponse> = null;
  @Output('dataChange')     dataChange    : any = new EventEmitter();

  @Input('perm')            perm          : any = null;
  @Output('permChange')     permChange    : any = new EventEmitter();

  @Input('mode')            mode : "add" | "view" | "edit" = "add";

  public config             : DetailsContainerConfig  = null;
  public isLoading    : boolean = true;
  public isDialog     : boolean = false;
  public activeIndex  : number  = 0;
  public isDisabled   : boolean = false;
  public title        : any = null;
  public subTitle     : any = null;

  public previousButton     : any = {label:"Go to Previous", disabled:true};
  public nextButton         : any = {label:"Go to Next", disabled:false};
  public myInputs           : any = {};

  private _subs : SubSink = new SubSink();
  private _dialogWidth : any = "60%";
  public objArray : any;

  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _cdr                    : ChangeDetectorRef,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() public dialogConfig : DynamicDialogConfig){

              this.isDialog = (this.ref != null && this.dialogConfig != null);
  }

  ngOnInit(): void {


    /*  */

    if(this.isDialog && this.dialogConfig.hasOwnProperty('data') && this.dialogConfig.data.isProcess){
      this.mode     = this.dialogConfig.data.mode;
      this.process  = this.dialogConfig.data.process_form;
      this.data     = this.dialogConfig.data.item;
      this.perm     = this.dialogConfig.data.permission;
      this.dialogConfig.width = this._dialogWidth;
      this._initConfig(this.dialogConfig)
      this.isLoading = false;
      this._checkButtonsStatus(this.activeIndex);
      this._cdr.detectChanges();
    }

    /* if(this.detailsConfig != null && this.process != null){
      this.title    = this.detailsConfig.config.header
      this.subTitle = this.detailsConfig.config.subheader || this.detailsConfig.config.subTitle;
    } */
  }

  private _initConfig(dialogConfig){
    this.config = {
      showNavbar        : false,
      showDetailbar     : this.mode != 'add',
      detailBarExpanded : true,
      navbarExpanded    : false,
      hasHeader         : true,
      header            : dialogConfig.header,
      /* subTitle          : Core.Localize("dContainerSubHeader", {header}), */
      dialogConfig      : dialogConfig,
      dialogRef         : this.ref,
      /* itemId            :  this.itemId, */
      params            : {id:this.config?.itemId},
      formProperty      : {
        //includedFields  : this.form['includedFields'],
        formProperties  : dialogConfig?.data.formProperties,
        formStructure   : dialogConfig?.data.formStructure,
        mode            : dialogConfig?.data.mode,
      },
      detailsApi$       : (param, method)   => {
        if(this.mode == "add"){
          return dialogConfig?.data.api$(param, method);
        }else{
          return dialogConfig?.data.api(param, method);
        }
      }
    }
    this.detailsConfig  = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._cdr});
    this.isLoading      = false;

  }


  public close(){
    /* this.dialogConfig.data.isChanged = true; */
    this.ref.close(this.dialogConfig.data);
  }

  private _cleanParam(data){
    let retObj = {}
    for (const key in data) {
      const value = data[key];
      switch(typeof(value)){
        case "object":
          if(value instanceof Date){
            retObj[key] = new Date(value)
          }else if(Array.isArray(value)){
            retObj[key] = value
          }else{
            retObj[key] = value?.['id'] || null;
          }
          break;
        default:
          retObj[key] = value
          break;
      }

    }
    return retObj;
  }

  private _checkButtonsStatus(_activeIndex){
    const _actIdx = _activeIndex;
    const _nextDisabled = (_actIdx == this.process.length - 1);
    const _prevDisabled = (_actIdx == 0);
    const _next = (!_nextDisabled)?this.process[_actIdx+1]:null;
    const _prev = (!_prevDisabled)?this.process[_actIdx-1]:null;

    this.nextButton = {
      label   : (_next != null)?`${_next['index']}. ${_next['name']}`:'Completed',
      disabled: (_actIdx == this.process.length)
    }
    this.previousButton = {
      label   : (_prev != null)?`${_prev['index']}. ${_prev['name']}`:'Start',
      disabled: _actIdx == 0
    }
  }

  private _actions(action, param, currIdx){
    switch(action){
      case "put":
        const _create : any = {};
        this.process[this.activeIndex]['fields'].forEach(e => {
          _create[e] = param[e]
        });

        this._fetchApi(this._cleanParam(_create), "put", currIdx)
        break;

      case "patch":
        const _patch : any = {id : this.data['id']};
        const _isNull : boolean = false;
        this.process[this.activeIndex]['fields'].forEach(e => {
          _patch[e] = param[e]
        });
        this._fetchApi(this._cleanParam(_patch), "patch", currIdx)
        break;
    }
  }

  private _updateProcessStatus(currIdx, status:"wip"|"complete"|"error", err=undefined){
    console.log({err});
    if(err){
      const firstObj = Object.keys(err.error?.content?.results?.[0])?.[0];
      if(firstObj){
        this.process[currIdx]['err'] = `${firstObj}: ${err.error?.content?.results?.[0]?.[firstObj]?.[0]}` || err.message;
      }
    } else{
      this.process[currIdx]['err'] = '';
    }
    switch(status){
      case "wip":
        this.process[currIdx]['isError']    = false;
        this.process[currIdx]['isComplete'] = false;
        this.process[currIdx]['isWip']      = true;
        break;
      case "complete":
        this.process[currIdx]['isError']    = false;
        this.process[currIdx]['isComplete'] = true;
        this.process[currIdx]['isWip']      = false;
        break;
      case "error":
        this.process[currIdx]['isError']    = true;
        this.process[currIdx]['isComplete'] = false;
        this.process[currIdx]['isWip']      = false;
        break;
    }
  }

  private _fetchApi(param, method:apiMethod, currIdx){
    this._subs.id('fetchApi').sink = this.detailsConfig.api(param, method).subscribe({
      next: (res) => {
        this.data                     = res.content.results[0];
        this.dialogConfig.data.items  = res.content.results[0];
        this.detailsConfig.data = res;


        this.detailsConfig.permission = res.content.permission;
        this.detailsConfig.fields = res.content.fields;
        this.detailsConfig.aggs = res.content.aggs;

        this.title = `${res.content.results[0]['ref']} - ${res.content.results[0]['name']}`

      },
      error: (err) => {
        this._updateProcessStatus(currIdx, "error", err);
        this.isLoading = false;
        this._subs.id('fetchApi').unsubscribe();
        this._cdr.detectChanges();
      },
      complete: () => {
        this._updateProcessStatus(currIdx, "complete");
        this._navigate('next', currIdx);
        this.dialogConfig.data['isChanged'] = true;
        this.isLoading = false;
        this._subs.id('fetchApi').unsubscribe();
        this._cdr.detectChanges();
      }
    });
  }

  private _navigate(action, currIndex){
    if(action == "next"){
      this.activeIndex = currIndex+1;
      this._checkButtonsStatus(currIndex+1);

    }else{
      this.activeIndex = currIndex-1;
      this._checkButtonsStatus(currIndex-1);

    }
  }

  public loadComponent(currIndex, data?){
    if(this.process[currIndex+1] != null){
      if(this.process[currIndex+1]?.hasForm == false){
        this.myInputs = { 'data': this.data,
                          'perm': this.perm,
                          'componentType': this.process[currIndex+1]['component']['data'] }
        if(this.isDialog && this.dialogConfig){
          this.dialogConfig.width = "80%";
          this.dialogConfig.data.items = this.data;

          this._cdr.detectChanges();
        }
      }else{
        if(this.isDialog && this.dialogConfig){
          this.dialogConfig.width = this._dialogWidth;
          this._cdr.detectChanges();

        }
      }
    } else {
      if((currIndex + 1) == this.process.length){
        this.ref.close(this.dialogConfig.data)
      }
    }

  }

  public getComponent(cmpt){
    return ComponentLookupRegistry.get(cmpt);
  }

  public step(action:"next" | "previous" | "skip", currIndex){
    switch(action){
      case 'next':
        if(this.process[currIndex]?.hasForm){
          if(!this.data){
            this._actions("put", this.detailsConfig.formGroup.getRawValue(), currIndex)
          }
          else{
            this._actions("patch", this.detailsConfig.formGroup.getRawValue(), currIndex)
          }
        }
        else {
          this.activeIndex = currIndex+1;
          this._checkButtonsStatus(currIndex+1);
          this._updateProcessStatus(currIndex, "complete");
        }
        this.loadComponent(currIndex)
        break;
      case 'previous':
        this.activeIndex = currIndex-1;
        this._checkButtonsStatus(currIndex-1);
        this.loadComponent(currIndex)
        break;
      case 'skip':
        this._navigate("next", currIndex);
        this._updateProcessStatus(currIndex, "wip")
        this.loadComponent(currIndex)
        break;
    }
  }

  public afterSaved(event){

  }

  ngOnDestroy(): void {

  }


}
