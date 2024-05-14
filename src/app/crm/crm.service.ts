import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { apiMethod, Core, GridResponse, HelperService, laneItem, laneType, MESSAGE_SEVERITY, ResponseObj, SharedService } from '@eagna-io/core';
import { LibraryService } from '@library/service/library.service';
import { WrapperService } from '@library/service/wrapper.service';
import { MessageService } from 'primeng/api';
import { Observable, debounceTime, map, of, share } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { environment as env } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class CrmService extends AppService {
  constructor(
    public http: HttpClient,
    public wr: WrapperService,
    private _messageService: MessageService,
    @Optional() public location?: Location,
    @Optional() public router?: Router,
    ){
    super(http, wr, location, router);
  }

  /* public org(urlSuffix = 'list', params?: any, method: apiMethod = 'post', toGrid = true): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(`${crmEnv.apiUrl}org/${urlSuffix}/`, params, method, toGrid);
  }

  public users(urlSuffix = 'list', params?: any, method: apiMethod = 'post', toGrid = true): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(`${crmEnv.apiUrl}user/${urlSuffix}/`, params, method, toGrid);
  } */

  /* public contacts_old(urlSuffix: string, params?: any, method: apiMethod = 'post', toGrid = false): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(`${env.apiUrl}${urlSuffix}`, params, method, toGrid);
    //return this.submitHttpRequest(`${url}`, params, method, toGrid);
  } */

  //setting new actions e.g Sales
  public setStatus(_stat: string, statuses: any[], api$: (param: any, method: string) => Observable<any>, id: number){
    const _newStatus = statuses?.find(_s => _s.name?.toUpperCase() == _stat);
    if(_newStatus){
      api$({id, status: _newStatus.id}, 'patch').subscribe( res => {
        this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
        this.wr.helperService.gotoPage({extraParams: {}});
      });
    } else{
      this._messageService?.add({summary: `${Core.Localize('status_not_found', {status: Core.Localize(_stat)})}

      ${Core.Localize('pleaseNotifyAdmin', {org: 'Eagna'})}`, severity: MESSAGE_SEVERITY.WARN});
    }
}



  public getOrg(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any[]>>{
    return this.submitHttpRequest(`${env.apiUrl}mock/${getParam}`, params, method);
    //return this.submitHttpRequest(`${env.apiUrl}org/orgMatrix/1`, params, method);
  }


  public crm_stats(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( nextUrl || `${env.apiUrl}contacts/statistics/`, params, method).pipe(share())
  }

  public contacts(url: string, params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${url}`, params, method);
  }

  public contactPeople(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( nextUrl || `${env.apiUrl}contacts/people/${getParam}`, params, method).pipe(share());
  }

  public contactOrg(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( nextUrl || `${env.apiUrl}contacts/company/${getParam}`, params, method).pipe(share())
  }

  public address(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest( `${env.apiUrl}contacts/address/${getParam}`, params, method).pipe(share())
  }

  public bankingAccount(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}banking/account/${getParam}`, params, method).pipe(share())
  }
  public bankingPayment(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}banking/payment/${getParam}`, params, method).pipe(share())
  }
  public organization(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}contacts/company/${getParam}`, params, method).pipe(share())
  }
  public deptteamtype(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/deptTeamType/${getParam}`, params, method).pipe(share())
  }
  public deptteams(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/deptTeams/${getParam}`, params, method).pipe(share())
  }
  public orgMatrix(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/orgMatrix/${getParam}`, params, method).pipe(share())
  }
  public orgMyUsers(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/myusers/${getParam}`, params, method).pipe(share())
  }
  public orgUsers(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/userInOrg/${getParam}`, params, method).pipe(share())
  }

  public sales(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/${getParam}`, params, method).pipe(share())
  }

  public historyComment(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}history/${getParam}`, params, method).pipe(share());
  }

  public balance_sheets(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/balance_sheets/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }

  public account_standards(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }

  /** Comments, Logs and Updates */
  public account_standard_updates(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}project/updates/${getParam}`, params, method).pipe(share());
  }

  public account_standard_comments(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}project/comments/${getParam}`, params, method).pipe(share());
  }

  public account_standard_logs(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}project/logs/${getParam}`, params, method).pipe(share());
  }
  /** END Comments, Logs and Updates */

  public income_statements(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/income_statements/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }

  public account_code_defn(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/code_defn/${getParam}`, params, method).pipe(share());
  }

  public account_logs(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/logs/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }

  public manual_entries(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/manual_entries/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }
  public account_taxes(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{ //TODO search all instances and replace
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/taxes/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }
  public vat_journals(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/vat_journals/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }
  public vat_taxform(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/taxes/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }
  public open_positions(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/open_positions/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }

  //purchasing
  public purchasing_bills(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}purchasing/bills/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}purchase/bills/${getParam}`, params, method).pipe(share());
  }

  public purchasing_expenses(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}purchasing/expenses/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}purchase/expenses/${getParam}`, params, method).pipe(share());
  }

  public purchase_orders(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}purchasing/order/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}purchase/purchase_order/${getParam}`, params, method).pipe(share());
  }

  public purchase_positions(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/position/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}purchase/purchase_positions/${getParam}`, params, method).pipe(share());
  }

  public outgoing_payments(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}purchasing/order/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}purchase/outgoing_payment/${getParam}`, params, method).pipe(share());
  }

  //sales

  public orders(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/orders/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/orders/${getParam}`, params, method).pipe(share());
  }
  public document_settings(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/docs/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/document_settings/${getParam}`, params, method).pipe(share());
  }
  public sales_comments(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/comments/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/order_comments/${getParam}`, params, method).pipe(share());
  }
  public sales_positions(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/position/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/positions/${getParam}`, params, method).pipe(share());
  }
  public order_positions(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/position/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/order_positions/${getParam}`, params, method).pipe(share());
  }



  public position_type(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/position_type/${getParam}`, params, method).pipe(share());
  }
  public document_types(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/document_types/${getParam}`, params, method).pipe(share());
  }

  public document_templates(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/document_template/${getParam}`, params, method).pipe(share());
  }

  public sales_credit_notes(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/credit_notes/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/credit_notes/${getParam}`, params, method).pipe(share());
  }

  public sales_delivery_notes(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/deliveries/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/deliveries/${getParam}`, params, method).pipe(share());
  }

  public sales_invoices(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/invoices/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/invoices/${getParam}`, params, method).pipe(share());
  }

  public sales_orders(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/orders/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/order/${getParam}`, params, method).pipe(share());
  }

  public sales_payment_reminders(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/reminder/${getParam}`, params, method).pipe(share());
  }

  public sales_quotes(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/quotes/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/quotes/${getParam}${getParam}`, params, method).pipe(share());
  }

  //TODO other email api
  public sales_quotes_email(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}comms/mail/sales/quote${getParam}`, params, method).pipe(share());
  }

  public sales_balance_statement(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/balance_statement/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/order/${getParam}`, params, method).pipe(share());
  }

  public sales_statements(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}sales/statements/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }
  public sales_order_payments(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/order_payments/${getParam}`, params, method).pipe(share());
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/standard/${getParam}`, params, method).pipe(share());
  }

  public sales_order_comments(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    // /* TODO: backend api */ return this.submitHttpRequest(nextUrl ||  `${env.apiUrl}sales/statements/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}sales/order_comments/${getParam}`, params, method).pipe(share());
  }

  //product
  public product_item(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}product/item/list/${getParam}`, params, method).pipe(share());
  }

  public product_item_comments(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}product/item/comments/${getParam}`, params, method).pipe(share());
  }

  /* public product_item(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}product/item/list/${getParam}`, params, method).pipe(share());
  } */

  public product_type(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}product/item/type/${getParam}`, params, method).pipe(share());
  }

  public inventory_location(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}product/stock/location/${getParam}`, params, method).pipe(share());
  }

  public inventory_area(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl ||`${env.apiUrl}product/stock/area/${getParam}`, params, method).pipe(share());
  }

  //project
  public project_list(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}project/list/${getParam}${getParam}`, params, method).pipe(share());
  }

  public project_tasks(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( nextUrl || `${env.apiUrl}project/task/${getParam}`, params, method).pipe(share());
  }

  public project_preceeding_tasks(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}project/preceeding_tasks_tree/${getParam}`, params, method).pipe(share());
  }

  public project_customer_partner(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}project/cp_list/${getParam}`, params, method).pipe(share());
  }

  public project_on_project(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}project/op_list/${getParam}`, params, method).pipe(share());
  }
  public project_role_type(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}project/role_type/${getParam}`, params, method).pipe(share());
  }
  public project_team(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}project/project_team/${getParam}`, params, method).pipe(share());
  }
  public project_condition(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest( `${env.apiUrl}project/conditions/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest( `${env.apiUrl}project/project_team/${getParam}`, params, method).pipe(share());
  }

  public project_activities(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest( `${env.apiUrl}project/activities/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest( `${env.apiUrl}project/activity/${getParam}`, params, method).pipe(share());
  }

   public project_expense(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest( `${env.apiUrl}project/expenses/${getParam}`, params, method).pipe(share());
    return this.submitHttpRequest( `${env.apiUrl}project/project_team/${getParam}`, params, method).pipe(share());
  }

  public project_time_tracking(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}project/time_tracking/${getParam}`, params, method).pipe(share());
  }

  public project_manager(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}project/project_manager/${getParam}`, params, method).pipe(share());
  }
  public project_action(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}project/action/${getParam}`, params, method).pipe(share());
  }
  public project_preceeding_activity(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( `${env.apiUrl}project/preceeding_activity/${getParam}`, params, method).pipe(share());
  }

  public project_logs(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( nextUrl || `${env.apiUrl}project/logs/${getParam}`, params, method).pipe(share());
  }
  public project_updates(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( nextUrl || `${env.apiUrl}project/updates/${getParam}`, params, method).pipe(share());
  }
  public project_comments(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( nextUrl || `${env.apiUrl}project/comments/${getParam}`, params, method).pipe(share());
  }
  public project_task_type(params?: any, method: apiMethod = 'post', nextUrl?:any, getParam=""): Observable<ResponseObj<any>>{
    return this.submitHttpRequest( nextUrl || `${env.apiUrl}project/task_type/${getParam}`, params, method).pipe(share());
  }

  /* CRM Sales Calculations */
  public calculate(value, taxed?){
    const _type = value.type.name.toLowerCase();
    switch(_type){
      case "product position":
        case "standard position":
          let _pp = value.quantity * value.unit_price

          if(value.discount_in_percent != null){
            if(value.is_percentual){
              _pp = (value.quantity * value.unit_price) * (value.discount_in_percent / 100);
              _pp = Math.round(_pp);
            }else{
              _pp = (value.quantity * value.unit_price) - value.discount_in_percent;
            }
          }
          if(taxed && value.tax != null){
            _pp = _pp * (parseFloat(value.tax.tax_rate)+1);
          }
        return _pp
      default:
        return null;
      }
  }

  public calcItemTax(position, data){
    const grouped = this.wr.libraryService.groupByNestedAttribute(position, 'tax');
    let _output : any = [];
    let return_val = {
      total: null,
      tax_group: null
    }
    grouped.forEach(t => {
      let _outObj = {noOfItems:null, tax:null, rate:null, before:null, taxed:null, after:null}

      let before  = 0;
      let after   = 0;
      let taxed   = 0;

      t.children.forEach(element => {
        before  += this.calculate(element, false);
        after   += this.calculate(element, true);
      });

      _outObj['noOfItems']  = t.children.length;
      _outObj['tax']        = (t.tax != null)?t.tax.name:'Not Taxable';
      _outObj['rate']       = (t.tax != null)?Math.round(t.tax.tax_rate*100)+'%':'None';
      _outObj['before']     = Math.round(before * 100) / 100;
      _outObj['after']      = Math.round(after * 100) / 100;
      taxed                 = after - before;
      _outObj['taxed']      = Math.round(taxed * 100) / 100;
      _outObj['currency']   = data?.currency?.name

      _output.push(_outObj)
    })

    if(_output.length > 0){
      let _outObj = {noOfItems:null, tax:null, rate:null, before:null, taxed:null, after:null}

      _output.forEach(o => {
        _outObj['noOfItems']  +=  o['noOfItems']
        _outObj['tax']        =   "Total"
        _outObj['rate']       =   'None'
        _outObj['before']     +=  o['before']
        _outObj['after']      +=  o['after']
        _outObj['taxed']      +=  o['taxed']
      })
      _outObj['currency']     =  data?.currency?.name
      return_val['total']= _outObj
      //_output.push(_outObj)
    }


    return_val['tax_group'] = _output;

    return return_val
  }

  public summaryCalc(data, isTax?:boolean){
    let _temp = 0;
    const _cache = [];

    data.forEach(element => {
      _cache.push(this.calculate(element, isTax));
      _temp += this.calculate(element, isTax)
    });

    return _temp
  }
}
