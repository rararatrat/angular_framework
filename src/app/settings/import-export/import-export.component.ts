import { Component, OnDestroy, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Core, MenuItems, RouteObserverService, apiMethod } from '@eagna-io/core';
import { WrapperService } from '@library/service/wrapper.service';
import { ActivatedRoute, Router } from '@angular/router';

import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig } from '@library/library.interface';
import { MenuItem } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { SettingsService } from '../settings.service';

@Component({
  selector: 'eg-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.scss']
})
export class ImportExportComponent extends RouteObserverService implements OnInit, OnDestroy {

  private menuItems         !: MenuItems[];
  public isHome             : boolean = false;
  public isLoading          : boolean = true;
  public detailsConfig      : DetailsConfig;
  public config             : DetailsContainerConfig  = null;
  public items              : MenuItem[];
  public data               : any;
  public activeIndex        : number = 0;
  public isChanged          : boolean;

  public products : any = [];


  public api = (p?: any, method?: apiMethod, nextUrl?) => this._settings.crm_payment(p, method);


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
    }

    private _initDetailsContainer(){
      let that = this;
      const header = Core.Localize("import_export");
      console.log(this.dialogConfig?.data)
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
        /* formProperty    : {
          includedFields  : profileFormProperty['includedFields'],
          formProperties  : profileFormProperty['formProperties']
        }, */
        sidebar       : {
          header,
          items  : [
            {
              label:"Import Export Queue",
              icon: "fa-solid fa-bullseye",
              subTitle: "Check the Status of Your Imports & Exports",
              selected: (this.activeIndex == 0) ? true : false,
              onClick : (event) => {
                this.activeIndex = 0;
              },
            },
            {
              label:"Schedule",
              icon: "fa-solid fa-bullseye",
              subTitle: "Schedule Import & Export",
              selected: (this.activeIndex == 1) ? true : false,
              onClick : (event) => {
                this.activeIndex = 1;


              },
            }
          ]

        }
      }
      this._initProducts();
      this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr});
      this.isLoading = false;
    }

  public _initProducts(){
    this.products = [
      {
        id: '1000',
        code: 'f230fh0g3',
        name: 'Bamboo Watch',
        description: 'Product Description',
        image: 'bamboo-watch.jpg',
        price: 65,
        category: 'Accessories',
        quantity: 24,
        inventoryStatus: 'INSTOCK',
        rating: 5
    },
    {
        id: '1001',
        code: 'nvklal433',
        name: 'Black Watch',
        description: 'Product Description',
        image: 'black-watch.jpg',
        price: 72,
        category: 'Accessories',
        quantity: 61,
        inventoryStatus: 'OUTOFSTOCK',
        rating: 4
    },
    ]
  }

  override ngOnDestroy(): void {

  }
}
