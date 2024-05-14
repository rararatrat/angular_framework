import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PrimeIcons, ConfirmationService, FilterService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { apiMethod, ConfirmDialogResult, Core, CoreService, GridService, HelperService, ResponseObj } from '@eagna-io/core';
import { AutocompleteConfig, editorFieldConfigType, FormStructure, IAddComponentData, InPlaceConfig, objArrayType } from '@library/library.interface';
import { TitleCasePipe } from '@angular/common';
import { WrapperService } from '@library/service/wrapper.service';


@Component({
  selector: 'eag-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddComponent {
  public api$: (p: any, method: apiMethod) => Observable<ResponseObj<any>>;

  public hideDeleteButton       : boolean = false;
  public fields                 : {label: string, field: string, required?: boolean, form: string, value: string, dateModel: any, listOptions?: any[]}[];
  public formGroup              : FormGroup;
  public pi                     : any = PrimeIcons;
  public fieldMeta              : Core = Core.FieldMeta;
  public localeValue            : any = this._coreService.getLocaleFormat();
  public mode                   : 'view' | 'add' | 'edit' = 'add'; //default to view
  public inPlaceConf            : InPlaceConfig;
  public objArray               : objArrayType = {};
  public formStructure          : (string | FormStructure)[] = undefined;
  public arr                    : [];
  public loading                : boolean = true;
  public isChanged              : boolean = false;
  public editingField           ?: string;

  public hasInclFields          : boolean = false;
  public hasFormStructure       : boolean = false;
  public inclFields             : string[] = null;
  public headers                : any = {title: null, description: null};
  public editorFieldConfigs     ?: { [field: string]: editorFieldConfigType };
  public subscription           = new Subscription();

  public configData                 : IAddComponentData;
  public files                  : { [file_name: string]: File[]; } = {};
  public isReadonly: boolean;
  /* sampleComponent = SampleCompoenentComponent; */

  constructor(private _helper       : HelperService,
              private _fb           : FormBuilder,
              private _coreService  : CoreService,
              private _confirmationService: ConfirmationService,
              private _titleCase          : TitleCasePipe,
              public filterService        : FilterService,
              private _wr                 : WrapperService,
              private _cdr                : ChangeDetectorRef,
              @Optional() public ref? : DynamicDialogRef,
              @Optional() private _config?: DynamicDialogConfig<IAddComponentData>,
    ) {
      this.configData              = this._config?.data;
      this.mode               = this._config?.data?.mode;
      this.hideDeleteButton   = this.configData?.hideDeleteButton == true;
      this.editingField       = this.configData?.editingField;
      this.editorFieldConfigs = this.configData?.editorFieldConfigs;
      this.formStructure      = this._config.data.formStructure;
      this.isReadonly         = this.configData.isReadonly == true;

      //console.log({configData: this.configData});

      /* RT: TODO
      this.formStructure      = this._config.data.formStructure.filter(fs => {
        if(typeof fs == "object"){
          return this._data?.fields.some(ff => fs.fields.includes(ff.field));
        }
        return this._data?.fields.includes(fs);
      }); */

      /* this.formStructure      = this._config.data.formStructure
      .filter(fs => {
        return typeof fs == "string" && true
      })
      .map(fs => {
        if(typeof fs == "object"){
          return {...fs, fields: fs.fields.filter(fss => true)};
        }
        return fs;
      }); */

      this.headers            = {title:this.configData?.title, description:this.configData?.description}
      this._initForm();
      this._initInplaceData();
  }

  ngOnInit(): void {
    this._cdr.detectChanges();
  }

  public toggle(index){
    this.formStructure[index]['collapsed'] = !this.formStructure[index]['collapsed'];
  }

  public collapsedChange(event, fs){
    fs['collapsed'] = event;
  }

  public hasObjInArr(arr: any[]): boolean {
    return arr.some(item => typeof item === 'object');
  }


  private _initForm(){
    const _reqFields: string[]      = this.configData?.requiredFields || []; //optional fields array
    const _excludedFields: string[] = this.configData?.excludedFields || (this.mode != 'edit' ? ['id', 'mig_id'] : []); //excluded fields array (e.g. id)
    const _includedFields: string[] = this.configData?.includedFields || (this.mode != 'edit' ? ['id', 'mig_id'] : []); //included fields array (e.g. id)
    const _lockedFields: string[]   = this.configData?.lockedFields || (this.mode != 'edit' ? ['id', 'mig_id'] : []); //locked fields for editing (e.g. position)
    const _toForm: any              = {};

    this.fields = this.configData?.fields?.map((_f: any) => {
      let dateModel   = undefined;
      const _objKey   = _f?.field || Object.keys(_f)?.[0];
      let value: any  = '';

      value = (((this.configData?.item?.[_objKey] || this.configData?.item?.[_objKey] >= 0) ? (this.configData?.item?.[_objKey]) : '') || '');

      /* if(!value && _objKey == 'group' && this._data?.fromComponent == 'translations') {
        value = 'translations';
      } */
      if(_f[_objKey] == 'Date' && this._wr.helperService?.isNotEmpty(value)){ //reformat value for Date and amend Data
        value = new Date(value);
      }

      /* Check if there is a value in param and set the form field */
      const disabled = _lockedFields?.includes(_objKey);
      if(this.mode == "add"){
        Object.keys((this.configData?.params || [])).forEach((key, val) => {
          if(_objKey == key){
            //value = {id: this._data.params[key], name: "Lawrence"};
            value = this.configData.params[key]
          }
        })
      }

      if(!(_excludedFields)?.includes(_objKey)){
        if(!_f?.required && !_reqFields?.includes(_objKey) || _f.form == "boolean"){
          _toForm[_objKey] = [{value: (value || ''), disabled}];
        } else {
          _toForm[_objKey] = [{value: (value || ''), disabled}, [Validators.required]];
        }
      }

      const _toReturn = {
        form: _f.form,
        label: _objKey,
        field: _f[_objKey],
        value: value,
        dateModel,
        required: _f.required,
      };

      return _toReturn;
    }).filter((_f: any) => {
      if(_includedFields?.length > 0){
        return _includedFields?.includes(_f.label) && !(_excludedFields).includes(_f.label) ;
      }else {
        return !_excludedFields?.includes(_f.label);
      }
    });
    this.api$ = (p: any, m: apiMethod) => this.configData?.api(p, m);
    this.formGroup = this._fb.group(_toForm);

    if(this.mode != "add"){
      if(this.formGroup.hasOwnProperty('currency')){
        this.formControlUpdated({data: this.formGroup.get('currency').value, formControl: 'currency'})
      }
      if(this.formGroup.hasOwnProperty('unit')){
        this.formControlUpdated({data: this.formGroup.get('unit').value, formControl: 'unit'})
      }
    }

    /* const _controls = this.formGroup?.controls;
    for (const key in _controls) {
      if (Object.prototype.hasOwnProperty.call(_controls, key)) {
        const element = _controls[key];
        console.log({key, err: element.errors, valid: element.valid, value: element.value, element});
      }
    } */
  }

  get formType(){
    /* if(this.hasInclFields){
      if(this.hasFormStructure){
        return "form_structure";
      }else{
        return "included_fields";
      }
    } */
    if(this.hasFormStructure){
      return "form_structure";
    } else if(this.hasInclFields) {
      return "included_fields";
    } else {
      return "default";
    }
  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  typeof(val){
    return typeof(val);
  }

  onDelete($event?: any){
    this._confirmationService.confirm({
      message: 'Are you sure you want to delete?',
      header: 'Delete Confirmation',
      icon: 'pi pi-info-circle',
      accept: () => {
          this.subscription.add(this.api$?.({id: this._config?.data.item?.['id']}, 'delete')?.subscribe(res => {
            if([200, 201].includes(res?.status.status_code)){
              this.ref.close(<ConfirmDialogResult>{isConfirmed: true, isDeleted: true});
            }
          }));
      }
    });
  }

  onSave($event?: any) {
    let _params: any = {};
    this.fields?.forEach(_f => {
      const _formField = this.formGroup.get(_f?.label);
      if( _formField && (this.configData?.formStructure?.length == 0 || (this.configData.byPassFormStructure || (this.configData.formStructure?.find(_fs => typeof _fs == 'string' ? _fs == _f?.label : _fs.fields.includes(_f?.label))))) ){
        let _val = _formField.value;
        if(_f.field == "Boolean"){
          _val = _val == true;
        }
        if(_f?.label == 'id'){
          _val = parseInt(_val);
        }

        const _tmpFType = this.configData?.formProperties?.[_f.label]?.type;
        if(["autocomplete", "select", "multiselect"].includes(_f.form) || (_tmpFType && ["autocomplete", "select", "multiselect"].includes(_tmpFType))){
          let _valKey : any = null;

          //if(!this._data?.hasAddCallbackOverride){
            if(this.configData?.formProperties?.[_f.label]?.autoConfig?.hasOwnProperty('saveField')){
              _valKey = this.configData?.formProperties?.[_f.label]?.autoConfig?.saveField;
            }else{
              _valKey = this.configData?.formProperties?.[_f.label]?.autoConfig?.title || 'id';
            }
          //}

          if(!this.configData?.hasAddCallbackOverride){
            if(typeof _val  == "object" && _val?.hasOwnProperty(_valKey)){
              _val = _val[_valKey];
            } /* RT */ else if(_valKey != 'name ' && _val?.hasOwnProperty('name') && _val?.['name']){ //mostly for select without options
              _val = _val['name'];
            }
          }
        }


        if(this._helper.isNotEmpty(_val)){
          if(typeof _val  == "object"){
            if(_val?.[Object.keys(_val)?.[0]]){
              _params[_f?.label] = _val; //mostly for select without options
            }
          } else {
            _params[_f?.label] = _val;
          }
        }

        if(_f.field == "Date" && _formField.value){
          try{
            _params[_f?.label] = new Date(_formField.value).toISOString();
          } catch(e){
            this._wr.messageService?.add({detail: e,
              summary: Core.Localize('invalidDateForField', {field: _f?.label, dateValue: _params[_f?.label]})})
          }
        } else if(_f.field == "JSON" && _formField.value){
          try{
            //_params[_f?.label] = this._helper.stripHtml((_formField.value || '').replaceAll(' ', ''));
            _params[_f?.label] = JSON.stringify(this._helper.stripHtml((_formField.value || '').replaceAll(' ', '')));
          } catch(e){
            this._wr.messageService?.add({detail: e,
              summary: Core.Localize('invalid_item', {item: 'JSON'})})
          }
        }
      }
    });

    if(!this.configData?.hasAddCallbackOverride){
      if(this.configData.hasOwnProperty('params') && this.configData.params != null){
        _params = this._wr.libraryService.toFormData({..._params, ...this.files, ...this.configData?.params});
      }else{
        _params = this._wr.libraryService.toFormData({..._params, ...this.files});
      }


    }

    const _that = this;
    if(this.configData?.hasAddCallbackOverride){
      this.ref.close(<ConfirmDialogResult>{isConfirmed: true, rawData: _params/* , apiData: {test: 'hello'} */});
    } else{

      this.subscription.add(this.api$?.(_params, (this.mode == 'edit' ? 'patch' : 'put'))?.subscribe({next: (result: ResponseObj<any>) => {
          if([200, 201].includes(result?.status.status_code)){
            this.ref.close(<ConfirmDialogResult>{isConfirmed: true, rawData: _params, apiData: result?.content});
          }
        }, error: err => {
          for (const key in err?.error?.content?.results[0] || {}) {
            if (Object.prototype.hasOwnProperty.call(err?.error?.content?.results[0] || {}, key)) {
              const element = err?.error?.content?.results[0]?.[key];
              if(element?.[0]){
                this.formGroup?.get(key)?.setErrors({err: element?.[0]});
              }
            }
          }
      }}));
    }


  }

  private _initInplaceData(){
    //inPlaceConf
    this.inPlaceConf = {
      mode        : (this.mode || 'add'),
      formGroup   : this.formGroup,
      method      : "api",
      isDisabled  : false,
      isWholeForm : true,
      permission  : this.configData?.permission, /* this.cc.permission */
      api$: this.api$,
      onUpdate : (a, b) => {}
    };


    this.objArray =  this._initFormArray();
    this.hasInclFields = (this.configData?.includedFields?.length > 0);
    this.hasFormStructure = (this.configData?.formStructure?.length > 0);
    this.inclFields = this.configData?.includedFields?.filter(f => {
      return this.fields?.find(e => e.label == f)
    });


    //listen to form changes
    /* console.log({objArray: this.objArray}); */
    const _tplWithCallback = Object.keys(this.objArray).filter(_key => this.objArray[_key].formChangesToCallback && this.objArray[_key].callback != undefined && this.objArray[_key].callback != null);
    const _controls = this.formGroup.controls;
    if((_tplWithCallback || []).length > 0){
      for (const key in _controls) {
        if (Object.prototype.hasOwnProperty.call(_controls, key)) {
          const element = _controls[key];
          if(_tplWithCallback.includes(key)){
            const _fc = this.formGroup?.get(key);
            if(_fc){
              this.subscription.add(_fc.valueChanges.subscribe(val => {
                this.objArray[key]?.callback({value: val, formControl: key}, this.formGroup);
              }));
            }
          }
        }
      }
    }
    //end listen

    this.loading = false;
  }

  private _initFormArray(): any{
    let _tmp: objArrayType = {};
    let _overrides: objArrayType = {};
    this.fields?.forEach((_f) => {
      _tmp[_f.label] = {
        isEditable:false,
        isDisabled:false,
        title: _f.label,
        icon: "fa-solid fa-circle",
        type: (_f.form || "text"),
        formControlName: _f.label,
        displayVal: null,
        //placeholder: (this._titleCase.transform((_f.form == "number" ? '0' : _f.label) || "")),
        placeholder: "",
        styleClass:"w-full",/*
        form: _f.form */
        required: _f.required,
        //TODO: numberConfig default for number
        ...(_f.form == "number" ? {numberConfig: {mode: 'decimal', minFractionDigits: 1}} : {}),
        ...(_f.form == "textarea" && this._config?.data?.formProperties?.[_f.label]?.textArea ? {textArea: this._config?.data?.formProperties?.[_f.label]?.textArea} : {})
      }

      if(GridService.ObjectFields.includes(_f.form)){
        _overrides[_f.label] = {autoConfig: {title: 'name'}, displayVal: `${_f.label}.name`, data: `${_f.label}.name`}; //RT: where is data used for?
      }
    });

    if(this.configData?.formProperties){
      // console.log("_overrides 1",{..._overrides})
      _overrides = {..._overrides, ...this.configData.formProperties};
      // console.log("_overrides 2",{..._overrides})
    }

    for (const key in _overrides) {
      if (Object.prototype.hasOwnProperty.call(_overrides, key)) {
        const element = _overrides[key];
        Object.keys(element).forEach((_k) => {
          if(_tmp[key]){
            if(_k == "displayVal" || (_k == "data" && element.type != "chip-labels"/*  && element.type != "address" */)){ //todo radio
              ////console.log({[key]: this._data?.item?.[key]});
              if(this._helper.isNotEmpty(this.configData?.item?.[key])){
                const _d = element[_k];
                _tmp[key][_k] = this._getDisplayByKey(_d);
              }
            } else{
              _tmp[key][_k] = element[_k];
            }
          }
        });
      }
    }
    return _tmp;
  }

  private _getDisplayByKey(_d: string): any{
    let _tmpObjChanged = false;
    let _tmpObj: any = this.configData?.item?.__data__ || this.configData?.item;
    if(typeof _d == 'string'){
      const _dArr: any[] = (_d?.split(".") || []); //"address.shipping" => ["address", "shipping"]
      /** e.g. the _data.item holds
       * 1.) account_id: {name: string, id: number},
       * 2.) or __data__ : {account_id: {name: string, id: number}}
       */
      _dArr.forEach(_dd => {
        if(this._helper.isNotEmpty(_tmpObj?.[_dd])){
          _tmpObj = _tmpObj?.[_dd];
          _tmpObjChanged = true;
        } else{
          _tmpObj = null;
          _tmpObjChanged = true;
        }
      });
    }

    return _tmpObjChanged ? _tmpObj : '';
  }

  public formControlUpdated(input){
    //this._config.data?.formChanged?.({input, objArray: this.objArray});
    this.objArray[input?.formControl]?.callback?.({input, objArray: this.objArray});

    let fp = this._config.data.formProperties;
    if(fp){
      Object.keys(fp).forEach(e => {
        if(fp[e].numberConfig != undefined){
          if(fp[e].numberConfig.mode == "currency" && input.formControl=="currency"){
            if(!fp[e].numberConfig['isDynamic']){
              fp[e]['numberConfig'].currency = (typeof(input.data.name) == 'object')?input.data.name.name : input.data.name;
            }

          }else if(fp[e].numberConfig.mode == "decimal" && (fp[e].numberConfig.suffix == undefined)){
            if(fp[e].numberConfig.type == "unit"){
              fp[e]['numberConfig'].suffix = (typeof(input.data.name) == 'object')?input.data.name.name : input.data.name;
            }
          }
        }
      });

      if(fp[input.formControl]){
        fp[input.formControl].data = input.data;
      }
    }


  }

  afterSaved(isChanged){
    if(this._config?.data){
      this._config.data.isChanged = isChanged;
    }
  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
  }
}
