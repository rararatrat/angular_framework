import { AfterViewInit, ChangeDetectorRef, Component, Input, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { Core, GridResponse, MESSAGE_SEVERITY, ResponseObj, RouteObserverService } from '@eagna-io/core';
import { MenuItem, MessageService, PrimeIcons } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CrmService } from '../../crm.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ContainerConfig, DetailsContainerConfig, IContainerWrapper, IStatsChart, InfoCardConfigArray, objArrayType } from '@library/library.interface';
import { forkJoin, map, tap } from 'rxjs';
import { WrapperService } from '@library/service/wrapper.service';
import { DetailsConfig } from '@library/class/details-config';
import { FormBuilder } from '@angular/forms';
import { Project } from '../project.static';

@Component({
  selector: 'eg-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss'],

})
export class ProjectDetailComponent extends RouteObserverService implements OnInit, AfterViewInit {
  @Input('data') data                 : any = null;
  @Input('display') display           : "full" | "meta" | "basic" | "dogtag" = "full";
  @Input('currentType') currentType   : "dialog" | "component" | "route";

  @ViewChild('egSubItem') egSubItem   : any;

  public container          : ContainerConfig = null;
  public config             : DetailsContainerConfig = null;
  public detailsConfig      : DetailsConfig;
  protected isConfiguring   : boolean = true;
  public items              : MenuItem[];

  public navbar             : boolean = false;
  public navMenu            : any = [];
  public activeIndex        : number = 2;

  public gant_data          : object[];
  /* public ganttChartSettings : GantChartSettings = {}; */
  public isLoading          : boolean = true;

  public taskType           : any
  public projectId          : number = 1;
  public isChanged          : boolean = false;

  public visual             : InfoCardConfigArray = { config: [] };
  public project            : InfoCardConfigArray = { config: [] };
  public update             : any;
  public chartData          : any = {
    status: null,
    type: null,
    creator: null,
    resource: null,
    priority:null,
    project: null
  };

  public details            : any = { project         : null,
                                      files           : null,
                                      company         : null,
                                      contact_partner : null
                                    };

  public action             : MenuItem[];
  public permission         : any;
  public dataType           : string;
  public params             : any;

  public statistics         : IStatsChart[];
  private _hasChecked       : boolean = false;
  public relatedDocs        : any[];

  constructor(private _crmService             : CrmService,
              private _wr                     : WrapperService,
              private _router                 : Router,
              private _fb                     : FormBuilder,
              private _cd                     : ChangeDetectorRef,
              private _messageService         : MessageService,
              private _route                  : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig,
              @Optional() public dialogRef    : DynamicDialogRef
              ) {
    super(_route, _router);
  }

  onRouteReady(event, snapshot, root, params): void{

  }
  onRouteReloaded(event, snapshot, root, params): void{
    this._initDetailsContainer();
  }

  public triggerChangeDetection() {
    this._cd.markForCheck(); // Marks the component and its ancestors as dirty
    this._cd.detectChanges(); // Triggers change detection for the component and its descendants
  }
  ngOnInit(): void {
    this.snapshotLoaded = true;
    this.dataType = this._wr.libraryService.getRenderedType(this.dialogConfig, this.data);
    this.display = (this.dataType == "dialog") ? "full" : this.display;
    this._initDetailsContainer();
    this._initRelatedDocs();
  }

