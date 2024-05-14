import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { Core, GridResponse, MESSAGE_SEVERITY, ResponseObj, apiMethod } from '@eagna-io/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DetailsContainerConfig, FormStructure, InPlaceConfig, objArrayType } from '@library/library.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DetailsConfig } from '@library/class/details-config';
import { ActivatedRoute } from '@angular/router';
import { WrapperService } from '@library/service/wrapper.service';
import { CrmService } from 'src/app/crm/crm.service';
import { Subscription, map } from 'rxjs';
import { SettingsService } from 'src/app/settings/settings.service';
import { MessageService } from 'primeng/api';
import { CrmSettings } from '../../crm-settings.static';

@Component({
  selector: 'eg-reminder-levels-detail',
  templateUrl: './reminder-levels-detail.component.html',
  styleUrls: ['./reminder-levels-detail.component.scss']
})
export class ReminderLevelsDetailComponent {
  @Input() param: any;
  public api = (p?: any, method?: apiMethod, nextUrl?) => this._settingsService.reminder_levels(p, method, nextUrl);
  public loading = true;
  public fp: {formProperties: objArrayType, valueFormStructure: (string | FormStructure)[], formStructure: (string | FormStructure)[]};
  public isChanged: boolean;
  public objArray: any;
  public editingField: string;
  public formGroup: FormGroup;
  public inPlaceConf: InPlaceConfig;
  private _subs = new Subscription();
  private _afterFirstLoad: boolean;
  private _oldLang: string;
  private _renderedType: string;
  
  public activeIndex: number|number[];
  public languages: any[] = [];

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
  public mode               : string;
  @Input() data             : any;

  ngOnInit(){
    this._renderedType = this._wr.libraryService.getRenderedType(this.dialogConfig, this.data);
    this.mode = this._renderedType == "route" ? "edit" : this.dialogConfig?.data?.mode;
    this.fp = CrmSettings.getReminderLevelsFormProperties();
    this.initDetailsContainer();
    //this._loadLanguages();
  }

  private _loadLanguages(){
    this._subs.add(this._settingsService.language({limit: 100}).subscribe(res => {
      let _toForm = {}
      const _val = this.detailsConfig.data.value;
      res.content.results.forEach(_r => {
        const _subForm = {
          title: [{value: _val?.[_r.code_2]?.title || '', disabled: false}, []],
          header: [{value: _val?.[_r.code_2]?.header || '', disabled: false}, []],
          footer: [{value: _val?.[_r.code_2]?.footer || '', disabled: false}, []],
        }
        _toForm[_r.code_2] = this._fb.group(_subForm);
      })
      this.detailsConfig.formGroup.controls['value'] = this._fb.group(_toForm);
      
      this.languages = res.content.results || [];

      setTimeout(() => {
        this.loading = false;
        this._crf.detectChanges();
      });
    }));
  }

  /* public setValue(_i?){
    const _fg = this.detailsConfig.formGroup;
    let _act = _i ? _i.index : 0;
    if(this.activeIndex != undefined){
      if(!_i){
        if(Array.isArray(this.activeIndex)){
          _act = this.activeIndex[0];
        } else{
          _act = this.activeIndex;
        }
      }

      const _lang = this.languages[_act];
      if(_lang){
        _fg?.get('value')?.get(_lang.code_2)?.setValue({
          title: _fg?.get('title').value,
          header: _fg?.get('header').value,
          footer: _fg?.get('footer').value
        })
      }
    }
  } */

  public initDetailsContainer() {
    const _itemId = this._renderedType == "route" ? this._activatedRoute?.snapshot?.params?.['id'] : (this.dialogConfig?.data?.item?.id);

    this.config = {
      hasHeader     : true,
      showDetailbar: this.mode != "add",
      header        : (this.dialogConfig?.data?.title ? `${this.dialogConfig?.data?.title} Details` : "Details Menu"),
      subheader     : "Reminder Levels Detail",
      dialogConfig  : this.dialogConfig,
      dialogRef     : this.ref,
      itemId        : _itemId,
      detailsApi$    : (param, method, nextUrl)   => {
        return this.api(param, method, nextUrl).pipe(map((res: ResponseObj<GridResponse>) => {
          res.content.fields = res.content.fields/* .map(_f => {
            if(_f.field == "eg_content_type"){
              _f.required = true;
            }
            return _f;
          }) */
          .concat([
            {title: "String", form: "text", field: "title", required: false},
            {header: "String", form: "textarea", field: "header", required: false},
            {footer: "String", form: "textarea", field: "footer", required: false},
            {show_document_items: "Boolean", form: "boolean", field: "show_document_items", required: false},
            {send_payment_reminder: "Boolean", form: "boolean", field: "send_payment_reminder", required: false},
            {days: "Number", form: "number", field: "days", required: false},
            {before_after_due_date: "String", form: "select", field: "before_after_due_date", required: false},
            //send_payment_reminder'/* , 'days', 'before_after'
          ]);
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
        mode: "add",
        formProperties: this.fp.formProperties,
      },
      onApiComplete   : (param, event) => {
        if(!_itemId){
          this.detailsConfig?.formGroup?.get('level')?.setValue(CrmSettings.reminderLevelsCount || 1);
        }

        this._loadLanguages();
      },
    };
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._crf});
  }

  public trackByFn(index, item) {
    return item.id;
  }

  public toggle(index){
    this.fp.formStructure[index]['collapsed'] = !this.fp.formStructure[index]['collapsed'];
  }

  public frmCtrlUpdated($event: {data: any, formControl: string}) {}

  onSend() {
    /* this.setValue(); */
    setTimeout(() => {
      const _rawValue = this.detailsConfig.formGroup.getRawValue();
      const _toSend = {
        ...(this.detailsConfig.data?.id ? {id: this.detailsConfig.data?.id} : {}),
        level: _rawValue.level,
        name: _rawValue.name,
        deadline: _rawValue.deadline,
        show_document_items: _rawValue.show_document_items,
        send_payment_reminder: _rawValue.send_payment_reminder,
        value: _rawValue.value,
        days: _rawValue.days,
        before_after_due_date: _rawValue.before_after_due_date?.value,
      };
      
      this._subs.add(this.detailsConfig.api(_toSend, this.detailsConfig.data?.id ? 'patch' : 'put').subscribe(res => {
        if(this._renderedType=="dialog"){
          this.ref.close({isConfirmed: true});
        } else if(this._renderedType == "route"){
          this._messageService.add({
            severity: MESSAGE_SEVERITY.SUCCESS,
            summary: Core.Localize('successfullySaved')});
          this.isChanged = true;
          this._wr.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._activatedRoute, ...(this.isChanged ? {queryParams: {onRefresh: true}} : {} ) }})
        }
      }));
    });
  }

  onClose() {
    this.ref?.close();
  }

  ngOnDestroy(){
    this._subs.unsubscribe();
  }

  getForm(key: any): FormGroup<any> {
    const _fg: FormGroup = <FormGroup>this.detailsConfig?.formGroup.get('value')?.get(key);
    if(key && _fg){
      return _fg
    }
    return null;
  }
}
