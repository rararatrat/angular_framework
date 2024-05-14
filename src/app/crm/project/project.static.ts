import { Core } from "@eagna-io/core";
import { FormStructure, objArrayType } from "@library/library.interface";
import { AppStatic } from "src/app/app.static";

export class Project {
    public static getProjectFormProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[], lockedFields?: string[]} {
      let today = new Date();
      let month = today.getMonth();
      let year = today.getFullYear();
      let prevMonth = (month === 0) ? 11 : month -1;
      let prevYear = (prevMonth === 11) ? year - 1 : year;
      let nextMonth = (month === 11) ? 0 : month + 1;
      let nextYear = (nextMonth === 0) ? year + 1 : year;
      let minDate = new Date();
      minDate.setMonth(prevMonth);
      minDate.setFullYear(prevYear);
      let maxDate = new Date();
      maxDate.setMonth(nextMonth);
      maxDate.setFullYear(nextYear);

      const _toReturn: {
        formProperties: objArrayType,
        formStructure: (string | FormStructure)[],
        lockedFields?: string[]
      } = {
        formProperties: {
            company             : {autoConfig:  {title: ['name'],                     description: 'email', image:{linkToImage:"logo"}, otherTopic: 'company', saveField: "id"} , displayVal: "company.name"},
            contact_partner     : {autoConfig:  {title: ['first_name', 'last_name'],  description: 'email', image:{linkToImage:"picture"}, saveField: "id"}                     , displayVal: "contact_partner.id"},
            state              : {type:"select", autoConfig:  {title: ['name'], saveField: "id", extraKey: "quotes_status" } , displayVal: "status.name"},
            priority            : {autoConfig:  {title: ['name'], saveField: "id"} , displayVal: "priority.id"},
            project             : {autoConfig:  {title: ['name'], saveField: "id"} , displayVal: "project.id"},
            date_start_planned  : AppStatic.StandardForm['date_start_planned'],
            date_end_planned  : AppStatic.StandardForm['date_end_planned'],
            date_start_actual  : AppStatic.StandardForm['date_start_actual'],
            date_end_actual  : AppStatic.StandardForm['date_end_actual'],
          },
        formStructure: [
            {
              header    : Core.Localize('detail', {count: 2}),
              fields    : ['name', /* 'type',  */'status', 'priority'],
              isTwoLine : true
            },
            {
              header    : Core.Localize('date', {count: 2}),
              fields    : ['date_start_planned', 'date_end_planned', 'date_start_actual', 'date_end_actual'],
              isTwoLine : true
            },
            {
              header    : Core.Localize('budget'),
              fields    : ['budget_planned', 'budget_actual'],
              isTwoLine : true
            },
            {
              header    : Core.Localize('assignment'),
              fields    : ['company', 'contact_partner'],
              isTwoLine : true
            },
            {
              header    : Core.Localize('description'),
              fields    : ['description'],
              isTwoLine : true
            }
          ],
        lockedFields: ['date_end_planned', 'date_start_actual', 'date_end_actual']
        }

      return _toReturn;
    }

    //['id', 'mig_id', 'project', 'work_package', 'company', 'contact', 'tt_activity', 'name', 'remarks', 'status', 'contact_partner', 'duration', 'from_date_time', 'to_date_time', 'can_invoice', 'amount', 'hourly_rate']
    public static h = [/* 'project', */ /* 'work_package', */ /* 'company', 'contact', */ /* 'tt_activity', */ /* 'name', */ /* 'remarks', */ /* 'status', */ /* 'contact_partner', */ /* 'duration', */ /* 'from_date_time', 'to_date_time', 'can_invoice', */ /* 'amount', 'hourly_rate' */];
    public static getTimeTrackingProperties(): {formProperties: objArrayType, formStructure: (string | FormStructure)[], lockedFields?: string[]} {
      const _toReturn: {
        formProperties: objArrayType,
        formStructure: (string | FormStructure)[],
        lockedFields?: string[]
      } = {
        formProperties: {
            /* work_package,
            hourly_rate,
            tt_activity, */
            /* work_package        : {autoConfig:  {title: ['name'], description: 'email', image:{linkToImage:"logo"}, otherTopic: 'company', saveField: "id"} , displayVal: "company.name"}, */
            /* contact_partner     : {autoConfig:  {title: ['first_name', 'last_name'],  description: 'email', image:{linkToImage:"picture"}, saveField: "id"}                     , displayVal: "contact_partner.id"},
            status              : {type:"select", autoConfig:  {title: ['name'], saveField: "id", extraKey: "quotes_status" } , displayVal: "status.name"},
            priority            : {autoConfig:  {title: ['name'], saveField: "id"} , displayVal: "priority.id"},
            project             : {autoConfig:  {title: ['name'], saveField: "id"} , displayVal: "project.id"},
            date_start_planned  : AppStatic.StandardForm['date_start_planned'],
            date_end_planned  : AppStatic.StandardForm['date_end_planned'],
            date_start_actual  : AppStatic.StandardForm['date_start_actual'],
            date_end_actual  : AppStatic.StandardForm['date_end_actual'], */
          },
        formStructure: [
            {
              header    : Core.Localize('detail', {count: 2}),
              fields    : ['name', 'status', 'project', 'work_package', 'contact'],
              isTwoLine : true
            },
            {
              header    : Core.Localize('setting', {count: 2}),
              fields    : ['amount', 'hourly_rate', 'can_invoice'],
              isTwoLine : true
            },
            {
              header    : Core.Localize('date', {count: 2}),
              fields    : ['from_date_time', 'to_date_time', 'duration'],
              isTwoLine : true
            },
            {
              header    : Core.Localize('assignment'),
              fields    : ['company', 'contact_partner'],
              isTwoLine : true
            },
            {
              header    : Core.Localize('description'),
              fields    : ['tt_activity', 'remarks'],
              isTwoLine : false
            }
          ],
        lockedFields: ['from_date_time', 'to_date_time']
        }

      return _toReturn;
    }

    public static getTaskFormProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[], lockedFields?: string[]} {
      const orgCurrency = "eur"; //TODO get from org
      const _toReturn: {
        formProperties: objArrayType,
        formStructure: (string | FormStructure)[],
        lockedFields?: string[]
      } = {
        formProperties: {
          project   : {autoConfig:  {title: 'name', saveField: "id"} , displayVal: "project.name"},
          creator   : {autoConfig :  {title: 'name',  description: 'email', image:{linkToImage:"picture"}, saveField: "id"}, displayVal: "creator.name"},
          /* type      : {autoConfig :  {title: 'name',  description: 'name', saveField: "id", extraKey:"task_type"}, displayVal: "type.name"}, */
          type      : {type: "select", autoConfig :  {title: 'name',  description: 'description', saveField: "id", extraKey:"task_type"}, displayVal: "type.name"},
          status    : {autoConfig :  {title: 'name',  description: 'name', saveField: "id", extraKey:"status"}, displayVal: "status.name"},
          priority  : {type:"select", autoConfig: {title: 'name',  extraKey:"priority", saveField: "id"}, displayVal: "priority.name"},
          resources : {type:"multiselect", autoConfig: {title: 'name',  extraKey:"name", saveField: "id", image:{linkToImage:"picture", avatarGroup:true}}, displayVal: "resources.name"},
          budget_planned   : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:orgCurrency, currencyDisplay:"symbol"} },
          budget_actual    : {icon:"fa-solid fa-percent", type:"number", numberConfig:{mode: "currency", currency:orgCurrency, currencyDisplay:"symbol"} },
          date_start_planned  : AppStatic.StandardForm['date_start_planned'],
          date_end_planned  : AppStatic.StandardForm['date_end_planned'],
          date_start_actual  : AppStatic.StandardForm['date_start_actual'],
          date_end_actual  : AppStatic.StandardForm['date_end_actual'],
        },
        formStructure: [
          {
            header    : Core.Localize('detail', {count: 2}),
            fields    : ['name', 'project'],
            isTwoLine : true
          },
          {
            header    : Core.Localize('status'),
            fields    : ['type', 'status', 'priority'],
            isTwoLine : true
          },
          {
            header    : Core.Localize('date', {count: 2}),
            fields    : ['date_start_planned', 'date_end_planned', 'date_start_actual', 'date_end_actual'],
            isTwoLine : true
          },
          {
            header    : Core.Localize('budget'),
            fields    : ['budget_planned', 'budget_actual'],
            isTwoLine : true
          },
          {
            header    : Core.Localize('assignment'),
            fields    : ['creator', 'resources'],
            isTwoLine : true
          },
          {
            header    : `${Core.Localize('file', {count: 2})} ${Core.Localize('and')} ${Core.Localize('description')}`,
            fields    : ['description', 'files'],
            isTwoLine : false
          }          
        ],
        lockedFields: ['date_end_planned', 'date_start_actual', 'date_end_actual']
      }

      return _toReturn;
    }

    public static getTeamProperties(): objArrayType{
      const _toReturn: objArrayType = {
        /* role: {autoConfig: {extraKey: 'project_role'}} */
        /* role: {type:"multiselect", autoConfig: {title: 'name',  extraKey:"name", saveField: "id", image:{linkToImage:"picture", avatarGroup:true}}, displayVal: "resources.name"}, */
        role: {type:"multiselect", autoConfig: {title: 'name',  /* extraKey:"name", */ saveField: "id"}, /* displayVal: "role.name" */},
      };
      return _toReturn;
    }

    public static getActivitiesProperties(): {formProperties: objArrayType,formStructure: (string | FormStructure)[], lockedFields?: string[]} {
      const _toReturn: {
        formProperties: objArrayType,
        formStructure: (string | FormStructure)[],
        lockedFields?: string[]
      } = {
        formProperties: {
          task: {autoConfig: {extraKey: 'project_task'}},
          type: {autoConfig: {extraKey: 'task_type'}},
          priority: {type:"select", autoConfig: {title: 'name', saveField: "id"}, displayVal: "priority.name"},
          date_start_planned  : AppStatic.StandardForm['date_start_planned'],
          date_end_planned  : AppStatic.StandardForm['date_end_planned'],
          date_start_actual  : AppStatic.StandardForm['date_start_actual'],
          date_end_actual  : AppStatic.StandardForm['date_end_actual'],
        },
        formStructure: [

          {
            header    : Core.Localize('detail', {count: 2}),
            fields    : ['name'],
            isTwoLine : false
          },
          {
            header    : Core.Localize('project'),
            fields    : ['project', 'status'],
            isTwoLine : true
          },
          {
            header    : Core.Localize('task_detail'),
            fields    : ['task', 'type', 'priority'],
            isTwoLine : true
          },
          {
            header    : Core.Localize('date', {count: 2}),
            fields    : ['date_start_planned', 'date_end_planned', 'date_start_actual', 'date_end_actual'],
            isTwoLine : true
          },
          {
            header    : Core.Localize('budget'),
            fields    : ['budget_planned', 'budget_actual'],
            isTwoLine : true
          },
          {
            header    : `${Core.Localize('file', {count: 2})} ${Core.Localize('and')} ${Core.Localize('description')}`,
            fields    : ['description', 'files'],
            isTwoLine : false
          },
        ],
        lockedFields: ['date_end_planned', 'date_start_actual', 'date_end_actual']
      };
      return _toReturn;
    }
}
