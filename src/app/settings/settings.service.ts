import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiMethod, GridResponse, HelperService, ResponseObj, SharedService } from '@eagna-io/core';
import { LibraryService } from '@library/service/library.service';
import { BehaviorSubject, distinctUntilChanged, Observable, of, share, Subject, switchMap } from 'rxjs';
import { AppService } from '../app.service';
import { environment as env } from 'src/environment/environment';
import { WrapperService } from '@library/service/wrapper.service';


export interface GeneralInteraface{
  data         : any;
  callback    ?: (action:string, event?: Event) => void;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService extends AppService {

  constructor(public http: HttpClient, public wr: WrapperService) {
    super(http, wr);
  }

  /* Shared Subject for General Component */
  public organizationSubject = new BehaviorSubject<GeneralInteraface>({data:null, callback:null});
  private apiRequest$: Subject<any> = new Subject<any>();
  public getCountryCode(){
    const _jsonURL = "../../assets/data/country_code.json";
    return this.http.get(_jsonURL);
  }
  public branding(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}settings/branding/`, params, method).pipe(share())
  }

  public notif_pref(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}settings/notif_pref/`, params, method).pipe(share())
  }

  public team_members(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}user/list/`, params, method).pipe(share())
  }

  public settings_app(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}settings/app/`, params, method).pipe(share())
  }
  public settings_app_pref(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}settings/app_preferences/`, params, method).pipe(share())
  }
  public settings_organization(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/list/`, params, method).pipe(share())
  }
  public language(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/language/`, params, method).pipe(share())
  }
  public country(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/country/`, params, method).pipe(share())
  }
  public translation(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/translation/`, params, method).pipe(share())
  }
  public business_activities(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/bus_activities/`, params, method).pipe(share())
  }
  public measurement_system(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/measurement/system/`, params, method).pipe(share())
  }
  public measurement_units(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/measurement/units/`, params, method).pipe(share())
  }
  public measurement_pre_units(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/measurement/pre_units/`, params, method).pipe(share())
  }
  public product_warehouse_location(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/product_warehouse_location/`, params, method).pipe(share())
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/measurement/units/`, params, method).pipe(share())
  }

  public tax_rate_global(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/tax_rates/`, params, method).pipe(share())
  }

  public doc_config(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/doc_config/`, params, method).pipe(share())
  }
  public doc_setup(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/doc_setup/`, params, method).pipe(share())
  }
  public doc_templates(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/doc_templates/`, params, method).pipe(share())
  }

  //settings accounting
  public accounting_currency(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/currency/`, params, method).pipe(share())
  }
  public accounting_standard(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/standard/`, params, method).pipe(share())
  }
  public accounting_taxes(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/taxes/`, params, method).pipe(share())
  }
  public accounting_code_defn(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/code_defn/`, params, method).pipe(share())
  }
  public accounting_p_code_defn(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/p_code_defn/`, params, method).pipe(share())
  }
  public accounting_calendar_years(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/calendar_years/`, params, method).pipe(share())
  }
  public accounting_business_years(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/business_years/`, params, method).pipe(share())
  }
  public accounting_vat_period(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/vat_period/`, params, method).pipe(share())
  }
  public accounting_base_vat(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/base_vat/`, params, method).pipe(share())
  }
  public accounting_vat_tax_rates(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}accounting/vat_tax_rates/`, params, method).pipe(share())
  }

  public contact_memo(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/contact/memo/`, params, method).pipe(share())
  }

  public contact_categories(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/contact/categories/`, params, method).pipe(share())
  }

  public contact_sector(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/contact/sector/`, params, method).pipe(share())
  }

  public contact_title(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/contact/title/`, params, method).pipe(share())
  }

  public contact_address(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/contact/address/`, params, method).pipe(share())
  }

  public project_documents(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/project/doc/`, params, method).pipe(share())
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/project/status/`, params, method).pipe(share())
  }
  public project_categories(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/project/categories/`, params, method).pipe(share())
  }
  public project_status(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/project/status/`, params, method).pipe(share())
  }
  public project_hourly_rate(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/project/hourly_rate/`, params, method).pipe(share())
  }
  public product_type(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/product/type/`, params, method).pipe(share())
  }
  public product_pre_type(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/product/pre_type/`, params, method).pipe(share())
  }
  public product_bin_locations(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/product/bin_locations/`, params, method).pipe(share())
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/product/type/`, params, method).pipe(share())
  }
  public product_groups(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<GridResponse>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/product/groups/`, params, method).pipe(share())
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/product/type/`, params, method).pipe(share())
  }

  public org_address(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/address/`, params, method).pipe(share())
  }
  public org_banking(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/banking/`, params, method).pipe(share())
  }
  public org_organization(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/list/`, params, method).pipe(share())
  }
  public org_deptteamtype(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/deptTeamType/`, params, method).pipe(share())
  }
  public org_deptteams(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/deptTeams/`, params, method).pipe(share())
  }

  public org_structure(params?: any, method: apiMethod = 'post', nextUrl?:any, isTree=false): Observable<ResponseObj<any>>{
    if(isTree){
      return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/orgStructure_tree/`, params, method).pipe(share())
    }else{
      return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/orgStructure/`, params, method).pipe(share())
    }

  }
  public org_hierarchy(params?: any, method: apiMethod = 'post', nextUrl?:any, isTree=false): Observable<ResponseObj<any>>{
    if(isTree){
      return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/orgHierarchy_tree/`, params, method).pipe(share())
    }else{
      return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/orgHierarchy/`, params, method).pipe(share())
    }
  }
  public org_myusers(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}org/myusers/`, params, method).pipe(share())
  }
  public user_list(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}user/list/`, params, method, false, false).pipe(share())
  }
  public user_role(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}user/role/`, params, method).pipe(share())
  }
  public user_groups(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}user/groups/`, params, method).pipe(share())
  }
  public content_types(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}user/content/`, params, method).pipe(share())
  }

  public process_status(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}process/status/`, params, method).pipe(share())
  }
  public process_priority(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}process/priority/`, params, method).pipe(share())
  }
  public process_flow(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}process/flow/`, params, method).pipe(share())
  }
  public process_name(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}process/name/`, params, method).pipe(share())
  }
  public process_sequence(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}process/sequence/`, params, method).pipe(share())
  }

  public crm_payment(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}banking/payment/`, params, method).pipe(share())
  }
  public crm_payment_types(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}banking/payment_type/`, params, method).pipe(share())
  }
  public crm_payment_reminders(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    //return this.submitHttpRequest(nextUrl || `${env.apiUrl}settings/crm_payment_reminders/`, params, method).pipe(share())
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}master_data/reminder_level/`, params, method).pipe(share())
  }
  public crm_payment_template(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(nextUrl || `${env.apiUrl}banking/payment_template/`, params, method).pipe(share())
  }
  public email_templates(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}master_data/email_template/`, params, method).pipe(share());
  }

  public reminder_levels(params?: any, method: apiMethod = 'post', nextUrl?:any): Observable<ResponseObj<any>>{
    return this.submitHttpRequest(`${env.apiUrl}master_data/reminder_level/`, params, method).pipe(share());
  }

