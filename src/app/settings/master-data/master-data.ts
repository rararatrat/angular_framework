import { FormStructure, objArrayType } from "@library/library.interface";

export class MasterData {
    public static getTranslationsFormProperties(fields: any[]): objArrayType{
        const _toReturn: objArrayType = {
            group: { type: "select", autoConfig: {title: "value"}},
            keyword: {type: "text"}
        };

        fields?.forEach(_eachField => {
            if(_eachField?.field != 'id' && !_toReturn.hasOwnProperty(_eachField?.field)){
                _toReturn[_eachField?.field] = {textArea: {isRawText: true}};
            }
        });
        return _toReturn; 
    }

    public static getStatusFormProperties(): {formProperties: objArrayType, formStructure: (FormStructure | string)[]}{
        const _processColorClass = (p) => {
            if(p.input.data == null){
                switch(p.input.formControl){
                    case 'bg_color':
                        p.input.formGroup?.get('bg_and_text_color')?.enable();
                    break;
                    case 'text_color':
                        p.input.formGroup?.get('bg_and_text_color')?.enable();
                    break;
                    case 'bg_and_text_color':
                        p.input.formGroup?.get('bg_color')?.enable();
                        p.input.formGroup?.get('text_color')?.enable();
                    break;
                }
            } else{
                switch(p.input.formControl){
                    case 'bg_color':
                        p.input.formGroup?.get('bg_and_text_color')?.disable();
                    break;
                    case 'text_color':
                        p.input.formGroup?.get('bg_and_text_color')?.disable();
                    break;
                    case 'bg_and_text_color':
                        p.input.formGroup?.get('bg_color')?.disable();
                        p.input.formGroup?.get('text_color')?.disable();
                    break;
                }
            }

            if(p.input.formControl == ''){

            }
        }

        const _toReturn   : {formProperties: objArrayType, formStructure: (FormStructure | string)[]} = {
            formProperties: {
                eg_content_type :{ autoConfig:{title:'description', description:'name', saveField:'id'}},
                color_class: {type: 'select', autoConfig: {title: 'name', colors: {type: "bg_and_text_color"}} },
            },
            formStructure : []
        }
        return _toReturn; 
    }
}