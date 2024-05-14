import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { SubSink } from 'subsink2';
import { LibraryService } from './library.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Injectable({
  providedIn: 'root'
})
export class DeviceService {
  private _subs           : SubSink = new SubSink();
  public instance$        : Subject<any> = new Subject<any>();
  private _type           : "Laptop/Desktop" | "Mobile" | "Tablet";
  private _osName          : any = "Unknown";

  constructor(private _handler: HttpBackend,
              private _app:AppService,
              private _lib : LibraryService,
              private _breakPtObserver: BreakpointObserver) { }

   /* Getting IP Address, GeoLocation, Device Info */

   public getIP(){
    this.getDeviceType();
    this.detectOS();

    const _request    = new HttpClient(this._handler);
    const ip_req$   = _request.get("https://api.ipify.org?format=json");
    let _toReturn =  {
      ip : null,
      browser: this.getDeviceInfo(),
      device: this._type,
      os: this._osName
    }
    this._subs.id('ip').sink = ip_req$.subscribe({
      next : (res) => {
        _toReturn['ip'] = res['ip']
      },
      error : (err) => {
        _toReturn['ip'] = "Not Available";
          this._app.instanceInfo$.next(_toReturn);
      },
      complete : () => {
        this._app.instanceInfo$.next(_toReturn);
      }
    })
  }

  /* Getthing Device Info */
  private _isPwa(): boolean {
    return ('serviceWorker' in navigator && 'caches' in window && 'Manifest' in window);
  }
  private _isWebBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.navigator !== 'undefined';
  }

  private _getBrowserName(): string {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('Chrome')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('Safari')) {
      return 'Safari';
    } else if (userAgent.includes('Edge')) {
      return 'Edge';
    } else if (userAgent.includes('Opera')) {
      return 'Opera';
    } else if (userAgent.includes('Brave')) {
      return 'Brave';
    } else {
      return 'Unknown Browser';
    }
  }

  public getDeviceInfo(){
    const _isBrowser = this._isWebBrowser();
    if(this._isPwa()){
      return "PWA"
    }else {
      if(this._isWebBrowser()){
        return this._getBrowserName();
      }else{
        return "Unknown"
      }
    }
  }

  public getDeviceType(){
    this._subs.id('deviceType').sink = this._breakPtObserver.observe([
      Breakpoints.Handset, // Mobile devices
      Breakpoints.Tablet, // Tablets
      Breakpoints.Web, // Desktop
    ]).subscribe(result => {
      if (result.matches) {
        if (result.breakpoints[Breakpoints.Handset]) {
          this._type = "Mobile";
        } else if (result.breakpoints[Breakpoints.Tablet]) {
          this._type = "Tablet";
        } else {
          this._type = "Laptop/Desktop"
        }
      }
      this._subs.id('deviceType').unsubscribe();
    });
  }

  detectOS() {
    const userAgent = window.navigator.userAgent;

    if (userAgent.indexOf('Win') !== -1) {
      this._osName = 'Windows';
    } else if (userAgent.indexOf('Mac') !== -1) {
      this._osName = 'MacOS';
    } else if (userAgent.indexOf('Linux') !== -1) {
      this._osName = 'Linux';
    } else if (userAgent.indexOf('Android') !== -1) {
      this._osName = 'Android';
    } else if (userAgent.indexOf('iOS') !== -1) {
      this._osName = 'iOS';
    } else {
      this._osName = 'Unknown';
    }
  }

}