/* Fetching Address from Google */


  private _formatAddress(results){
    const resultObj = results[0];
    const address   = results[0]['address_components'];
    const retrunObj = {
            formatted_address   : resultObj['formatted_address'],
            streetNumber        : address.filter(e => { return e.types.includes("street_number")}).map(e=>e.long_name)[0],
            premise             : address.filter(e => { return e.types.includes("premise")}).map(e=>e.long_name)[0],
            address             : address.filter(e => { return e.types.includes("route")}).map(e=>e.long_name)[0],
            sublocality_level_1 : address.filter(e => { return e.types.includes("sublocality_level_1")}).map(e=>e.long_name)[0],
            sublocality_level_2 : address.filter(e => { return e.types.includes("sublocality_level_2")}).map(e=>e.long_name)[0],
            sublocality_level_3 : address.filter(e => { return e.types.includes("sublocality_level_3")}).map(e=>e.long_name)[0],
            sublocality_level_4 : address.filter(e => { return e.types.includes("sublocality_level_4")}).map(e=>e.long_name)[0],
            locallity           : address.filter(e => { return e.types.includes("locality")}).map(e=>e.long_name)[0],
            administrative_area_level_3 : address.filter(e => { return e.types.includes("administrative_area_level_3")}).map(e=>e.long_name)[0],
            administrative_area_level_2 : address.filter(e => { return e.types.includes("administrative_area_level_2")}).map(e=>e.long_name)[0],
            administrative_area_level_1 : address.filter(e => { return e.types.includes("administrative_area_level_1")}).map(e=>e.long_name)[0],
            country :address.filter(e => { return e.types.includes("country")}).map(e=>e.long_name)[0],
            postal_code :address.filter(e => { return e.types.includes("postal_code")}).map(e=>e.long_name)[0],
            postal_code_suffix :address.filter(e => { return e.types.includes("postal_code_suffix")}).map(e=>e.long_name)[0],
            plus_code :address.filter(e => { return e.types.includes("plus_code")}).map(e=>e.long_name)[0],
            neighborhood :address.filter(e => { return e.types.includes("neighborhood")}).map(e=>e.long_name)[0],

          }
      return retrunObj;
  }




}
