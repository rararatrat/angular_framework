import { Core } from "@eagna-io/core";
import { FormStructure, objArrayType } from "@library/library.interface";

export class ConfigStatic{
/**
 * getBrandingFormProperties
 */

  public static getBrandingFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[], lockedFields?: string[]} {
    const _toReturn: {
      formProperties: objArrayType,
      formStructure: (string | FormStructure)[],
      lockedFields?: string[]
    } = {
      formProperties : {
        id            : {isEditable:false, isDisabled:false, title:"id",        icon:"fa-solid fa-circle", type:"number",  formControlName:"id",           placeholder:"", styleClass:"w-full"},
        accent        : {isEditable:false, isDisabled:false, title:"accent",    icon:"fa-solid fa-circle", type:"color",  formControlName:"accent",         placeholder:"", styleClass:"w-full"},
        danger        : {isEditable:false, isDisabled:false, title:"danger",    icon:"fa-solid fa-circle", type:"color",  formControlName:"danger",         placeholder:"", styleClass:"w-full"},
        info          : {isEditable:false, isDisabled:false, title:"info",      icon:"fa-solid fa-circle", type:"color",  formControlName:"info",           placeholder:"", styleClass:"w-full"},
        primary       : {isEditable:false, isDisabled:false, title:"primary",   icon:"fa-solid fa-circle", type:"color",  formControlName:"primary",        placeholder:"", styleClass:"w-full"},
        secondary     : {isEditable:false, isDisabled:false, title:"secondary", icon:"fa-solid fa-circle", type:"color",  formControlName:"secondary",      placeholder:"", styleClass:"w-full"},
        success       : {isEditable:false, isDisabled:false, title:"success",   icon:"fa-solid fa-circle", type:"color",  formControlName:"success",        placeholder:"", styleClass:"w-full"},
        warn          : {isEditable:false, isDisabled:false, title:"warn",      icon:"fa-solid fa-circle", type:"color",  formControlName:"warn",           placeholder:"", styleClass:"w-full"},

        facebook      : {isEditable:false, isDisabled:false, title:"facebook",  icon:"fa-brands fa-facebook", type:"text",  formControlName:"facebook",       placeholder:"", styleClass:"w-full"},
        instagram     : {isEditable:false, isDisabled:false, title:"instagram", icon:"fa-brands fa-instagram", type:"text",  formControlName:"instagram",      placeholder:"", styleClass:"w-full"},
        linkedin      : {isEditable:false, isDisabled:false, title:"linkedin",  icon:"fa-brands fa-linkedin", type:"text",  formControlName:"linkedin",       placeholder:"", styleClass:"w-full"},
        pinterest     : {isEditable:false, isDisabled:false, title:"pinterest", icon:"fa-brands fa-pinterest", type:"text",  formControlName:"pinterest",      placeholder:"", styleClass:"w-full"},
        twitter       : {isEditable:false, isDisabled:false, title:"twitter",   icon:"fa-brands fa-twitter", type:"text",  formControlName:"twitter",        placeholder:"", styleClass:"w-full"},

        font_family   : {isEditable:false, isDisabled:false, title:"font_family", icon:"fa-solid fa-circle", type:"text",  formControlName:"font_family",  placeholder:"", styleClass:"w-full"},
        isDefault     : {isEditable:false, isDisabled:false, title:"isDefault",   icon:"fa-solid fa-circle", type:"text",  formControlName:"isDefault",    placeholder:"", styleClass:"w-full"},
        localisation  : {isEditable:false, isDisabled:false, title:"localisation",icon:"fa-solid fa-circle", type:"text",  formControlName:"localisation", placeholder:"", styleClass:"w-full"},
        name          : {isEditable:false, isDisabled:false, title:"name",        icon:"fa-solid fa-circle", type:"text",  formControlName:"name",         placeholder:"", styleClass:"w-full"},

      },
      formStructure :[
        {
          header    : Core.Localize('details'),
          fields    : ['name', 'localisation', 'font_family'],
          isTwoLine : true
        },
        {
          header    : Core.Localize('brand_color', {count: 2}),
          fields    : ['primary', 'secondary'],
          isTwoLine : true
        },
        {
          header    : Core.Localize('web_color', {count: 2}),
          fields    : ['accent', 'danger', 'info', 'success', 'warn'],
          isTwoLine : true
        },
        {
          header    : Core.Localize('social_media'),
          fields    : ['facebook', 'instagram', 'linkedin', 'pinterest', 'twitter'],
          isTwoLine : true
        }
      ]

    }

    return _toReturn
  }




 /*  public static setBrandingSections(_this){
    _this.section['app_colors']    = ["accent","danger", "info","success","warn"];
    _this.section['brand_colors']  = ["primary","secondary"];
    _this.section['brand_name']    = ['name', 'isDefault', 'localisation', 'name'];
    _this.section['social_media']  = ['instagram', 'facebook', 'linkedin', 'pinterest', 'twitter'];
  } */

  public static OrgSections = {
    company_logo    : ['logo'],
    details         : ['name', 'preferred_name', 'abbreviation', 'registration_no', 'vat_no', 'legal_form', 'legal_name'],
    disclaimer      : ['terms_conditions', 'copyright', 'data_privacy', 'disclaimer', 'currency'],
    company_address : ['shipping_add', 'reg_add', 'billing_add']
  }

  public static OrgHeaders = {
    details         : {name: "Update Company Details", description: "Update the basic information of your Organisation"},
    company_address : {name: "Update Company Address", description: "Update the Shipping, Bililng and Registered Adddress"},
    disclaimer      : {name: "Update Disclaimers", description: "Update the Disclaimers"}
  }

  public static getOrganizationFormProperties(): objArrayType {
    const _toReturn: objArrayType = {
      logo            : { type:"image", styleClass:"h-1rem w-1rem overflow-hidden border-circle" },
      billing_add     : { type:"address", autoConfig: {extraKey: 'ext_address'}, callback(p, _f) {
        console.log(p, _f); //RT TODO: patch new ID
      }, },
      reg_add         : { type:"address" },
      shipping_add    : { type:"address" },//data:__data__?.address.billing
    };
    return _toReturn;
  }


  public static getOrgFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[], lockedFields?: string[]} {
    const _toReturn: {
      formProperties: objArrayType,
      formStructure: (string | FormStructure)[],
      lockedFields?: string[]
    } = {
      formProperties : {
        logo            : { type:"image", styleClass:"h-6rem w-6rem overflow-hidden border-circle" },
        billing_add     : { type:"address" },
        reg_add         : { type:"address" },
        shipping_add    : { type:"address" },
        currency        : {type: "select", autoConfig: {title: "name", saveField: "id"}, displayVal: "currency.name" },
        pref_bank_acct  : {type: "autocomplete", autoConfig: {title: "name", saveField: "id", extraKey: "banking"}, displayVal: "pref_bank_acct.name" },
        bank_accounts   : {type: "multiselect", autoConfig: {title: "name", saveField: "id", extraKey: "banking"}, displayVal: "bank_accounts.name" },
        units           : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "unit", saveField: "id",}, displayVal: "name" },
      },
      formStructure :[
        {
          header    : `${Core.Localize('basic_details')}`,
          subheader : `${Core.Localize('basic_details_desc')}`,
          fields    : [ 'logo', 'name', 'preferred_name', 'abbreviation', 'registration_no', 'vat_no', 'legal_form', 'legal_name'],
          isTwoLine : true
        },
        {
          header    : `${Core.Localize('address_details')}`,
          subheader : `${Core.Localize('address_details_desc')}`,
          fields    : ['shipping_add', 'reg_add', 'billing_add'],
          isTwoLine : true
        },
        {
          header    : Core.Localize('banking'),
          subheader : Core.Localize('banking_desc'),
          fields    : [ 'bank_accounts'],
          isTwoLine : true
        },
        {
          header    : Core.Localize('transaction'),
          subheader : Core.Localize('transaction_desc'),
          fields    : ['units', 'currency','pref_bank_acct'],
          isTwoLine : true
        },
        {
          header    : Core.Localize('disclaimer', {count: 2}),
          subheader : Core.Localize('disclaimers_desc'),
          fields    : ['terms_conditions', 'copyright', 'data_privacy', 'disclaimer'],
          isTwoLine : true
        },
      ]

    }

    return _toReturn
  }

}
