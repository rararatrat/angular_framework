import { ChangeDetectorRef } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { GridResponse, GridService, HelperService, ResponseObj, apiMethod } from "@eagna-io/core";
import { DetailsContainerConfig, IContainerWrapper, InPlaceConfig, objArrayType } from "@library/library.interface";
import { WrapperService } from '@library/service/wrapper.service';
import { Observable, Subscription } from "rxjs";

export class DetailsConfig {
    public fields         : any;
    public permission     : any;
    public aggs           : any;
    public data           : any;
    public objArray       : objArrayType;
    public formGroup      : FormGroup;
    public inPlaceConf    : InPlaceConfig;
    public api            : (p?: any, method?: apiMethod, nextUrl?, append?: string) => Observable<ResponseObj<any>>;
    private _fb           : FormBuilder;
    private _wr           : WrapperService;
    public currentType    : "dialog" | "component" | "route";
    public config         : DetailsContainerConfig;
    public isLoading      : boolean = true;
    public hasData        : boolean = false;
    public cdr            ?: ChangeDetectorRef;

    public subscription = new Subscription();

    constructor(details: {
        config  : DetailsContainerConfig
        fb      : FormBuilder,
        wr      : WrapperService,
        cdr     ?: ChangeDetectorRef;
    }){
        this.api = details.config.detailsApi$;
        this.config = details.config;
        this._fb = details.fb;
        this._wr = details.wr;
        this.cdr = details.cdr;
        this.init(this.config.dialogConfig, this.config.data)
    }

    init(dialogConfig, data){
      const temp = this._wr.libraryService.getRenderedType(dialogConfig, data);
      this.currentType = temp;

      switch(temp){
        case "route":
          this.fetchData();
          break;
        case "dialog":

          if (dialogConfig.data.hasOwnProperty('item') && dialogConfig.data?.item != undefined && dialogConfig.data?.item.hasOwnProperty('id')){
            this.data       = dialogConfig.data?.item;
            this.permission = dialogConfig.data?.permission;
            this.fields     = dialogConfig.data?.fields;
            this.aggs       = dialogConfig.data?.aggs;

            this._initFormGroup();
            this.objArray = this._initFormArray();
            this._initInplaceData();
            this.isLoading  = false;
          }else {
            this.fetchData();
          }
          /* this.fetchData((dialogConfig.data?.item?.id || dialogConfig.data?.id)); */
          break;

        case "component":
          if (data.hasOwnProperty("content")){
            this.data       = data?.content.results[0];
            this.permission = data?.content.permission;
            this.fields     = data?.content.fields;
            this.aggs       = data?.content.aggs;

            this._initFormGroup();
            this.objArray = this._initFormArray();
            this._initInplaceData();
            this.isLoading  = false;
          }else {
            this.fetchData(this.config.itemId);
          }

          break;
      }

    }

    setHeader(){
      let header = {
        title: null,
        subtitle: null
      }

      switch(this.currentType){
        case "component":
          break;
        case "dialog":
        case "route":
          if(this.data.hasOwnProperty('name') && (this.data.name != null && this.data.name != "")){
            header = {
              title: this.data?.name?.toString(),
              subtitle: this.data?.name?.toString()
            }
          }else {
            header = {
              title     :  this.config?.header?.toString(),
              subtitle  :  (this.config?.subTitle) ? this.config?.subTitle?.toString() : null
            }
          }
          break;
      }
      this.config.header = this._wr.libraryService.titleCasePipe.transform(header?.title);
      this.config.subTitle = this._wr.libraryService.titleCasePipe.transform(header?.subtitle);
      return header;
    }

    fetchData(param?){
      this.isLoading = true;
      let id = (param != null && param != undefined) ? param : this.config.itemId;
      this.api({id:id}, "post", null).subscribe({
        next : (res) => {
          this.data        = this._wr.helperService.isNotEmpty(id) ? res.content.results[0] :  res.content.results; // {}
          this.permission  = res.content.permission
          this.fields      = res.content.fields
          this.aggs        = res.content.aggs

          /* console.log({reqFields: this.fields.filter(_f => _f.required).map(_f => _f.field)});
          console.log({allFields: this.fields.map(_f => _f.field)}); */

          this._initFormGroup();
          this.objArray = this._initFormArray();
          this._initInplaceData();
          this.setHeader();
        },
        error: (err) => {
          this.isLoading  = false;
          this.triggerChangeDetection();
        },
        complete : () => {
          this.config.onApiComplete?.(this.permission, this.data);
          this.isLoading  = false;
          this.triggerChangeDetection();
        }
      })
    }

    setData(item, fields, permission, data?){
        this.data = item;

        if(!this.fields){
            this.fields = fields;
        }

        if(!this.permission){
            this.permission = permission
        }

        if(this.data != null){

        }

        this._initFormGroup();
        this.objArray = this._initFormArray();
        this._initInplaceData();
    }

