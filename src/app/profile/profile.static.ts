import { FormStructure, objArrayType } from "@library/library.interface";

export class Profile {
    public static getProfileAccountForm(): any{

        const _formProperties: objArrayType = {
            country             : {type:"select", autoConfig: {title: 'name', description: 'name', icon:{iconPrefix:'fi fis fi-', iconSuffix:'code'}}},
            locale              : {type:"select", autoConfig: {title: 'code_2', description: null}},
            picture             : {type:"image", }
          };

        const _toReturn   : any = {

          formProperties  : _formProperties,
          includedFields  : ['picture', 'first_name', 'last_name', 'country', 'locale', 'user_id', 'username'],

        }
        return _toReturn;
    }

    public static getFormErrorMessage() : any {
      return {
        password : {
          required: "Field is required",
          pattern : "Password must contain at least one number, one uppercase and a lowercase letter and at least 8 characters Password cannot contain whitespace",
          confirmedValidator: "Passwords did not match"
        },
        email : {
          required: "Field is required",
          pattern : "Invalid Email Address",
          confirmedValidator: "Email did not match"
        },
      }
    }
    public static form_validators : any = {
      email     : RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
      password  : RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/)
    }

    public static getApprovalHistoryFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[], requiredFields?:string[]} {
      const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
        formProperties: {otp: {type: "text"}, process_cat: {type: 'text'}},
        formStructure: ['user', 'process_cat', 'otp', 'otp_num_used', 'is_provision', 'isTokenVerified', 'verifed_date', 'ip_address', 'status', 'lat', 'lon']
      };
      return _toReturn;
    }
}
