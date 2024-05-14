import { Core } from "@eagna-io/core";
import { MenuItem, PrimeIcons } from "primeng/api";

export class CRM {
  public static getSidebarMenuItems(_this){
    const _toReturn   : MenuItem[] =
    [
      {
        icon: PrimeIcons.USERS,
        label: Core.Localize('contact'),
        /* subTitle: Core.Localize('contact'), */
        routerLink: ['crm/contacts'],
        routerLinkActiveOptions: { exact: false },
        items:[
          {
            icon: PrimeIcons.USERS,
            label: Core.Localize('company'),
            routerLink: ['crm/contacts/company'],
            routerLinkActiveOptions: { exact: true }
          },
          {
            icon: PrimeIcons.USER,
            label: Core.Localize('people'),
            routerLink: ['crm/contacts/people'],
            routerLinkActiveOptions: { exact: true }
          },
          {
            icon: PrimeIcons.DOLLAR,
            label: Core.Localize('banking', {count: 2}),
            routerLink: ['crm/contacts/banking'],
            routerLinkActiveOptions: { exact: true }
          },
        ]
      },
      {
        icon: PrimeIcons.SHARE_ALT,
        label: Core.Localize('sales'),
        routerLink: ['crm/sales'],
        routerLinkActiveOptions: { exact: false },
        items:[
          {
            icon: PrimeIcons.SHARE_ALT,
            label: Core.Localize('quote', {count: 2}),
            tooltip: Core.Localize('quote', {count: 2}),
            routerLink: ['crm/sales/quotes'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.SHARE_ALT,
            label: Core.Localize('order'),
            tooltip: Core.Localize('order'),
            routerLink: ['crm/sales/orders'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.SHARE_ALT,
            label: Core.Localize('order_payment', {count: 2}),
            tooltip: Core.Localize('order_payment', {count: 2}),
            routerLink: ['crm/sales/order_payments'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.SHARE_ALT,
            label: Core.Localize('invoice', {count: 2}),
            tooltip: Core.Localize('invoice', {count: 2}),
            routerLink: ['crm/sales/invoices'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.SHARE_ALT,
            label: Core.Localize('credit_note', {count: 2}),
            tooltip: Core.Localize('credit_note', {count: 2}),
            routerLink: ['crm/sales/credit_notes'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.SHARE_ALT,
            label: Core.Localize('delivery_note', {count: 2}),
            tooltip: Core.Localize('delivery_note', {count: 2}),
            routerLink: ['crm/sales/delivery_notes'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.SHARE_ALT,
            label: Core.Localize('account_statement', {count: 2}),
            tooltip: Core.Localize('account_statement', {count: 2}),
            routerLink: ['crm/sales/statements'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.SHARE_ALT,
            label: Core.Localize('payment_reminder', {count: 2}),
            tooltip: Core.Localize('payment_reminder', {count: 2}),
            routerLink: ['crm/sales/payment_reminder'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.SHARE_ALT,
            label: Core.Localize('balance_statement', {count: 2}),
            tooltip: Core.Localize('balance_statement', {count: 2}),
            routerLink: ['crm/sales/balance_statement'],
            routerLinkActiveOptions: { exact: false }
          },
        ]
      },
      {
        icon: PrimeIcons.PLAY,
        label: Core.Localize('project', {count: 2}),
        routerLink: ['crm/project'],
        routerLinkActiveOptions: { exact: false },
        items:[
          {
            icon: PrimeIcons.PLAY,
            label: Core.Localize('project', {count: 2}),
            routerLink: ['crm/project'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.PLAY,
            label: Core.Localize('task', {count: 2}),
            routerLink: ['crm/task'],
            routerLinkActiveOptions: { exact: false }
          }
        ]
      },
      {
        icon: 'fa-brands fa-product-hunt',
        label: Core.Localize('product', {count: 2}),
        routerLink: ['crm/product'],
        routerLinkActiveOptions: { exact: false },
        items:[
          {
            icon: 'fa-solid fa-cubes',
            label: `${Core.Localize('product_item', {count: 2})} / ${Core.Localize('inventory')}`,
            routerLink: ['crm/product/article'],
            routerLinkActiveOptions: { exact: true }
          },
          {
            icon: 'fa-solid fa-tags',
            label: `${Core.Localize('item', {count: 2})} / ${Core.Localize('inventory_type')}`,
            routerLink: ['crm/product/article_type'],
            routerLinkActiveOptions: { exact: true }
          },
          {
            icon:'fa-solid fa-warehouse',
            label: Core.Localize('stock_location'),
            routerLink: ['crm/product/stock_location'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: 'fa-solid fa-boxes-stacked',
            label: Core.Localize('stock_area'),
            routerLink: ['crm/product/stock_area'],
            routerLinkActiveOptions: { exact: false }
          }
        ]
      },
      {
        icon: PrimeIcons.MONEY_BILL,
        label: Core.Localize('purchasing'),
        routerLink: ['crm/purchasing'],
        routerLinkActiveOptions: { exact: false },
        items:[
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('bill', {count: 2}),
            routerLink: ['crm/purchasing/bills'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('expense', {count: 2}),
            routerLink: ['crm/purchasing/expenses'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('purchase_order', {count: 1}),
            routerLink: ['crm/purchasing/purchase_order'],
            routerLinkActiveOptions: { exact: false }
          },
        ]
      },
      {
        icon: PrimeIcons.MONEY_BILL,
        label: Core.Localize('accounting'),
        routerLink: ['crm/accounting'],
        routerLinkActiveOptions: { exact: false },
        items:[
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('account', {count: 1}),
            routerLink: ['crm/accounting/account'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('balance_sheet'),
            routerLink: ['crm/accounting/balance_sheet'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('income_statement', {count: 1}),
            routerLink: ['crm/accounting/income_statement'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('log', {count: 2}),
            routerLink: ['crm/accounting/logs'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('manual_entry', {count: 1}),
            routerLink: ['crm/accounting/manual_entry'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('open_position', {count: 1}),
            routerLink: ['crm/accounting/open_position'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('vat_journal', {count: 1}),
            routerLink: ['crm/accounting/vat_journal'],
            routerLinkActiveOptions: { exact: false }
          },
          {
            icon: PrimeIcons.MONEY_BILL,
            label: Core.Localize('vat_taxform', {count: 1}),
            routerLink: ['crm/accounting/vat_taxform'],
            routerLinkActiveOptions: { exact: false }
          },
        ],
      },
    ];

    return _toReturn
  }
}
