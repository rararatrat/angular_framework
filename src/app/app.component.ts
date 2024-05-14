import { Component, Inject, LOCALE_ID, OnDestroy, OnInit } from '@angular/core';
import { APP_ID, AbstractCoreService, Core } from '@eagna-io/core';
import { SubSink } from 'subsink2';
import { environment as env } from 'src/environment/environment';
import { AppService } from './app.service';
import { AppMockService } from './app.mock.service';
import { User } from '@library/class/user';
import { AuthService } from './auth/auth.service';
import { WrapperService } from '@library/service/wrapper.service';
import { DatePipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'body',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    {provide: AbstractCoreService, useClass: !env.debug ? AppService : AppMockService},
    {provide: AppService, useClass: !env.debug ? AppService : AppMockService}
  ]
})
export class AppComponent implements OnInit, OnDestroy {
  public title = 'eagna';
  private _subs   : SubSink = new SubSink();
  public user : User;
  public app : any = 1

  public orgId = 1;
  public dateToday = new Date();
  public _timerInterval: any;
  public appLocalize      = Core.Localize;
  public items: any = [];
   //to go inside the eagna-io library
  public isLoading  : boolean = false;
  public isGlobalMenuPref: boolean;
  public isDebug : boolean;
  public translationDone: boolean;

  constructor(private _auth:AuthService,
              private _wr: WrapperService,
              private _date: DatePipe,
              private _decimal: DecimalPipe,
              @Inject(LOCALE_ID) public LOCALE_ID: any,
              @Inject(APP_ID) public appId: number){

    this._wr.device.getIP();
    this.user = new User(this._auth);
    this.app = appId;
    this.isDebug = ( this._wr.sharedService.appConfig.env?.main.isDebug == true);
  }

  ngOnInit(): void {

    this._initEagna();
    this._subs.sink = this._wr.coreService.translationDone$.subscribe(res => {
      this.translationDone = true;
    })
  }

  private _initEagna(){
    const ls = this.user.details;
    this.isGlobalMenuPref = ls?.['globalMenubarPref'] == true;
    if(this.isDebug){
      this._timerInterval = setInterval(() => {
        this.dateToday = new Date()
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
    clearInterval(this._timerInterval);
  }

}

declare global {
  interface Window {
    typeOf(val: any): void;
  }
}
window.typeOf = (val:any) => {
  return typeof val
}
