import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ConfirmDialogResult, CONFIRM_DIALOG_TYPE, CustomDialogConfig, EagnaListener, ResponseObj } from '@eagna-io/core';
import { LibraryService } from '@library/service/library.service';
import { Config } from 'ng-otp-input/lib/models/config';
import {ConfirmationService} from 'primeng/api';
import { Observable, scan, take, takeWhile, timer } from 'rxjs';
import { environment as env } from 'src/environment/environment';

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {

  transform(value: number, args?: any): any {
    return `${Math.floor(value / 60)}:${('0' + (value % 60)).slice(-2)}`;
  }

}

@Component({
  selector: 'eg-otp-token',
  templateUrl: './otp-token.component.html',
  styleUrls: ['./otp-token.component.scss'],
  providers: [ConfirmationService]

})
export class OtpTokenComponent implements OnInit {
  public otpConfig : Config = {
    length      :6,
    inputClass  :'shit',
    inputStyles :{'height.rem': 6,
                  'border.rem': 0,
                  'border-radius.rem':1,
                  'box-shadow': '0 2px 1px -1px #0003, 0 1px 1px #00000024, 0 1px 3px #0000001f', 'outline':'none',
                  'background': 'aliceblue'
                }
  }
  public req                : any = {method: "patch", url: null, params:  {} }
  public otp                : FormControl = new FormControl(null,[Validators.required, Validators.minLength(6)]);
  public result             : ConfirmDialogResult
  public currUser           : any = JSON.parse(this._lib.getLocalStorage("user"))
  public isProvisioned      : boolean = false;

  public timeLeft           : number;
  public customDialogConfig : CustomDialogConfig
  public emailRequest       : boolean = false;
  private _api              : any = env.apiUrl;
  private _ouuid            : any = null;
  public isApproved         : boolean = false;

  constructor(private _eagnaEmit: EagnaListener, private _http: HttpClient, private _lib : LibraryService) {


    this._eagnaEmit.customDialogOpened$.subscribe((cdc?: CustomDialogConfig) => {

      if(cdc.dialogType == CONFIRM_DIALOG_TYPE.TOKEN){

        this.customDialogConfig = cdc;
        this.customDialogConfig.visible = true;
        this.isProvisioned      = this.currUser.hasProvision;

        let errReq              = this.customDialogConfig.data.request;

        this.req.url            = errReq.url;
        this.req.method         = errReq.method;
        this.req.params         = errReq.body;

        cdc.onConfirm = (e) => {
            this.sendToken()
        }
      }else{
        this._eagnaEmit.customDialogOpened$.unsubscribe();
      }

    })
  }

  ngOnInit(): void {

  }

  public sendToken(){
    let newParams = {...{otp: this.otp.getRawValue()}, ...this.req.params}
    if(this._ouuid != null){
      newParams = {...newParams, o_uuid: this._ouuid}
    }

    this._submitReq(this.req.method, this.req.url, newParams).subscribe({
      next: res => {
        this.isApproved = true;
      },
      error: err => {

      },
      complete: () => {
        this._countDowntimer(3);
        setTimeout(() => {
          location.reload()
        }, 3000);

      }
    })
  }

  public requestForEmailToken(){
    this.emailRequest = true;
    this._countDowntimer(300);

    this._http.post(`${this._api}user/mail-otp/`, this.req.params).subscribe({
      next : res => {
        this._ouuid = res['o_uuid']
      },
      error : err =>{
        this._ouuid = err.error.o_uuid
      }
    })

  }


  private _countDowntimer(time){
    const temp = timer(0, 1000).pipe(
      scan(acc => --acc, time),
      take(120)
    ).subscribe(val => {
      this.timeLeft = val
      if(this.timeLeft == 0){
        temp.unsubscribe()
      }
    })


  }

  private _submitReq(method, url, params){
    switch(method){
      case 'POST'   : return <Observable<any>>this._http?.post(url, params);
      case 'PUT'    : return <Observable<any>>this._http?.put(url, params);
      case 'PATCH'  : return <Observable<any>>this._http?.patch(url, params);
      case 'DELETE' : return <Observable<any>>this._http?.delete(url, params);
      case 'OPTIONS': return <Observable<any>>this._http?.options(url, params);
      default       : return null
    }
  }
}
