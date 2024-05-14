import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { User, UserPreferences } from '@eagna-io/core';
import { EditableComponent } from '@library/library.interface';
import { LibraryService } from '@library/service/library.service';
import { WrapperService } from '@library/service/wrapper.service';
import {MenuItem, TreeNode} from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';
import { SettingsService } from 'src/app/settings/settings.service';

import { SubSink } from 'subsink2';

@Component({
  selector: 'eg-org-chart',
  templateUrl: './org-chart.component.html',
  styleUrls: ['./org-chart.component.scss'],

})
export class OrgChartComponent implements OnInit, OnDestroy {
  @Input("config")    config    : EditableComponent;
  @Input("topic")     topic     : any;
  @Input("topicId")   topicId   : any;
  @Input("options")   options   : any =  "organization" || "dept_structure" || "teams" || "users";

  @Output("optionsChange")   optionsChange   = new EventEmitter();
  @Output("callback") callback  = new EventEmitter();

  @ViewChild("orgchartSidebar") sidebar : Sidebar;
  @ContentChild('formTemplate') formTemplateRef: TemplateRef<any>;

  public showDetails                    : boolean = false;

  public root         : any;
  public container    : any;
  public series       : any;
  public icon         : any;
  public data         : any = null;
  public items        : MenuItem[];
  public selectedNode : any;
  public isLoading    : boolean = true;

  private _subs = new SubSink();
  private _user         ?: User;

  constructor(private _settings:SettingsService, private _wr : WrapperService, private _cdr: ChangeDetectorRef){}

  ngOnInit(): void {


    this._user = <User>JSON.parse(localStorage.getItem('user') || '{}');

    this.orgChartType(this.config, this.options);

    this.items  = [
      {
        label:'Add',
        icon:'fa-solid fa-plus',
        command: (event?: any) => {
        }
      },
      {
        label:'View',
        icon:'fa-solid fa-eye',
        command: (event?: any) => {

        }
      },
      {
          label:'Edit',
          icon:'fa-solid fa-pencil',
          command: (event?: any) => {

          }
      },
      {
          label:'Delete',
          icon:'fa-solid fa-trash',
          command: (event?: any) => {

          }
      },
    ]
  }

  public reDo(){
    this.orgChartType(this.config, this.options);
  }
  public imageErr(event){
    this._wr.libraryService.noImageUrl(event);
  }

  public orgChartType(config, type){
    this._subs.sink = config.api$({[this.topic]: this.topicId}, "post").subscribe({
      next : (res) => {
        let temp  = res.content.results;
        this.data   = (type == 'users')? temp.map(_mapUsers): temp.map(_map);


      },
      error : (err) => {},
      complete : () => { this.isLoading = false;         this._cdr.detectChanges();}
    })


    let that = this;

    function _map(eachData){

      const name = that._wr.libraryService.findObjectInNested__data__(eachData, "name");
      const logo = that._wr.libraryService.findObjectInNested__data__(eachData, "logo");

      const template = {
        label: eachData['__data__']?.['name'] ,
        type: that.options,
        styleClass: (that.topicId == eachData['__data__']?.['id'])? 'active' : "",
        expanded: true,
        isTeams: eachData?.__data__?.hasOwnProperty?.("type") == true,
        data: {...eachData, curr_role:eachData?.hasOwnProperty('parent') ? 'members' : 'head'},
        /* curr_role: eachData?.hasOwnProperty('parent') ? 'members' : 'head', */
        children: eachData.children?.map(_map, that.options, 'child'),


      }
      return template
    }

    function _mapUsers(eachData){
      if(eachData){
        const user = that._wr.libraryService.findObjectInNested__data__(eachData, "member");
        const logo = that._wr.libraryService.findObjectInNested__data__(eachData, "logo");
        const picture = that._wr.libraryService.findObjectInNested__data__(eachData, "picture");

        let tempe = (user?.length > 0) ? user[0] : user;
        let image = (user?.length > 0) ? picture : logo;
        let rel_id = eachData.id

        let template;

        if(tempe){
          template = {

            id_user   : tempe['id'],
            type      : that.options,
            styleClass: (tempe['id'] == that._user.id)? 'active' : "",
            expanded: true,
            role      : "chief",
            isUser    : false,
            data: {...eachData['__data__'], selected_user : eachData['__data__']?.__data__?.user, rel_id},
            children: (eachData.children || []).map(_mapUsers, that.options).map(e => {

            var users = e?.data?.member || [];

              const temp_w = {
                id        : e?.id,
                id_team   : e?.data?.id,
                id_user   : e?.data?.__data__?.owner.id,
                type      : that.options,
                role      : "lead",
                expanded  : true,
                isUser    : false,
                styleClass: (e?.data?.__data__?.owner.id  == that._user.id) ?"active":"",
                data      : {...e?.data, selected_user : e?.data?.__data__?.owner, rel_id},

                children  : e?.children
              }
              e = temp_w;

              if(users.length > 0){
                let temp = {};

                users.forEach(element => {
                  if(e?.data?.owner != element.id && eachData.owner != element.id){
                    temp = {
                      id        : e?.id,
                      id_team   : e?.data?.id,
                      id_user   : element.id,
                      type      : that.options,
                      role      : "member",
                      expanded  : true,
                      isUser    : true,
                      data      : {...e?.data, selected_user : element, rel_id},
                      styleClass: (element.id == that._user.id) ?"active":""
                    }
                    e?.children.push(temp)
                  }
                });

              }

              return e
              //return temp;
            })
          }


        }
        return template
      }
      return eachData;
    }


  }



  public nodeSelected(event){

    this.selectedNode = event;
    this.showDetails = !this.showDetails
    this.config.callback({event, root :this.data[0].data})

    //this.config.callback(event.node, event);
  }




  ngOnDestroy(): void {
    /* this._subs.unsubscribe(); */
  }

}
