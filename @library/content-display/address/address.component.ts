import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Optional, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, FormGroup, NG_VALUE_ACCESSOR, Validators } from '@angular/forms';
import * as L from 'leaflet';
import { ContentDisplayService } from '../content-display.service';
import { MenuItem } from 'primeng/api';
import { HelperService } from '@eagna-io/core';
import { WrapperService } from '@library/service/wrapper.service';

import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { ComponentConfig } from '@library/library.interface';
import { SubSink } from 'subsink2';
import { Observable } from 'rxjs';

export interface AddressDataObject {
  id                : number;
  po_box            : any;
  name              : any;
  formatted_address : any;
  street            : any;
  bldgNumber        : any;
  city              : any;
  state             : any;
  zipcode           : any;
  country           : any;
  lat               : any;
  lon               : any;
  type              : any;
  place_id          : any;
  plus_code         : any;
  icon              : any;
  status            : any;
}


@Component({
  selector: 'eg-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AddressComponent),
    multi: true,
  }]
})
export class AddressComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor  {
  public cc                                 : ComponentConfig = null;

  @ViewChild("gMap")        gMap            : ElementRef;

  @Input("formGroup")       formGroup       : FormGroup = null;
  @Input("formControlName") formControlName : any ;
  @Input('type')            type            : "address" | "map" | "edit";
  @Input('format')          format          : "id" | "data" | "object" | "array";
  @Input("data")            data            : any   = null;
  @Output('callback')       callback        = new EventEmitter();
  @Input('topic')           topic           : string;

  public                    address         : any = [];
  public                    isLoading       : boolean = true;
  public                    overlay         : boolean = false;

  public                    tempAdd : any = null;
  public addressForm : FormGroup = null;
  public state : any = "edit";

  public items: MenuItem[];


  public options    : any;
  public overlays   : any = [];
  public infoWindow : any;
  private map : any;
  private _dialogConfig    : DynamicDialogConfig

  public onChange = (value: any) => { console.log(value)};
  public onBlur = (touched: boolean) => {};

