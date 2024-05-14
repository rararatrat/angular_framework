import { Location } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Core, GridResponse, MESSAGE_SEVERITY, ResponseObj } from '@eagna-io/core';
import { AutocompleteConfig, InPlaceConfig, NumberConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { SubSink } from 'subsink2';
import { MenuItem } from 'primeng/api';
import { AppStatic } from 'src/app/app.static';

@Component({
  selector: 'eg-inplace',
  templateUrl: './inplace.component.html',
  styleUrls: ['./inplace.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => InplaceComponent),
    multi: true,
  }]
})

export class InplaceComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @ViewChild('egInPlace') egInPlace : any;

  @Input("isChanged") isChanged                   = false;
  @Output("isChangedChange") isChangedChange      = new EventEmitter<boolean>(false);

  @Input('config')          config                : InPlaceConfig;
  @Output("configChange") configChange            = new EventEmitter<InPlaceConfig>;

  @Input('type')            type                  : "text" | "number" | "date" | "autocomplete" | "select" | "image" | "address" | "password" | "textarea" | "boolean" | "multiselect" | "file" | "radio" | "chips" | "json" | "color";
  @Input('displayVal')      displayVal            : any = null;
  @Input('icon')            icon                  : any = null;
  @Input('data')            data                  : any = null;
  @Input('placeholder')     placeholder           : string = null;
  @Input("formControlName") formControlName       : any = null;
  private _fcNameCopy                             : any = null;

  @Input("topic")           topic                 : any;
  @Input("autoConfig")      autoConfig            : AutocompleteConfig;
  @Input("numberConfig")    numberConfig          : NumberConfig;

  @Input("isDisabled")      isDisabled            : boolean = false;
  @Input("isEditable")      isEditable            : boolean = false;

  @Input("isRawText")       isRawText             : boolean = false;
  @Input("tinyMceConfig")   tinyMceConfig         : any;
  @Input("mask_string")     mask_string           : string;
  @Input("styleClass")      styleClass            : any ="w-full";

  @Input("selected")        selected              : any;
  @Input('options')         options               : any[] = [];
  @Input()
  public editMode : boolean = false;

  @Output()
  public editModeChange = new EventEmitter<boolean>(false);

  public inputIconClass: string = "";

  public modelValue : any = null;

  public onChange = (value: any) => { };
  public onBlur   = (touched: boolean) => {};
  private _subs   : SubSink = new SubSink();
  public fcLoader : any  = null;
  public canEdit  : boolean = false;
  public locale   : any = null;

  public locale_saved : any = AppStatic.savedLocale;

  private _value          : any = null;
  public attrTitleType    : any =  "string" || "object";



  //private _fileFormData: FormData;
  private _files  : {[file_name:string]: File[]} = {};
  public items    : MenuItem[]

  public hasSaved : boolean = false;

  public savedData :any =  {
    files:[]
  };
  public nonToggable = false;

  constructor(private _wr : WrapperService){
    this.locale = this._wr.coreService.getLocaleFormat();
  }

  writeValue(value: string) : void {}
  registerOnChange(fn: any) : void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onBlur  = fn; }
  trackByFn(index, item) {
    return item?.id; // unique id corresponding to the item
  }

  ngOnInit(): void {
    this.inputIconClass = (this.icon != null && this.icon != undefined && this.icon != '') ? 'border-round-left-xs': '';

    if(this.type == "number" && (!this.numberConfig || !this.numberConfig?.minFractionDigits)){
      this.numberConfig = {mode: 'decimal', minFractionDigits: 1};
    }

    this.canEdit = !this.config?.permission?.update;
    this.isDisabled = this.config?.formGroup.disabled || this.isDisabled;
    this.fcLoader = this.formControlName;

    const _modeValue = this.config?.formGroup?.get(this.formControlName)?.value;

    /* if(this.type == "color"){
      this.modelValue = this.config?.formGroup?.get(this.formControlName)?.value;
    } */

    if(this.type != "date"){
      this.displayVal = (this.displayVal == null ) ? (this.type == "boolean" ? ((_modeValue === true) + '') : _modeValue) : this.displayVal;
      if(this.type == 'json'){
        //this.displayVal = {'i am': 'Randy', 'l': 'tolentino'};
        /* if(typeof this.displayVal == 'object'){
          try {
            this.displayVal = JSON.stringify(this.displayVal);
          } catch (error) {}
        } */
        if(this.displayVal && typeof this.displayVal == 'string'){
          try {
            this.displayVal = JSON.parse(this.displayVal);
          } catch (error) {
            this.displayVal = {error: Core.Localize('invalid_item', {item: 'JSON'})};
          }
        }
      } else {
        if(this.type == 'multiselect'){
          if(this.autoConfig?.formProperty?.isForMultiselectOptions){
            this.autoConfig.formProperty.api?.({limit: 1000}, 'post')?.subscribe((res: ResponseObj<GridResponse>) => {
              const _apiResult = res.content?.results || [];

              if(this.autoConfig.formProperty.mapNodes){
                this.displayVal = this.autoConfig.formProperty.mapNodes(_apiResult);
              } else if(Array.isArray(_modeValue) && this._wr.helperService.isArrayOfNumber(_modeValue)){
                //STANDARD data display when formControl value is An array of ids only
                this.displayVal = _apiResult.filter( _res => _modeValue.includes(_res.id) );
              }
            });
          }
        }

        if(typeof(this.displayVal) == "object"){
          if(this.displayVal?.['name']){
            this.displayVal = this.displayVal?.['name'];
          } else{
            if(this.displayVal.length == undefined || this.displayVal.length == 0){
              if(this.type == "autocomplete"){
                this.displayVal = null;
              } else if(this.type == "radio"){
                this.displayVal = this.displayVal.label;
              } else{
                this.displayVal = this.displayVal.name;
              }
            }
          }
        } else if(this.type == "radio"){
          const findOptionValue = this.options?.find(opt => opt.id == this.displayVal);
          if(findOptionValue?.label){
            this.displayVal = findOptionValue.label;
          }
        }
      }


    }

    this.modelValue = (this.type == "boolean" ? (_modeValue == true) : _modeValue);

    this.items = [
      {
        label: 'Show Detail',
        icon: 'pi pi-fw pi-pencil',
      },
      {
        label: 'Copy',
        icon: 'pi pi-fw pi-pencil',
      },
      {
        label: 'Edit',
        icon: 'pi pi-fw pi-pencil',
      }
    ];

    if(['radio', 'boolean'].includes(this.type)){
      this.editMode = true;
      this.nonToggable = true;

      if(this.type == 'radio'){
        this._subs.add(this.config.formGroup?.get(this.formControlName)?.valueChanges.subscribe(newVal => {
          this.toggleEditor('save');
        }));
      }
    }
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
    this._files = {};
  }

  public imageErr(event, data){
    this._wr.libraryService.noImageUrl(event);
  }

  private _setParams(event?){
    if(!event){
      event = this.config.formGroup.get(this.formControlName)?.value;
    }

    const val = (this._value == null) ? this.config.formGroup.get(this.formControlName)?.value : this._value;

    let _params : any = {
      val   : null,
      isObj : false,
      data  : null
    };

    switch(this.type){
      case "autocomplete":
        _params.isObj = true;
        _params.data = {
          id                      : this.config.formGroup.get("id").value,
          [this.formControlName]  : (val?.[this.autoConfig?.saveField || 'id'] || val)
        };
        _params.val = event;
        break;
      case "multiselect":
        _params.isObj = true;
        _params.data = {
          id: this.config.formGroup.get("id").value,
          [this.formControlName]:event?.id //RT
        };
        _params.val = event.data;
        break;

      case "image":
      case "file":
        const _valueToSave  = val?.[this.autoConfig?.saveField] || val?.id || val?.name;
        _params.data = {
          id : this.config.formGroup.get("id").value,
          [this.formControlName] : _valueToSave
        };
        _params.data = this._wr.libraryService.toFormData({..._params.data, ...this._files});
        _params.val = val;

        break;

      default:
        let _defaultValue = val;
        if(typeof val == 'object' && this.type != "date" ){
          _params.isObj    = true;
          _defaultValue = val?.[this.autoConfig?.saveField] || val?.id || val?.name;
        }else if(this.type == "date"){

          _defaultValue = new Date(_defaultValue);
        }

        _params.data = {
          id : this.config.formGroup.get("id").value,
          [this.formControlName] : _defaultValue
        };
        _params.val = val;

        break;
    }

    return _params;

  }


  public save(event?, type?: string){
    switch (this.config.method) {
      case "callback":
        this.isChanged = true;
        this.isChangedChange.emit(this.isChanged);
        this.config.onUpdate(event);
        break;
      case "api":
        let _params;
        let val
        let isObj = false;

        const paramData = this._setParams(event);
        _params = paramData.data;
        val     = paramData.val;
        isObj   = paramData.isObj;

        if(this.type == 'json'){
          _params = {..._params, [this.formControlName]: this._wr.helperService.stripHtml(_params?.[this.formControlName] || '')};
        }

        if(this.config.paramUpdate){
          _params = this.config.paramUpdate?.(_params, this.formControlName);
        }

        /* console.trace({_params}); */
        this._subs.sink = this.config.api$(_params, "patch").subscribe({
          next: (res) => {
            this.isChanged = true;
            this.isChangedChange.emit(this.isChanged);

            if(this.type == "image"){
              //reload page
              this._wr.helperService.gotoPage({extraParams: {}});
            }
            this.savedData = res.content?.results?.[0];
          },
          error : (err) => {},
          complete : () => {
            /* if(!this.nonToggable){ */
              this.hasSaved = true;
  
              if(isObj){
                this.config.formGroup.get(this.formControlName)?.setValue(val, {emitEvent: false});
  
                if(this.type != "multiselect"){
                  this.displayVal = val?.name;
                } else {
                  this.displayVal = val;
                }
  
              }else{
                if(this.type != 'password'){
                  if(this.type == 'boolean') {
                    this.displayVal = (val === true) + '';
                  } else if(this.type != 'date'){
                    this.displayVal = val;
                  }
                }
              }
  
              if(this.type != "address"){
                this.egInPlace?.deactivate();
                //this.editMode = false;
              }
  
              if(this.type == 'json'){
                this.displayVal = JSON.parse(this.savedData?.[this.formControlName] || '{}');
              }
              this._files = {};
              this._wr.messageService.add({detail: 'Successfully saved.' , severity: MESSAGE_SEVERITY.SUCCESS})
            }
          /* } */
        });

        break;

      default:
        break;
    }
  }

  public handleCallback(event, type?: string){
    /* console.log({event, type}); */
    if(type == "uploadApiCallback"){
      this._files[this.formControlName] = event || [];
      this.config.formGroup.updateValueAndValidity();
      this.save()
    } /* else{ RT
      this.save(event, type);
    } */
    else if(this.type == 'multiselect'){
      this.save(event, type);
    }
    this._value = event?.id;
    this.displayVal = event?.name;
  }


  public toggleEditor(event){
    switch (event) {

      case "edit":
        this.editMode = true;
        this.hasSaved = false;
        this._fcNameCopy = {...this.config.formGroup.get(this.formControlName)}.value
        this.config.formGroup.updateValueAndValidity();
        break;

      case "save":
        if(!this.nonToggable){
          if(this.hasSaved){
            this.config.formGroup.updateValueAndValidity();
          } else {
            this.config.formGroup.updateValueAndValidity();
            this.save()
          }
          this.editMode = false;
        } else{
          //this.config.formGroup.updateValueAndValidity();
          this.save()
        }
        break;

      case "cancel":
        if(this.type == "multiselect"){
          this.displayVal = this._fcNameCopy;
        }
        this.config.formGroup.get(this.formControlName)?.setValue(this._fcNameCopy, {emitEvent: false});
        this.editMode = false;
        break;

      default:
        break;
    }
    if(!this.nonToggable){
      this.editModeChange.emit(this.editMode);
    }
  }

  public switchChanged(e) {
    if(this.config?.formGroup?.get(this.formControlName)){
      this.config.formGroup.get(this.formControlName).setValue(e);
    }

    this.toggleEditor('save');
  }
}
