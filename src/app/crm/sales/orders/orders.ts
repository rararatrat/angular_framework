import { Core } from "@eagna-io/core";
import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";

export class Orders {
    public static getFormProperties(): {formProperties: objArrayType, formStructure: (FormStructure | string)[]}{
        const _formProperties: objArrayType = {
          is_valid_from : {type: 'date'},
          project           : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "project"} , displayVal: "project.name"},
          language          : {icon:"fa-solid fa-language", type:"select", autoConfig: {title: 'name', description: 'name'} },
          bank_account      : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "bank_account"} , displayVal: "bank_account.name"},
          currency          : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "currency"}, displayVal: "name" },
          payment_type      : {icon:"fa-solid fa-circle-user", type:"select", autoConfig: {title: 'name', description: 'name'},  displayVal: "name"},
          taxs              : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "tax"} , displayVal: "taxs.name"},
          delivery_address  : {icon:"fa-solid fa-location-dot", type:"address", autoConfig:{saveField: "id"}},
          invoice_address   : {icon:"fa-solid fa-location-dot", type:"address", autoConfig:{saveField: "id"}},
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
        };

      const _toReturn   : {formProperties: objArrayType, formStructure: (FormStructure | string)[]} = {
          formProperties  : _formProperties,
          formStructure   : [
                              {
                                header    : Core.Localize('item_details', {item: Core.Localize('order')}),
                                subheader : Core.Localize('enter_key_info', {item: Core.Localize('order')}),
                                fields    : ["name", "company","contact", "user", "project", "title", "api_reference", "template_slug"],
                                isTwoLine : false
                              },
                              {
                                key       : "items",
                                header    : Core.Localize('item', {count: 2}),
                                subheader : Core.Localize('list_of_products', {item: Core.Localize('order')}),
                                fields    : [ "files"],
                                isTwoLine : false
                              },
                              {
                                header    : Core.Localize('condition', {count: 2}),
                                subheader : Core.Localize('conditions_desc', {item: Core.Localize('order')}),
                                fields    : ["payment_type","is_valid_from","is_valid_until"/* ,"kb_terms_of_payment" */],
                                isTwoLine : false
                              },
                              {
                                header    : Core.Localize('address'),
                                subheader : Core.Localize('delivery_and_invoice', {item: Core.Localize('order')}),
                                fields    : [ "delivery_address", "invoice_address"],
                                isTwoLine : false
                              },
                              {
                                header    : Core.Localize('text', {count: 2}),
                                subheader : Core.Localize('texts_desc'),
                                fields    : [ "title","header", "footer","language",],
                                isTwoLine : false
                              },
                              {
                                header    : Core.Localize('setting', {count: 2}),
                                subheader : Core.Localize('settings_desc'),
                                fields    : [
                                              "show_position_taxes", "show_total", "bank_account", "currency",
                                              "mwst_type", "mwst_is_net"],
                                isTwoLine : false
                              },
                            ]
        }

        return _toReturn;
      }
}
