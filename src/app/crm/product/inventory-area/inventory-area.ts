import { objArrayType } from "@library/library.interface";

export class InventoryArea {
  public static getFormProperties(): any{
    const _formProperties: objArrayType = {
      /* article_type      : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "article_type"}, displayVal: "name" },
      currency          : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "currency"}, displayVal: "name" },
      tax_income        : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "tax_income"}, displayVal: "name" },
      tax_expense       : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "tax_income"}, displayVal: "name" },
      unit              : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "unit"}, displayVal: "name" },
      stock_location    : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "stock_location"}, displayVal: "name" },
      stock_area        : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "stock_area"}, displayVal: "name" },
      article_group_id  : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "article_group"}, displayVal: "name" },
      user              : {icon:"fa-solid fa-circle-user", autoConfig:  {title: ['first_name', 'last_name'], saveField: "id", extraKey: "user"} , displayVal: "user.name"}, */
    };

  const _toReturn   : any = {
      formProperties  : _formProperties,
      includedFields  : [   "name", "type", "shelf", "stack", "lane", "area","files"],
      formStructure   : [
      {
        header    : "Details",
        fields    : ["name", "type", "shelf", "stack", "lane", "area",],
        isTwoLine : false
      },
      {
        header    : "Files",
        subheader : "Upload Any Images, Documents of the Area",
        fields    : [ "files"],
        isTwoLine : true
      },
      ]
    }

    return _toReturn;
  }

}
