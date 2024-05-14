import { FormStructure } from "@library/library.interface";
import { objArrayType } from "@library/library.interface";

export class Users {
    public static getUserFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[], excludedFields?: string[], modalWidth?: string } {
        const _formProperties: objArrayType = {
            country             : {type:"select", autoConfig: {title: 'name', description: 'name', icon:{iconPrefix:'fi fis fi-', iconSuffix:'code'}}},
            locale              : {type:"select", autoConfig: {title: 'code_2', description: null}},
            picture             : {type: "image" },
            avatar              : {type: "image" },
          };

        return {
          //['password', 'is_superuser', 'username', 'is_staff', 'is_active', 'date_joined', 'country', 'app_metadata', 'blocked', 'is_deactivated', 'email_verified', 'user_metadata', 'identities', 'last_ip', 'logins_count', 'multifactor', 'phone_number', 'phone_verified', 'user_id', 'provider', 'locale', 'globalMenubarPref', 'globalGridPref', 'globalChartPref', 'globalScheme', 'provision', 'provision_app', 'provision_uri', 'provision_verified', 'isExternal', 'hasNotification']
          //['', '', '', '', '', '', '', '', '', '', '', '', , '', , '', '', '', , '', '']
          formProperties: _formProperties,
          formStructure: [
            {
                header: 'User Details',
                fields: [ 'username', 'first_name', 'last_name', 'email'],
                isTwoLine: true
            },
            {
                fields: ['user_id', 'password', 'phone_number', 'locale', 'country'],
                isTwoLine: true
            },
            {
                fields: ['created_at', 'updated_at', 'date_joined', 'identities'],
                isTwoLine: true
            },
            {
                header: 'Roles & Permissions',
                fields: ['is_superuser', 'is_staff', 'isExternal', 'role'],
                isTwoLine: true,
            },
            {
                fields: ['picture'],
                isTwoLine: true,
            },
            {
                fields: ['files'],
                isTwoLine: true,
            },
          ],
          excludedFields: ['user_permissions', 'is_active', 'app_metadata', 'blocked', 'is_deactivated', 'email_verified', 'user_metadata', 'last_ip', 'logins_count', 'multifactor', 'phone_verified', 'provider', 'globalMenubarPref', 'globalGridPref', 'globalChartPref', 'globalScheme', 'provision', 'provision_app', 'provision_uri', 'provision_verified', 'hasNotification'],
          modalWidth: '80vw'

          /* ['password', 'is_superuser',, 'is_staff', 'is_active', '', 'id', '', 'app_metadata', 'blocked', '', 'is_deactivated',
          'email_verified', 'user_metadata', '', 'last_ip', 'last_login', 'last_password_reset', 'logins_count', 'multifactor', '', 'phone_verified', , '', '', 'provider', '', 'globalMenubarPref', 'globalGridPref', 'globalChartPref', 'globalScheme', 'provision', 'provision_app', 'provision_uri', 'provision_verified',
          'isExternal', 'hasNotification', 'groups', '', 'role', ''] */
        }
    }
}
