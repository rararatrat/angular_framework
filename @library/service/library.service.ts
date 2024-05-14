import { Inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT, NgTemplateOutlet, TitleCasePipe } from '@angular/common';

import { environment as env } from 'src/environment/environment';

import { Observable, Subject } from 'rxjs';

import * as CryptoJS from 'crypto-ts';

import { Core, GridResponse, GridService, HelperService, MenuSideBarSettings, ResponseObj, SharedService } from '@eagna-io/core';

import { DialogService } from 'primeng/dynamicdialog';
import { componentConfigType, objArrayType } from '../library.interface';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { SubSink } from 'subsink2';


@Injectable({
  providedIn: 'root'
})
export class LibraryService {

  public menuItems$       : Subject<any> = new Subject<any>();
  public menuItemArr      : any = [];
  private _keys           : string  = env.salt;
  private _subs           : SubSink = new SubSink();

  private _api: any = env.apiUrl;

  constructor(  private _titleService   : Title,
                private _helper : HelperService,
                private _shared : SharedService,
                private _router : Router,
                private _dialogService: DialogService,
                public titleCasePipe : TitleCasePipe,
                private _handler: HttpBackend,
                @Inject(DOCUMENT) private document: Document
                ) {}

  public refreshToken(token) {
    let temp = new HttpClient(this._handler);
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    })
    // const req = { refresh_token: this._lib.getLocalStorage('rt')}
    return temp.post(`${this._api}auth/refresh_token/`, {refresh_token: token}, { headers: headers })
  }
  public get months(){
    return [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December'
  ];
  }
  public parseId(id){
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const integerPattern = /^[0-9]+$/;

    if (uuidPattern.test(id)) {
      return id.toString();
    } else if (integerPattern.test(id)) {
      return parseInt(id);
    }
  }

  public getRenderedType(dialog, data): componentConfigType{
    if(dialog != null && dialog.data != undefined){
      return "dialog";
    }else
      if(this._helper.isNotEmpty(data)){
        return "component";
      } else {
        return "route";
      }
  }

  public noImageUrl(event){
    event.target.src = env.noImagUrl;
  }

  public dialog(type:"close"|"maximize"|"destroyAll"){
    var i = 0;

    this._dialogService.dialogComponentRefMap[this._dialogService.dialogComponentRefMap.size - 1]
    this._dialogService.dialogComponentRefMap.forEach(dialog => {
      if(type == "destroyAll"){
        dialog.destroy();
      }else{
        if(i == (this._dialogService.dialogComponentRefMap.size - 1)){

          switch (type) {
            case "close":
              //dialog.instance.close();
              dialog.destroy();
              break;

            case "maximize":
              dialog.instance.maximize();
              break;

            default:
              break;
          }
        }
        i++
      }

    });
  }

  public loadStyle(styleName: string) {
    const head = this.document.getElementsByTagName('head')[0];

    let themeLink = this.document.getElementById(
      '__sync__'
    ) as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = styleName;
    } else {
      const style = this.document.createElement('link');
      style.id = '__sync__';
      style.rel = 'stylesheet';
      style.href = `${styleName}`;

      head.appendChild(style);
    }
  }

  public setLocalStorage(variable, value, encrypt?){
    value = (encrypt != null) ? this.encrypt(value.toString()) : value;
    if(env.production){
      localStorage.setItem(variable, value);
    }else {
      localStorage.setItem(variable, value);
    }

    localStorage.setItem(variable, value);
  }

  public getLocalStorage(variable, decrypt?){
    let value = localStorage.getItem(variable);
    if(value == null){
      return null;
    }else {
      value = (decrypt != null) ? this.decrypt(value.toString()) : value.toString();
      return value;
    }
  }

  public makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
  }
  public encrypt(value)
  {
    let iv = CryptoJS.enc.Utf8.parse(this._keys);
    let encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), this._keys,
      {
        /* keySize: 128 / 8, */
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.PKCS7
      });

    return encrypted.toString();
  }

  public decrypt(value) {
    let iv  = CryptoJS.enc.Utf8.parse(this._keys);
    let decrypted = CryptoJS.AES.decrypt(value, this._keys, {
      /* keySize: 128 / 8, */
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.PKCS7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  public setMenuItems(app, data?: any) : void{
    this.menuItems$.next({app: app, data: data});
  }

  public fetchMenuItemArr(){
    return this.menuItemArr;
  }

  public onApp(): Observable<any> {
    return this.menuItems$.asObservable();
  }

  public destroyMenuItems(){
    this.menuItems$.next({});
  }

  public pageTitle(title): void {
    let validatedTitle = (title != undefined || title != null)?title : "undefined";

    this._titleService.setTitle("eagna.io | " + validatedTitle);
  }

  public setCustomBreadcrumbs(breadcrumb_title, currentType:"route"|"component"|"dialog"){
    if(currentType == "route"){
      const checkUrl        = this._router.url;
      const breadCrumbCopy  = this._shared.globalVars.breadcrumbs.slice();
      const toUpdate        = breadCrumbCopy.find(e => {
        return e.routerLink == checkUrl;
      })
      toUpdate['label'] = breadcrumb_title;
      this._shared.globalVars.breadcrumbs = breadCrumbCopy;
    }

  }

  public detectDeviceType(data) {
    const screenWidth = data.target.innerWidth;
    if(screenWidth < 810){
      return "mobile";
    }else if( screenWidth >= 810 && screenWidth < 992){
      return "tablet";
    }else{
      return "desktop";
    }
  }



  public setCssForContainer(sidebarSettings:MenuSideBarSettings, calledFrom?){

    if(sidebarSettings != undefined){
      const sameSidebar = (sidebarSettings.sidebarLoaderId == calledFrom)? true : false;

      if(sidebarSettings.menuType == 'sidebar'){
        /* console.trace(sidebarSettings, calledFrom) */
        document.documentElement.style.setProperty(`--eg-container-header-height`, "3.8rem")
        //document.documentElement.style.setProperty(`--eg-container-body-height`, calc(100vh - var(--eg-container-header-height)))
        document.documentElement.style.setProperty(`--eg-container-left-margin`  , "0rem")
        //RT: added new css variable to be used by modal overlay
        document.documentElement.style.setProperty(`--eg-container-modal-left-margin`  , "0rem")

        //document.documentElement.style.setProperty(`--eg-sbmodal-overlay-left-margin`  , "0rem")
        if(sidebarSettings.sidebarVisible){
          switch(sidebarSettings.mode){
            case "thin":
              if(!sidebarSettings.modal){ //RT: only move container when sidebar is not modal
                document.documentElement.style.setProperty(`--eg-container-left-margin`  , setLeftMargin("--menuThinWidth", "rem"));
              }
              //RT: move modal overlay depending on mode
              document.documentElement.style.setProperty(`--eg-container-modal-left-margin`  , setLeftMargin("--menuThinWidth", "rem"));
              break;
            case "list":
              if(!sidebarSettings.modal){ //RT: only move container when sidebar is not modal
                document.documentElement.style.setProperty(`--eg-container-left-margin`  , setLeftMargin("--menuWidth", "rem"));
              }
              //RT: move modal overlay depending on mode
              document.documentElement.style.setProperty(`--eg-container-modal-left-margin`  , setLeftMargin("--menuWidth", "rem"));
              break;
            case "compact":
              if(!sidebarSettings.modal){ //RT: only move container when sidebar is not modal
                document.documentElement.style.setProperty(`--eg-container-left-margin`  , setLeftMargin("--menuCompactWidth", "rem"));
              }
              //RT: move modal overlay depending on mode
              document.documentElement.style.setProperty(`--eg-container-modal-left-margin`  , setLeftMargin("--menuCompactWidth", "rem"));
              break;
          }
        }

      }else {
        //console.log(sidebarSettings, calledFrom)
        document.documentElement.style.setProperty(`--eg-container-breadcrumbs-height`  , "2.3rem")
        document.documentElement.style.setProperty(`--eg-container-header-height`  , "calc(3.8rem + var(--eg-container-breadcrumbs-height))")
        document.documentElement.style.setProperty(`--eg-container-left-margin`  , "0rem")
        document.documentElement.style.setProperty(`--eg-container-body-height`  , "calc(100vh - var(--eg-container-header-height))")
      }


    }

    function setLeftMargin(type, unit){

      let temp =  window.getComputedStyle(document.documentElement).getPropertyValue(type);
      let currTemp = parseFloat((temp.split(unit))?.[0])
      const val = currTemp + unit

      return val
    }
  }

  public spliceObjectFromArray(arr:any[], item:any, identifier:string){
    const indexOfObject = arr.findIndex((object) => {
      return object[identifier] === item[identifier];
    });

    //console.log(indexOfObject); // 👉️ 1

    if (indexOfObject !== -1) {
      arr.splice(indexOfObject, 1);
    }

    return  arr;
  }

  public upadteObjectFromArray(arr:any[], item:any, identifier:string){
    const indexOfObject = arr.findIndex((object) => {
      return object[identifier] === item[identifier];
    });

    if (indexOfObject !== -1) {
      arr[indexOfObject] = item

    }

    return  arr;
  }

  public findObjectInNested__data__(obj, attribute: string): any | undefined {
    if (obj.__data__ && obj.__data__[attribute] !== undefined) {
      return obj.__data__[attribute];
    }

    for (const key in obj) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = this.findObjectInNested__data__(obj[key], attribute);
        if (result !== undefined) {
          return result;
        }
      }
    }

    return undefined;
  }

  /* Use this to find inmpcitble paris for the MATRIX MODULES (i. orghierarchy, morg user, dpet hierarchy.) */
  public findIncompatiblePairs(data: any, target: any): { parent: number[], child: number[] } {
    const incompatibleParents: number[] = [];
    const incompatibleChildren: number[] = [];
    const stack: number[] = [];
    const visited: Set<number> = new Set();
    const targetId = target.item_id;

    // Initialize the stack with the target ID

    stack.push(targetId);

    while (stack.length > 0) {
      const id = stack.pop() as number;
      visited.add(id);

      for (const pair of data) {
        if (pair.id !== id) {
          if (pair.parent && pair.parent.id === id) {
            incompatibleParents.push(pair.child.id);
            if (!visited.has(pair.child.id)) {
              stack.push(pair.child.id);

            }
          } else if (pair.child && pair.child.id === id) {
            incompatibleChildren.push(pair.parent.id);
            if (!visited.has(pair.parent.id)) {
              stack.push(pair.parent.id);
            }
          }
        }
      }
    }
    if(!incompatibleChildren.includes(targetId) || !incompatibleParents.includes(targetId)){
      incompatibleChildren.push(targetId);
      incompatibleParents.push(targetId);
    }


    if(target.hasOwnProperty('parent') && !incompatibleParents.includes(target.parent.id)){
      incompatibleParents.push(target.parent.id)
    }

    if(target.hasOwnProperty('children') && target.children.length > 0){
      target.children.forEach(element => {
        if(!incompatibleChildren.includes(element.item_id)){
          incompatibleChildren.push(element.item_id)
        }
      });
    }

    return {
      parent: Array.from(new Set(incompatibleParents)),
      child: Array.from(new Set(incompatibleChildren)),
    };
  }
  /* Create Data For Charts & Infographics */

  public reduceRender(data = [], category, value, keyvaluepair?){
    return data.map((obj) => {
      if(keyvaluepair == null){

        return {
          category: obj[category] ?? 'Unknown', // Use "Unknown" if status__name is null or undefined
          value: obj[value],
          id: obj['id'] ?? null
        };
      }else{
        return {
          [obj[category]]: obj[value]
        };
      }

    })
  }

  public renderStatsDataForCharts(res_data){

    let chart  = {};
    let info   = {};
    let data  : any;
    if(Array.isArray(res_data)){
      data = this.arrayObjToObjectObj(res_data);

    }else{
      data = res_data

    }



    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {

        const element = data[key];
        const fetch_attr = (element.type == "Date")? "date" : "content";

        if(element.hasOwnProperty('annotation'))
        {
          chart[key] = this.reduceRender(element['annotation'], fetch_attr, "value");

          if(element?.type == "Number"){
            info[key] = { sum:element['sum'],
                                    min:element['min'],
                                    max:element['max'],
                                    total:element['total'],
                                    avg:element['avg']
                                  }
          }
        }


        else
        {
          for (const key2 in element) {
            if (Object.prototype.hasOwnProperty.call(element, key2)) {
              const element2 = element[key2];
              const fetch_attr = (element2.type == "Date")? "date" : "content";
              chart[key+'__'+key2] = this.reduceRender(element2.annotation, fetch_attr, "value");

              if(element2?.type == "Number"){
                info[key+'__'+key2] = { sum:element2['sum'],
                                        min:element2['min'],
                                        max:element2['max'],
                                        total:element2['total'],
                                        avg:element2['avg']
                                      }
              }
            }
          }
        }
      }
    }
    return {chart,info};
  }

  public renderDataForInfo(data, icon){
    let a = {};
    let a2 = {};
    let b = [];
    const TOPIC = {
      avg:Core.Localize('average'),
      sum:Core.Localize('sum'),
      min:Core.Localize('min'),
      max:Core.Localize('max'),
      total:Core.Localize('total')
    }
    for (const key in data) {
      b = [];
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const element = data[key];
        for (const key2 in element) {
          if (Object.prototype.hasOwnProperty.call(element, key2)) {
            const element2 = element[key2];
            a2 = {
              illustrationType : "icon",
              illustration : {
                icon : {class: icon +' text-primary-faded', name:key2}
              },
              topic: TOPIC[key2],
              value: element2
            }
            b.push(a2)
          }
        }
        a[key] = b;
      }
    }
    return a;

  }

  public scrollToElement($element): void {
    $element.nativeElement.scrollIntoView({behavior: "smooth", block: "nearest", inline: "nearest"});
  }

  public setDevice(res_arr){

    const win_height        = String(window.screen.height)+"";
    const win_width         = String(window.screen.width)+"";

    const win_avail_height  = String(window.screen.availHeight)+"px";
    //const win_avail_width   = String(window.screen.availWidth)+"px";
    const win_avail_width   = "100vw";

    let resolution          = res_arr.filter(e => (e.height == win_height && e.width == win_width));
    const font_size         = (resolution.length > 0) ? resolution[0].font_size : "12px";

    document.documentElement.style.setProperty('--resolution', font_size);
    document.documentElement.style.setProperty('--min-width', win_avail_width);
    document.documentElement.style.setProperty('--min-height', win_avail_height);

    let deviceInfo : any    = {};
    /* deviceInfo              = this._deviceService.getDeviceInfo(); */
    deviceInfo.font_size    = font_size;
    deviceInfo.min_width    = String(win_avail_width+"px");
    deviceInfo.min_height   = String(win_avail_height+"px");
    deviceInfo.resolution   = resolution[0];

    env.deviceType          = deviceInfo;

    return deviceInfo;
  }

  /* public resultMap(p: ResponseObj<GridResponse>, _gridFields:{ [field: string]: string; }[]){
    _gridFields = p.content?.fields;
    if(p.content?.results){
      p.content.results = p.content.results.filter(res => this._helper.isNotEmpty(res?.id));
      if(!p.content?.page && p.content?.results?.length > 0){
        p.content.page = {total: (p.content.results.length || 0), page: 1, page_size: 1};
      }
      if(!p.content?.total && p.content?.results?.length > 0){
        p.content.total = (p.content.results.length || 0);
      }
    }
    return p;
  } */

  public capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  public formatAddress(isGoogle, address, po_box?, name?){
    const addressComp =  address?.['address_components'];
    let tempAddress = {
      po_box           : po_box,
      name             : address?.['name'] || address?.['formatted_address'],
      formatted_address: address?.['formatted_address'],
      street           : getAddComp(address, 'route'),
      bldgNumber       : getAddComp(address, 'street_number'),
      city             : getAddComp(address, 'locality') || getAddComp(address, 'sublocality_level_1'),
      state            : getAddComp(address, 'administrative_area_level_1'),
      zipcode          : getAddComp(address, 'postal_code'),
      country          : getAddComp(address, 'country'),
      lat              : address?.['geometry']['location']['lat'],
      lon              : address?.['geometry']['location']['lng'],
      type             : address?.['types'].toString(),
      place_id         : address?.['place_id'],
      plus_code        : address?.['plus_code']?.['global_code'] ,
      types            : address?.[''],
      status           : address?.['business_status']
    }

    return tempAddress;

    function getAddComp(address, field){
      return address?.["address_components"].filter(e =>{return e['types'].includes(field) })?.[0]?.['long_name']
    }
  }

  public deleteObjectFromArray(array: any[], id: any): any[] {
    const index = array.findIndex((element) => element.id === id);
    if (index !== -1) {
      array.splice(index, 1)
    }
    return array;
  }

  public updateObjectByKeyValueInArray(array: any[], id: any, key: any, value: any): any[] {
    const index = array.findIndex((element) => element.id === id);
    if (index !== -1) {
      array[index][key] = value;
    }
    return array;
  }

  public updateObjectByIdInArray(array: any[], newObject: any, id: any): any[] {
    const index = array.findIndex((element) => element.id === id);
    if (index !== -1) {
      array[index] = { ...newObject };
    }
    return array;
  }
  public findObjectInArray(array: any[], key: any, value:any): any[] {
    const index = array.findIndex((element) => element[key] === value);
    if (index !== -1) {

      return array[index];
    }else{
      return [];
    }

  }

  public arrayObjToObjectObj(data){
    let e   = {};
    data.forEach(element => {
      const key = Object.keys(element)?.[0]
      e[key] = element[key]
    });
    return e;
  }

  groupByNestedAttribute<T>(arr: T[], nestedAttribute: string): any[] {
    const groupedData = new Map<string, any>();

    for (const item of arr) {
      const nestedValue = this.getNestedValue(item, nestedAttribute);
      if (!groupedData.has(nestedValue)) {
        groupedData.set(nestedValue, []);
      }
      groupedData.get(nestedValue).push(item);
    }

    const grouped: any[] = [];
    for (const [key, value] of groupedData.entries()) {
      const group: any = {};
      group[nestedAttribute] = JSON.parse(key); // Parse the string back to an object
      group.children = value;
      grouped.push(group);
    }

    return grouped;
  }

  private getNestedValue<T>(obj: T, nestedAttribute: string): any {
    const keys = nestedAttribute.split('.');
    let value: any = obj;
    for (const key of keys) {
      value = value ? value[key] : null;
    }
    return JSON.stringify(value); // Stringify the object to use it as a key
  }



  public setParamForApi(matrix: string[][], value: string): boolean {
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        if (matrix[i][j] === value) {
          return true;
        }
      }
    }
    return false;
  }

  public valueInMatrix(matrix: string[][], value: string): boolean {
    for (let i = 0; i < matrix?.length; i++) {
      for (let j = 0; j < matrix?.[i]?.length; j++) {
        if (matrix[i][j] === value) {
          return true;
        }
      }
    }
    return false;
  }

  public toFormData<T>( formValue: T, isMultiple = true, ref?: string ): FormData {
    let formData = new FormData();
    let i=1;
    for ( let key of Object.keys(formValue) ) {
      let obj = formValue[key];
      if(obj?.type == "file"){ //Old Implementation
        formData.append(isMultiple? "file[]" : "file_"+ (i++), obj.file, (ref? ref + "_" : "") + obj.file.name);
      } else{ //New Implementation
        if(Array.isArray(obj)){
          obj.forEach((_f) => {
            if(_f instanceof File){//file
              formData.append(key, _f);
            } else if(typeof(_f) == 'object' && _f.hasOwnProperty("id")){ //custom objects
              formData.append(key, _f.id);
            }else{ //default
              formData.append(key, _f);
            }
          });
        } else if(key == "file"){ //Old Implementation
          formData.append("file", obj, (ref? ref + "_" : "") + obj.name);
        } else { //default
          formData.append(key, obj);
        }
      }
    }
    return formData;
  }

  public get resolutionArray(){
    return [
      {
        type:"SD (Standard Definition)",
        name:"480p",
        ratio:"4:3",
        pixel:"640 x 480",
        height:"480",
        width:"640",
        font_size:"10px"
      },
      {
        type:"HD (High Definition)",
        name:"720p",
        ratio:"16:9",
        pixel:"1280 x 720",
        height:"720",
        width:"1280",
        font_size:"13px"
      },
      {
        type:"Full HD (FHD)",
        name:"1080p",
        ratio:"16:9",
        pixel:"1920 x 1080",
        height:"1080",
        width:"1920",
        font_size:"13px"
      },
      {
        type:"QHD (Quad HD)",
        name:"1440p",
        ratio:"16:9",
        pixel:"2560 x 1440",
        height:"1440",
        width:"2560",
        font_size:"13px"
      },
      {
        type:"2K video",
        name:"1080p",
        ratio:"1:1.77",
        pixel:"2048 x 1080",
        height:"1080",
        width:"2048",
        font_size:"17px"
      },
      {
        type:"4K video or Ultra HD (UHD)",
        name:"4K or 2160p",
        ratio:"1:1.9",
        pixel:"3840 x 2160",
        height:"2160",
        width:"3840",
        font_size:"19px"
      },
      {
        type:"8K video or Full Ultra HD",
        name:"8K or 4320p",
        ratio:"16∶9",
        pixel:"7680 x 4320",
        height:"4320",
        width:"7680",
        font_size:"21px"
      },
    ]

  }

  public setAppUiTheme(param, type?){
    let branding : any = (type == 'branding')? param : param.__data__.branding;

    const font = branding.font_family || "Roboto";

    Object.keys(branding).forEach(key => {
      if(key == "primary" || key ==  "secondary" || key ==  "accent" || key ==  "danger" || key ==  "warn" || key ==  "info" || key == "success"){
        //tempObj[key] = data[key];
        const val = branding[key]
        if(val != null || val != undefined){
          document.documentElement.style.setProperty(`--${key}`, val);
          document.documentElement.style.setProperty(`--${key}-color`, val);
          document.documentElement.style.setProperty(`--${key}-contrast`, invertColor(val, true));
          document.documentElement.style.setProperty(`--${key}-faded`, fadeColor(val, "#ffffff", .90));
        }
      }
    });

    document.documentElement.style.setProperty(`--brand-logo`, param.logo);
    document.documentElement.style.setProperty(`--font-family`, font);


    function invertColor(hex, bw) {
      if (hex.indexOf('#') === 0) {
          hex = hex.slice(1);
      }
      // convert 3-digit hex to 6-digits.
      if (hex.length === 3) {
          hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      if (hex.length !== 6) {
        console.warn('Invalid HEX color.');
        //throw new Error('Invalid HEX color.');
      }


      //console.log(hex.length);

      var r : any = parseInt(hex.slice(0, 2), 16);
      var g : any = parseInt(hex.slice(2, 4), 16);
      var b : any = parseInt(hex.slice(4, 6), 16);

      if (bw) {
          // https://stackoverflow.com/a/3943023/112731
          return (r * 0.299 + g * 0.587 + b * 0.114) > 186
              ? '#000000'
              : '#FFFFFF';
      }
      // invert color components
      r = (255 - r).toString(16);
      g = (255 - g).toString(16);
      b = (255 - b).toString(16);
      // pad each with zeros and return

      return "#" + padZero(r) + padZero(g) + padZero(b);
    }

    function padZero(str) {
        let len = 2;
        var zeros = new Array(len).join('0');
        return (zeros + str).slice(-len);
    }

    function fadeColor(color1, color2, percent) {
      var red1 = parseInt(color1[1] + color1[2], 16);
      var green1 = parseInt(color1[3] + color1[4], 16);
      var blue1 = parseInt(color1[5] + color1[6], 16);

      var red2 = parseInt(color2[1] + color2[2], 16);
      var green2 = parseInt(color2[3] + color2[4], 16);
      var blue2 = parseInt(color2[5] + color2[6], 16);

      var red = Math.round(mix(red1, red2, percent));
      var green = Math.round(mix(green1, green2, percent));
      var blue = Math.round(mix(blue1, blue2, percent));

      return generateHex(red, green, blue);
    }

    function generateHex(r, g, b) {
      r = r.toString(16);
      g = g.toString(16);
      b = b.toString(16);

      // to address problem mentioned by Alexis Wilke:
      while (r.length < 2) { r = "0" + r; }
      while (g.length < 2) { g = "0" + g; }
      while (b.length < 2) { b = "0" + b; }

      return "#" + r + g + b;
    }

    function mix(start, end, percent) {
        return start + ((percent) * (end - start));
    }
  }

  public checkGridEmptyFirstResult(res: ResponseObj<GridResponse>) : boolean {
    let noRowData = true;
    const firstRow = res.content.results?.[0];
    if(firstRow){
      for (const key in firstRow) {
        if (Object.prototype.hasOwnProperty.call(firstRow, key)) {
          const element = firstRow[key];
          if(noRowData && this._helper.isNotEmpty(element)){
            noRowData = false;
          }
        }
      }
    }
    return noRowData;
  }

  public initFormArray(fields, formProperties, data): any{
    let _tmp: objArrayType = {};
    let _overrides: objArrayType = {};
    fields.forEach((_f) => {
      _tmp[_f.label] = {
        isEditable:false,
        isDisabled:false,
        title: _f.label,
        icon: "fa-solid fa-circle",
        type: (_f.form || "text"),
        formControlName: _f.label,
        displayVal: null,
        //placeholder: (this._titleCase.transform((_f.form == "number" ? '0' : _f.label) || "")),
        placeholder: "",
        styleClass:"w-full",/*
        form: _f.form */
        required: _f.required,
        //TODO: numberConfig default for number
        ...(_f.form == "number" ? {numberConfig: {mode: 'decimal', minFractionDigits: 1}} : {}),
        ...(_f.form == "textarea" && formProperties[_f.label]?.textArea ? {textArea: formProperties?.[_f.label]?.textArea} : {})
      }

      if(GridService.ObjectFields.includes(_f.form)){
        _overrides[_f.label] = {autoConfig: {title: 'name'}, displayVal: `${_f.label}.name`, data: `${_f.label}.name`}; //RT: where is data used for?
      }
    });

    if(formProperties){
      _overrides = {..._overrides, ...formProperties};
    }

    for (const key in _overrides) {
      if (Object.prototype.hasOwnProperty.call(_overrides, key)) {
        const element = _overrides[key];
        Object.keys(element).forEach((_k) => {
          if(_tmp[key]){
            if(_k == "displayVal" || (_k == "data" && element.type != "chip-labels"/*  && element.type != "address" */)){ //todo radio

              if(this._helper.isNotEmpty(data[key])){
                const _d = element[_k];
                _tmp[key][_k] = _getDisplayByKey(_d, data);
              }
            } else{
              _tmp[key][_k] = element[_k];
            }
          }
        });
      }
    }
    return _tmp;

    function _getDisplayByKey(_d: string, data): any{
      let _tmpObjChanged = false;
      let _tmpObj: any = data.__data__ || data.item;
      if(typeof _d == 'string'){
        const _dArr: any[] = (_d?.split(".") || []); //"address.shipping" => ["address", "shipping"]
        /** e.g. the _data.item holds
         * 1.) account_id: {name: string, id: number},
         * 2.) or __data__ : {account_id: {name: string, id: number}}
         */
        _dArr.forEach(_dd => {
          if(this._helper.isNotEmpty(_tmpObj?.[_dd])){
            _tmpObj = _tmpObj?.[_dd];
            _tmpObjChanged = true;
          } else{
            _tmpObj = null;
            _tmpObjChanged = true;
          }
        });
      }

      return _tmpObjChanged ? _tmpObj : '';
    }
  }


  public getIpAddress(){

    /* let _request    = new HttpClient(this._handler);
    const ip_req$   = _request.get("https://api.ipify.org?format=json")
    const data    = {
      ip_add        : null,
      country_name  : null,
      country_code  : null,
      city          : null,
      time_zone     : null,
      os            : this.getOSInfo()['os'],
      browser       : this.getOSInfo()['browser']
    }
    this._subs.id('ip').sink = ip_req$.subscribe({
      next : (value) => {
        data.ip_add = value['ip']
      },
      complete : () => {

        const geo_req$  = _request.get(`https://api.findip.net/${data.ip_add}/?token=67cfb253edfa438abf977f656ba358af`)

        this._subs.id('geo').sink = geo_req$.subscribe({
          next : (value) => {
            console.log(value)
            data.country_code = value['country_code'];
            data.country_name = value['country_name'];
            data.city         = value['city'];
            data.time_zone    = value['time_zone'];

          },
          complete : () => {
            this._subs.id('ip').unsubscribe();
            this._subs.id('geo').unsubscribe();
          },
          error : (err) => {
            this._subs.id('ip').unsubscribe();
            this._subs.id('geo').unsubscribe();
          },
        })
      },
      error : (err) => {
        this._subs.id('ip').unsubscribe();
        this._subs.id('geo').unsubscribe();
      },
    });

    return data;

 */

  }
  getOSInfo(): any {
    const platform = window.navigator.platform;

    const device = {
      os : null,
      browser : window.navigator.userAgent
    }


    // Determine the OS based on the platform and user agent
    if (platform.startsWith('Win')) {
      device.os = 'Windows';
    } else if (platform.startsWith('Mac')) {
      device.os = 'MacOS';
    } else if (platform.startsWith('Linux')) {
      device.os = 'Linux';
    } else if (platform.includes('iPhone') || platform.includes('iPad') || platform.includes('iPod')) {
      device.os = 'iOS';
    } else if (platform.includes('Android')) {
      device.os = 'Android';
    } else {
      device.os = 'Unknown';
    }

    return device;

  }


}
