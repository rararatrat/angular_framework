import { objArrayType, FormStructure } from "@library/library.interface";

export type  TypeOrgActions= "add_child" | "remove_child" | "add_parent" | "remove_parent" | "change_parent" | "change_child" | "delete_node" | "set_distincts" | "all";
export type  TypeApi = "org_hierarchy" | "org_structure" | "org_deptteams" | "org_myusers";
export class Structure{

  public static getOrgHierarchyFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {
        parent: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "organization"}, displayVal: "name" },
        child: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "organization"}, displayVal: "name" },
        /* name:  {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "organization"}, displayVal: "name" }, */
      },
      formStructure: ['parent', 'child'],
    };
    return _toReturn;

  }
  public static getGroupFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {
        content: {type:"multiselect", autoConfig: {title: 'name',  /* extraKey:"name", */ saveField: "id"}, /* displayVal: "role.name" */},
      },
      formStructure: ['content']
    };
    return _toReturn;
  }

  public static getTeamsFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {
        organization: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "organization"}, displayVal: "organization" },
        member: {type:"multiselect", autoConfig: {title: 'name',  extraKey:"name", saveField: "id", image:{linkToImage:"picture", avatarGroup:true}}, displayVal: "user.name"},
        type: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'id',  extraKey: "dept_type"}, displayVal: "type" }
      },
      formStructure: ['name', 'type', 'organization', 'owner', 'member']
    };
    return _toReturn;
  }

  public static getOrgFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {
        point_of_contact: {icon:"fa-solid fa-circle-user", autoConfig:  {title: ['first_name', 'last_name'], saveField: "id", extraKey: "point_of_contact"} , displayVal: "point_of_contact.name"},
        reg_add         : {icon:"fa-solid fa-registered", type:"address", title:"Registration Address", autoConfig:{extraKey:"reg_add"}},
        /* organization: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "organization"}, displayVal: "organization" },
        member: {type:"multiselect", autoConfig: {title: 'name',  extraKey:"name", saveField: "id", image:{linkToImage:"picture", avatarGroup:true}}, displayVal: "user.name"},
        type: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'id',  extraKey: "dept_type"}, displayVal: "type" } */
      },
      formStructure: ['name','legal_name','email','email_2','phone','mobile','point_of_contact','registration_no','vat_no','reg_add']
    };
    return _toReturn;
  }

  public static getUserTeamFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[]} {
    const _toReturn: {formProperties: objArrayType, formStructure: (string | FormStructure)[]} = {
      formProperties: {
        /* organization: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'name',  extraKey: "organization"}, displayVal: "organization" },
        member: {type:"multiselect", autoConfig: {title: 'name',  extraKey:"name", saveField: "id", image:{linkToImage:"picture", avatarGroup:true}}, displayVal: "user.name"},
        type: {icon:"fa-solid fa-circle", type:"select", autoConfig: {title: 'name', description: 'id',  extraKey: "dept_type"}, displayVal: "type" } */
      },
      formStructure: ['first_name', 'last_name', 'email',  'phone_number',  'country', 'is_staff', 'is_superuser', 'isExternal']
    };
    return _toReturn;
  }


}
