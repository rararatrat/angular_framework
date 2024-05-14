import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";

export class OrderPayment {
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
                                header    : "Order Payment Details",
                                subheader : "Enter the Key information for your Order Payment",
                                fields    : ["name", "company","contact", "user", "project", "title", "api_reference", "template_slug"],
                                isTwoLine : false
                              },
                              {
                                header    : "Items",
                                subheader : "List of Products or Services attached to this Order Payment",
                                fields    : [ "files"],
                                isTwoLine : false
                              },
                              {
                                header    : "Conditions",
                                subheader : "Conditions of the Order Payment",
                                fields    : ["payment_type","is_valid_from","is_valid_until"/* ,"kb_terms_of_payment" */],
                                isTwoLine : false
                              },
                              {
                                header    : "Address",
                                subheader : "Delivery and Order Payment Address for this Order Payment",
                                fields    : [ "delivery_address_type"],
                                isTwoLine : false
                              },
                              {
                                header    : "Texts",
                                subheader : "Configure what you should see for the email",
                                fields    : [ "title","header", "footer","language",],
                                isTwoLine : false
                              },
                              {
                                header    : "Settings",
                                subheader : "Update the The required Fields",
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
