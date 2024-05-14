import { ColDef, ColGroupDef } from "ag-grid-community";
import { FormStructure, objArrayType } from "@library/library.interface";

export class DocumentTemplate {

  public static getDocumentConfigFormProperties(): {formProperties: objArrayType, formStructure: (FormStructure | any)[]}{
    let _formProperties: objArrayType = {
      eg_content_type : {type: "select", autoConfig:{title:'description', description:'name', saveField:'id'}, displayVal: 'name'},
      doc_template    : {autoConfig:{title:'name', description:'name', saveField:'id'}, displayVal: 'name'},
      doc_setup       : {autoConfig:{title:'name', description:'name', saveField:'id'}, displayVal: 'name'},
    }


    let _formStructure: (FormStructure | string)[] = ["name", "eg_content_type","doc_setup", "doc_template"]
    return {
      formProperties: _formProperties,
      formStructure: _formStructure
    }


  }
}
