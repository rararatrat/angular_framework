import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { SideBarService } from '@eagna-io/core';
import { ComponentConfig } from '@library/library.interface';
import { MegaMenuItem, MenuItem } from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';
import { CrmService } from '../crm/crm.service';
@Component({
  selector: 'eg-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public isVisible  : boolean = false;
  public cc         : ComponentConfig = null;

  public data       : any = [];
  public list       : any = null;
  public virtualList: any = [];
  public search     : FormControl = new FormControl();

  public itemLoading  : boolean = false;
  public isDisabled   : boolean = false;
  public activeIndex  : number = null;
  public viewDetail   : boolean = false;

  public currContactMenu : {value: any, api:any, params:any; label: any};

  constructor( private _crm: CrmService, private _sidebar:SideBarService) { }

  ngOnInit(): void {
    this._sidebar.sidebar$.next({
      isVisible: false,
      items:[],
      mode:'compact',
      sidebarLoaderId:'eag-home'
    });


  }


}
