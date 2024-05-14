import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { Core, GridResponse, MESSAGE_SEVERITY, ResponseObj, apiMethod } from '@eagna-io/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DetailsContainerConfig, FormStructure, InPlaceConfig, objArrayType, template_type } from '@library/library.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DetailsConfig } from '@library/class/details-config';
import { ActivatedRoute, Router } from '@angular/router';
import { WrapperService } from '@library/service/wrapper.service';
import { CrmService } from 'src/app/crm/crm.service';
import { EmailRenderer } from '@library/container-collection/email-renderer/email.renderer';
import { Observable, Subscription, filter, forkJoin, map, merge, pairwise, startWith } from 'rxjs';
import { SettingsService } from 'src/app/settings/settings.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'eg-mail-detail',
  templateUrl: './mail-detail.component.html',
  styleUrls: ['./mail-detail.component.scss']
})
export class MailDetailComponent {
  @Input() param: any;
  public api = (p?: any, method?: apiMethod, nextUrl?) => this._settingsService.email_templates(p, method, nextUrl);
  public loading = true;
  public fp: {formProperties: objArrayType, formStructure: (string | FormStructure)[]};
  public objArray: any;
  public editingField: string;
  public formGroup: FormGroup;
  public inPlaceConf: InPlaceConfig;
  private _subs = new Subscription();
  private _afterFirstLoad: boolean;
  private _oldLang: string;
  private _renderedType: string;
  private _languages: any[];
  private _apiData: any;
  private _isLangSet: boolean;
  private _egContents: any[];
  //data: any;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _fb: FormBuilder,
    private _wr: WrapperService,
    private _crmService: CrmService,
    private _settingsService: SettingsService,
    private _crf: ChangeDetectorRef,
    private _messageService: MessageService,
    @Optional() public ref: DynamicDialogRef,
    @Optional() public dialogConfig: DynamicDialogConfig) {}

  public config             : DetailsContainerConfig = null;
  public detailsConfig      : DetailsConfig;
  public id                 : number;
  public mode               : 'add' | 'edit' | 'view';
  @Input() data             : any;

  ngOnInit(): void {
    this._renderedType = this._wr.libraryService.getRenderedType(this.dialogConfig, this.data);
    this.mode = this._renderedType == "route" ? "edit" : this.dialogConfig?.data?.mode;
    this.fp = EmailRenderer.getTemplateFormProperties();
    this.initDetailsContainer();
    this._listenContent();
  }

  private _loadPlaceholders(template_type: template_type = 'quotes'){
    let _fieldsApi;
    
    //TODO: fieldsApi can be outside computed function
    switch (template_type) {
      case 'creditnotes':
        _fieldsApi = (p, m) => this._crmService.sales_credit_notes(p, m);
        break;

      case 'purchaseorders':
        _fieldsApi = (p, m) => this._crmService.purchase_orders(p, m);
        break;

      case 'invoices':
        _fieldsApi = (p, m) => this._crmService.sales_invoices(p, m);
        break;
      
      case 'order':
        _fieldsApi = (p, m) => this._crmService.sales_orders(p, m);
        break;

      case 'reminder':
        _fieldsApi = (p, m) => this._crmService.sales_payment_reminders(p, m);
        break;
    
      default:
        _fieldsApi = (p, m) => this._crmService.sales_quotes(p, m);
        break;
    }

    this.loading = true;
    this._subs.add(_fieldsApi({limit: 1}, 'options').subscribe((res: ResponseObj<GridResponse>) => {
      this.detailsConfig.config.formProperty.formProperties = {...this.detailsConfig.config.formProperty.formProperties, 
          placeholders: {type: "chip-labels", data: (res?.content.fields || []).concat({field: 'link_to'}).map(_f => ({label: _f.field, value: _f.field})), callback: (p, f) => {
            this._chipLabelCallback(p);
          }
      }};

      //this.detailsConfig.triggerChangeDetection();
      //setTimeout(() => {
        //this._getIsDefaults(template_type);
      //});

      this.detailsConfig.overrideObjArray();
      
      this.loading = false;
      this._crf.detectChanges();

      /* if(this.mode != 'add'){
        this.detailsConfig.formGroup.get('eg_content_type').disable();
      } */
    }));
  }

  private _listenContent(){
    this._subs.add(this.detailsConfig?.formGroup?.get('subject')?.valueChanges.subscribe(_newSubj => {
      this._applValueChange();
    }));
    this._subs.add(this.detailsConfig?.formGroup?.get('content')?.valueChanges.subscribe(_newContent => {
      this._applValueChange();
    }));
  }

  public initDetailsContainer() {
    const _itemId = this._renderedType == "route" ? this._activatedRoute?.snapshot?.params?.['id'] : (this.dialogConfig?.data?.item?.id);
    if(this._renderedType == 'dialog'){ //TODO: async first of 

    }

    this.config = {
      hasHeader     : true,
      showDetailbar: true,
      header        : (this.dialogConfig?.data?.title ? `${this.dialogConfig?.data?.title} Details` : "Details Menu"),
      subheader     : "Conditions Details",
      dialogConfig  : this.dialogConfig,
      dialogRef     : this.ref,
      /* data          : this.data, */
      itemId        : _itemId,
      detailsApi$    : (param, method, nextUrl)   => {
        return this.api(param, method, nextUrl).pipe(map((res: ResponseObj<GridResponse>) => {
          res.content.fields = res.content.fields.map(_f => {
            if(_f.field == "eg_content_type"){
              _f.required = true;
            }
            return _f;
          })
          .concat([
            {subject: "String", form: "text", field: "subject", required: true},
            {content: "String", form: "textarea", field: "content", required: true},
            {placeholders: "String", form: "chip-labels", field: "placeholders", required: false},
            /* {template: "Number", form: "select", field: "template", required: true}, */
            {language: "String", form: "select", field: "language", required: true},
          ]);
          //that.fields = res.content?.fields;
          return res;
        }))
      },
      hasUpdates    : true,
      updateApi$    : (param, method, nextUrl)   => {
        return this._crmService.project_updates(param, method, nextUrl);
      },
      hasComments   : true,
      commentsApi$  : (param, method, nextUrl)   => {
        return this._crmService.project_comments(param, method, nextUrl);
      },
      hasLogs       : true,
      logsApi$      : (param, method, nextUrl)   => {
        return this._crmService.project_logs(param, method, nextUrl);
      },
      formProperty: {
        mode: "edit",
        formProperties: this.fp.formProperties,
        /* formStructure: this.fp.formStructure, */
      },
      onApiComplete   : (param, event) => {
        //TODO: set isDefault formControl to true when there is no yet default && (mode == new or renderType is dialog)
        setTimeout(() => {
          if(this.mode == 'edit'){
            this._apiData = event;
            console.log({param, event});
            console.log(event.eg_content_type)
          }
  
          //const _content_type = this.mode == 'add' ? this.dialogConfig?.data?.eg_content_type?.name : event?.eg_content_type?.name;
          //const _content_type = this.mode == 'add' ? "quotes" : event?.__data__?.eg_content_type?.content_model;
          const _content_type = event?.__data__?.eg_content_type?.content_model || "quotes";

          console.log({_content_type});

          if(this.mode == 'add'){
            this.detailsConfig.formGroup.get('eg_content_type').setValue(_content_type, {emitEvent: false});
          } /* else{
            if(this.detailsConfig.objArray?.['eg_content_type']){
              this.detailsConfig.objArray['eg_content_type'].isDisabled = true;
            }
            //this.detailsConfig.formGroup.get('eg_content_type').disable();
          } */

          if(_content_type){
            if( _content_type != "reminder"){
              this.detailsConfig.formGroup.get('reminder_level').disable();
              this.detailsConfig.formGroup.get('reminder_level').setValue(null, {emitEvent: false});
            }

            //Get defaults 
            this._getIsDefaults(_content_type);
          }

          console.log({_content_type});
          this._loadPlaceholders(_content_type);
          this._setDefaultLanguage();
          // this.loading = false;
          // this._crf.detectChanges(); */
        });
      },
    };
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._crf});
  }
  private _getIsDefaults(_content_type: string) {
    //TODO upon form ready, lock the content type when editting

    this.api({eg_content_type__content_model: [_content_type]}, 'post').subscribe(et => {
      if(!this._wr.libraryService.checkGridEmptyFirstResult(et)){
        this._egContents = et?.content?.results || [];
      } else{
        this._egContents = [];
      }

      console.log({et, _egC: this._egContents});
      if(this.mode == 'add'){
        if(this._egContents?.filter(_etc => _etc.isDefault).length >= 1){
          console.log("here1")
          //this.detailsConfig.data['isDefault'] = false;
          //setTimeout(() => {
            this.detailsConfig.formGroup.get('isDefault').setValue(false, {emitEvent: true});
          //})
          this.detailsConfig.formGroup.get('isDefault').enable({emitEvent: false});
          
          /* this.detailsConfig.formGroup.controls?.['isDefault'].setValue(false, {emitEvent: false}); */
          /* if(this.dialogConfig.data?.item?.hasOwnProperty('isDefault')){
            this.dialogConfig.data.item.isDefault = false;
          } */

        } else{
          console.log("here2")
          //this.detailsConfig.data['isDefault'] = true;
          /* if(this.dialogConfig.data?.item?.hasOwnProperty('isDefault')){
            this.dialogConfig.data.item.isDefault = true;
          } */
          this.detailsConfig.formGroup.get('isDefault').setValue(true, {emitEvent: true});
          this.detailsConfig.formGroup.get('isDefault').disable({emitEvent: false});
          //this.detailsConfig.formGroup.controls?.['isDefault'].setValue(true, {emitEvent: false});
          /* setTimeout(() => { */
          /* }); */
        }
      } else{
        if(this.detailsConfig.formGroup.get('isDefault')?.value){
          console.log("here3")
          this.detailsConfig.formGroup.get('isDefault').disable();
          /* setTimeout(() => { */
          /* }); */
        }
      }

      this.detailsConfig.formGroup?.updateValueAndValidity();
      this._crf.detectChanges();
    });
  }

  public trackByFn(index, item) {
    return item.id;
  }

  public toggle(index){
    this.fp.formStructure[index]['collapsed'] = !this.fp.formStructure[index]['collapsed'];
  }

  private _loadContentByLang(_loadedLang = 'en'){
    const _loadedLangLC = _loadedLang.toLowerCase?.();
    const _toLoadValue: {content: string, subject: string} = this.detailsConfig?.data?.value?.[_loadedLangLC] || {content: '', subject: `Subject ${_loadedLang}`};

    const _fContent = this.detailsConfig.formGroup?.get('content');
    if(this.detailsConfig?.objArray?.["content"]?.textArea){
      this.detailsConfig.objArray["content"].textArea.tinyMceConfig = {...this.detailsConfig.objArray["content"].textArea.tinyMceConfig, clearText: true};
      this._crf.detectChanges();
    }
    _fContent?.setValue(`${_toLoadValue.content}`);

    const _fSubject = this.detailsConfig.formGroup?.get('subject');
    _fSubject?.setValue(`${_toLoadValue.subject}`);

    this._oldLang = _loadedLang;
    this._afterFirstLoad = true;
  }

  public frmCtrlUpdated($event: {data: any, formControl: string}) {
    console.log({$event});
    if($event.formControl == "eg_content_type"){
      if(this.mode == 'add'){
        const _fReminderLevel = this.detailsConfig.formGroup.get('reminder_level');
        const _content_model_value = $event?.data?.name?.content_model || $event?.data?.content_model || 'quotes'
        if(_content_model_value != "reminder"){
          _fReminderLevel?.setValue(null, {emitEvent: false});
          _fReminderLevel?.clearValidators();
          _fReminderLevel?.disable();
        } else{
          _fReminderLevel?.setValidators(Validators.required)
          _fReminderLevel?.enable();
        }
        this.detailsConfig.formGroup?.updateValueAndValidity();
  
        //console.trace({frmCtrlUpdated: $event?.data});
        this._loadPlaceholders(_content_model_value);
        this._getIsDefaults(_content_model_value);
      } else {
        //this.detailsConfig.formGroup.get('eg_content_type')?.setValue('quotes', {emitEvent: false});
        //HERE
        /* this.detailsConfig.formGroup.get('eg_content_type').setValue('quotes', {emitEvent: false}); */
        this._messageService.add({summary: 'Cannot perform this action!', detail: 'Please add another template, instead...', life: 2000, severity: MESSAGE_SEVERITY.ERROR});
        setTimeout(() => {
          this._wr.helperService.gotoPage({extraParams: {}});
        }, 3000)
      }
    }

    if(this._afterFirstLoad){
      this._applValueChange(this._oldLang);
    }

    if($event.formControl == "language" && $event?.data){  
      setTimeout(()=>{
        this._loadContentByLang($event.data.name?.code_2 || $event.data.code_2);
      });
    }
  }

  private _applValueChange(oldLang?){
    const rawValue = this.detailsConfig.formGroup.getRawValue();

    if(this.detailsConfig.data){
      const _loadedLang = oldLang || rawValue?.language?.code_2;
      const _loadedLangLC = _loadedLang.toLowerCase?.();
      if(this.detailsConfig?.data?.value){
        this.detailsConfig.data.value[_loadedLangLC] = {content: rawValue.content, subject: rawValue.subject};
        this.detailsConfig.formGroup?.get('value')?.setValue(this.detailsConfig.data.value);
      }
    }
  }

  private _chipLabelCallback(p: any) {
    const _fContent = this.detailsConfig.formGroup?.get('content');
    if(this.detailsConfig?.objArray?.["content"]?.textArea){
      this.detailsConfig.objArray["content"].textArea.tinyMceConfig = {...this.detailsConfig.objArray["content"].textArea.tinyMceConfig, clearText: false};
      this._crf.detectChanges();
    }
    _fContent?.setValue(`[${p?.value}]`);
    this._applValueChange();
  }

  onSend() {
    const _rawValue = this.detailsConfig.formGroup.getRawValue();
    this._applValueChange();
    const _tmpData = Object.assign(this.detailsConfig.data);
    delete _tmpData?.__data__;

    const _toSend = {..._tmpData, isDefault: (_rawValue?.isDefault==true), name: _rawValue?.name, eg_content_type: _rawValue?.eg_content_type?.id, reminder_level: (_rawValue?.reminder_level?.id || _rawValue?.reminder_level?.value)}
    this.detailsConfig.api(_toSend, this.detailsConfig.data?.id ? 'patch' : 'put').subscribe(res => {
      const _resultData = res?.content.results?.[0];
      if(_resultData?.isDefault && (this._egContents || [].length > 0)){
        //do patches of content type data
        const _toPatch = this._egContents.filter(_etc => this.mode == 'add' || (_etc.id != _resultData.id &&  _etc.isDefault));
        if(_toPatch?.length > 0){
          const _patches: Observable<any>[] = _toPatch.map(_p => this.api({id: _p.id, isDefault: false}, 'patch') );
          console.log(_patches);
          this._subs.add(forkJoin(_patches).subscribe(_forkRes => {
            console.log({_forkRes});
          }));
        }
      }

      if(this._renderedType=="dialog"){
        this.ref.close({isConfirmed: true});
      } else if(this._renderedType == "route"){
        this._messageService.add({
          severity: MESSAGE_SEVERITY.SUCCESS,
          summary: Core.Localize('successfullySaved')});
        this._wr.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._activatedRoute, queryParams: {isChanged: true, isDefault: (_rawValue?.isDefault==true) }}})
      }
    })
  }

  onClose() {
    this.ref?.close();
  }

  onOptionsChange($event: any, key: any) {
    console.log({$event, key, apiData: this._apiData});

    if(key == 'language'){
      this._languages = $event;

      this._setDefaultLanguage()
      // this.loading = false;
      // this._crf.detectChanges();
    }
  }
  private _setDefaultLanguage() {
    if(!this._isLangSet){
      const _fLanguage = this.detailsConfig.formGroup?.get('language');
      let _defaultLocale = 'en';
      let _defaultLocaleVal = {
        "id": 4,
        "mig_id": 4,
        "name": "Englisch",
        "language": "Englisch",
        "code_2": "en",
        "code_3": "en"
      };
  
      if(this.mode == "add"){
        this.detailsConfig.data = {value: {}};
        _fLanguage?.setValue(_defaultLocaleVal);
        this._isLangSet = true;
      } else {
        const _localeSaved = Object.keys(this._apiData?.value)?.[0];
        if(this._languages && _localeSaved){
          
          console.log({lang: this._languages, _localeSaved});
          _defaultLocale = _localeSaved;
          _defaultLocaleVal = this._languages?.find(_l => _l.code_2 == _localeSaved);

          console.log({_defaultLocale, _defaultLocaleVal});
          _fLanguage?.setValue(_defaultLocaleVal);
          this._loadContentByLang(_defaultLocale);
          this._isLangSet = true;
        }
      }
    }
  }

  ngOnDestroy(){
    this._subs.unsubscribe();
  }
}
