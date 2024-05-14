
import { FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { apiMethod, ConfirmDialogResult, ExtendedGridDefinition, gridDefaultColumns, GridResponse, MenuItems, ResponseObj } from '@eagna-io/core';
import { GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink2';
import { MenuItem } from 'primeng/api';
import { Type } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

export type statusClasses = {label?: string, code?: number, btnClass?: string, primeClass?: string};
export type template_type = 'creditnotes' | 'invoices' | 'quotes' | 'order' | 'reminder' | "purchaseorders" | /* "deliverynotes" | */ "deliveries" | "accountstatement" | "bills" | "expenses";
//export type template_type = /* 'creditnotes' */ /* | 'invoices' |  *//* 'quotes' | */ /* 'order' | */ /* 'reminder' | */ /* "purchaseorders" */ | "deliverynotes" | "accountstatement" | "bills" | "expenses";

export interface ITemplateSettings{
  companyLogo?: string;
  template: {
    titleColor: string;
    lineColor: string;
    textColor: string;
  };
  templateEl: {
    noPagebreak: boolean;
    showCompanyAddress: boolean;
    showCompanyLogo: boolean;
    showLines: boolean;
    showPageNumbers: boolean;
    columnHeadings: boolean;
  };
  letterHead?: {
    showDocBackgroundCover?: boolean; //to add
    docBackgroundCover: string;

    showDocBackgroundSheet?: boolean; //to add
    docBackgroundSheet?: string;
  };
  font: {
    size: number;
    heading: number;
    recipient: number;
    company: number;
  };
  distance: {
    topMargin: number;
    bottomMargin: number;
    leftMargin: number;
    rightMargin: number;
    headerLine: number;
  };
  recipient: {
    align: string;
    leftRight: number;
    upDown: number;
  };
  setup: pageSetup;
}

export type pageSetup = {
    headerOptions: {
        showDate: boolean,

        /** Only for quote */
        showValidUntil?: boolean,

        /** Only for invoices */
        showPayableUntil?: boolean,

        showCompanyContact: boolean,
        showCustomerNumber: boolean,

        /** Only for quote, invoices, orders */
        showProjectName?: boolean,

        /** Only for invoices, deliverynotes */
        showOrderNumber?: boolean,

        showVATNumber: boolean
      },
    columnOptions?: {
        showPositionNumber: boolean,
        /** Only for quote, invoices, orders, creditnotes */
        showAmount?: boolean,
        /** Only for quote, invoices, orders, creditnotes */
        showUnitPrice?: boolean
      },
    footer: {
        companyNameAndAddress: boolean,
        companyEmailAddress: boolean,
        companyPhone: boolean,
        bankAccountInfo: boolean,
        vatNumber: boolean,
        euVATNumber: boolean,
        mobile: boolean,
        fax: boolean,
        website: boolean,
      },
    appendPDF: boolean,
    /** only for invoices default to true 'Show payment slip on separate page' */
    showPaymentSlip?: boolean,

    /** only for invoices 'Set background for payment slip' */
    setBackground?: boolean,
  }


export interface IPositionPreviewData{
  item: any;
  template_type: template_type;
  api?: (p?, m?, n?) => Observable<any>;
}

export class STATUS{
  static byCode: {[key: string]: statusClasses} = {
      '1': {code: 1, label: 'Continuing', primeClass: "plain", btnClass: 'p-button-plain'},
      '2': {code: 2, label: 'Restitute', primeClass: 'warning', btnClass: 'p-button-warning'},
      '3': {code: 3, label: 'Completed', primeClass: 'success', btnClass: 'p-button-success'},
      '4': {code: 4, label: 'Canceled', primeClass: 'danger', btnClass: 'p-button-danger'},
  };

  static byName: {[key: string]: statusClasses} = {
      'Continuing': {code: 1, label: 'Continuing', primeClass: "plain", btnClass: 'p-button-plain'},
      'Restitute': {code: 2, label: 'Restitue', primeClass: 'warning', btnClass: 'p-button-warning'},
      'Completed': {code: 3, label: 'Completed', primeClass: 'success', btnClass: 'p-button-success'},
      'Canceled': {code: 4, label: 'Canceled', primeClass: 'danger', btnClass: 'p-button-danger'},
  };
}

export interface IllustrationConfig{
  icon      ?: {class: any, name:any},
  image     ?: {url: any, class?: any, name:any},
  sparkline ?: {data: any, class: any}
}

export interface InfoCardConfig{
  illustrationType: "icon" | "image" | "sparkline"
  illustration    : IllustrationConfig,
  topic           : any,
  value           : any
  subTopic        ?: any
}

export interface InfoCardConfigArray{
  config        ?: InfoCardConfig[]
}

export interface PermissionConfig{
  create  ?: boolean;
  read    ?: boolean;
  update  ?: boolean;
  delete  ?: boolean;
  role    ?: any;
  message ?: any;
}

export interface TextConfig{
  name    :   any;
  show    :   boolean;
  class   ?:  any;
}

export interface ComponentConfig {
  header        : TextConfig;
  subHeader     : TextConfig;
  data          : any;
  currentType   : componentConfigType;
  subs          : SubSink;
  virtualList   ?: any[];
  list          ?: any;
  permission    ?: PermissionConfig;
  menuItems     ?: MenuItems[];
  isLoading     ?: boolean;
  itemLoading   ?: boolean;
  onSearch      ?: (param?:any, event?: Event) => void;
}

export interface ContainerConfig {
  containerType     : "twocolumn" | "onecolumn"
  hasHeader         : boolean;
  header            : string;
  subheader         ?: string;
  items             ?: MenuItems[] | any;
  menuType          ?: "tab" | "menubar" | "slide" | "tiered";
  menuDisplay       ?: "icon" | "text" | "both";
  subTitle          ?: string;
  hasSearch         ?: boolean;
  cc                ?: ComponentConfig;
  noContainerHeight ?: boolean;
  onSearch          ?: (param?:any, event?: Event) => void;
  api$              ?: (param?:any, method?: "patch") => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
}

export interface FormStructure{
  key       ?: string,
  header    ?: string,
  headerTooltip ?: {icon?: string, text: string},
  subheader ?: string,
  isTwoLine ?: boolean,
  hasBorder ?: boolean,
  fields    ?: string[],
  collapsed ?:boolean
}

export interface CrudInterface{

  includedFields  ?: string[],
  excludedFields  ?: string[],
  lockedFields    ?: string[]
  requiredFields  ?: string[],
  formStructure   ?: (string | FormStructure)[];
  title           ?: any,
  description     ?: any,
  formProperties  ?: objArrayType,
  fromComponent   ?: any,
  callback        ?: (param?:any, data?: any) => void;
  onSubmit        ?: (param?:any, event?: Event) => void;
  onSave          ?: (param?:any, event?: Event) => void;
  onCancel        ?: (param?:any, event?: Event) => void;
}

export interface StateTabs{
  label     : string ,
  subTitle  : string,
  icon      : string,
  gridId    : string,
  api$      : (param?:any, method?: any, nextUrl?:any) => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
  items     ?: MenuItems[];
  onSearch  ?: (param?:any, event?: Event) => void;
  onClick   ?: (param?:any, event?: Event) => void;
  /**
  *  Optional fields configuration, to be included upon add, edit
  */
  formStructure   ?: (string | FormStructure)[];

  defaultColumns?: gridDefaultColumns;

  /**
   * To override/ provide additional form properties for editting
   */
  formProperties?: objArrayType;

  isReadonly?: boolean;
}

export interface IContainerWrapper {
  /* for select and auto */
  initValue?: any;

  reloaded?:boolean;
  params  ?:any;
  viewtype ?: "grid" | "list" | "stats";
  /* virtualListCols ?: {colId: _f.field, field: _f.field, header: "name"}[]; */
  virtualListCols ?: {
    cols?: {colId: string, field?: string, header?: string}[],
    visibleCols?: string[]
  };
  contextMenuItems?: MenuItem[];
  hasSearch?: boolean;
  extendedGridDefOverride?: ExtendedGridDefinition;

  /**
   * The main ContainerConfig
   */
  config?: ContainerConfig;
  /**
   * attach here the dual binded item from Grid
   */
  gridParams?: GridReadyEvent;

  /** Grid Default Columns */
  defaultColumns?: gridDefaultColumns;

  /** Added gridFields and permission to make the GridService independent from which caller */
  gridFields?: any[];
  permission?: PermissionConfig;
  aggs?: any;

  /**
   * Title to be appeared in create/edit modal
   */
  title?: string;

  /**
   * Description to be appeared in create/edit modal
   */
  description?: any,

  /**
   * optionally indicate from which component
   */
  fromComponent?: string;

  /**
   * optionally indicate the base url to be used for router navigation upon selection
   */
  baseUrl?: string;

  /**
   * the status field name from the backend
   * if not provided, no addiditonal column will be created
   * and no tabs in container wrapper
   */
  statusField?: string;

  /**
   * preconfigured menu to be used in first column for twocolumns (state: e.g Vat Standard Tax, Base VAT)
   */
  stateTabs?: StateTabs[];

  /**
   * to be attached response of grid during tap
   */
  res?: ResponseObj<GridResponse>;

  /**
   * Optional fields configuration, additional fields to be marked as required add, edit
   */
  requiredFields?: string[];

  /**
   * Optional fields configuration, to be locked upon add, edit
   */
  lockedFields?: string[];

  /**
   *  Optional fields configuration, to be excluded upon add, edit
   */
  excludedFields?: string[];

  /**
   *  Optional fields configuration, to be included upon add, edit
   */
  includedFields?: string[];

  /**
   *  Optional fields configuration, to be included upon add, edit
   */
  formStructure   ?: (string | FormStructure)[];

  /**
   * To override/ provide additional form properties for editting
   */
  formProperties?: objArrayType;
  modalWidth?: string;
  modalHeight?: string;
  noModalHeight?: boolean;

  skipTranslation?: boolean;
  
  /**
   * Adds extra configuration for each editor field element
   */
  editorFieldConfigs?: { [field: string]: editorFieldConfigType };

  /**
   * CRUD Elements
  */
  add     ?: CrudInterface;
  view    ?: CrudInterface;
  edit    ?: CrudInterface;
  delete  ?: CrudInterface;

  isReadonly?: boolean;
  isProcess ?: boolean;
  process_form ?: IProcessForm[];

  /**
   * to ammend the default CRUD submenus
  */
  amendSubMenus?: (_subMenus: MenuItem[], config?: IContainerWrapper) => MenuItem[];

  /**
   * attach the apiService to be called upon add/edit
   */
  apiService: (p: any, m?: any, n?:any) => Observable<ResponseObj<any>>;
  selectionCallback?: (item?: any, p?: SelectionChangedEvent) => void;
  listFilterCallback?: (p?: any) => void;
  addCallback?: (p?: ConfirmDialogResult) => void;
  deleteCallback?: (p?: any) => void;

  tabClickCallback?: (p?: IContainerWrapper) => IContainerWrapper;

  /**
   * Specify which Details Component will be used, if not given the default
   * Add 'view' functionality window will appear
   */
  detailComponent?: Type<any>;

  /**
   * Specify which Details Component will be used, if not given the default
   * Add 'view' functionality window will appear
   */
  addEditComponent?: Type<any>;

  /**
   * Set this to false so the grid will not open the route via right sidebar
   */
  withDetailRoute?: boolean;

  /**
   * Disable to turn off actions column, turned on by default in GridListComponent
   */
  gridActionsColumnConfig?: {
    /**
     * enable/disable
     */
    enable: boolean,
    /**
     * provide to filter which actions will be visible, leave blank for default actions
     */
    actions?: typeActionsAllowed[]
  };

  excludedMenus?: ('view' | 'new' | 'edit' | 'delete')[];
  hasAddCallbackOverride?: boolean;

  //for customizing the form upon event change: e.g. dates
  /* formChanged?: (p: any) => any | void; */
}

export type typeActionsAllowed = 'view' | 'copy'

export interface ImageContainerConfig {
  formGroup             ?: FormGroup
  formControlName       ?: any
  variableModel         ?: any
  hasPreview            ?: boolean
  onClick               ?: (param?:any, event?: Event) => void;
}

export interface ImageConfig {
  name        ?: string;
  urlPrefix   ?: string;
  urlSuffix   ?: string;
  extension   ?: "png" | "gif" | "webp" | "jpeg" | "jpg";
  linkToImage ?: string;
  avatarGroup ?: boolean;
}

export interface IconConfig {
  name        ?: string
  iconPrefix   ?: string
  iconSuffix   ?: string
}

export interface AutocompleteConfig {
  /**
   * the mapping field to be used for displaying using the field given
   */
  title                 ?: any;
  description           ?: any;
  description_formatter ?: (p?) => any;
  identifier_prefix     ?: string;
  identifier            ?: string;
  image                 ?: ImageConfig;
  icon                  ?: IconConfig;
  otherTopic            ?: string;
  colors                ?: {
    type                : 'bg_color' | 'text_color' | 'bg_and_text_color',
    isColorPicker       ?: boolean
  }

  /**
   * to replace default topic (as field)
   */
  extraKey            ?: string;

  /**
   * to replace default topic (as field)
   */
  saveField           ?: string; /* e.g., id or name */

  /**
   * properties to be used by Autocomplete's Create New
   */
  formProperty        ?: IAddComponentData;

  filters             ?: {[p: string]: string[]}; // {description: ['invoices', 'quotes', 'order', 'reminder']}

  /**
   * used for Add new when no AutoSelect
   */
  callback            ?: (p?: any) => any;

  onApiComplete       ?: (p?: {apiData: any[], formGroup: FormGroup}) => void;
}

export interface NumberConfig{
  /*** string	decimal	Defines the behavior of the component, valid values are "decimal" and "currency". */
  mode ?: "currency" | "decimal" ;
  /*** string	null	Text to display before the value. */
  prefix ?: string;
  /*** string	decimal	Text to display after the value. */
  suffix ?: string;
  /*** boolean	true	Whether to use grouping separators, such as thousands separators or thousand/lakh/crore separators */
  useGrouping ?: boolean;
  /***number	null	 The minimum number of fraction digits to use. Possible values are from 0 to 20;  */
  minFractionDigits ?: number;
  /*** number	null	 The maximum number of fraction digits to use. Possible values are from 0 to 20; the default for plain number formatting is the larger of minimumFractionDigits and 3;  */
  maxFractionDigits ?: number;
  /*** string	null	 The currency to use in currency formatting. Possible values are the ISO 4217 currency codes, such as "USD" There is no default value; if the style is "currency", the currency property must be provided.  */
  currency ?: string;
  /*** string	symbol	 How to display the currency in currency formatting. Possible values are "symbol" or "name" */
  currencyDisplay?: "symbol" | "name";
  /*** number	null	Mininum boundary value. */
  min?: number;
  /*** number	null	Maximum boundary value. */
  max?:number;
  /*** locale	null	set Locale Value. */
  locale?:string;
  /*** string	decimal	Defines the behavior of the units, valid values are  "unit" | "number" | "percent". */
  type ?: "unit" | "number" | "percent"
  /*** Boolean use isDynamic if you want the field to be frozen when tehformcontrol changes set this to true*/
  isDynamic ?: boolean;


}

export interface InPlaceConfig{
  method              : "callback" | "api";
  formGroup           : FormGroup | FormGroup<any>;
  isWholeForm         : boolean;
  mode                ?: 'view' | 'add' | 'edit' | undefined; //default to view
  isDisabled          ?: boolean;
  autoCompleteConfig  ?: AutocompleteConfig;
  permission          ?: PermissionConfig;
  styleClass          ?: any;
  attribute           ?: any;
  selNgModel          ?: any;
  paramUpdate         ?: (param: any, p2?: any) => any;
  api$                ?: (param?:any, method?: apiMethod) => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
  onUpdate            ?: (param?:any, event?: Event) => void;
}

export interface EditableComponent{
  method              ?: any;
  formGroup           ?: FormGroup | FormGroup<any>;
  formControlName     ?: any
  isDisabled          ?: boolean;
  permission          ?: PermissionConfig;
  styleClass          ?: any;
  attribute           ?: any;
  selNgModel          ?: any;
  data                ?: any;
  api$                ?: (param?:any, method?: apiMethod) => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
  callback            ?: (param?:any, event?: Event) => void;
}

export interface CommentsInterface{
  action         : any;
  user           : any;
  comment        : any;
  dateCommented  : Date;
  onDelete      ?: (param?:any, event?: Event) => void;
  onUpdate      ?: (param?:any, event?: Event) => void;
}

export interface LogsInterface{
  action          : any;
  user            : any;
  logs            : any;
  dateCommented   : Date;
  onDelete       ?: (param?:any, event?: Event) => void;
  onUpdate       ?: (param?:any, event?: Event) => void;
}

export interface DetailsActionItemInterface{
  icon             : any;
  title            : any;
  subtitle        ?: any;
  notification    ?: any;
  onClick         ?: (param?:any, event?: Event) => void;
}

export interface DetailsContainerConfig {
  showNavbar        ?: boolean;
  navbarExpanded    ?: boolean;
  showDetailbar     ?: boolean;
  detailBarExpanded ?: boolean;
  hasHeader          : boolean;
  header             : string;
  subheader         ?: string;
  title             ?: string;
  subTitle          ?: string;
  workflowItems     ?: MenuItem[];
  actionItems       ?: MenuItem[];
  data              ?: any;
  itemId            ?: any;
  dialogConfig      ?: DynamicDialogConfig;
  dialogRef         ?: DynamicDialogRef;
  sidebar           ?: {
    header?: any,
    items ?: MenuItems[];
  },
  params            ?: any;
  paramUpdate       ?: (param: any, p2?: any) => any;
  detailsApi$       ?: (param?:any, method?: any, nextUrl?: any, append?: string) => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
  updateApi$        ?: (param?:any, method?: any, nextUrl?: any) => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
  commentsApi$      ?: (param?:any, method?: any, nextUrl?: any) => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
  logsApi$          ?: (param?:any, method?: any, nextUrl?: any) => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
  callback          ?: (param?:any, event?: any) => void;
  onApiComplete     ?: (param?:any, event?: any) => void;
  hasUpdates        ?: boolean;
  hasComments       ?: boolean;
  hasLogs           ?: boolean;

  formProperty      ?: IAddComponentData;
}

export interface GridListConfig {
  display           : "list" | "grid" | "stats";
  params            : any;
  title             ?: string;
  api$              ?: (param?:any, method?: any, nextUrl?:any, append?: string) => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
  detailComponent   ?: Type<any>;
  contextMenuItems  ?: MenuItem[];
  virtualListCols   ?: any[];
  containerWrapper  ?: IContainerWrapper;
  instance          ?: Type<any>;
}

export interface TrackingConfig {
  display       : "list" | "grid" | "stats";
  params        : any;
  callback      ?: (param?:any, event?: any) => void;
  api$          ?: (param?:any, method?: any, nextUrl?:any) => Observable<any> | Observable<ResponseObj<any>> | Observable<ResponseObj<GridResponse>>;
}

/* export interface IRouteReloaded extends RouteObserverService{
  onRouteReloaded(event?: NavigationEnd, snapshot?: ActivatedRouteSnapshot, rootData?: Data, rootParams?: Params);
} */

export type editorFieldConfigType = {noToolbar: boolean};

export type notifsTypeType = 'any' | 'assignment' | 'mail' | 'cron';
export type notifsType = {
  id: number,
  type: notifsTypeType,
  title: string,
  description: string,
  dateTime: string
  routerLink?: string,
  picture?: string,
  name?: string,
  isRead: boolean
}

export type componentConfigType = 'dialog' | 'route' | 'component';

export type chatMessage = {
  chatId: number,
  message: string,
  userId: number,
  username: string,
  picture?: string,
  isRead?: boolean
}

export type chatType = {
  id: number,
  //isGroup: boolean,
  userId?: number,
  username?: string,
  picture?: string,

  chatMessages: chatMessage[]
  chatGroupName?: string
}

export interface IAddComponentData {
  /* editMode?: boolean, */
  title?: any,
  description?: any,
  mode?: 'view' | 'add' | 'edit' | undefined; //default to view
  hideDeleteButton?: boolean;
  item?: any;
  fields?: any[];
  api?: (p: any, m: apiMethod) => Observable<any>;

  /** use this flag for multiselect and providing api for getting the options */
  isForMultiselectOptions?: boolean;
  mapNodes?: (_data: any[]) => any[];

  lockedFields?: string[];
  excludedFields?: string[];
  includedFields?: string[];
  
  formStructure   ?: (string | FormStructure)[];
  /** During add/edit using AddComponent turn this on to follow the entire FormGroup based on api fields, instead of fields only included from FormStructure array */
  byPassFormStructure?: boolean;
  
  requiredFields?: string[];
  fromComponent?: string;
  params?: any;
  /* cardHeight?: string, */
  permission?: PermissionConfig;
  formProperties?: objArrayType;
  isChanged?: boolean;
  editingField?: string;
  editorFieldConfigs?: {[field: string]: editorFieldConfigType};
  hasAddCallbackOverride?: boolean;
  isReadonly?: boolean;
  isProcess?:boolean;
  process_form ?: IProcessForm[];
  //for customizing the form upon event change: e.g. dates
  /* formChanged?: (p: any) => any | void; */
}

export type gridFieldsType = { ['form']?: string, ['field']?: string, ['required']?: any, [field: string]: string };

export type objArrayType = {[p: string]: {
  isEditable?: boolean;
  isDisabled?: boolean;
  title?: string;
  icon?: string;
  type?: any;
  mask_string?: string;
  formControlName?: string;
  displayVal?: any;
  placeholder?: string;
  styleClass?: string;
  imageClass?: string;

  /** use this to access nested formGroup
   * e.g: {form: {subForm: {subValue: ''}}}
   * the parentFormGroupKey then should be 'subForm' */
  parentFormGroupKey?: string;

  autoConfig?: AutocompleteConfig; /* {title: string, description?: string, image?:{linkToImage: 'icon'} } */
  numberConfig?: NumberConfig;
  /** turn this on to switch from WYSIWYG to textarea */
  textArea?: {
    isRawText: boolean;
    tinyMceConfig?: any;
  };
  required?: boolean;
  data?: any;
  validators?: (ValidatorFn | ValidationErrors)[];
  formChangesToCallback?: boolean;
  callback?: (p: any, _f?: FormGroup) => void;

  /* for Dates */
  dateConfig?: {
    minDate?: Date;
    maxDate?: Date;
  }
}};

export interface IEmailRendererData{
  id?: number;
  fields: any[];
  template_type: template_type;
  emailApi: (p: any, m?: apiMethod) => Observable<any>;
}

export interface INoDataFound {
  action        ?: string;
  message       ?: string;
  icon          ?: string;
  topic         ?: string;
  params        ?: any;
  api           ?: (p: any, m: apiMethod) => Observable<any>;
  formProp      ?: any;
  formStruc     ?: any;
  callback      ?: (p: any) => void;
  hasCallback   ?: boolean;
}

export interface IStatsChart {
  layout      : "horizontal" | "vertical" | "overlay" | "chart" | "info" | "infoChart" | "content";
  chart_type  : "xy" | "pie" | "line" | "bar" | "content" | "clustered";
  chart_data  : any;
  id          : any;
  title       : string;
  show_label  : boolean;
  info        ?: InfoCardConfig[];
  no_data     ?: INoDataFound;
}

export interface IDynamicComponent{
  component:  any;
  data : any;
}

export interface IProcessForm  {
  index:number;
  name:any;
  description:any;
  status:any;
  isWip:boolean;
  isComplete:boolean;
  isError:boolean;
  hasForm:boolean;

  fields ?: any[];
  component?:IDynamicComponent;
  err?:string;
}
