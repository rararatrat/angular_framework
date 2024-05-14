import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ComponentConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';


import { SubSink } from 'subsink2';
import { environment as env } from 'src/environment/environment'
import { PrimeNGConfig, LazyLoadEvent } from 'primeng/api';
import { VirtualScroller } from 'primeng/virtualscroller';
import { map } from 'rxjs';
import { ProfileService } from 'src/app/profile/profile.service';

@Component({
  selector: 'eg-lib-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {
  @ViewChild('vs') vs                       : VirtualScroller;
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
  public imgHostUrl   : any = env.apiUrl+"media/";

  public currNotifMenu : {value: any, api:any, params:any; label: any};

  constructor(private _profile:ProfileService, private _ws : WrapperService, private _cdr: ChangeDetectorRef) {

  }



  public notifications = [];
  private _subs = new SubSink();

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  ngOnInit(): void {
    this._initComponent();
  }

  private _initComponent(){
    this.cc = {
      header        : {show: true, name: "Contact User List"},
      subHeader     : {show: true, name: "List of Contacts"},
      data          : this.data,
      currentType   : "component",
      subs          : new SubSink(),
      isLoading     : true,
      permission    : {
                        create  : false,
                        read    : true,
                        delete  : false,
                        update  : false,
                        role    : "user"
                      }
    }

    this.currNotifMenu = {
      api:"notification_list",
      params:{limit:100,sort:[{colId: 'id', sort: 'desc'}]},
      value:"notification_list",
      label: "Notification"
    };

    this._fetchData(this.currNotifMenu.api, null, this.currNotifMenu.params)

    this._initSearch();
    this._initLiveUpdates();
  }

  public imageErr(event){
    this._ws.libraryService.noImageUrl(event);
  }

  private _initLiveUpdates(){
    this._subs.sink = this._ws.communicationService.notification$.subscribe(res => {
      console.log({res});
      if(!this._ws.libraryService.checkGridEmptyFirstResult(res)){
        let parsed = JSON.parse(res)
        const newImgUrl = this.imgHostUrl+parsed.notif_user_triggered.picture
        parsed.notif_user_triggered.picture = newImgUrl;
        parsed.notif_message = JSON.parse(parsed.notif_message);
        this.virtualList.unshift(parsed)
      }
    });
  }

  private _initSearch(){
    this.cc.subs.sink = this.search.valueChanges.subscribe(res => {
      if(res != "" || undefined || null){
        this.itemLoading = true;
        setTimeout(() => {
          const params = {query: res, ...this.currNotifMenu.params };
          this._fetchData(this.currNotifMenu.api, null, params, true);
        }, 1000);
      }else {
        this.itemLoading = true;
        this.virtualList = [];
        this._fetchData(this.currNotifMenu.api);
      }
    })
  }

  private _fetchData(context:any, nextUrl?, params?:any, isSearch?:boolean){
    params = (params == null)? this.currNotifMenu?.params : params;
    this.cc.subs.sink = this._profile.notification_list(params, 'post', nextUrl).pipe(map(e => {
       e.content.results.map(f => {
        if(f){
          const temp = (this.imgHostUrl+f)?.notif_user_triggered?.picture;
          if(f.notif_message){
            try {
              f.notif_message = JSON.parse(f.notif_message);
            } catch (error) {
              console.warn({error});
            }
          }
          if(f.notif_user_triggered){
            f.notif_user_triggered.picture = temp;
          }
        }
        return f;
      })
      return e;
    })).subscribe({
      next: (res) => {
        this.list = [];

        if(!this._ws.libraryService.checkGridEmptyFirstResult){
          this.list = res.content;
          if(isSearch){
            this.virtualList = res.content.results;
          }else{
            //console.log(JSON.stringify(res.content.results[0]));
            this.virtualList = this.virtualList.concat(res.content.results);
          }
          this.cc.data = res.content.results;
        }
        this.cc.permission = res.content.permission;
      },
      complete: () => {
        this.cc.isLoading = false;
        this.itemLoading = false;
        this._cdr.detectChanges();
      },
      error: (err) => {
        console.log(err);
      }
    })
  }

  public lazyLoadData(event: any) : void{
    const interval = this.virtualList.length  / this.vs.itemSize;
    const requestPage = event.first / event.rows;
    const nextPage = requestPage > 0 ? requestPage + 1 : 0;

    if (nextPage < requestPage) {
      return;
    }

    if(event.last >= this.virtualList.length - 10 && this.list != null && this.list?.page?.next != null && !this.itemLoading){
      this.itemLoading = true
      this._fetchData(this.currNotifMenu.api, this.list.page.next);
      event.forceUpdate();
    }
  }

  public showDetails(currNotif, data){
    console.log("showdetails", currNotif, data)
  }

  public toJson(data){
    console.log(data)
    //return JSON.parse(data);
  }

  public update(action, data){
    let method : any = (action == 'update')? 'patch' : 'delete';
    let req : any = {"id": data.id, "hasRead": !data.hasRead}

    this.cc.subs.sink = this._profile.notification_list(req, method).subscribe(res => {

      if(action == 'delete') {
        this._ws.libraryService.deleteObjectFromArray(this.virtualList, data.id);
      }
      else{
        this._ws.libraryService.updateObjectByKeyValueInArray(this.virtualList, res.content.results[0]['id'], 'hasRead', res.content.results[0]['hasRead'])
      }
    })
  }

  public showUser(data){
    console.log(data)
  }

  ngOnDestroy(){
    this._subs.unsubscribe();
  }

}
