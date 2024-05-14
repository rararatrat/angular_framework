import { objArrayType } from "@library/library.interface";

export class Product {
    public static getProductFormProperties(): objArrayType{
      const _toReturn: objArrayType = {
          /* user            : { autoConfig  : {title: 'name', description: 'email', image:{linkToImage:"picture"}, saveField: "id"}, displayVal: "user.name" }, */
          user            : {icon:"fa-solid fa-circle-user", autoConfig:  {title: ['first_name', 'last_name'], saveField: "id", image:{linkToImage:"picture"}} , displayVal: "user.name"},
          article_type    : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "article_type.name" },
          currency        : { type:"select", autoConfig  : {title: "name", saveField: "id"}, displayVal: "currency.name" },
          tax_income      : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "tax_income.name" },
          tax_expense     : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "tax_expense.name" },
          unit            : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "unit.name" },
          stock_location  : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "stock_location.name" },
          stock_area      : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "stock_area.name" },
      };
      return _toReturn;
  }
    public static getInventoryAreaFormProperties(): objArrayType{
      const _toReturn: objArrayType = {
          project : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "project.name" },
          role    : { autoConfig  : {title: "name", extraKey: "project_role", saveField: "id"}, displayVal: "role.name" },
          user    : { autoConfig  : {title: 'name',  description: 'email', image:{linkToImage:"picture"}, saveField: "id"}, displayVal: "user.name" }
      };
      return _toReturn;
  }
    public static getInventoryLocationFormProperties(): objArrayType{
      const _toReturn: objArrayType = {
          project : { autoConfig  : {title: "name", saveField: "id"}, displayVal: "project.name" },
          role    : { autoConfig  : {title: "name", extraKey: "project_role", saveField: "id"}, displayVal: "role.name" },
          user    : { autoConfig  : {title: 'name',  description: 'email', image:{linkToImage:"picture"}, saveField: "id"}, displayVal: "user.name" }
      };
      return _toReturn;
  }
}
