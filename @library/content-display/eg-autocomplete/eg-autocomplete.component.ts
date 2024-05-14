import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, Renderer2, Type, ViewChild } from '@angular/core';
import { AutocompleteConfig, FormStructure, IContainerWrapper, objArrayType } from '@library/library.interface';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutoComplete } from 'primeng/autocomplete';
import { ContentDisplayService } from '../content-display.service';
import { WrapperService } from '@library/service/wrapper.service';
import { ConfirmDialogResult, Core, MESSAGE_SEVERITY } from '@eagna-io/core';
import { MessageService } from "primeng/api";
import { SubSink } from 'subsink2';
import { tap } from 'rxjs';
import { Contacts } from 'src/app/crm/contacts/contacts';
import { Users } from 'src/app/users/users';
import { Project } from 'src/app/crm/project/project.static';
import { ConfigStatic } from 'src/app/settings/configuration/configuration.static';
import { PurchaseOrder } from 'src/app/crm/purchasing/purchase-order/purchase-order';
import { Sales } from 'src/app/crm/sales/sales';
import { AppStatic } from 'src/app/app.static';
@Component({
  selector: 'eg-auto-complete',
  templateUrl: './eg-autocomplete.component.html',
  styleUrls: ['./eg-autocomplete.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EgAutocompleteComponent),
    multi: true,
  }]
})
export class EgAutocompleteComponent implements OnInit, ControlValueAccessor, AfterViewInit, OnDestroy {

  @Input("formGroup") formGroup             : FormGroup = null;
  @Input("formControlName") formControlName : any;
  @Input("topic") topic                     : any;

  @Input("styleClass") styleClass           : any;
  @Input("attribute") attribute             : AutocompleteConfig;
  @Input('newData')  newData                : boolean = false;
  @Input() noHeader = false;

  @Input("selected") selected               : any;
  @Output("selectedChange") selectedChange  = new EventEmitter<any>();

  @Output("callback") callback              = new EventEmitter();

  @ViewChild('egAutoComplete') _elementRef  : AutoComplete;

  @Input()
  icon: string;


  public virtualResults   : any = [];
  public results          : any = [];

  public text: string[]   = [];
  public overlayVisible   : boolean = true;

  public api$             : any;
  public currTopic        : any;
  public currQuery        : any;

  public scrollLock       : boolean = false;
  public isLoading        : boolean = false;
  public value            : string;

  public onChange = (value: any) => {};
  public onBlur = (touched: boolean) => {};

  public attrTitleType    : any =  "string" || "object";
  public attrField        : string;
  public noDataFound      : boolean = true;
  public inputClass       : string = "";

  private _subs : SubSink = new SubSink();

  private _fP: {
    /* addEditComponent?: Type<any>, */
    formProperties: objArrayType,
    formStructure?: (string | FormStructure)[],
    includedFields?: string[],
    excludedFields?: string[],
    lockedFields?: string[],
    modalWidth?: string,
  } = {formProperties: {}};
  private _addParams: IContainerWrapper;