    private _initFormGroup(){
        const _toForm: any = {};
        const _reqFields = this.config.formProperty?.requiredFields || [];
        const _excludedFields = this.config.formProperty?.excludedFields || [];
        const _lockedFields   = this.config.formProperty?.lockedFields || ['id', 'mig_id'];
        const _includedFields   = this.config.formProperty?.includedFields || [];
        this.fields = this.fields?.map((_f: any) => {
          let dateModel = undefined;
          const _objKey = _f?.field || Object.keys(_f)?.[0];

          let value: any = (_objKey == 'group' && this.data?.fromComponent == 'translations') ? 'translations'  : ''

          //value = (((this.data?.[_objKey] || this.data?.[_objKey] >= 0) ? (this.data?.[_objKey] + '') : '') || '');
          value = (((this.data?.[_objKey] || this.data?.[_objKey] >= 0) ? (this.data?.[_objKey]) : '') || '');

          if(_f[_objKey] == 'Date' && value){ //reformat value for Date and amend Data
            value = new Date(value);
          }

          const disabled = _lockedFields?.includes(_objKey);

          /*const uniqueValidator = (_objKey): ValidatorFn | null => {
            return (control: AbstractControl): ValidationErrors | null => {
              const val = control.value;
              if(this.formGroup && ['to', 'cc', 'bcc'].includes(_objKey)){
                for (const field of ['to', 'cc', 'bcc']) {
                  if(field != _objKey){
                    if( (this.formGroup.value[field] || []).filter(fv => (val || []).includes(fv)).length > 0 ){
                      return {
                        notUnique: val
                      };
                    }
                  } else if(Array.isArray(val) && val.find((a, b, c)=>c.filter(cVal => cVal==a).length > 1)){
                    return {
                      notUnique: val
                    };
                  }
                }
              }
              return null;
            };
          } */

          if(!(_excludedFields)?.includes(_objKey)){
              let modValue = replaceWith__data__(this.data, _objKey, value);
              //_toForm[_objKey] = [{value: (modValue || ''), disabled}, [...( (_f.required || _reqFields?.includes(_f.label)) ? [Validators.required] : []), ...[uniqueValidator(_objKey), /* Validators.email */]] ];
              _toForm[_objKey] = [{value: (modValue || ''), disabled}, [...( ((_f.required || _reqFields?.includes(_f.field)) && _f.form != "boolean") ? [Validators.required] : []),
              /* custom validators */
              ...(this.config?.formProperty?.formProperties?.[_f.field]?.validators || []) ]];
          }

          const _toReturn = {
            form  : _f.form,
            label : _objKey,
            field : _f[_objKey],
            value : replaceWith__data__(this.data, _objKey, value),
            dateModel,
            required: (_f.required==true),
          };
          return _toReturn;
        }).filter((_f: any) => {
          if(_includedFields?.length > 0){
            return _includedFields?.includes(_f.label) && !(_excludedFields).includes(_f.label) ;
          }else {
            return !_excludedFields?.includes(_f.label);
          }
        }); //TODO: filters

        /* console.log({_toForm}); */
        this.formGroup = this._fb?.group(_toForm);

        function replaceWith__data__(data, field, value){
          if(data.hasOwnProperty("__data__") && data.__data__.hasOwnProperty(field)){
            return data?.__data__[field];
          }else{
            return value;
          }
        }
    }

    private _initFormArray(){
        let _tmp: any = {};
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
            placeholder: "",
            styleClass:"w-full",
            form: _f.form,
            required: (_f.required==true),
            parentFormGroupKey: this.config?.formProperty?.formProperties?.[_f.label]?.parentFormGroupKey,
            isRawText: (this.config?.formProperty?.formProperties?.[_f.label]?.textArea?.isRawText == true),
            tinyMceConfig: this.config?.formProperty?.formProperties?.[_f.label]?.textArea?.tinyMceConfig,
            ...(_f.form == "number" ? {numberConfig: {mode: 'decimal'}} : {}),
          }

