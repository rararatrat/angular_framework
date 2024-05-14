import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";

export class Accounting {
  public static getStandardFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {},
      formStructure: ['title', 'name', 'code', 'description', 'files']
    };
    return _toReturn;
  }
  public static getAccountingFormProperties(): objArrayType{
    const _toReturn: objArrayType = {
        user            : { autoConfig  : {title: 'name', description: 'email', image:{linkToImage:"picture"}, saveField: "id"}, displayVal: "user.name" },
        article_type    : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "article_type.name" },
        currency        : AppStatic.StandardForm['currency'],
        tax_income      : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "tax_income.name" },
        tax_expense     : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "tax_expense.name" },
        unit            : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "unit.name" },
        stock_location  : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "stock_location.name" },
        stock_area      : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "stock_area.name" },
    };
    return _toReturn;
  }
  // public static getBalanceSheetFormProperties(): objArrayType{
  //   const _toReturn: objArrayType = {/* 
  //       TODO: accounting_balance_sheet api
  //       project : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "project.name" },
  //       role    : { autoConfig  : {title: "name", extraKey: "project_role", saveField: "id"}, displayVal: "role.name" },
  //       user    : { autoConfig  : {title: 'name',  description: 'email', image:{linkToImage:"picture"}, saveField: "id"}, displayVal: "user.name" }
  //    */};
  //   return _toReturn;
  // }
  public static getBalanceSheetFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      //TODO: accounting_balancesheet api
      formProperties: {
        currency        : AppStatic.StandardForm['currency'],
        language          : AppStatic.StandardForm['language'],
        payment_type      : AppStatic.StandardForm['payment_type'],
      },
      formStructure: ['title', 'name', 'code', 'description', 'files']
    };
    return _toReturn;
  }
  public static getIncomeFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      //TODO: accounting_income api
      formProperties: {},
      formStructure: ['title', 'name', 'code', 'description', 'files']
    };
    return _toReturn;
  }
  public static getLogsFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      //TODO: accounting_logs api
      formProperties: {},
      formStructure: ['title', 'name', 'code', 'description', 'files']
    };
    return _toReturn;
  }
  public static getManualEntryFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      //TODO: accounting_manual_entries api
      formProperties: {},
      formStructure: ['title', 'name', 'code', 'description', 'files']
    };
    return _toReturn;
  }
  public static getOpenPositionFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      //TODO: accounting_open_positions api
      formProperties: {},
      formStructure: ['title', 'name', 'code', 'description', 'files']
    };
    return _toReturn;
  }
  public static getVatJournalFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      //TODO: accounting_vat_journal api
      formProperties: {},
      formStructure: ['title', 'name', 'code', 'description', 'files']
    };
    return _toReturn;
  }
  public static getVatTaxFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      //TODO: accounting_vat_taxform api
      formProperties: {},
      formStructure: ['title', 'name', 'code', 'description', 'files']
    };
    return _toReturn;
  }
}
