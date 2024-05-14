import { FormStructure, objArrayType } from "@library/library.interface";

export class CrmSettings{
  public static reminderLevelsCount = 1

  public static getReminderLevelsFormProperties(_that?): {formProperties: objArrayType, valueFormStructure: (string | FormStructure)[], formStructure: (string | FormStructure)[]} {
      /* const _fields = _that.dialogConfig?.data?.fields;
      const _template_type = _that.dialogConfig?.data?.template_type; */
  
      const _toReturn: {
        formProperties: objArrayType,
        valueFormStructure: (string | FormStructure)[],
        formStructure: (string | FormStructure)[]
      } = {
        formProperties: {
          title: {parentFormGroupKey: 'value'},
          header: {parentFormGroupKey: 'value'},
          footer: {parentFormGroupKey: 'value'},
          before_after_due_date: {type: 'select', autoConfig: {extraKey: 'reminder_level_before_after_due_date', title: 'value'} }
        },
        valueFormStructure: [
          {
              fields: ['title', 'header', 'footer']
          }
        ],
        formStructure: [
          {
              header: 'Standard settings',
              fields: ['name', 'deadline', 'show_document_items']
          },
          {
              header: 'Email automated reminder',
              fields: ['send_payment_reminder', 'days', 'before_after_due_date'],
              isTwoLine: true,
              hasBorder: true,
              headerTooltip: {text: `Info<br><br>Please keep in mind that you need an email template for this reminder level to ensure that the automatic reminder is sent successfully.`}
          }
        ]
      };
  
      return _toReturn;
    }
}