  constructor(private _contentService: ContentDisplayService, private _messageService: MessageService, private _wr: WrapperService, private _cdr: ChangeDetectorRef){

  }
  writeValue(value: string) : void {}
  registerOnChange(fn: any) : void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onBlur  = fn; }
  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }
  public triggerChangeDetection() {
    this._cdr.markForCheck(); // Marks the component and its ancestors as dirty
    this._cdr.detectChanges(); // Triggers change detection for the component and its descendants
  }
  ngOnInit(): void {
    if(typeof this.styleClass == 'string'){
      this.styleClass += ' pAutoInput';
      this.inputClass = (this.icon) ? "border-round-left-xs" : "";
    } else if(Array.isArray(this.styleClass)){
      this.styleClass = [...this.styleClass, 'pAutoInput'];
      this.inputClass = (this.icon) ? "border-round-left-xs" : "";
    }

    this.attrTitleType = (typeof(this.attribute?.title) == "string") ? "string" : "object";
    this.attrField     = this.attribute?.title ? ((typeof(this.attribute?.title) == "string") ? this.attribute?.title : this.attribute?.title?.[0]) : "name";
    if(this.newData){
      this._fetchData(this.topic, null, null, false, true);
    }

  }

  public acFieldRender(user: any) {
    return user.first_name + ' ' + user.last_name;
  }

  private _fetchData(topic:any, event:any, queryParam: any, isPaginate: boolean, isFirst = false){

    this.currTopic = topic;
    let query : any = {query:null};

    if(queryParam != null){
      query['query'] = queryParam['query'].toLowerCase();
    }else {
      query['query'] = null;
    }

    // console.log({topic});

    switch (topic) {
      case "ext_address":
        this.api$ = (p?, m?, n?) => this._contentService.searchAddress(query);
        if(isPaginate){
          query.pagetoken =  this.results?.page?.next
          this.api$ = (p?, m?, n?) => this._contentService.searchAddress(query);
        }

        break;

      case "contact_address":
        this.api$ = (p?, m?, n?) => this._contentService.crm.address((m == "put" ? p : query), m, n);
        if(isPaginate){
          this.api$ = (p?, m?, n?) => this._contentService.crm.address(query, "post", this.results?.page?.next);
        }

        break;

      case "address":
        this.api$ = (p?, m?, n?) => this._contentService.settings.org_address((m == "put" ? p : query), m, n);
        if(isPaginate){
          this.api$ = (p?, m?, n?) => this._contentService.settings.org_address(query, "post", this.results?.page?.next);
        }

        break;

      case "salesman":
      case "contact_partner":
      case "user":
      case "userId":
      case "company_owner":
      case "owner":
        this.api$ = (p?, m?, n?) => this._contentService.settings.user_list((m == "put" ? p : query), m, n).pipe(tap(res => {
          // console.log({reqs: res?.content.fields.filter(_f => _f.required).map(_f => _f.field) })
        }));

        this._fP =  Users.getUserFormProperties();

        break;

      case "bank_account":
      case "banking":
        this.api$ = (p?, m?, n?) => this._contentService.crm.bankingAccount((m == "put" ? p : query), m, n);
        this._fP = {formProperties: {currency: AppStatic.StandardForm['currency']}}
        break;

      case "parent_org":
      case "child_org":
      case "organization":
        this.api$ = (p?, m?, n?) => this._contentService.settings.org_organization((m == "put" ? p : query), m, n);
        this._fP = {formProperties: ConfigStatic.getOrganizationFormProperties()};
        break;

      case "dept_type":
        this.api$ = (p?, m?, n?) => this._contentService.settings.org_deptteamtype((m == "put" ? p : query), m, n);
        break;

      case "org_dept":
        this.api$ = (p?, m?, n?) => this._contentService.settings.org_deptteams((m == "put" ? p : query), m, n);
        break;

      case "branding":
        this.api$ = (p?, m?, n?) => this._contentService.settings.branding((m == "put" ? p : query), m, n);
        break;
      case "tax_rates":
        this.api$ = (p?, m?, n?) => this._contentService.settings.tax_rate_global((m == "put" ? p : query), m, n);
        break;

      case "vendor_contact":
      case "bank_owner":
      case "supplier_contact":
      case "point_of_contact":
      case "contact":
        this.api$ = (p?, m?, n?) => this._contentService.crm.contactPeople((m == "put" ? p : query), m, n);
        if(isPaginate){
          this.api$ = (p?, m?, n?) => this._contentService.crm.contactPeople(query, "post", this.results?.page?.next);
        }

        this._fP = Contacts.getContactFormProperties();

        break;
      case "supplier":
      case "vendor":
      case "company":
        this.api$ = (p?, m?, n?) => this._contentService.crm.contactOrg((m == "put" ? p : query), m, n);
        if(isPaginate){
          this.api$ = (p?, m?, n?) => this._contentService.crm.contactOrg(query, "post", this.results?.page?.next);
        }

        this._fP = Contacts.getOrgFormProperties();

        break;

      /* case "units":
        this.api$ = (p?, m?, n?) => this._contentService.settings.measurement_units((m == "put" ? p : query), m, n);

        if(isPaginate){
          this.api$ = (p?, m?, n?) => this._contentService.settings.measurement_units(query, "post", this.results?.page?.next);
        }

        break; */

      case "parent_id":
        this.api$ = (p?, m?, n?) => this._contentService.settings.org_organization((m == "put" ? p : query), m, n);

        if(isPaginate){
          this.api$ = (p?, m?, n?) => this._contentService.settings.org_organization(query, "post", this.results?.page?.next);
        }



        break;

      case "payment_type":
        this.api$ = (p?, m?, n?) => this._contentService.settings.crm_payment_types(((m == "put" || p ) ? p : query), m, n);
        break;

      case "project":
        this.api$ = (p?, m?, n?) => this._contentService.crm.project_list(((m == "put" || p ) ? p : query), m, n);
        this._fP = Project.getProjectFormProperties();
        break;
      
      case "hourly_rate":
        this.api$ = (p?, m?, n?) => this._contentService.settings.project_hourly_rate(((m == "put" || p ) ? p : query), m, n);
        break;

      case "project_task":
        this.api$ = (p?, m?, n?) => this._contentService.crm.project_tasks(((m == "put" || p ) ? p : query), m, n);
        break;

      case "work_package":
        this.api$ = (p?, m?, n?) => this._contentService.crm.project_tasks((( m == "put" || p ) ? p : (query?.query ? query : {type__name__icontains: 'work package'})), m, n);
        break;

      case "task_type":
        this.api$ = (p?, m?, n?) => this._contentService.crm.project_task_type((m == "put" ? p : query), m, n);
        break;


      case "type":
        this.api$ = (p?, m?, n?) => this._contentService.crm.product_type((m == "put" ? p : query), m, n);
        break;

      case "system":
        this.api$ = (p?, m?, n?) => this._contentService.settings.measurement_system((m == "put" ? p : query), m, n);
        break;

      case "account":
      case "booking_account":
      case "account_id":
      case "income_account":
      case "acct_std":
        this.api$ = (p?, m?, n?) => this._contentService.settings.accounting_standard((m == "put" ? p : query), m, n);

        break;

      case "parent":
      case "child":
      case "acct_code_defn":
        this.api$ = (p?, m?, n?) => this._contentService.settings.accounting_code_defn((m == "put" ? p : query), m, n);
        break;

      case "article_type":
        this.api$ = (p?, m?, n?) => this._contentService.crm.product_type((m == "put" ? p : query), m, n);

        break;

      /* case "currency_code":
      case "currency":
        this.api$ = (p?, m?, n?) => this._contentService.settings.accounting_currency((m == "put" ? p : query), m, n);
        break; */

      case "tax":
      case "tax_income":
        this.api$ = (p?, m?, n?) => this._contentService.settings.accounting_taxes((m == "put" ? p : query), m, n);
        break;

      case "tax_expense":
        this.api$ = (p?, m?, n?) => this._contentService.settings.accounting_taxes((m == "put" ? p : query), m, n)
        break;

      case "stock":
        this.api$ = (p?, m?, n?) => this._contentService.crm.product_item((m == "put" ? p : query), m, n);

        break;

      case "invoice":
        this.api$ = (p?, m?, n?) => this._contentService.crm.sales_invoices((m == "put" ? p : query), m, n);

        this._fP = {formProperties: Sales.getSalesInvoiceProperties()};
        break;

      case "credit_voucher":
        this.api$ = (p?, m?, n?) => this._contentService.crm.sales_credit_notes((m == "put" ? p : query), m, n);

        this._fP = {formProperties: Sales.getCreditNotesProperties()};
        break;

      case "stock_place_id":
        this.api$ = (p?, m?, n?) => this._contentService.crm.inventory_location((m == "put" ? p : query), m, n);

        break;

      case "parent_unit":
      case "child_unit":
      case "unit":
        this.api$ = (p?, m?, n?) => this._contentService.settings.measurement_units((m == "put" ? p : query), m, n);

        break;

      case "creator":
      case "user":
        this.api$ = (p?, m?, n?) => this._contentService.settings.user_list((m == "put" ? p : query), m, n);

        break;

      case "memo":
        this.api$ = (p?, m?, n?) => this._contentService.settings.contact_memo((m == "put" ? p : query), m, n);

        break;

      case "stock_area":
        this.api$ = (p?, m?, n?) => this._contentService.crm.inventory_area((m == "put" ? p : query), m, n);

        break;

      case "stock_location":
        this.api$ = (p?, m?, n?) => this._contentService.crm.inventory_location((m == "put" ? p : query), m, n);

        break;

      case "status":
        this.api$ = (p?, m?, n?) => this._contentService.settings.process_status((m == "put" ? p : query), m, n);
        break;

      case "project_status":
        this.api$ = (p?, m?, n?) => this._contentService.settings.project_status((m == "put" ? p : query), m, n);
        break;

      case "content":
      case "content_type":
      case "eg_content_type":
          this.api$ = (p?, m?, n?) => this._contentService.settings.content_types((m == "put" ? p : query), m, n);
          break;

      case "priority":
        this.api$ = (p?, m?, n?) => this._contentService.settings.process_priority((m == "put" ? p : query), m, n);
        break;

      case "project_role":
        this.api$ = (p?, m?, n?) => this._contentService.crm.project_role_type((m == "put" ? p : query), m, n);
        break;

      case "purchase":
      case "purchase_order":
        this.api$ = (p?, m?, n?) => this._contentService.crm.purchase_orders((m == "put" ? p : query), m, n);

        this._fP = PurchaseOrder.getFormProperties();

        break;

      case "payment":
        this.api$ = (p?, m?, n?) => this._contentService.crm.sales_order_payments((m == "put" ? p : query), m, n);
        break;

      case "notifications":
        this.api$ = (p?, m?, n?) => this._contentService.settings.notif_pref((m == "put" ? p : query), m, n);
        break;

      case "doc_template":
        this.api$ = (p?, m?, n?) => this._contentService.settings.doc_templates((m == "put" ? p : query), m, n);

        break;

      case "doc_setup":
        this.api$ = (p?, m?, n?) => this._contentService.settings.doc_setup((m == "put" ? p : query), m, n);
        break;

      default:
        let _org: any = this._wr.libraryService.getLocalStorage('org') || '';
        try {
          _org = JSON.parse(_org);
        } catch (error) {console.warn({error});}

        this._wr.messageService?.add({summary: `${Core.Localize('noAutoConfigApi', {topic: this.topic})}
        
        ${Core.Localize('pleaseNotifyAdmin', {org: _org?.name || 'Eagna'})}`, severity: MESSAGE_SEVERITY.WARN});
        break;
    }

    this._search(this.api$, isPaginate, queryParam);
    this.triggerChangeDetection();
  }


  public search(topic, event) {
    const searchTopic = this.attribute?.otherTopic != undefined ? this.attribute?.otherTopic : topic;
    this.currQuery = {query: event['query'].toLowerCase(), limit:20}
    this._fetchData(searchTopic, event, this.currQuery, false)
  }

  private _search(event:any, isPaginate:boolean=false, query?) {

    this.isLoading = true;

    if(query == null){
      if(this.formGroup.get(this.formControlName).value != "" || undefined || null){
        let _val = this.formGroup.get(this.formControlName).value;
        if(typeof(_val) != "object"){
          this._subs.id("initialFetch").sink = this.api$({id:_val, limit: 1}).subscribe(res => {
            let attname = (this.attribute?.title)?this.attribute.title:"name";
            this.formGroup.get(this.formControlName).setValue({
              id: res.content.results[0]['id'],
              [attname]: res.content.results[0][attname],
            })
            this._subs.id('initialFetch').unsubscribe();
          });

        }
      }
    } else {
      this._subs.sink = this.api$?.().subscribe({
        next: (res:any) => {
          if(res.content.results?.[0]?.hasOwnProperty(this.currTopic != "ext_address" ? "id" : "place_id")){
            this.results        = res.content;
            if(isPaginate){
              this.virtualResults = this.virtualResults.concat(res.content.results);
            } else {
              this.virtualResults = [];
              this.virtualResults = res.content.results
            }
          } else{
            this.virtualResults = [];
          }
        },
        complete : () => {

          this.isLoading = false;
          this.triggerChangeDetection();
        }
      });
    }



  }


  paginate(topic:any, event:any) {
    const requestPage = event.first / event.rows;
    const nextPage = requestPage > 0 ? requestPage + 1 : 0;

    if (nextPage < requestPage) {
      return;
    }

    if(event.last >= this.virtualResults.length - 4 && this.results.page?.next != null && !this.isLoading){
      this._fetchData(topic, event, this.currQuery, true)
    }

  }

  public onSelect(topic, value){
    switch(topic){
      case "ext_address":
        console.log({here: value});
        this._subs.sink = this._contentService.getPlace({place_id: (value?.value?.['place_id'] || value?.['place_id'])}).subscribe(res => {
          const temp = this._wr.libraryService.formatAddress(true, res.content.results);
          this.callback.emit(temp);
        })
        break;

      default:
        this.callback.emit(value);
        break

    }

  }

  public imageErr(event){
    this._wr.libraryService.noImageUrl(event);
  }

  addCallback(item: string) {
    if(this.attribute?.formProperty?.api || this.api$){
      const _whichApi = this.attribute?.formProperty?.api || this.api$;

      this._subs.sink = _whichApi({}, 'options')?.subscribe(res => {

        this._addParams = {
          res           : res,
          gridFields    : res.content?.fields,
          permission    : res.content?.permission,
          apiService    : (p, m?) => _whichApi(p, m),
          //title: `${Core.Localize('addItemAutoComplete', {item})}`,
          title         : item,
          /* addEditComponent: this._fP.addEditComponent, */
          formProperties  : this._fP?.formProperties || this.attribute?.formProperty?.formProperties || {},
          formStructure   : this._fP?.formStructure || this.attribute?.formProperty?.formStructure || [],
          //includedFields  : this._fP?.includedFields || this.attribute?.formProperty?.includedFields || [],
          excludedFields  : this._fP?.excludedFields || this.attribute?.formProperty?.excludedFields || [],
          lockedFields    : this._fP?.lockedFields || this.attribute?.formProperty?.lockedFields || [],
          modalWidth      : this._fP?.modalWidth,
          addCallback     : (p: ConfirmDialogResult) => {
            //this.formGroup?.controls?.[this.attrField]?.setValue(p?.apiData?.results?.[0]?.name);
            //this.formGroup?.controls?.[this.attrField]?.setValue(p?.apiData?.results?.[0]);
            const _resultData = p?.apiData?.results?.[0];
            (this.virtualResults || []).push(_resultData);
            this.formGroup?.controls?.[this.formControlName]?.setValue(_resultData);
            this.callback.emit({value: _resultData});
            this.attribute?.callback?.(p);
          },
          hasAddCallbackOverride  : this.attribute?.callback != undefined,
          noModalHeight           : true,
          /* formChanged: (p) => {
            console.log({formChanged: p});

            //(<objArrayType>p.objArray)['date_end_planned'].dateConfig = {minDate: new Date(), maxDate: new Date() };
            (<objArrayType>p.objArray)[p.input?.formControl]?.callback?.(p); // = {minDate: new Date(), maxDate: new Date() }
          } */};

          console.log(this._addParams);
        this._wr?.containerService?.addAction(this._addParams);

      });
    } else{
      this._wr.messageService?.add({detail: Core.Localize('noFormProperties', {field: this.attrField}) , severity: MESSAGE_SEVERITY.ERROR});
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      /* const elInput = this._elementRef?.el?.nativeElement?.getElementsByClassName('pAutoInput')?.[0]; */
      const elInput = this._elementRef?.el?.nativeElement?.getElementsByTagName('input')?.[0];
      if(elInput){
        //elInput?.focus();
        /* fromEvent(elInput, "keyup").pipe(
          filter(Boolean),
          debounceTime(1000),
        ).subscribe((text: any) => {
          this.inputSearchValue = text?.srcElement?.value;
        })  */
        /* this.search(this.topic, {query: ''}) */
      }
    })
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }
}