  writeValue(value: string) : void {}
  registerOnChange(fn: any) : void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onBlur  = fn; }
  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  constructor(private _contentService: ContentDisplayService,
              private _wrapper: WrapperService,
              private _cdr: ChangeDetectorRef
              ) { }

  ngOnInit(): void {
    this._initComponent();
  }

  private _initComponent(){
    /* console.log({addressData: this.data}); */

    this.cc = {
          header        : {show: true, name: null},
          subHeader     : {show: true, name: null},
          data          : this.data,
          currentType   : "component",
          subs          : new SubSink(),
          isLoading     : false,
          permission    : null
        }

    if(this.type != 'edit'){
      this._fetchData(this.format);
    }else{
      if(this.formGroup != null){
        if(!this.formGroup.get(this.formControlName).value){
          this.state = "new";
          this.isLoading = false;
        } else {
          if(this.data != null && this.data.hasOwnProperty("id") && (this.data.id != null || "")){
            this.state = "edit";
            this.isLoading = false;
          }else{
            this._manageAddress("get", this.formGroup.get(this.formControlName).value)
          }
        }
      }
    }
  }

  private _fetchData(format:any){
    switch(format){
      case "id":
        this.cc.subs.sink = this._contentService.crm.address({id: this.data}).subscribe({
          next: (res) => {
            this.address.push(res.content.results[0]);
           /*  this.initGoogleMaps("setOverlay",  this.address);
            this.initGoogleMaps("loadMap", this.overlays); */

          },
          error: (res) => {},
          complete: () => {this.isLoading = false;},
        })
        break;
      case "data":
        if(this.data != null){
          this.address.push(this.data);
      /*     this.initGoogleMaps("setOverlay",  this.address);
          this.initGoogleMaps("loadMap", this.overlays); */

          this.isLoading = false;
        }
        break;
      case "object":
        if(this.data != null){
          Object.keys(this.data).forEach((k) => {
            this.address.push(this.data[k])
          })
   /*        this.initGoogleMaps("setOverlay",  this.address);
          this.initGoogleMaps("loadMap", this.overlays); */
          this.isLoading = false;
        }
        this.isLoading = false;
        break;
      case "array":
        this.address = this.data;
       /*  this.initGoogleMaps("setOverlay",  this.address);
        this.initGoogleMaps("loadMap", this.overlays); */
        this.isLoading = false;
        break;

    }
  }

  private initGoogleMaps(key, param?){
    switch (key) {
      case "setMap":
        this.map = param.map;
        break;
      case "loadMap":
        if(this.address.length == this.overlays.length){
          this._loadMap(this.overlays);
        }
        break;

      case "setOverlay":

        param.forEach(element => {
          if(element != null){
            const lat : number = +element.lat;
            const lon : number = +element.lon;
            //let marker : google.maps.Marker = new google.maps.Marker({position: {lat: lat, lng: lon}, title:JSON.stringify(element)})
            let marker : null
            this.overlays.push(marker);
          }
        });

        break;
    }
  }

  private _loadMap(overlays){
    this.options = {
      disableDefaultUI: true,
      //center:new google.maps.LatLng(40.5499490416043, 34.953640086323944),
      zoom: 1,
      mapId: "2b7b3e8655c2bf94"
    };
  }

  public handleOverlay(event){
    //this.infoWindow = new google.maps.InfoWindow();
    this.infoWindow = null;
    const address = JSON.parse(event.overlay.title);
    const content =  `
    <div class="address-name bold">${address['name']}</div>
    <div class="address-street">${address['bldgNumber']}, ${address['street']}</div>
    <div class="address-state">${address['city']}, ${address['state']} ${address['zipcode']}</div>
    <div class="address-country">${address['country']}</div>
    `
    this.infoWindow.setContent(content);
    this.infoWindow.open(event.map, event.overlay);
  }

  public editAdddress(event){
    this.overlay = true;
    this.tempAdd = event;
    this._initForm(event);
  }

  public setAddress(data){
    this.tempAdd = data;

    Object.keys(data).forEach((key, value) => {
      if(key != "__data__"){
        this.addressForm.get(key)?.patchValue(data[key]);
      }
    });
  }

  private _initForm(data){
    let tObj    = {};

    if(!data){
      data = {
        name: null,
        bldgNumber: null,
        street: null,
        city: null,
        zipcode: null,
        state: null,
        country: null
      } as AddressDataObject
    }

    Object.keys(data).forEach((key, value) => {
      if(key != "__data__"){
        tObj[key] = new FormControl(data[key], [Validators.required]) ;
      }
    });
    this.addressForm = new FormGroup(tObj)
  }

  public updateAddress(event){
    let formValue = this.addressForm.getRawValue();
    //Create New Address
    if(this.state == "new"){
      this._manageAddress("put", formValue);
    }else {
      //Update Address
      this._manageAddress("patch",formValue);
    }


  }

  private _manageAddress(key, value?){
    //console.log({manageAddress: key, value, form: this.cc?.currentType, topic: this.topic});

    let api: (p, m) => Observable<any>;
    switch(this.topic){
      case "contact_address":
        api = (p, m) => this._contentService.crm.address(p, m);
        break;
      default:
        api = (p, m) => this._contentService.settings.org_address(p, m);
    }

    switch (key) {
      case "get":
        if (typeof(value) == "object"){
          this.data = value;
          this.isLoading = false;
        }else{
          this.isLoading = true;      
          this._cdr.detectChanges();
          this.cc.subs.sink = api({id:value}, "post").subscribe({
            next : (res) => {
              this.data = res.content.results[0];
            },
            error     : (err) => {},
            complete  : ()    => {
              this.isLoading = false;
              this._cdr.detectChanges();
            }
          })
        }

        break;
      case "patch":

        if(!this.tempAdd.hasOwnProperty('id')){
          this._manageAddress("put", this.tempAdd);
        }else {
          this.cc.subs.sink = api(value, "patch").subscribe({
            next : (res) => {
              console.log(res);
              this.data = res.content.results[0];
              this.callback.emit(res.content.results[0])
            },
            error     : (err) => {},
            complete  : ()    => {}
          })
        }

        break;
      case "put":
        /* this.isLoading = true; */
        this.cc.subs.sink = api(value, "put").subscribe({
          next : (res) => {
            this.data = res.content.results[0];
            this.type = "edit";
            this.state = "edit";
            this.formGroup?.get(this.formControlName)?.setValue(this.data);
            this.callback.emit(res.content.results[0]);
            this.overlay=false;
            /* this.isLoading = false; */
          },
          error     : (err) => {},
          complete  : ()    => {}
        })
        break;
      case "delete":
        this.cc.subs.sink = this._contentService.settings.org_address({id:value}, "delete").subscribe({
          next : (res) => {

          },
          error     : (err) => {},
          complete  : ()    => {}
        })
        break;

      default:
        break;
    }

  }



  ngAfterViewInit(): void {

  }

  ngOnDestroy(): void {
    this.cc.subs.unsubscribe();
  }

}

