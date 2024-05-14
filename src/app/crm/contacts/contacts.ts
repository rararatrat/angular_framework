import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";

export class Contacts {
    public static getContactFormProperties(): any{
        const _formProperties: objArrayType = {
            phone               : {icon: "fa-solid fa-phone", type:"number", placeholder:"Phone Number"},
            mobile              : {icon: "fa-solid fa-mobile-retro", type:"number", placeholder:"Mobile Number"},
            fax_number          : {icon:"fa-solid fa-fax", type:"number",  placeholder:"Fax Number"},

            addressBy           : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  saveField: "id"}, displayVal: "name" },
            title               : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  saveField: "id"}, displayVal: "name" },
            category            : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "contact_category"}, displayVal: "name" },
            sector              : {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "contact_sector"}, displayVal: "name" },
            gender              : {icon:"fa-solid fa-mars-and-venus-burst", type :"select", autoConfig: {title: 'name', description: 'name',  saveField: "name"} },
            language            : {icon:"fa-solid fa-language", type:"select", autoConfig: {title: 'name', description: 'name'} },
            country             : {icon:"fa-solid fa-globe", type:"select", autoConfig: {title: 'name', description: 'name', icon:{iconPrefix:'fi fis fi-', iconSuffix:'code'}}, displayVal: "name"},
            company             : {icon:"fa-solid fa-sitemap", type:"autocomplete",autoConfig:  {title: ['name'], saveField: "id", extraKey: "company"} , displayVal: "company.name",  placeholder:"Search company"},
            date_of_birth       : {icon:"fa-solid fa-cake-candles", placeholder:"Date of Birth"},
            first_name          : {icon:"fa-solid fa-circle",  placeholder:"Firstname" },
            middle_name         : {icon:"fa-solid fa-circle",  placeholder:"Middlename"},
            last_name           : {icon:"fa-solid fa-circle",  placeholder:"Lastname"},
            email               : {icon:"fa-solid fa-envelope",  placeholder:"eMail"},
            email_2             : {icon:"fa-solid fa-envelope",  placeholder:"eMail Secondary"},
            social              : {icon:"fa-solid fa-hashtag",  placeholder:"Social Profile"},
            //picture             : {icon:"fa-solid fa-image-potrait",  type: 'image',  styleClass:"w-full", placeholder:"Link to Image"},
            job                 : {icon:"fa-solid fa-user-tie",  placeholder:"Job / Profession"},
            address             : {icon:"fa-solid fa-location-dot", type:"address", autoConfig:{extraKey:"contact_address"}},
            contact_partner     : {icon:"fa-solid fa-circle-user", autoConfig:  {title: ['first_name', 'last_name'], saveField: "id", extraKey: "contact_partner"} , displayVal: "contact_partner.name"},
          };

        const _toReturn   : any = {
          formProperties  : _formProperties,
          /* includedFields  : [ 'picture','addressBy', 'title',
                              'first_name', 'last_name', 'job', 'language',
                              'country','email','email_2', 'mobile', 'phone', 'phone_2',
                              'category', 'sector',
                              'company', 'gender', 'address','date_of_birth',
                              'files'
                            ], */
          formStructure   : [
            'picture',
          /* {
            header    : "Image",
            fields    : ['picture'],
            isTwoLine : true
          }, */
          {
            header    : "Details",
            fields    : ['addressBy', 'title', 'first_name', 'last_name'],
            isTwoLine : true
          },
          {
            header    : "Contact",
            fields    : ['company', 'email', 'email_2', 'mobile', 'phone', 'phone_2', 'address'],
            isTwoLine : false
          },
          {
            header    : "Others",
            fields : ['gender','date_of_birth'],
            isTwoLine : false
          },
          ]
        }

      return _toReturn;
    }

    public static getOrgFormProperties(): any{
        const _formProperties: objArrayType = {
            name                : {icon:"fa-solid fa-building"},
            legal_form          : {icon:"fa-solid fa-circle", type: "text"},
            suffix_name         : {icon:"fa-solid fa-circle", type: "text"},
            registration_no     : {icon:"fa-solid fa-gavel", type: "text"},
            vat_no              : {icon:"fa-solid fa-percent", type: "text"},
            vat_id_no           : {icon:"fa-solid fa-circle", type: "text"},
            language            : {icon:"fa-solid fa-circle", type: "select",  autoConfig:  {title:'name', saveField: "id"}},
            contact_partner     : {icon:"fa-solid fa-circle-user", autoConfig:  {title: ['first_name', 'last_name'], saveField: "id", image:{linkToImage:"picture"}, extraKey: "contact_partner"} , displayVal: "contact_partner.name"},
            abbreviation        : {icon:"fa-solid fa-a"},
            website             : {icon:"fa-solid fa-globe", type:"text"},
            //logo                : {icon:"fa-solid fa-circle", type: 'image', autoConfig:{image:{linkToImage:"logo"}},  styleClass:"w-full"},
            billing_add         : {icon:"fa-solid fa-location-dot", type:"address",  title:"Billing Address", autoConfig:{extraKey:"contact_address"}},
            reg_add             : {icon:"fa-solid fa-registered", type:"address", title:"Registration Address", autoConfig:{extraKey:"contact_address"}},
            shipping_add        : {icon:"fa-solid fa-ship", type:"address",  title:"Shipping Address", autoConfig:{extraKey:"contact_address"}},
            branding            : {icon:"fa-solid fa-circle"},
            category            : {icon:"fa-solid fa-circle", type: "select", autoConfig:  {title: 'name', saveField: "id", extraKey: "contact_category"} , displayVal: "category.name"},
            owner               : {icon:"fa-solid fa-building-user", autoConfig:  {title: ['name'], saveField: "id", image:{linkToImage:"picture"}, extraKey: "company_owner"} , displayVal: "owner.name"},
          };
        const _toReturn   : any = {
          formProperties  : _formProperties,
          includedFields  : [ "name",
                              "abbreviation",
                              "billing_add",
                              "category",
                              "contact_partner",
                              "legal_form",
                              "suffix_name",
                              "owner",
                              "reg_add",
                              "registration_no",
                              "shipping_add",
                              "website",
                              "logo",
                              "email",
                              "email_2",
                              "phone", "phone_2",
                              "mobile", "fax_number",
                              'registration_no','vat_no', 'vat_id_no',
                              "language",
                              "id"
                            ],
          formStructure   : [
            'logo',
            {
              header    : "Details",
              fields    : ['name', 'legal_form', 'language', 'category', "suffix_name", "abbreviation"],
              isTwoLine : true
            },
            {
              header    : "Legal Details",
              fields    : ['registration_no','vat_no', 'vat_id_no'],
              isTwoLine : true
            },
            {
              header    : "Address",
              fields    : ['reg_add', 'billing_add', 'shipping_add'],
              isTwoLine : false
            },
            {
              header    : "Contact Details",
              fields    : ["email", "email_2", "mobile", "fax_number", "phone", "phone_2"],
              isTwoLine : false
            },
          ]
        }
        return _toReturn;
    }

    public static getBankAccountFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[]} {
      const _toReturn: {
        formProperties: objArrayType,
        formStructure: (string | FormStructure)[]
      } = {
        formProperties: {
          owner         : {icon:"fa-solid fa-circle-user", type: "autocomplete", autoConfig:  {title: ['first_name', 'last_name'], saveField: "id", extraKey: "bank_owner"} , displayVal: "owner.name"},
          /* currency      : {type: "select", autoConfig: {title: "name", saveField: "id"}, displayVal: "currency.name" }, */
          currency      : AppStatic.StandardForm['currency'],
        },
        formStructure: [
          {
            header    : "Details",
            fields    : ['account', 'name', 'company'],
            isTwoLine : true
          },
          {
            header    : "Owner",
            fields    : ['owner', 'owner_address', 'owner_zip', 'owner_city', 'owner_country'],
            isTwoLine : true
          },
          {
            header    : "Bank Details",
            fields    : ['bank_name', 'bank_account_nr', 'bc_nr', 'bank_nr', 'iban_nr'],
            isTwoLine : true
          },
          {
            fields    : ['currency', 'invoice_mode', 'type'],
            isTwoLine : true
          },
          {
            header    : "Other Info",
            fields    : ['remarks', "qr_invoice_iban"],
            isTwoLine : true
          }
        ]
      };
      return _toReturn;
    }
}
