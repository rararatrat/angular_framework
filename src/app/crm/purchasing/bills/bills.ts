import { Core } from "@eagna-io/core";
import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";

export class Bills {
    public static getFormProperties(): {formProperties: objArrayType, formStructure: (FormStructure | any)[]}{
      const _company = AppStatic.StandardForm['company'];
      const _contact_partner = AppStatic.StandardForm['contact_partner'];
      const _formProperties: objArrayType = {
        //company           : { icon:"fa-solid fa-circle-user", displayVal: "company.name", autoConfig:  {title: "name", saveField: "id", extraKey: "company", image:{linkToImage:"logo"}}},
        company           : _company,
        vendor            : {..._company, displayVal: "vendor.name"},
        vendor_contact    : {..._contact_partner, autoConfig: {..._contact_partner.autoConfig, title: ['first_name', 'last_name'], extraKey: "vendor_contact"}, displayVal: "vendor_contact.first_name"},
        user              : {icon:"fa-solid fa-circle-user", displayVal: "user.name", autoConfig:  {title: "name", saveField: "id", extraKey: "user", image:{linkToImage:"picture"}}},
        delivery_address  : {...AppStatic.StandardForm['address'], title:" Delivery Address"},
        invoice_address   : {...AppStatic.StandardForm['address'], title: "Invoice Address"},
        project           : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "project"} , displayVal: "project.name"},
        language          : {icon:"fa-solid fa-language", type:"select", autoConfig: {title: 'name', description: 'name'} },
        bank_account      : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "bank_account"} , displayVal: "bank_account.name"},
        currency          : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "currency"}, displayVal: "name" },
        payment_type      : {icon:"fa-solid fa-circle-user", type:"select", autoConfig: {title: 'name', description: 'name'},  displayVal: "name"},
        taxs              : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "description", description: "tax_rate", saveField: "id", extraKey: "tax"} , displayVal: "taxs.name"},
      };
  
      const _toReturn   : {formProperties: objArrayType, formStructure: (FormStructure | string)[]} = {
        formProperties  : _formProperties,
        formStructure   : [
                            {
                              key       : "details",
                              header    : Core.Localize('item_details', {item: Core.Localize('bill')}),
                              subheader : Core.Localize('enter_key_info', {item: Core.Localize('bill')}),
                              fields    : ['name', 'contact_partner', 'vendor', 'vendor_contact', 'vendor_ref', 'ref'],
                              isTwoLine : false
                            },
                            {
                              key       : "items",
                              header    : Core.Localize('item', {count: 2}),
                              subheader : Core.Localize('list_of_products', {item: Core.Localize('bill')}),
                              fields    : [ "files"],
                              isTwoLine : false
                            },
                            {
                              key       : "conditions",
                              header    : Core.Localize('condition', {count: 2}),
                              subheader : Core.Localize('conditions_desc', {item: Core.Localize('bill')}),
                              fields    :['payment', 'purchase'],
                              isTwoLine : false
                            },
                            {
                              key       : "address",
                              header    : Core.Localize('address'),
                              subheader : Core.Localize('delivery_and_invoice', {item: Core.Localize('bill')}),
                              fields    : ['bill_address'],
                              isTwoLine : false
                            },
                            {
                              key       : "text",
                              header    : Core.Localize('text', {count: 2}),
                              subheader : Core.Localize('texts_desc'),
                              fields    : [ "title"],
                              isTwoLine : false
                            },
                            {
                              key       : "settings",
                              header    : Core.Localize('setting', {count: 2}),
                              subheader : Core.Localize('settings_desc'),
                              fields    : ["currency"],
                              isTwoLine : false
                            },
                          ]
      }
  
      return _toReturn;
    }
}