          if(GridService.ObjectFields.includes(_f.form)){
            _overrides[_f.label] = {autoConfig: {title: 'name'}, displayVal: `${_f.label}.name`};
          }

        });

        if(this.data?.formProperties){
          _overrides = {..._overrides, ...this.data?.formProperties};
        }else if(this.config.formProperty?.formProperties) {
          _overrides = {..._overrides, ...this.config.formProperty?.formProperties};
        }

        for (const key in _overrides) {
          if (Object.prototype.hasOwnProperty.call(_overrides, key)) {
            const element = _overrides[key];
            Object.keys(element).forEach((_k) => {
              if(_tmp[key]){
                if(_k != "displayVal"){
                  _tmp[key][_k] = element[_k];

                } else{
                  if(this._wr?.helperService.isNotEmpty(this.data?.[key])){
                    const _d = element[_k];
                    _tmp[key].displayVal = this._getDisplayByKey(_d); //RT
                  }
                }
              }
            });
          }
        }
        return _tmp;
    }

    public overrideObjArray(){

      this.objArray = this._initFormArray();
      /* this._initInplaceData(); */
    }

    private _initInplaceData(){
        this.inPlaceConf = {
            mode        : (this.config?.formProperty?.mode) ? this.config?.formProperty.mode : 'view',
            formGroup   : this.formGroup,
            method      : this.config?.formProperty?.mode == "add" ? "callback" : "api",
            isDisabled  : false,
            isWholeForm : false,
            permission  : this.permission, // this.cc.permission
            paramUpdate : this.config.paramUpdate ? (param, p2) => this.config.paramUpdate(param, p2)  : (param) => param,
            api$: (p, m, n?) => this.api(p, m, n),
            onUpdate : (a, b) => {
              this.config?.callback(a, b);
            }
        };
        // this.objArray =  this._initFormArray();
        // this.hasInclFields = (this._data?.includedFields?.length > 0);
        // this.inclFields = this._data?.includedFields?.filter(f => {
        //   return this.fields?.find(e => e.label == f)
        // });
        // this.loading = false;
    }

    private _getDisplayByKey(_d: string): any{
      const _dArr: any[] = (_d?.split(".") || []); //"address.shipping" => ["address", "shipping"]
      /** e.g. the _data.item holds
       * 1.) account_id: {name: string, id: number},
       * 2.) or __data__ : {account_id: {name: string, id: number}}
       */
      let _tmpObj: any = this.data.__data__ || this.data;
      let _tmpObjChanged = false;

      _dArr.forEach(_dd => {
          if(this._wr.helperService.isNotEmpty(_tmpObj?.[_dd])){
          _tmpObj = _tmpObj?.[_dd];
          _tmpObjChanged = true;
          } else{
          _tmpObj = null;
          _tmpObjChanged = true;
          }
      });

      return _tmpObjChanged ? _tmpObj : '';
    }

    public triggerChangeDetection() {
      this.cdr?.markForCheck(); // Marks the component and its ancestors as dirty
      this.cdr?.detectChanges(); // Triggers change detection for the component and its descendants
    }

    public typeof(val){
      return typeof(val);
    }

    /** If used, note that subscription can be inherited, just make sure to unsubscribe after */
    public addModal(p?: IContainerWrapper, mode: 'add' | 'edit' | 'view' | 'delete' ='add'){
      let _p: IContainerWrapper = {apiService: (p, m, n) => this.api(p, m, n)};
      const _that = this;

      const _addModal = () => {
        _p = {
          ..._p,
          ...p,
          title: (p.title || 'Test')
        };

        /* console.log({_p, _that}); */

        this._wr.containerService.dialogAction(mode, _p);
      }

      if(!p?.apiService){
        if(this.fields && this.permission){
          //_p.res = [this.data];
          _p.gridFields = this.fields;
          _p.permission = this.permission;
          _addModal();
        } else if(this.api){
          this.subscription.add(
          this.api({}, 'post').subscribe((res: ResponseObj<GridResponse>) => {
            _p.res = res;
            _p.gridFields = res.content.fields;
            _p.permission = res.content.permission;
            _addModal();
          }));
        } else{
          //
        }
      } else{
        p.apiService({}, 'post').subscribe((res: ResponseObj<GridResponse>) => {
          _p.res = res;
          _p.gridFields = res.content.fields;
          _p.permission = res.content.permission;
          _addModal();
        });
      }


      /* this._subscription.add((p?.apiService({}, 'post').subscribe((res: ResponseObj<GridResponse>) => {
        // console.log(this.data);
        // console.log(this.api);
        // console.log(this.fields);
        // console.log(this.permission);
        console.log({that: this});

        // res:
        // permission: res.content?.permission,
        // gridFields: res.content?.fields,
        // noModalHeight: true,


        const iContainerWrapper: IContainerWrapper = {
          apiService: p.apiService,

          title: p.title,
          params: (p.params || {}),
          noModalHeight: p.noModalHeight == true,
          // addCallback: (p2) => {
          //   if(p2?.isConfirmed){
          //     this.egSubItem?.gridList?.grid?.refresh();
          //     //if(this.egTask?.taskGridList?.grid?.isChanged()){TODO}
          //   }
          // },
          ...(p.formProperties ? {formProperties: p.formProperties} : {}),
          ...(p.formStructure ? {formStructure: p.formStructure} : {}),
          ...(p.detailComponent ? {detailComponent: p.detailComponent} : {}),
        };
        this._wr.containerService.dialogAction(mode, iContainerWrapper);
      }))) */
    }
}
