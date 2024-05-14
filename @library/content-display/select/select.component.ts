import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutocompleteConfig } from '@library/library.interface';
import { SubSink } from 'subsink2';
import { ContentDisplayService } from '../content-display.service';

@Component({
  selector: 'eg-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => SelectComponent),
    multi: true,
  }]
})
export class SelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input("formGroup")       formGroup       : FormGroup = null;
  @Input("formControlName") formControlName : any;
  @Input("topic")           topic           : any;
  @Input("placeholder")     placeholder     : string;

  @Input("styleClass")      styleClass      : any;
  @Input("attribute")       attribute       : AutocompleteConfig;
  @Input("selected")        selected        : any;

  @Output("selectedChange") selectedChange  = new EventEmitter<any>();
  @Output("callback")       callback        = new EventEmitter();
  @Input("icon")            icon: string;
  @Input("mode")            mode: string;
  @Output('optionsChange')  optionsChange   = new EventEmitter<any>();

  public isLoading        : boolean = false;
  public api$             : any;
  public results          : any = [];
  public filterFields     : any;
  public currTopic        : any;
  public currQuery        : any;
  private _subs           : SubSink = new SubSink();

  public onChange = (value: any) => {};
  public onBlur = (touched: boolean) => {};
  readonly: boolean;

  writeValue(value: string) : void {}
  registerOnChange(fn: any) : void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onBlur  = fn; }

  constructor(private _contentService: ContentDisplayService, private _cdr: ChangeDetectorRef){}

  ngOnInit(): void {
    let _initForm = this.formGroup.get(this.formControlName)
    if(typeof(_initForm.value) == "string"){
      _initForm.setValue({[this.attribute?.title]:_initForm.value});
    }
    this._cdr.detectChanges();
    this._fetchData(this.topic);

    this._subs.add(_initForm.valueChanges.subscribe(newVal => {
      this.callback.emit(newVal);
    }));

    /* console.log({_initForm}); */
  }

  private _fetchData(topic:any){
    const _getColorClass = (_text: string = '', _color='') => {
      return _text.replace(new RegExp('{color}', 'g'), _color);
    }

    const _getColors = () => {
      let _color_classs = '';
      if( this.attribute?.colors?.type == 'bg_color'){
        _color_classs = "bg-{color}-faded";
      } else if( this.attribute?.colors?.type == 'text_color'){
        _color_classs = "text-{color}";
      } else if( this.attribute?.colors?.type == 'bg_and_text_color'){
        _color_classs = "bg-{color}-faded text-{color}";
      }
      const _primary =  _getColorClass(_color_classs, 'primary');
      const _secondary =  _getColorClass(_color_classs, 'secondary');
      const _success =  _getColorClass(_color_classs, 'success');
      const _warn =  _getColorClass(_color_classs, 'warn');
      const _accent =  _getColorClass(_color_classs, 'accent');
      const _danger =  _getColorClass(_color_classs, 'danger');
      const _info =  _getColorClass(_color_classs, 'info');
      return  [
        {name: _primary, value: _primary},
        {name: _secondary, value: _secondary},
        {name: _success, value: _success},
        {name: _warn, value: _warn},
        {name: _accent, value: _accent},
        {name: _danger, value: _danger},
        {name: _info, value: _info},
      ];
    }

    this.currTopic = topic;
    switch (topic) {
      case "appId":
        this.api$ = this._contentService.settings.apps({limit: 100}, 'post');
        this._search(this.api$, false);
        break;

      case "addressBy":
        this.api$ = this._contentService.settings.contact_address({limit: 100});
        this._search(this.api$, false);
        break;

      case "title":
        this.api$ = this._contentService.settings.contact_title({limit: 100});
        this._search(this.api$, false);
        break;

      case "language":
      case "locale":
        this.api$ = this._contentService.settings.language({limit: 100});
        this._search(this.api$, false);
        break;

      case "country":
        this.api$ = this._contentService.settings.getCountryCode();
        this._search(this.api$, false);
        break;
      case "country_api":
        this.api$ = this._contentService.settings.country();
        this._search(this.api$, false);
        break;

      case "organization":
          this.api$ = this._contentService.settings.org_organization({limit: 1000});
          this._search(this.api$, false);
          break;

      case "dept_type":
          this.api$ = this._contentService.settings.org_deptteamtype({limit: 1000});
          this._search(this.api$, false);
          break;

      case "org_dept":
          this.api$ = this._contentService.settings.org_deptteams({limit: 1000});
          this._search(this.api$, false);
          break;

      case "content_type":
      case "eg_content_type":
          this.api$ = this._contentService.settings.content_types({limit: 1000, ...this.attribute?.filters});
          this._search(this.api$, false);
          break;

      case "task_type":
        this.api$ = this._contentService.crm.project_task_type({limit: 1000});
        this._search(this.api$, false);
        break;

      case "priority":
          this.api$ = this._contentService.settings.process_priority({limit: 1000});
          this._search(this.api$, false);
          break;

      case "gender":
        this.results = [{name:'Female',value:"female"},{name:'Male',value:"male"},{name:'Diverse',value:"diverse"}]
        break;

      case "payment_type":
        this.api$ = this._contentService.settings.crm_payment_types({limit: 1000});
        this._search(this.api$, false);
        break;

      case "bank_account":
      case "banking":
        this.api$ = (p?, m?, n?) => this._contentService.crm.bankingAccount({limit: 1000});
        break;

      case "currency_code":
      case "currency":
        this.api$ = this._contentService.settings.accounting_currency({limit: 1000});
        this._search(this.api$, false);
        break;

      case "contact_category":
        this.api$ = this._contentService.settings.contact_categories({limit: 1000});
        this._search(this.api$, false);
        break;

      case "contact_sector":
        this.api$ = this._contentService.settings.contact_sector({limit: 1000});
        this._search(this.api$, false);
        break;

      case "unit":
        this.api$ = this._contentService.settings.measurement_units({limit: 1000});
        this._search(this.api$, false);
        break;

      case "account":
        this.api$ = this._contentService.settings.accounting_code_defn({limit: 1000});
        this._search(this.api$, false);
        break;

      case "tax":
      case "tax_rates":
        this.api$ = this._contentService.settings.accounting_taxes({limit: 1000}); //value
        this._search(this.api$, false);
        break;

      /* case "tax_rates":
        this.api$ = this._contentService.settings.tax_rate_global({limit: 1000});
        this._search(this.api$, false);
        break; */

      case "stock_area":
        this.api$ = this._contentService.crm.inventory_area({limit: 1000});
        this._search(this.api$, false);
        break;

      case "stock_location":
        this.api$ = this._contentService.crm.inventory_location({limit: 1000});
        this._search(this.api$, false);
        break;

      case "article_group":
      case "article_type":
      case "product_type":
        this.api$ = this._contentService.crm.product_type({limit: 1000});
        this._search(this.api$, false);
        break;

      case "quotes_status":
        this.api$ = this._contentService.settings.process_status({limit: 1000, eg_content_type__description__icontains:"quotes"});
        this._search(this.api$, false);
        break;

      /* translation_group: TODO use the altername key */
      case "group":
        this.results = [{name:'Titles', value:"titles"}, {name:'Translations',value:"translations"}, {name:'Routes',value:"routes"}]
        //this.results = ["titles", "translations", "routes"]
        break;

      case "provision_app":
        this.results = [{name:'Google Authenticator',value:"Google Authenticator"},
                        {name:'Microsoft Authenticator',value:'Microsoft Authenticator'},
                        {name:'Zoho OneAuth',value:"Zoho OneAuth"}]
        break;

      case "position_key":
        this.results = [{name:'eg_standard_position',value:"eg_standard_position"},
                        {name:'eg_discount_position',value:'eg_discount_position'},
                        {name:'eg_pdf_break_position', value:"eg_pdf_break_position"},
                        {name:'eg_group_position', value:"eg_group_position"},
                        {name:'eg_service_position', value:"eg_service_position"},
                        {name:'eg_product_position', value:"eg_product_position"},
                        {name:'eg_text_position', value:"eg_text_position"},
                        {name:'eg_subtotal_position', value:"eg_subtotal_position"}
                      ];
        break;
      case "email_template":
        this.api$ = this._contentService.settings.email_templates({limit: 1000, ...this.attribute?.filters});
        this._search(this.api$, false);
        break;

      /* case "email_template_type":
        this.results = [{name:'Invoice',value: 1},
                        {name:'Order',value: 2},
                        {name:'Quote',value: 3},
                        {name:'Reminder',value: 4}
                      ];
        break; */

      case "reminder_level": //TEMP
        /* this.results = [{name:'Reminder Level 1', value: 1},
                        {name:'Reminder Level 2', value: 2},
                        {name:'Reminder Level 3', value: 3},
                      ]; */
        this.api$ = this._contentService.settings.reminder_levels({limit: 1000});
        this._search(this.api$, false);
        break;

      case "reminder_level_before_after_due_date": //TEMP
        this.results = [
          {name:'Before', value: 'before'},
          {name:'After', value: 'after'}
          /* 'before',
          'after' */
        ];
        break;

      case "bg_color":
      case "text_color":
      case "color_class":
        this.results = _getColors();
      break;

      /* case "bg_color":
        _color_classs = "bg-{color}-faded";
        break;
      case "text_color":
        _color_classs = "text-{color}";
        break;
      case "bg_and_text_color":
        _color_classs = "bg-{color}-faded text-{color}";
        break; */
      case "doc_template":
        this.api$ = this._contentService.settings.doc_templates({limit: 100});
        this._search(this.api$, false);
        break;

      case "doc_setup":
        this.api$ = this._contentService.settings.doc_setup({limit: 100});
        this._search(this.api$, false);
        break;

      default:
        break;
    }
  }

  private _search(event:any, isPaginate:boolean=false) {
    this.isLoading = true;
    this._subs.sink = this.api$.subscribe({
      next: (res:any) => {
        this.results        = res.hasOwnProperty("content")? res.content.results : res;
        this.optionsChange.emit(this.results);
        this.filterFields   = Object.keys(this.results[0]).toString();
      },
      complete : () => {
        if(this.mode == 'add'){ //RT added condition to perfrom only when mode is add, TODO add another flag to perform this but default to false and negate the condition
          let _initForm = this.formGroup.get(this.formControlName);
          const _cache = this.results;

          if((_cache || []).length > 0 && _initForm?.value){
            //const temp = _cache.find(e => (typeof _initForm.value == 'number') ? (e?.id == _initForm.value) : (((e.name || '').toLowerCase()) == ((_initForm.value?.['name'] || '').toLowerCase()) ));
            const temp = _cache.find(e => {
              //(typeof _initForm.value == 'number') ? (e?.id == _initForm.value) : (((e.name || '').toLowerCase()) == ((_initForm.value?.['name'] || '').toLowerCase()) )
              if(typeof _initForm.value == 'number'){
                return e?.id == _initForm.value || e === _initForm.value;
              } else if(typeof _initForm.value == 'object'){
                return e?.id == _initForm.value['id'] || (e?.name || '').toLowerCase() == (_initForm.value['name'] || '').toLowerCase();
              }
              return false;
            });
            if(temp){
              //console.log({temp});
              _initForm.setValue(temp); //RT
              this._cdr.detectChanges();
              //_initForm.disable();
              //this.readonly = true; //RT
            }
          }
        }

        //}

        this.attribute?.onApiComplete?.({apiData: this.results, formGroup: this.formGroup});
        this.isLoading = false;
        this._cdr.detectChanges();
      }
    });

  }

  public onSelect(event){
    const retVal = {
      id : event.hasOwnProperty('id')? event.id : event.value,
      name : event.value,
      param : this.attribute?.["title"]
    }

    this.callback.emit(retVal);
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

}
