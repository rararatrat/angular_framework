import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MenuItems, apiMethod, SidebarComponent, Core, RouteObserverService } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, EditableComponent, FormStructure, IContainerWrapper, objArrayType } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { FilterService, MenuItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SettingsService } from '../../settings.service';
import { OrgChartComponent } from '@library/chart/org-chart/org-chart.component';
import { Structure, TypeApi, TypeOrgActions } from './structure.static';
import { SubSink } from 'subsink2';
import { Users } from 'src/app/users/users';
import { forkJoin, tap } from 'rxjs';

interface TreeNode {
  id?: number;
  parent: TreeNode | null;
  children: TreeNode[];
}
@Component({
  selector: 'eg-structure',
  templateUrl: './structure.component.html',
  styleUrls: ['./structure.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StructureComponent extends RouteObserverService implements OnInit, OnDestroy {

  private menuItems         !: MenuItems[];

  public isHome             : boolean = false;
  public isLoading          : boolean = true;
  public isContentLoading   : boolean = true;
  public isDisabled         : boolean = true;
  public orgId              : number = null;
  public detailsConfig      : DetailsConfig;
  public config             : DetailsContainerConfig  = null;
  public orgDetails         : DetailsContainerConfig  = null;

  public items              : MenuItem[];
  public data               : any;
  public activeIndex        : number = 3; //0
  public isChanged          : boolean;
  public breadcrumbs_title  : string = null;
  public api = (p?: any, method?: apiMethod, nextUrl?) => this._settings.org_organization(p, method);

  public gridListConfig     : IContainerWrapper;
  public type               : "list" | "grid" | "stats" = "grid";
  public title              : string =  "Manage Your Team";
  public gridListId         : any;

  public orgChart           : EditableComponent;
  public orgOptions         : any;


  public selectedNode       : any;
  public formArray          : objArrayType[]  = [];
  public _fbGroup           : objArrayType    = {
                                                  name:  {type: 'text', formControlName: 'name'},
                                                };

  public orgList            : {all:any, parent:any, child:any, avail_parent:any, avail_child:any} = {all:[], parent:[], child:[], avail_parent:[], avail_child:[]};
  public deptList           : {all:any, avail:any} = {all:[], avail:[]};

  private _subs             : SubSink = new SubSink();
  public current            : "org_hierarchy" | "org_structure" | "org_myusers";
  public detailsApi         : any = null;

  public userFrmProperties  : any = Users.getUserFormProperties();
  public usrDetailsConfig   : DetailsConfig;
  public usrConfig          : DetailsContainerConfig  = null;

  private _actions : "asdasd" | "adasd"


  @ViewChild('eagSideBar') eagSideBar: SidebarComponent | undefined;
  @ViewChild('orgChartComp')  orgChartComp : OrgChartComponent;

  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _router                 : Router,
              public fs                       : FilterService,
              private _settings               : SettingsService,
              private _cdr                    : ChangeDetectorRef,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() private _route      : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig,

              ) {
      super(_route, _router);
                  this._setIsHome();
  }

  onRouteReady(): void { }

  onRouteReloaded(): void { }

  ngOnInit(): void {
    this._initDetailsContainer();

  }

  private _setIsHome(){
    this.orgId = this._wr.libraryService.parseId(this.snapshotParams['orgId']);
  }

  private _initDetailsContainer(){
    let that = this;
    const header = Core.Localize("org_structure");
    this.data = this.dialogConfig?.data?.item;
    this.orgDetails = {
      hasHeader     : true,
      header        : this.title,
      subheader     : Core.Localize(this.title, {header}),
      showNavbar    : false,
      showDetailbar : false,
      dialogConfig    : this.dialogConfig,
      dialogRef       : this.ref,
    }

    this.config = {
      showNavbar      : true,
      hasHeader       : false,
      header          : header,
      subheader       : Core.Localize("dContainerSubHeader", {header}),
      dialogConfig    : this.dialogConfig,
      showDetailbar   : false,
      dialogRef       : this.ref,
/*         params          : {id:this.user.id},*/
      itemId          : this.orgId,
      detailsApi$     : (param, method, nextUrl)   => {
        return this.api(param, method, nextUrl);
      },

      sidebar       : {
        header,
        items  : [
          {
            label: Core.Localize('dept_type'),
            titleAbbr: 'DeptType',
            subTitle: Core.Localize("manage", {header, manage: Core.Localize('dept_type', {count: 2})}),
            icon: 'fa-solid fa-tags',
            selected: (this.activeIndex == 0) ? true : false,
            onClick : (item?, parentIndex?, event?) => {
              this.activeIndex = 0;
              this.title = Core.Localize("manage", {header, manage: Core.Localize('dept_type')}),
              this.gridListId = "settings_org_dept_type";

              this._initGrid(this.gridListId, 'org_deptteamtype');
              this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr:  this._cdr});
              this.detailsConfig.triggerChangeDetection();
            },

          },
          {
            label: Core.Localize('dept', {count: 2}),
            titleAbbr: 'Dept',
            subTitle: Core.Localize('manage_dept'),
            icon: 'fa-solid fa-building',
            selected: (this.activeIndex == 1) ? true : false,
            onClick: (item?, parentIndex?, event?) => {
              this.activeIndex = 1;
              this.title = Core.Localize("manage_dept", {header}),
              this.gridListId = "settings_org_dept";


              this._initGrid(this.gridListId, 'org_deptteams');
              this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr:  this._cdr});
              this.detailsConfig.triggerChangeDetection();
            },

          },
          {
            label: Core.Localize('org_hierarchy'),
            titleAbbr: 'orgh_h',
            subTitle: Core.Localize("manage_org_hierarchy"),
            icon: 'fa-solid fa-sitemap',
            selected: (this.activeIndex == 2) ? true : false,
            onClick: (item?, parentIndex?, event?) => {
              this.activeIndex = 2;
              this.title = Core.Localize("manage_org_hierarchy", {header}),
              this.orgDetails.header = this.title;
              this.orgOptions = "organization";


              this.config.formProperty = Structure.getOrgHierarchyFormProperties();
              this.current = "org_hierarchy";

              this._updateOrg(this.current);
              this._drawOrg('org_hierarchy');

            },
          },
          {
            label: Core.Localize('org_structure'),
            titleAbbr: 'org_s',
            subTitle: Core.Localize("manage_dept_structure"),
            icon: 'fa-solid fa-building-user',
            selected: (this.activeIndex == 3) ? true : false,
            onClick: (item?, parentIndex?, event?) => {
              this.activeIndex = 3;
              this.title = Core.Localize("manage_dept_structure", {header}),
              this.orgDetails.header = this.title;
              this.orgOptions = "dept_structure";

              this.config.formProperty = Structure.getOrgHierarchyFormProperties();
              this.current = "org_structure";

              this._updateOrg(this.current);

              this._drawOrg('org_structure')
            },
          },
          {
            label: Core.Localize('user_structure'),
            titleAbbr: 'user_s',
            subTitle: Core.Localize("manage_user_structure"),
            icon: 'fa-solid fa-users-between-lines',
            selected: (this.activeIndex == 4) ? true : false,

            onClick: (item?, parentIndex?, event?) => {
              that.activeIndex = 4;
              this.title = Core.Localize("manage_user_structure", {header});
              this.orgDetails.header = this.title;
              this.orgOptions = "users";
              this.detailsApi = "org_deptteams";
              this.current = "org_myusers";
              this.config.formProperty = Structure.getTeamsFormProperties();
              this._updateOrg(this.current);
              this._drawOrg('org_myusers');
            },
          },
        ]

      }
    }

    this.isLoading = false;
  }

  private _initGrid(gridListId, api){
    this.gridListConfig = {
      reloaded    : true,
      viewtype    : "grid",
      params      : {},
      apiService  : (p, m, n?) => this._settings[api](p, m, n),
      title       : this.title,
      noModalHeight: true,
      withDetailRoute: false,
      formProperties: {type:  {type: 'select', autoConfig: {extraKey: 'dept_type', title: 'name', saveField: 'id'}}}
    	}
  }


  public imageErr(event){
    this._wr.libraryService.noImageUrl(event)
  }


  private _drawOrg(api, data?:any){
    this.orgChart = {
      method  : "api",
      selNgModel:api,
      data: data,
      api$: (param?:any) => {
        return this._settings[api](param, "post", null, true)
      },

      callback :(data?:any, event?: Event) => {
        this.selectedNode = data.event;


        if(!this.selectedNode.hasOwnProperty('item_id')){
          this.selectedNode['item_id'] = data.event['id']
        }

        if(this.detailsApi != null){
          this.config.detailsApi$     = (param, method, nextUrl)   => {
            return this._settings[this.detailsApi]({...param, id:this.selectedNode.id}, method, null, false);
          };
        }

        this._updateOrg(api, 'set_distincts', this.selectedNode);

        this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr:  this._cdr});

        this.isLoading = false;
        this.detailsConfig.triggerChangeDetection();


      }
    }
    if(this.orgChartComp != undefined){
      this.orgChartComp.options = this.orgOptions;
    }

  }

  private _task_completed(){
    this.orgChartComp.reDo();
    this.isContentLoading = false;
    /* this.orgChartComp.showDetails = false; */
    this._cdr.detectChanges();
    this._subs.unsubscribe();
  }

  public updates(api, action?, data?){
    switch(api){
      case "org_hierarchy":
        this._subs.sink = this._updateOrg('org_hierarchy', action, data).subscribe(() => {
          this._task_completed();
        });
        break;

      case "org_structure":
        /* this.updateOrgStructure(action, data); */
        this._subs.sink = this._updateOrg('org_structure', action, data).subscribe(() => {
          this._task_completed();
        });
        break;

      case "org_myusers":
        this.updateUserOrgTeams(action, data);
      break;


    }
  }


  private _updateOrg(api:TypeApi, action?:TypeOrgActions, data?:any){
    let param : any = {};
    let retObs : any = null;
    switch(action){

      case 'add_child': /* works */
        param = {parent: this.selectedNode.item_id, child : data.id};
        if(api == "org_structure"){
          param['organization'] = this.orgId;
        }
        retObs = this._settings?.[api](param, "put", null, false);

        this.orgList.avail_child = this.orgList.avail_child.filter(ac => !(ac.id == data.id));
        break;

      case 'remove_child': /* works */

        param = { id: data.id};
        retObs = this._settings?.[api](param, "delete", null, false);

        this.orgList.child = this.orgList.child.filter(ac => !(ac.id == data.id));
        break;

      case 'add_parent': /* works */
        param         = {parent: data.id, child: this.selectedNode.item_id };
        const child   = { id:this.selectedNode.id, child: data.id};
        param         = {parent: data.id, child: this.selectedNode.item_id };
        if(api == "org_structure"){
          param['organization'] = this.orgId;
          child['organization'] = this.orgId;
        }
        retObs = forkJoin({
          add_parent: this._settings?.[api](param, "put", null, false),
          change_child: this._settings?.[api](child, "patch", null, false),
        })
        this.orgList.avail_parent = this.orgList.avail_parent.filter(ac => !(ac.id == data.id));
        break;

      case 'remove_parent': /* works */
        param = { id: data.id};
        retObs = this._settings?.[api](param, "delete", null, false);
        this.orgList.parent = this.orgList.parent.filter(ac => !(ac.id == data.id));
        break;

      case 'change_parent': /*  */
        param   = { id:this.selectedNode.id, parent: data.id}
        if(api == "org_structure"){
          param['organization'] = this.orgId;
        }
        retObs  = this._settings?.[api](param, "patch", null, false);
        break;

      case 'change_child':
        param = {parent: this.selectedNode.item_id, child : data.id};
        if(api == "org_structure"){
          param['organization'] = this.orgId;
        }
        retObs = this._settings?.[api](param, "put", null, false);
        break;

      case 'delete_node':
        param = {id : this.selectedNode.id};
        retObs = this._settings?.[api](param, "delete", null, false)
        break;

      case 'set_distincts':
        this._setDistinct(api, data);
        break;

      default:
        this._fetchOrgData(api);
        break;

    }
    return retObs;
  }

  private _setCustomDetailForm(api:TypeApi, data?:any){
    switch(api){
      case 'org_hierarchy':
        this.usrConfig = {
          hasHeader:false,
          header:"asdasd",
          itemId: data.item_id,
          detailsApi$: (param, method, nextUrl)   => {
            return this._settings.org_organization(param, method, nextUrl);
          },
          formProperty: Structure.getOrgFormProperties(),
        }
        this.usrDetailsConfig = new DetailsConfig({config: this.usrConfig, fb: this._fb, wr: this._wr, cdr:  this._cdr});
        this.usrDetailsConfig.triggerChangeDetection();

        break;
      case 'org_structure':
        this.usrConfig = {
          hasHeader:false,
          header:"asdasd",
          itemId: this.selectedNode.item_id,
          detailsApi$: (param, method, nextUrl)   => {
            return this._settings.org_deptteams(param, method, nextUrl);
          },
          formProperty: Structure.getTeamsFormProperties(),
        }
        this.usrDetailsConfig = new DetailsConfig({config: this.usrConfig, fb: this._fb, wr: this._wr, cdr:  this._cdr});
        this.usrDetailsConfig.triggerChangeDetection();

        break;
      case 'org_deptteams':
      case "org_myusers":
        this.usrConfig = {
          hasHeader:false,
          header:"asdasd",
          itemId: this.selectedNode.selected_user.id,
          detailsApi$: (param, method, nextUrl)   => {
            return this._settings.user_list(param, method, nextUrl);
          },
          formProperty: Structure.getUserTeamFormProperties(),
        }
        this.usrDetailsConfig = new DetailsConfig({config: this.usrConfig, fb: this._fb, wr: this._wr, cdr:  this._cdr});
        this.usrDetailsConfig.triggerChangeDetection();

        break;
    }

    setTimeout(e => {
      this.isContentLoading = this.usrDetailsConfig.isLoading;
      this.usrDetailsConfig.triggerChangeDetection();
    }, 300)

  }

  private _setDistinct(api:TypeApi, data:any){
    this._setCustomDetailForm(api, data);

    switch(api){
      case 'org_hierarchy':


        this.usrDetailsConfig = new DetailsConfig({config: this.usrConfig, fb: this._fb, wr: this._wr, cdr:  this._cdr});

        this._subs.id('orgList').sink = this._settings.org_hierarchy({limit:100}, "post", null, false).subscribe({
          next : (res) => {
            const _orgMatrix        = res.content.results;
            const incompatiblePairs = this._wr.libraryService.findIncompatiblePairs(res.content.results, data);
            const _cache = this.orgList.all;

            if(this.selectedNode.curr_role != "head"){
              const _parent = _orgMatrix.filter( f => {
                if(f.child.id == this.selectedNode.item_id){
                  return f;
                }
              });

              const _currParent = _parent.map(e => e.parent.id);

              this.orgList['avail_child'] = _cache.filter( f => !incompatiblePairs.child.includes(f.id));
              this.orgList['avail_parent'] = _cache.filter( f => !incompatiblePairs.parent.includes(f.id) && !_currParent.includes(f.id));
              this.orgList['child'] = data.children;

              this.orgList['parent'] = _parent.map(e => {
                return {
                  id: e.id,
                  item_id : e?.parent?.id || null,
                  name: e?.parent?.name || null,
                  __data__ : _cache.find(f => e.parent.id == f.id)
                }
              })
            }else{

              this.orgList['avail_child'] = _cache.filter(f => (f.id != this.selectedNode.id));
              this.orgList['child'] = data?.children || [];
            }


          },
          complete : () => {

            this._subs.id('orgList').unsubscribe();
            this.isContentLoading = false;
            this._cdr.detectChanges();
          }
        })
        break;
      case 'org_structure':
        const _set_param =  { limit:100,organization: this.orgId}

        this._subs.id('orgList').sink = this._settings.org_structure(_set_param, "post", null, false).subscribe({
          next : (res) => {
            const _orgMatrix        = res.content.results;
            const incompatiblePairs = this._wr.libraryService.findIncompatiblePairs(res.content.results, data);
            const _cache = this.orgList.all;
            if(this.selectedNode.curr_role != "head"){
              const _parent = _orgMatrix.filter( f => {
                if(f.child.id == this.selectedNode.item_id){
                  return f;
                }
              });

              const _currParent = _parent.map(e => e.parent.id);

              this.orgList['avail_child'] = _cache.filter( f => !incompatiblePairs.child.includes(f.id));
              this.orgList['avail_parent'] = _cache.filter( f => !incompatiblePairs.parent.includes(f.id) && !_currParent.includes(f.id));
              this.orgList['child'] = data.children;

              this.orgList['parent'] = _parent.map(e => {
                return {
                  id: e.id,
                  item_id : e.parent.id,
                  name: e.parent.name,
                  __data__ : _cache.find(f => e.parent.id == f.id)
                }
              })
            }else{
              this.orgList['avail_child'] = this.orgList.all.filter(f => (f.id != this.selectedNode.id));
              this.orgList['child'] = data?.children || [];
            }



          },
          complete : () => {
            this._subs.id('orgList').unsubscribe();
            this._task_completed();
          }
        })
        break;
      case 'org_deptteams':
      case "org_myusers":

        break;

    }

  }

  private _fetchOrgData(api:TypeApi){
    if(api == "org_hierarchy"){
      this._subs.id('orgList').sink = this._settings.org_organization({limit:100}).subscribe({
        next : (res) => {
          this.orgList.all = res.content.results;
        },
        complete : () => {
          this._subs.id('orgList').unsubscribe();
          this.isContentLoading = false;
          this._cdr.detectChanges();
        }
      })
    }else{
      this._subs.id('orgList').sink = this._settings.org_deptteams({limit:100, organization:this.orgId}).subscribe({
        next : (res) => {
          this.deptList.all = res.content.results;
          this.orgList.all  = res.content.results;
        },
        complete : () => {
          this._subs.id('orgList').unsubscribe();
        }
      })
    }
  }


  public updateUserOrgTeams(action?:any, data?:any){
    this.isContentLoading = true;
    switch(action){
      case 'changeTeam':
        const _user = this.selectedNode?.selected_user?.id;
        let new_teams = [];

        this._subs.id('new_team').sink = this._settings.org_deptteams({id:data.id }, "post", null).subscribe({
          next : (res) => {

            new_teams = res.content.results.map(e =>{
              return e.member.map(m => m.id)
            })[0];
          },
          complete : () => {
            new_teams.push(_user)
            const _chg_param = {
              id: data.id,
              member :new_teams
            }
            this._subs.id('chg_team').sink = this._settings.org_deptteams(_chg_param, "patch", null).subscribe({
              complete : () => {
                this.updateUserOrgTeams('remove_frm_team')
                this._subs.id('chg_team').unsubscribe();
                this._subs.id('new_team').unsubscribe();
                this.isContentLoading = false;
              }
            });
          }
        });

        break;
      case "remove_frm_team":
        const _userCur = this.selectedNode?.selected_user?.id;
        let old_teams = this.selectedNode?.member.map(m => m.id);
        old_teams     = old_teams.filter(e => e != _userCur);

        const _del_param = {
          id: this.selectedNode?.id,
          member :old_teams
        }

        this._subs.id('del_old_team').sink = this._settings.org_deptteams(_del_param, "patch", null).subscribe({
          complete : () => {
            this._subs.id('del_old_team').unsubscribe();
            this._task_completed();
          }
        });
        break;


    }
  }



  override ngOnDestroy(): void {
  }
}
