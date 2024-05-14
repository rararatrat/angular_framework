import { FormStructure, objArrayType } from "@library/library.interface";

export class ProcessStatic{

  public static getProcessFormProperties(_this) {
    let tObj    : objArrayType;
    tObj        = {
      eg_content_type :{ autoConfig:{title:'description', description:'name', saveField:'id'}},
    }
    let _toReturn   : {formProperties: objArrayType, formStructure: (string | FormStructure)[]};

    _toReturn = {
      formProperties : {
        eg_content_type :{ autoConfig:{title:'description', description:'name', saveField:'id'}}
      },
      formStructure   : [
        {
          header    : "Main",
          subheader : "Details",
          fields    : [
                        "name",
                        "description",
                        "app",
                        "module",
                        "affected_model",
                        "method",
                        "status",
                        "eg_content_type",
                        "roles",
                        "files"
                      ], //"user", "code", "description",  "article_group_id", "unit"
          isTwoLine : false,
          collapsed : false
        },

    ]
    }
    return _toReturn
  }
}
