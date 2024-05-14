import { objArrayType } from "@library/library.interface";

export class TrackingClass{
  public static getFormProperties(): objArrayType{
    const _toReturn: objArrayType = {
      user   : {autoConfig :  {title: 'name',  description: 'email', image:{linkToImage:"picture"}, saveField: "id"}, displayVal: "user.name"},
      type      : {autoConfig :  {title: 'name',  description: 'name', saveField: "id", extraKey:"task_type"}, displayVal: "name"},
      priority  : {type:"select", autoConfig: {title: 'name',  extraKey:"priority", saveField: "id"}, displayVal: "priority.name"},
      resources : {type:"multiselect", autoConfig: {title: 'name',  extraKey:"name", saveField: "id"}, displayVal: "resources.name"}
    };
    return _toReturn;
}
}
