import { Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { RouteObserverService, MenuItems, apiMethod, Core } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SettingsService } from 'src/app/settings/settings.service';
import { ProcessStatic } from '../../process.static';

@Component({
  selector: 'eg-flow-detail',
  templateUrl: './flow-detail.component.html',
  styleUrls: ['./flow-detail.component.scss']
})
export class FlowDetailComponent extends RouteObserverService implements OnInit, OnDestroy {

  private menuItems         !: MenuItems[];
  public isHome             : boolean = false;
  public isLoading          : boolean = true;
  public detailsConfig      : DetailsConfig;
  public config             : DetailsContainerConfig  = null;
  public items              : MenuItem[];
  public data               : any;
  public activeIndex        : number = 0;
  public isChanged          : boolean;

  public api = (p?: any, method?: apiMethod, nextUrl?) => this._settings.process_name(p, method);
  public form               : any = ProcessStatic.getProcessFormProperties(this);
  public mode               : "edit" | "add" | "view" = "add";
  public files              : { [file_name: string]: File[]; } = {};
  public processFs            : any[] = [];
  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _router                 : Router,
              private _settings               : SettingsService,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() private _route      : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig
            ) {
                super(_route, _router);

              }

    onRouteReady(): void {}
    onRouteReloaded(): void {}

    ngOnInit(): void {
      this._initDetailsContainer();
      this.processFs  = this._getFromStructure(['Main']);
    }

    private _initDetailsContainer(){
      let that = this;
      const header = Core.Localize("document_template_settings");

      this.data = this.dialogConfig?.data?.item;

      this.config = {
        showNavbar      : true,
        hasHeader       : false,
        header          : header,
        subheader       : Core.Localize("dContainerSubHeader", {header}),
        dialogConfig    : this.dialogConfig,
        showDetailbar   : false,
        dialogRef       : this.ref,
/*         params          : {id:this.user.id},
        itemId          : this.user.id, */
        detailsApi$     : (param, method, nextUrl)   => {
          return this.api(param, method, nextUrl);
        },
        formProperty    : {
          formProperties  : this.form['formProperties']
        },
        sidebar       : {
          header,
          items  : [
            {
              label:"Quotes",
              icon: "fa-solid fa-bullseye",
              subTitle: "Add Process Steps",
              selected: (this.activeIndex == 0) ? true : false,
              onClick : (event) => {
                this.activeIndex = 0;
              },
            },
          ]

        }
      }
      this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr});
      this.isLoading = false;
    }

  afterSaved(isChanged){}
  
  public toggle(index){
    this.form['formStructure'][index]['collapsed'] = !this.form['formStructure'][index]['collapsed'];
  }
  private _getFromStructure(section){
    return this.form['formStructure'].filter(e =>
      {
        return section.includes(e.header)
      }
    ).map((item) => ({ ...item, id: this.form['formStructure'].indexOf(item) }));
  }

  override ngOnDestroy(): void {

  }
}
