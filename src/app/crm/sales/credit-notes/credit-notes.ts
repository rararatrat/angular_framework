import { Core } from "@eagna-io/core";
import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";

export class CreditNotes {
    public static getFormProperties(): {formProperties: objArrayType, formStructure: (FormStructure | string)[]}{
        const _formProperties: objArrayType = {
          company           : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "company", image:{linkToImage:"logo"}} , displayVal: "company.name"},
          contact           : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "contact", image:{linkToImage:"picture"}} , displayVal: "contact.name"},
          user              : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "user", image:{linkToImage:"picture"}} , displayVal: "user.name"},
          project           : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "project"} , displayVal: "project.name"},
          language          : {icon:"fa-solid fa-language", type:"select", autoConfig: {title: 'name', description: 'name'} },
          bank_account      : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "bank_account"} , displayVal: "bank_account.name"},
          currency          : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "currency"}, displayVal: "name" },
          payment_type      : {icon:"fa-solid fa-circle-user", type:"select", autoConfig: {title: 'name', description: 'name'},  displayVal: "name"},
          taxs              : {icon:"fa-solid fa-circle-user", autoConfig:  {title: "name", saveField: "id", extraKey: "tax"} , displayVal: "taxs.name"},
          mwst_type         : AppStatic.StandardForm['mwst_type'],
          mwst_is_net       : AppStatic.StandardForm['mwst_is_net'],
        };

      const _toReturn   : {formProperties: objArrayType, formStructure: (FormStructure | string)[]} = {
          formProperties  : _formProperties,
          formStructure   : [
                              {
                                header    : Core.Localize('item_details', {item: Core.Localize('credit_note')}),
                                subheader : Core.Localize('enter_key_info', {item: Core.Localize('credit_note')}),
                                fields    : ["name", "company","contact", "user", "project", "title", "api_reference"/* , "template_slug" */],
                                isTwoLine : false
                              },
                              {
                                header    : Core.Localize('item', {count: 2}),
                                subheader : Core.Localize('list_of_products', {item: Core.Localize('credit_note')}),
                                fields    : [ "files"],
                                isTwoLine : false
                              },
                              {
                                header    : Core.Localize('text', {count: 2}),
                                subheader : Core.Localize('texts_desc'),
                                fields    : [ "title", "language"],
                                isTwoLine : false
                              },
                              {
                                header    : Core.Localize('setting', {count: 2}),
                                subheader : Core.Localize('settings_desc'),
                                fields    : ["payment_type","bank_account", "currency",
                                              "mwst_type", "mwst_is_net"],
                                isTwoLine : false
                              },
                            ]
        }

        return _toReturn;
    }
}
