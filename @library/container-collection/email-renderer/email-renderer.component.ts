import { ChangeDetectorRef, Component, Optional } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GridResponse, ResponseObj } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, FormStructure, IEmailRendererData, objArrayType } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { map } from 'rxjs';
import { CrmService } from 'src/app/crm/crm.service';
import { EmailRenderer } from './email.renderer';

@Component({
  selector: 'eg-email-renderer',
  templateUrl: './email-renderer.component.html',
  styleUrls: ['./email-renderer.component.scss']
})
export class EmailRendererComponent{
  detailsConfig: DetailsConfig;
  config: DetailsContainerConfig;
  private _currentTemplateId: number;
  
  constructor(
    private _ws: WrapperService,
    private _fb: FormBuilder,
    private _cd: ChangeDetectorRef,
    private _crm: CrmService,
    @Optional() public ref: DynamicDialogRef,
    @Optional() public dialogConfig : DynamicDialogConfig<IEmailRendererData>){
    }

  public loading = true;

  public fp: {formProperties: objArrayType, formStructure: (string | FormStructure)[]};
    
  ngOnInit(){
    const that = this;

    this.fp = EmailRenderer.getFormProperties(that);

    /* this.data = this.dialogConfig?.data?.item; */
    this.config = {
      header: 'Test',
      hasHeader: false,
      params: {template: 1},
      detailsApi$     : (param, method, nextUrl, append?)   => this._crm.sales_quotes(param, method, nextUrl, append).pipe(map((res: ResponseObj<GridResponse>) => {
        res.content.fields = [
          {recipient: "String", form: "chips", field: "recipient", required: true},
          {cc_to: "String", form: "chips", field: "cc_to", required: false},
          {bcc_to: "String", form: "chips", field: "bcc_to", required: false},
          {subject: "String", form: "text", field: "subject", required: true},
          {reply_to: "String", form: "text", field: "reply_to", required: false},
          {send_copy: "Boolean", form: "boolean", field: "send_copy", required: false},
          {private_signature: "Boolean", form: "boolean", field: "private_signature", required: false},
          {subject_with_ref: "Boolean", form: "boolean", field: "subject_with_ref", required: false},
          {content: "String", form: "textarea", field: "content", required: true},
          //{files: "String", form: "file", field: "files", required: false}
          {placeholders: "String", form: "chip-labels", field: "placeholders", required: false},
          {template: "Number", form: "select", field: "template", required: true}
        ];
        return res;
      })),
      onApiComplete   : (param, event) => {
        this.loading = false;
      },
      formProperty: {
        mode: "add",
        formProperties: this.fp.formProperties,
      },
      /* paramUpdate(param, p2) {
        console.log({param, p2});
      }, */
    }
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._ws, cdr: this._cd});
  }

  onSend() {
    const rawValue = this.detailsConfig.formGroup.getRawValue();
    const emailApi = this.dialogConfig?.data.emailApi;
    //this._crm.sales_quotes({...rawValue, id: this._dialogConfig?.data.id, template: 1, language: "EN" }, 'mail').subscribe((res) => {
    emailApi(rawValue).subscribe((res) => {
      this.ref.close({isConfirmed: true});
    });
  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  public toggle(index){
    this.fp.formStructure[index]['collapsed'] = !this.fp.formStructure[index]['collapsed'];
  }

  onEmailTemplateApiComplete(p: { apiData: any[]; formGroup: FormGroup; }) {
    let _defalut_template = p.apiData?.find(_data => _data.isDefault/*  == true */);
    if(!_defalut_template){
      _defalut_template = p.apiData?.[0];
    }
    if(_defalut_template){
      this.detailsConfig?.formGroup?.get("template")?.setValue(_defalut_template);
      this.frmCtrlUpdated({data: _defalut_template, formControl: 'template'}, true);
    }
  }

  chipLabelCallback(p: any) {
    const _fContent = this.detailsConfig.formGroup?.get('content');
    //_fContent?.setValue(`${_fContent?.value}<p>[${p?.value}]</p>`);
    if(this.detailsConfig?.objArray?.["content"]?.textArea){
      this.detailsConfig.objArray["content"].textArea.tinyMceConfig = {...this.detailsConfig.objArray["content"].textArea.tinyMceConfig, clearText: false};
      this._cd.detectChanges();
    }
    _fContent?.setValue(`[${p?.value}]`);
  }

  frmCtrlUpdated($event: {data: any, formControl: string}, isFirst = false) {
    const _default_lang = "en";
    const _lang = "de";

    if($event?.formControl == "template"){
      //set clearText property first and detect changes
      if(this.detailsConfig?.objArray?.["content"]?.textArea && !isFirst){
        this.detailsConfig.objArray["content"].textArea.tinyMceConfig = {...this.detailsConfig.objArray["content"].textArea.tinyMceConfig, clearText: true};
        this._cd.detectChanges();
      }

      const _id = $event?.data?.id?.id || $event?.data?.id;
      if(_id && _id != this._currentTemplateId){
        const _val = $event?.data?.name?.value || $event?.data?.value;
        //TODO fetch from id friom form
        const _tplContentLang = _val?.[_default_lang] || _val?.[_lang];

        const _fContent = this.detailsConfig.formGroup?.get('content');
        _fContent?.setValue(_tplContentLang?.content);

        const _fSubject = this.detailsConfig.formGroup?.get('subject');
        _fSubject?.setValue(_tplContentLang?.subject);

        this._currentTemplateId = _id;
      }
    }
  }
}
