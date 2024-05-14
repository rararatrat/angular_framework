import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";
import { CRM } from "../crm.static";

export class Sales {
  public static getOrderFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[]} {
    const _toReturn: {
      formProperties: objArrayType,
      formStructure: (string | FormStructure)[]
    } = {
      formProperties: {
        currency      : AppStatic.StandardForm['currency'],
        language      : AppStatic.StandardForm['language'],
        is_valid_from : {type: 'date'},
        company           : {icon:"fa-solid fa-circle-user", displayVal: "company.name", autoConfig:  {title: "name", saveField: "id", extraKey: "company", image:{linkToImage:"logo"}, formProperty: {
          formProperties: {
            billing_add: AppStatic.StandardForm["billing_add"],
            shipping_add: AppStatic.StandardForm["shipping_add"],
            reg_add: AppStatic.StandardForm["reg_add"],
            category: AppStatic.StandardForm["category"],
            contact_partner: AppStatic.StandardForm["contact_partner"],
            language: AppStatic.StandardForm["language"],
            role: AppStatic.StandardForm["role"],
            sector: AppStatic.StandardForm["sector"],
          }
        }}},
        contact           : {icon:"fa-solid fa-circle-user", displayVal: "contact.name", autoConfig:  {title: "name", saveField: "id", extraKey: "contact", image:{linkToImage:"picture"}, formProperty: {
          formProperties: {
            category: AppStatic.StandardForm["category"],
            language: AppStatic.StandardForm["language"],
            role: AppStatic.StandardForm["role"],
            sector: AppStatic.StandardForm["sector"],
            country: AppStatic.StandardForm["country"],
          }
        }}},
        user              : {icon:"fa-solid fa-circle-user", displayVal: "user.name", autoConfig:  {title: "name", saveField: "id", extraKey: "user", image:{linkToImage:"picture"}, formProperty: {
          formProperties: {
            country: AppStatic.StandardForm["country"],
          }
        }}},
        mwst_type         : AppStatic.StandardForm['mwst_type'],
        mwst_is_net       : AppStatic.StandardForm['mwst_is_net'],
      },
      formStructure: [
        {
          header    : "Details",
          fields    : ['name', "api_reference", 'is_valid_from', 'language'],
          isTwoLine : true
        },
        {
          header    : "Contact",
          fields    : ['company', 'contact', 'user', 'delivery_address_type'],
          isTwoLine : true
        },
        {
          header    : "Project",
          fields    : ['project'],
          isTwoLine : true
        },
        {
          header    : "Bank & Currency Details",
          fields    : ['bank_account', 'currency', 'payment_type'],
          isTwoLine : true
        },
        {
          header    : "Header & Footer",
          fields    : ['header', 'footer'],
          isTwoLine : false
        },
        {
          header    : "Info",
          fields    : ['mwst_type', 'mwst_is_net'],
          isTwoLine : true
        },
        {
          fields    : ['template_slug'],
          isTwoLine : true
        },
        {
          header    : 'Positions',
          fields    : ['show_position_taxes', 'positions'],
          isTwoLine : true
        },
        {
          fields    : ['files'],
          isTwoLine : true
        },
      ]
    };

    //['id', 'name', 'company', 'contact', 'user', 'project', 'language', 'bank_account', 'currency', 'payment_type', 'header', 'footer', 'mwst_type', 'mwst_is_net', 'show_position_taxes', 'is_valid_from', 'delivery_address_type', 'api_reference', 'template_slug', 'positions', 'files']
    return _toReturn;
  }

  public static getSalesInvoiceProperties(): objArrayType{
    const _toReturn: objArrayType = {
        payment_type      : AppStatic.StandardForm['payment_type'],
        language          : AppStatic.StandardForm['language'],
        currency          : AppStatic.StandardForm['currency'],
    };
    return _toReturn;
  }

  public static getCreditNotesProperties(): objArrayType{
    const _toReturn: objArrayType = {
        company: {},
        contact: {},
        user: {},
        project: {},
        bank_account: {},
        status: {},
        positions: {autoConfig: {extraKey: 'sales_positions'}},
        language          : AppStatic.StandardForm['language'],
        currency          : AppStatic.StandardForm['currency'],
        payment_type      : AppStatic.StandardForm['payment_type'],
    };
    return _toReturn;
  }

  public static getStatementsFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[], requiredFields?:string[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {},
      formStructure: ['title', 'name', 'code', 'description', 'files']
    };
    return _toReturn;
  }

  public static getBalanceStatementsFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[], requiredFields?:string[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {
        language          : AppStatic.StandardForm['language'],
        currency          : AppStatic.StandardForm['currency'],
        payment_type      : AppStatic.StandardForm['payment_type'],
        /* bank_account_nr   : { callback: (p, _f) => {
          console.log({p, _f});
        }, autoConfig: {
          callback : (p) => {
            console.log({attributeCallback: p});
        }}} */
      },
      formStructure: []
    };
    return _toReturn;
  }

  public static getOrderPaymentFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[], requiredFields?:string[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {},
      formStructure: ['name', 'date', 'value', 'bank_account', 'client_acct_redemption', 'cash_discount', 'invoice', 'credit_voucher', 'bill']
      //['id', 'name', 'date', 'value', 'bank_account', 'client_acct_redemption', 'cash_discount', 'invoice', 'credit_voucher', 'bill']
    };
    return _toReturn;
  }

  public static getPaymentRemindersFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[], requiredFields?:string[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {},
      formStructure: ['invoice', 'name', 'title', 'is_valid_from', 'is_valid_until', 'period_in_days', 'level', 'show_positions', 'remaining_price', 'received_total', 'is_sent', 'header', 'footer']
    };
    return _toReturn;
  }
}