  private _initRelatedDocs(){
    const _fork$ = {
      quotes: this._crmService.sales_quotes({project: this.projectId, limit: 1000}, "post"),
      /* invoices: this._crm.sales_invoices({quote: this.itemId, limit: 1000}, "post"), */
    }

    this.subscription.add(forkJoin(_fork$).subscribe({
      next : ({quotes/* , invoices */}) => {
        if(!this._wr.libraryService.checkGridEmptyFirstResult(quotes)){
          this.relatedDocs = (quotes?.content?.results || []).map(_o => ({..._o, type: 'quotes'}));
        }
       /*  if(!this._wr.libraryService.checkGridEmptyFirstResult(invoices)){
          this.relatedDocs = this.relatedDocs.concat((invoices?.content?.results || []).map(_o => ({..._o, type: 'invoices'})));
        } */
        if(!this.relatedDocs){
          this.relatedDocs = [];
        }
      }
    }));
  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  private _addNewItem(p: IContainerWrapper, mode: "view" | "add" | "edit" | "delete" = "add", ){
    //const subApi = api$(param, method, nextUrl);
    this.subscription.add((p.apiService({}, 'post').subscribe((res: ResponseObj<GridResponse>) => {
      const iContainerWrapper: IContainerWrapper = {
        apiService: p.apiService,
        permission: res.content?.permission,
        gridFields: res.content?.fields,
        title: p.title,
        params: (p.params || {}),
        noModalHeight: p.noModalHeight == true,
        addCallback: (p2) => {
          if(p2?.isConfirmed){
            this.egSubItem?.gridList?.grid?.refresh();
            //if(this.egTask?.taskGridList?.grid?.isChanged()){TODO}
          }
        },
        ...(p.formProperties ? {formProperties: p.formProperties} : {}),
        ...(p.formStructure ? {formStructure: p.formStructure} : {}),
        ...(p.detailComponent ? {detailComponent: p.detailComponent} : {}),
      };
      this._wr.containerService.dialogAction(mode, iContainerWrapper);
    })));
  }

  private _initDetailsContainer(){
    if(this.activeIndex == 0){
      this._initProject();
    }

    const header = Core.Localize("project_menu");
    this.projectId = this.dataType == 'dialog' ? this.dialogConfig?.data?.item.id : (this.dataType == 'route' ? this._route?.snapshot?.params?.['id'] : (this.data?.id || 1));
    this.data = this.dialogConfig?.data?.item;

    const _fTaskProps = Project.getTaskFormProperties();
    const _fActivityTaskProps = Project.getActivitiesProperties();

    const _getActionItems = (_data?) => {
      const _currData = _data || this.detailsConfig?.data;
      const _toReturn: MenuItem[] = [
        {
          label: Core.Localize('add_new', {item: Core.Localize('task')}),
          icon: "fa-solid fa-list-check",
          styleClass : "text-lg",
          visible: this.activeIndex != 2,
          command: (event) => {
            this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_tasks(p, m, n), title: Core.Localize('task'), params: {project: this.projectId}, formProperties: _fTaskProps.formProperties, formStructure: _fTaskProps.formStructure})
          },

        },
        {
          label: Core.Localize('track_time'),
          icon: "fa-solid fa-business-time",
          styleClass : "text-lg",
          visible: this.activeIndex != 3,
          command: (event) => {
            this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_time_tracking(p, m, n), title: Core.Localize('time_tracking'), params: {project: this.projectId}, formProperties: Project.getTeamProperties(), noModalHeight: true})
          },
        },
        {
          label: Core.Localize('duplicate', {item: Core.Localize('project')}),
          icon: PrimeIcons.COPY,
          styleClass : "text-lg",
          command: (event) => {
            this._wr.confirmationService.confirm({
              message: `
                <div class="mt-3 fs-14"> ${Core.Localize("confirmDuplicateMessage", {keyword: Core.Localize('project')})}</div>
                `,
              header: Core.Localize('duplicationConfirmationHeader'),
              icon: 'pi pi-info-circle',
              acceptLabel: Core.Localize('yes'),
              rejectLabel: Core.Localize('no'),
              accept: () => {
                if(_currData){
                  delete _currData.id;
                  delete _currData.__data__;
                  this.subscription.add(this.config.detailsApi$({..._currData, status: 1}, 'put').subscribe(result => { //code 204
                      this._messageService.add({detail: Core.Localize("stateSuccessfully", {state: Core.Localize('statusDuplicated')}) , severity: MESSAGE_SEVERITY.SUCCESS}); //Successfully deleted.
                      this.isChanged = true;

                      if(this.dataType == 'dialog'){
                        this.dialogRef?.close(result);
                      } else if(this.dataType == 'route'){
                        this._wr.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._route, queryParams: {onRefresh: true}, state: {onRefresh: true}}});
                      }
                  }));
                } else{
                  this._messageService.add({detail: Core.Localize("somethingWentWrong"), summary: Core.Localize('noDataFound') + ' ' + Core.Localize('pleaseNotifyAdmin'), severity: MESSAGE_SEVERITY.WARN});
                }
              }
            });
          },
        },
        {
          label:"Close Project",
          icon: PrimeIcons.TIMES,
          styleClass : "text-lg",
          visible: (_currData?.status == 2),
          command: (event) => {
            this._wr.confirmationService.confirm({
              message: `
                <div class="mt-3 fs-14"> ${Core.Localize("confirmClose", {keyword: Core.Localize('project')})}</div>
                `,
              header: Core.Localize('closeConfirmationHeader'),
              icon: 'pi pi-info-circle',
              acceptLabel: Core.Localize('yes'),
              rejectLabel: Core.Localize('no'),
              accept: () => {
                if(_currData){
                  /* delete _currData.id; */
                  delete _currData.__data__;
                  this.subscription.add(this.config.detailsApi$({..._currData, status: 3},'patch').subscribe(result => { //code 204
                    this._messageService.add({detail: Core.Localize("stateSuccessfully", {state: Core.Localize('statusClosed')}) , severity: MESSAGE_SEVERITY.SUCCESS});
                      this.isChanged = true;
                      if(this.dataType == 'dialog'){
                        //this.dialogRef?.close(result);
                      } else if(this.dataType == 'route'){
                        this._wr.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._route, queryParams: {onRefresh: true}, state: {onRefresh: true}}});
                      }
                  }));
                } else{
                  this._messageService.add({detail: Core.Localize("somethingWentWrong"), summary: Core.Localize('noDataFound') + ' ' + Core.Localize('pleaseNotifyAdmin'), severity: MESSAGE_SEVERITY.WARN});
                }
              }
            });
          },
        },
      ];
      return _toReturn;
    }

    const pf = Project.getProjectFormProperties();

    this.config = {
      detailBarExpanded: true,
      showNavbar    : true,
      /* navbarExpanded : true, */
      hasHeader     : true,
      header        : this.dialogConfig?.data?.item.name,
      subheader     : Core.Localize("dContainerSubHeader", {header}),
      sidebar       : {
        header,
        items  : [
          {
            label: Core.Localize("milestone", {count: 2}),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize("milestone_desc"),
            selected: (this.activeIndex == 0),
            onClick : (event) => {
              this.config.params = {
                project               : this.projectId,
                type__name__icontains : "milestone"
              }
              this.taskType = "milestone";
              this.config.actionItems = _getActionItems();
              this.detailsConfig?.triggerChangeDetection();
            },
            items: [
              {
                label: Core.Localize('add_new', {item: Core.Localize('milestone')}),
                icon: "fa-solid fa-bullseye",
                styleClass : "text-lg",
                command: (p) => {
                  //this._addNewItem((p?, m?, n?) => this._crmService.project_tasks(p, m, n), Core.Localize('milestone'), {project: this.projectId}, _fProps.formProperties);
                  this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_tasks(p, m, n), title: Core.Localize('milestone'), params: {project: this.projectId}, formProperties: _fTaskProps.formProperties, formStructure: _fTaskProps.formStructure});
                }
              },
            ],
          },
          {
            label: Core.Localize("workpackage", {count: 2}),
            icon: "fa-solid fa-briefcase",
            subTitle: Core.Localize("workpackage_desc"),
            selected: (this.activeIndex == 1),
            onClick : (event) => {
              this._wr.containerService.hasSetConfigInitialised = false;
              this.config.params = {
                project               : this.projectId,
                type__name__icontains : "work package"
              }
              this.taskType = "work package";
              /* this.config = {...this.config, actionItems: _getActionItems()}; */
              this.config.actionItems = _getActionItems();
              this.detailsConfig?.triggerChangeDetection();
            },
            items   : [
              {
                label: Core.Localize('add_new', {item: Core.Localize('workpackage')}),
                icon: "fa-solid fa-briefcase",
                styleClass : "text-lg",
                command: (p) => {
                  //this._addNewItem((p?, m?, n?) => this._crmService.project_tasks(p, m, n), Core.Localize('workpackage'), {project: this.projectId}, _fProps.formProperties)
                  this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_tasks(p, m, n), title: Core.Localize('workpackage'), params: {project: this.projectId}, formProperties: _fTaskProps.formProperties, formStructure: _fTaskProps.formStructure})
                }
              },

            ],
          },
          {
            label: Core.Localize("task", {count: 2}),
            icon: "fa-solid fa-list-check",
            subTitle: Core.Localize("task_desc"),
            selected: (this.activeIndex == 2),
            onClick: (event) => {
              this.config.params = {
                project               : this.projectId,
                type__name__icontains : "task"
              }
              this.config.actionItems = _getActionItems();
              this.detailsConfig?.triggerChangeDetection();
            },
            items: [
              {
                label: Core.Localize('add_new', {item: Core.Localize('task')}),
                icon: "fa-solid fa-list-check",
                styleClass : "text-lg",
                command: (p) => {
                  //this._addNewItem((p?, m?, n?) => this._crmService.project_tasks(p, m, n), Core.Localize('task'), {project: this.projectId}, _fProps.formProperties)
                  this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_tasks(p, m, n), title: Core.Localize('task'), params: {project: this.projectId}, formProperties: _fTaskProps.formProperties, formStructure: _fTaskProps.formStructure})
                }
              },
            ]
          },
          {
            label: Core.Localize("time_tracking"),
            icon: "fa-solid fa-business-time",
            subTitle: Core.Localize("time_tracking_desc"),
            selected: (this.activeIndex == 3),
            onClick : (event) => {
              this._wr.containerService.hasSetConfigInitialised = false;
              this.config.actionItems = _getActionItems();
              this.detailsConfig?.triggerChangeDetection();
            },
            items   : [
              {
                label: Core.Localize('add_new', {item: Core.Localize('time_tracking')}),
                icon: "fa-solid fa-business-time",
                styleClass : "text-lg",
                command: (p) => {
                  //this._addNewItem((p?, m?, n?) => this._crmService.project_time_tracking(p, m, n), Core.Localize('time_tracking'), {project: this.projectId}, Project.getTeamProperties() /* TODO */)
                  this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_time_tracking(p, m, n), title: Core.Localize('time_tracking'), params: {project: this.projectId}, formProperties: Project.getTeamProperties(), noModalHeight: true})
                }
              },
            ],
          },
          {
            label: Core.Localize("team"),
            icon: "fa-solid fa-people-group",
            subTitle: Core.Localize("team_desc"),
            selected: (this.activeIndex == 4),
            onClick : (event) => {
              this.config.params = {
                project               : this.projectId,
              }
              this._wr.containerService.hasSetConfigInitialised = false;
              this.config.actionItems = _getActionItems();
              this.detailsConfig?.triggerChangeDetection();
            },
            items   : [
              {
                label: Core.Localize('add_new', {item: Core.Localize('team')}),
                icon: "fa-solid fa-people-group",
                styleClass : "text-lg",
                command: (p) => {
                  //this._addNewItem((p?, m?, n?) => this._crmService.project_team(p, m, n), Core.Localize('team'), {project: this.projectId}, Project.getTeamProperties())
                  this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_team(p, m, n), title: Core.Localize('team'), params: {project: this.projectId}, formProperties: Project.getTeamProperties(), noModalHeight: true})
                }
              },
            ],
          },
          {
            label: Core.Localize("activity", {count: 2}),
            icon: "fa-solid fa-timeline",
            subTitle: Core.Localize("activities_desc"),
            selected: (this.activeIndex == 5),
            onClick : (event) => {
              this.config.params = {
                project               : this.projectId,
              };
              this.config.actionItems = _getActionItems();
              this.detailsConfig?.triggerChangeDetection();
            },
            items   : [
              {
                label: Core.Localize('add_new', {item: Core.Localize('activity')}),
                icon: "fa-solid fa-timeline",
                styleClass : "text-lg",
                command: (p) => {
                  //this._addNewItem((p?, m?, n?) => this._crmService.project_activities(p, m, n), Core.Localize('activity'), {project: this.projectId}, Project.getActivitiesProperties())
                  this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_activities(p, m, n), title: Core.Localize('activity'), params: {project: this.projectId}, formProperties: _fActivityTaskProps.formProperties, formStructure: _fActivityTaskProps.formStructure})
                }
              },
            ],
          },
          {
            label: Core.Localize("condition", {count: 2}),
            icon: "fa-solid fa-star-of-life",
            subTitle: Core.Localize("conditions_desc"),
            selected: (this.activeIndex == 6),
            onClick : (event) => {
              this.config.params = {
                project               : this.projectId,
              };
              this.config.actionItems = _getActionItems();
              this.detailsConfig?.triggerChangeDetection();
            },
            items : [
              {
                label: Core.Localize('add_new', {item: Core.Localize('condition')}),
                icon: "fa-solid fa-star-of-life",
                command: (p) => {
                  //this._addNewItem((p?, m?, n?) => this._crmService.project_condition(p, m, n), Core.Localize('condition'), {project: this.projectId}, Project.getTeamProperties())
                  this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_condition(p, m, n), title: Core.Localize('condition'), params: {project: this.projectId}, formProperties: Project.getTeamProperties(), noModalHeight: true})
                }
              },
            ]
          },
          /* {
            label:"Expenses",
            icon: "fa-solid fa-money-bill-transfer",
            subTitle: "Set Your Organization Expenses",
            selected: (this.activeIndex == 7) ? true : false,
            onClick : (event) => {
              this.config.params = {
                project               : this.projectId,
              };
              this.activeIndex = 7;
            },
            items : [
              {
                label: Core.Localize('add_new', {item: Core.Localize('expenses')}),
                icon: "fa-solid fa-money-bill-transfer",
                command: (p) => {
                  this._addNewItem({apiService: (p?, m?, n?) => this._crmService.project_expense(p, m, n), title: Core.Localize('expenses'), params: {project: this.projectId}, formProperties: Project.getTeamProperties(), noModalHeight: true});
                }
              },
            ]
          }, */
          /* {
            label:"Gantt Chart",
            icon: "fa-solid fa-bar-chart",
            subTitle: "Gant Chart",
            selected: (this.activeIndex == 7) ? true : false,
            onClick : (event) => {
              this.activeIndex = 7;
            }
          }, */
          
          {
            label: Core.Localize("flow"),
            icon: "fa-solid fa-microchip",
            subTitle: Core.Localize("flow_desc"),
            selected: (this.activeIndex == 7),
            onClick : (event) => {
              this.config.params = {
                project               : this.projectId,
              };              
            }
          }
        ]
      },
      itemId        : this.projectId,
      params        : ['project'],
      detailsApi$    : (param, method, nextUrl)   => {
        return this._crmService.project_list(param, method, nextUrl).pipe(tap(res => {
          this.detailsConfig.config.actionItems = _getActionItems(res.content?.results?.[0]);
        }))
      },
      hasUpdates    : true,
      updateApi$    : (param, method, nextUrl)   => {
        return this._crmService.project_updates(param, method, nextUrl)
      },
      hasComments   : true,
      commentsApi$  : (param, method, nextUrl)   => {
        return this._crmService.project_comments(param, method, nextUrl)
      },
      hasLogs       : true,
      logsApi$      : (param, method, nextUrl)   => {
        return this._crmService.project_logs(param, method, nextUrl)
      },
      actionItems : [],
      formProperty: {
        formProperties: pf.formProperties,
        formStructure: pf.formStructure
      }
    }

    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr : this._cd });
    this.isConfiguring = false;
  }


  private _initProject(){

    const team$     = this._crmService.project_team({project:this.projectId});
    const project$  = this._crmService.project_list({id:this.projectId});
    const task$     = this._crmService.project_tasks({id:this.projectId, limit:1}).pipe(map(e => {
      var flattened =(e.content.aggs).reduce((acc, obj) => {
        const [key, value] = Object.entries(obj)[0];
        return { ...acc, [key]: value };
      }, {});
      return flattened
    }));

    this.subscription.add(forkJoin({
      team    : team$,
      project : project$,
      task    : task$
      }).subscribe( {
        next : ({team, project, task}) => {
          const details          = project.content.results[0];
          const company          = details['__data__']['company'];
          const contact_partner  = details['__data__']['contact_partner'];
          //this.data              = details;

          this.chartData.status     = reduceRender(task.status, "status__name", "count");
          this.chartData.type       = reduceRender(task.type, "type__name", "count");
          this.chartData.priority   = reduceRender(task.priority, "priority__name", "count");
          this.chartData.resource   = reduceRender(task.resources, "resources__first_name", "count");
          this.chartData.creator    = reduceRender(task.creator, "creator__first_name", "count");
          this.chartData.project    = reduceRender(task.project, "project__name", "count");

          this.project.config   = [ {
                                      illustrationType : null,
                                      illustration : {
                                        icon : {class: 'fa-solid fa-home text-primary-faded', name:"home"}
                                      },
                                      topic: "Project",
                                      value: details.name,
                                      subTopic: details.description
                                    },
                                    {
                                      illustrationType : "image",
                                      illustration : {
                                        image : {url: company.logo, name:company.name, class:"w-4rem h-4rem"}
                                      },
                                      topic: "Company / Customer",
                                      value: company.name,
                                      subTopic: company.email
                                    },
                                    {
                                      illustrationType : "image",
                                      illustration : {
                                        image : {url: contact_partner.picture, name:contact_partner.first_name, class:"w-4rem h-4rem"}
                                      },
                                      topic: "Contact Partner",
                                      value: contact_partner.first_name + " " + contact_partner.last_name,
                                      subTopic: contact_partner.email
                                    }
                                  ];

          let tempVisual = [];
          this.chartData.status.forEach(element => {
            tempVisual.push({
              illustrationType : "icon",
              illustration : {
                icon : {class: 'fa-solid fa-home text-primary-faded', name:"home"}
              },
              topic: element.category,
              value: element.value
            })
          })


          this.visual.config    = [];
          this.visual.config = this.visual.config.concat(tempVisual);

          this.details          = {
                                    team            : team.content.results,
                                    project         : details,
                                    files           : details['__data__']['files'],
                                    company         : company,
                                    contact_partner : contact_partner
                                  }
        },
        complete :() => {

        }
      }
    ));

    const reduceRender = (data, category, value, keyvaluepair?) => {
      return data.map((obj) => {
        if(keyvaluepair == null){
          return {
            category: obj[category] ?? 'Unknown', // Use "Unknown" if status__name is null or undefined
            value: obj[value]
          };
        }else{
          return {
            [obj[category]]: obj[value]
          };
        }
      })
    }
  }

  public onImageErr(event){
    this._wr.libraryService.noImageUrl(event);
  }

  ngAfterViewInit(): void {
    this.detailsConfig?.triggerChangeDetection();
  }

  afterSaved($event: boolean) {}

  private _setChartConfig(chart_data, info_data){
    /* Just an Example needs to change on when configuring */
    this.statistics = [
      {
        layout      : 'chart',
        chart_type :'xy',
        chart_data : chart_data['invoices__name'],
        title      : 'Invoices Details' ,
        id         : `invoices__name_${this._wr.libraryService.makeid(3)}`,
        show_label : false,
        no_data     : {
                        action      : 'Add',
                        hasCallback : true,
                        callback    : (p) => {},
                        api: (rawValue: any) => {
                          return this._crmService.sales_invoices(rawValue);
                        },
                        params      : {company : this.detailsConfig.data},
                        //formProp    : Contacts.getBankAccountFormProperties()['formProperties'],
                        //formStruc   : Contacts.getBankAccountFormProperties()['formStructure'],
                        icon        : "fa-solid fa-euro",
                        message     : "No Invoices Details Found",
                        topic       : "Invoices"
                      }
      }
    ];
  }

  ngAfterViewChecked(){
    if(this.detailsConfig.isLoading == false && this.detailsConfig?.data && !this._hasChecked){
      const stats_data = this._wr.libraryService.renderStatsDataForCharts(this.detailsConfig.aggs);
      this._setChartConfig(stats_data['chart'], stats_data['info']);
      this._hasChecked = true
    }
  }
}
