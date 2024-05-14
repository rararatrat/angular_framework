import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { FormStructure, objArrayType, template_type } from "@library/library.interface";
import { EmailRendererComponent } from "./email-renderer.component";
import { Core, apiMethod } from "@eagna-io/core";
import { Observable } from "rxjs";
import { MailComponent } from "src/app/settings/crm-settings/mail/mail.component";
import { AppStatic } from "src/app/app.static";

export class EmailRenderer {
  public static EmailPattern = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$"
  public static regexp = new RegExp(this.EmailPattern);

  public static checkEmail(eachVal){
    const regExpTest = this.regexp.test(eachVal);
    return regExpTest;
  }

  public static _chipsEmailAndUniqueValidators = (_that: EmailRendererComponent, _objKey: string): ValidatorFn | null => {
    return (control: AbstractControl): ValidationErrors | null => {
      const val = control.value;
      const _formGroup: FormGroup = _that?.detailsConfig?.formGroup;
      if(_formGroup){
        for (const field of ['recipient', 'cc_to', 'bcc_to']) {
          if(field != _objKey){
            let _fval;
            if( (_formGroup.value[field] || []).filter(fv => {
              if((val || []).includes(fv)){
                _fval = fv;
                return true;
              }
              return false;
            }).length > 0 ){
              const _err = {err: Core.Localize('errValidationNotUnique', {value: _fval})};
              control.setErrors(_err);
              return _err;
            }
          } else if(Array.isArray(val) && val.find((a, b, c)=>c.filter(cVal => cVal?.toLowerCase?.() == a?.toLowerCase?.()).length > 1)){
            const _err = {err: Core.Localize('errValidationNotUnique', {value: val})};
            control.setErrors(_err);
            return _err;
          } else {
            for (const eachVal of val || []) {
              if(!this.checkEmail(eachVal)){
                const _err = {err: Core.Localize('errValidationEmailFormat', {value: eachVal})};
                control.setErrors(_err);
                return _err;
              }
            }
          }
        }
        if(control.hasError){
          control.setErrors({notUnique: null, email: null});
        }
      }
      return null;
    };
  }

  public static getTemplateFormProperties(_that?: MailComponent): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _eg_content_type = AppStatic.StandardForm['eg_content_type'];

    const _toReturn: {
      formProperties: objArrayType,
      formStructure: (string | FormStructure)[]
    } = {
      formProperties: {
        content: {textArea: {isRawText: false, tinyMceConfig: {height: '35rem'}}},
        language: {icon:"fa-solid fa-circle", type: "select",  autoConfig:  {title:'name', saveField: "id"}},
        //template: {autoConfig: {extraKey: 'email_template', title: 'name', saveField: "id"}, displayVal: "name"},
        eg_content_type: {..._eg_content_type, autoConfig: {..._eg_content_type?.autoConfig, filters: {content_model: (['invoices', 'quotes', 'order', 'reminder', 'creditnotes', 'purchaseorders', "deliveries", /* "deliverynotes", */ "accountstatement", "bills", "expenses"] as template_type[]) }} },
        reminder_level: {type: "select", autoConfig: {title: 'name'}}
      },
      formStructure: [
        {
          fields    : ['eg_content_type', 'name'],
          isTwoLine : true
        },
        {
          fields    : ['subject', 'reminder_level'],
          isTwoLine : true
        },
        {
          fields    : ['isDefault', 'language'],
          isTwoLine : true
        },
        {
          fields    : ['placeholders'],
          isTwoLine : false
        },
        {
          fields    : ['content'],
          isTwoLine : true
        }
      ]
    };

    return _toReturn;
  }

  public static getFormProperties(_that: EmailRendererComponent): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _fields = _that.dialogConfig?.data?.fields;
    const _template_type = _that.dialogConfig?.data?.template_type;

    const _toReturn: {
      formProperties: objArrayType,
      formStructure: (string | FormStructure)[]
    } = {
      formProperties: {
        content: {textArea: {isRawText: false, tinyMceConfig: {height: '42rem'}}},
        recipient: {validators: [EmailRenderer._chipsEmailAndUniqueValidators(_that, "recipient") /* Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$") */ ]},
        cc_to: {validators: [EmailRenderer._chipsEmailAndUniqueValidators(_that, "cc_to")]},
        bcc_to: {validators: [EmailRenderer._chipsEmailAndUniqueValidators(_that, "bcc_to")]},
        reply_to: {validators: [Validators.email]},
        placeholders: {data: (_fields || []).concat({label: 'link_to'}).map(_f => ({label: _f.label, value: _f.label})), callback: (p) => {
          _that.chipLabelCallback(p);
        }},
        template: {autoConfig: {extraKey: 'email_template', title: 'name', saveField: "id", 
          ...(_template_type ? {filters: {eg_content_type__content_model: [_template_type]}} : {}),
          onApiComplete: (p) => {
            _that.onEmailTemplateApiComplete?.(p);
          },
          }, 
          displayVal: "name"}
      },
      formStructure: [
        {
          fields    : ['recipient', 'subject'],
          isTwoLine : false
        },
        {
          header    : Core.Localize('settings'),
          collapsed : true,
          fields    : ["cc_to", 'bcc_to', 'reply_to', 'subject_with_ref', 'private_signature', 'send_copy'],
        },
        {
          fields    : ['placeholders', 'template'],
          isTwoLine : true
        },
        {
          fields    : ['content'/* , 'files' */],
          isTwoLine : true
        }
      ]
    };

    return _toReturn;
  }
}