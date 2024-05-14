import { objArrayType, FormStructure } from "@library/library.interface";
import { Observable } from "rxjs";
import { AppStatic } from "src/app/app.static";

export class Team{

  public static getUserFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {
        country: AppStatic.StandardForm['country_api'],
        org: {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "decimal", minFractionDigits:0, maxFractionDigits:0} },
      },
      formStructure: ['first_name', 'last_name', 'email', 'username', 'country', 'is_active', 'is_staff', 'is_superuser', 'password', 'org']
    };
    return _toReturn;

  }
  public static getGroupFormProperties(_contentApi?: (p, m) => Observable<any>): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {
        name: {type:"text"},
        content: { autoConfig: { title: 'content_model',  formProperty: {isForMultiselectOptions: true, api: _contentApi }} }
      },
      formStructure: ['name', 'create', 'read', 'update', 'delete', 'archive', 'user', 'content', 'notes']
    };
    return _toReturn;

  }
}
