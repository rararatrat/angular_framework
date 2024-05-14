import { Core } from "@eagna-io/core";
import { MenuItem, PrimeIcons} from 'primeng/api';
import { SettingsComponent } from "./settings.component";

export class SettingsStatic {
    public static getSidebarMenuItems(_this: SettingsComponent){
        const _toReturn   : MenuItem[] =
          [
            {
              icon: PrimeIcons.DATABASE,
              label: Core.Localize('master_data') /* 'Master Data' */,
              disabled:  _this.isDisabled,
              routerLink : [`/settings/${_this.orgId}/masterdata`],
              routerLinkActiveOptions: { exact: false },
              items:[
                {
                  icon: PrimeIcons.BOOK,
                  label: `${Core.Localize('address_book')} (${Core.Localize('contact', {count: 2})})` /* 'Address Book (Contacts)' */,
                  //routerLink:['/business/address_book'],
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/addressbook`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.USER,
                  label: Core.Localize('business_activities') /* 'Business Activities' */,
                  //routerLink: ['settings/business/activites'],
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/business_activites`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.USER,
                  label: Core.Localize('general_status') /* 'General Status' */,
                  //routerLink: ['settings/business/activites'],
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/general_status`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.USER,
                  label: Core.Localize('general_priority')/* 'General Priority' */,
                  //routerLink: ['settings/business/activites'],
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/general_priority`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.BOLT,
                  label: Core.Localize('content_type')/* 'Content Type' */,
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/content_type`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.USER,
                  label: Core.Localize('measurement_units'),
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/measurement`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.USER,
                  label: Core.Localize('project'),
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/project_settings`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.USER,
                  label: Core.Localize('product'),
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/product_settings`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.USER,
                  label: Core.Localize('translations'),
                  //routerLink: ['settings/regional/translation'],
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/translation`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.USER,
                  label: Core.Localize('language_and_iso')/* 'Language & ISO' */,
                  //routerLink: ['settings/regional/language'],
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/language`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.USER,
                  label: Core.Localize('vat')/* 'Language & ISO' */,
                  //routerLink: ['settings/regional/language'],
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/masterdata/tax_rates`],
                  routerLinkActiveOptions: { exact: true }
                }
              ],
            },
            {
              icon: PrimeIcons.TH_LARGE,
              label: Core.Localize('crm'),
              disabled:  _this.isDisabled,
              routerLink : [`/settings/${_this.orgId}/crm`],
              routerLinkActiveOptions: { exact: false },
              items:[
                {
                  icon: PrimeIcons.MAP,
                  label: Core.Localize('payment'),
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/crm/payment`],
                  routerLinkActiveOptions: { exact: true }
                },
                /* {
                  icon: PrimeIcons.MAP,
                  label: Core.Localize('email_template', {count: 2}),
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/templates/email_templates`],
                  routerLinkActiveOptions: { exact: true }
                }, */
                {
                  icon: PrimeIcons.MAP,
                  label: Core.Localize('reminder_level', {count: 2}),
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/crm/reminder_levels`],
                  routerLinkActiveOptions: { exact: true }
                },
                /* {
                  icon: PrimeIcons.FILE,
                  label: 'Document Templates',
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/crm/document_templates`],
                  routerLinkActiveOptions: { exact: true }
                }, */
              ]
            },
            {
              icon: PrimeIcons.EURO,
              label: Core.Localize('accounting'),
              disabled:  _this.isDisabled,
              routerLink: [`/settings/${_this.orgId}/accounting`],
              routerLinkActiveOptions: { exact: true }
            },
            /* RT commented {
              icon: PrimeIcons.UPLOAD,
              label: Core.Localize('import_export'),
              disabled:  _this.isDisabled,
              routerLink : [`/settings/${_this.orgId}/import_export`],
              routerLinkActiveOptions: { exact: true }
              //routerLink: ['profile/approvals']
            },
            {
              icon: PrimeIcons.CHART_LINE,
              label: Core.Localize('process'),
              disabled:  _this.isDisabled,
              routerLink : [`/settings/${_this.orgId}/process`],
              routerLinkActiveOptions: { exact: true }
              //routerLink: ['profile/approvals'] 
            }, */
            {
              icon: PrimeIcons.CHART_LINE,
              label: (_this.capitalizeFirst ? _this.capitalizeFirst.transform(Core.Localize('template')) : Core.Localize('template')),
              disabled:  _this.isDisabled,
              routerLink : null,
              routerLinkActiveOptions: { exact: true },
              items:[
                {
                  icon: PrimeIcons.MAP,
                  label: Core.Localize('document_template'),
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/templates/document`],
                  routerLinkActiveOptions: { exact: true }
                },
                {
                  icon: PrimeIcons.MAP,
                  label: Core.Localize('email_template', {count: 2}),
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/templates/email_templates`],
                  routerLinkActiveOptions: { exact: true }
                },
                /* {
                  icon: PrimeIcons.MAP,
                  label: Core.Localize('email_template', {count: 2}),
                  disabled: _this.isDisabled,
                  routerLink : [`/settings/${_this.orgId}/templates/email`],
                  routerLinkActiveOptions: { exact: true }
                } */
              ]
              //routerLink: ['profile/approvals']
            },
          ];

        return _toReturn;
    }

    public static form_validators : any = {
      email     : RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i),
      password  : RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/)
    }


}
