import { Core } from "@eagna-io/core";
import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";

export class Purchasing {
  public static getPurchaseOrderProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[],requiredFields:string[]} {
    const orgCurrency = "eur"; //TODO
    const _toReturn: {
        formProperties: objArrayType,
        formStructure: (string | FormStructure)[],
        requiredFields: string[]
    } = {
        formProperties: {
          project   : {autoConfig:  {title: 'name', saveField: "id"} , displayVal: "project.id"},
          language          : AppStatic.StandardForm['language'],
          currency          : AppStatic.StandardForm['currency'],
          payment_type      : AppStatic.StandardForm['payment_type'],
          salesman          : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", image:{linkToImage:"picture"}} , displayVal: "contact.name"},
          mwst_type         : AppStatic.StandardForm['mwst_type'],
          mwst_is_net       : AppStatic.StandardForm['mwst_is_net'],
        },
        formStructure: [
        {
            header    : "Details",
            fields    : ['title', 'name'],
            isTwoLine : true
        },
        {
          fields    : ['project', 'company', 'language'],
          isTwoLine : true
        },
        {
          fields    : ['ttl_rounding_diff', '_nb_decimals_amount', '_nb_decimals_price', 'show_position_taxes', 'is_compact_view'],
          isTwoLine : true
        },
        {
            header    : "Payment",
            fields    : ['bank_account', 'payment_type', 'currency'],
            isTwoLine : true
        },
        {
            fields    : ['terms_of_payment'],
            isTwoLine : true
        },
        {
            header    : "MWST",
            fields    : ['mwst_type', 'mwst_is_net'],
            isTwoLine : true
        },
        {
            header    : "Dates",
            fields    : ['is_valid_from', 'is_valid_to', 'is_valid_until', 'viewed_by_client_at'], //"created_at", "updated_at",
            isTwoLine : true
        },
        {
            header    : "Assignment",
            fields    : ['salesman', 'user', 'contact'],
            isTwoLine : true
        },
        {
          header    : "Adress",
          fields    : ['address', 'delivery_address_type'],
          isTwoLine : true
        },
        {
          header    : "Total",
          fields    : ['total_w_tax', 'total_wo_tax',],
          isTwoLine : true
        },
        {
          header    : "Documents",
          fields    : ['template_slug', 'payment_template', 'header', 'footer'],
          isTwoLine : true
        },
        {
          header    : "References",
          fields    : ['document_nr', 'api_reference'],
          isTwoLine : true
        },
        {
          fields    : ['reference'],
          isTwoLine : true
        },
        {
          fields    : ['files'],
          isTwoLine : true
        }],
        requiredFields: ['ttl_rounding_diff', 'salesman', 'user']
    }

    return _toReturn;
  }

  public static getBillsProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[]} {
    const _toReturn: {
      formProperties: objArrayType,
      formStructure: (string | FormStructure)[]
    } = {
      formProperties: {
        supplier: { autoConfig: {title: "name", saveField: "id"}, displayVal: "supplier.name" },
        address: {icon:"fa-solid fa-location-dot", type:"address", autoConfig:{extraKey:"contact_address"}},
        currency_code: {type: "select", autoConfig: {title: "name", saveField: "id"}, displayVal: "currency_code.name" },
      },
      formStructure: [
        {
          header: 'Details',
          fields: ['name', 'title'],
          isTwoLine: true
        },
        {
          header: 'Contacts',
          fields: ['supplier', 'supplier_contact', 'contact_partner'],
          isTwoLine : true
        },
        {
          header: 'Dates',
          fields: ['bill_date', 'due_date'],
          isTwoLine: true
        },
        {
          header: 'References',
          fields: ['amount_mfg', 'vendor_ref', 'qr_bill_info', 'purchase_order', 'payment'],
          isTwoLine: true
        },
        {
          fields    : ['amount_calc'],
          isTwoLine : true
        },
        {
          fields    : ['files'],
          isTwoLine : true
        },
      ]
      //['id', 'vendor_ref', 'supplier', 'supplier_contact', 'contact_partner', 'bill_date', 'due_date', 'amount_mfg', 'amount_calc', 'manual_amount', 'currency_code', 'exchange_rate', 'base_currency_amt', 'item_net', 'purchase_order', 'qr_bill_info', 'address', 'payment', 'files', 'items']
    };
    return _toReturn;
  }
  
  public static getExpenseProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[],requiredFields:string[]} {
    const _toReturn: {
      formProperties: objArrayType,
      formStructure: (string | FormStructure)[],
      requiredFields:string[]
    } = {
      formProperties: {
        supplier: { autoConfig: {title: "name", saveField: "id"}, displayVal: "supplier.name" },
        currency_code  : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name', extraKey: "currency", saveField: "id"}, displayVal: "name" },
        address: {icon:"fa-solid fa-location-dot", type:"address", autoConfig:{extraKey:"contact_address"}},
        base_currency_amt: {formChangesToCallback: true,  callback(p, _f) {
          if(_f.get('exchange_rate')?.value && _f.get('amount')?.value){
            _f.get('amount')?.setValue(_f.get('exchange_rate')?.value * p?.value, {emitEvent: false});
          }
        }},
        exchange_rate: {formChangesToCallback: true,  callback(p, _f) {
          if(_f.get('base_currency_amt')?.value){
            _f.get('amount')?.setValue(_f.get('base_currency_amt')?.value * p?.value, {emitEvent: false});
          }
        }},
        amount: {formChangesToCallback: true,  callback(p, _f) {
          if(_f.get('base_currency_amt')?.value){
            _f.get('exchange_rate')?.setValue(p?.value / _f.get('base_currency_amt')?.value, {emitEvent: false});
          }
        }},
      },
      formStructure: [
        {
          header: Core.Localize('detail', {count: 2}),
          fields: ['name', 'title'],
          isTwoLine: true
        },
        /* {
          header: 'Contacts',
          fields    : ['address'],
          isTwoLine: false
        },
        {
          fields: ['supplier', 'supplier_contact'],
          isTwoLine : true
        }, */
        {
          header: Core.Localize('contact', {count: 2}),
          fields: ['supplier', 'supplier_contact'],
          isTwoLine : true
        },
        {
          header: Core.Localize('reference', {count: 2}),
          fields: ['bank_account', 'booking_account'],
          isTwoLine: true
        },
        {
          header: `${Core.Localize('amount', {count: 2})} ${Core.Localize('and')} ${Core.Localize('currency', {count: 2})}`,
          fields: ['tax', 'currency_code', 'base_currency_amt'], /* '',  */
          isTwoLine: true
        },
        {
          fields: ['exchange_rate', 'amount'],
          isTwoLine: true
        },
        {
          fields: ['files'],
          isTwoLine: true
        },
      ],
      requiredFields: ['amount','exchange_rate','base_currency_amt']
    };
    //['id', ]
    //['id', 'name', 'title', 'currency_code', 'supplier', 'supplier_contact', 'bank_account', 'booking_account', 'amount', 'tax', 'exchange_rate', 'base_currency_amt', 'address', 'files']
    return _toReturn;
  }

  public static getBankAccountFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[]} {
    const _toReturn: {
      formProperties: objArrayType,
      formStructure: (string | FormStructure)[]
    } = {
      formProperties: {
        owner         : {icon:"fa-solid fa-circle-user", type: "autocomplete", autoConfig:  {title: ['first_name', 'last_name'], saveField: "id", extraKey: "bank_owner"} , displayVal: "owner.name"},
        currency      : {type: "select", autoConfig: {title: "name", saveField: "id"}, displayVal: "currency.name" },
      },
      formStructure: [
        {
          header    : Core.Localize('detail', {count: 2}),
          fields    : ['account', 'name', 'company'],
          isTwoLine : true
        },
        {
          header    : Core.Localize('owner'),
          fields    : ['owner', 'owner_address', 'owner_zip', 'owner_city', 'owner_country'],
          isTwoLine : true
        },
        {
          header    :  Core.Localize('bank_detail', {count: 2}),
          fields    : ['bank_name', 'bank_account_nr', 'bc_nr', 'bank_nr', 'iban_nr'],
          isTwoLine : true
        },
        {
          fields    : ['currency', 'invoice_mode', 'type'],
          isTwoLine : true
        },
        {
          header    : "Other Info",
          fields    : ['remarks', "qr_invoice_iban"],
          isTwoLine : true
        },
      ]
    }
    //['id', 'name', 'company', 'owner', 'owner_address', 'owner_zip', 'owner_city', 'owner_country', 'bc_nr', 'bank_name', 'bank_nr', 'bank_account_nr', 'iban_nr', 'currency', 'account', 'remarks', 'invoice_mode', 'qr_invoice_iban', 'type']
    return _toReturn;
  }
}