import { Injectable } from '@angular/core';
import { Sidebar } from 'primeng/sidebar';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RightbarService {
  public  sidenav     : Sidebar = null;
  public  drawer      : Sidebar = null;
  public  drawers     : Sidebar[] = [];
  public  drawerDict  : any = {};
  private currentapp  : Subject<any> = new Subject<any>();

  constructor() { }

  public registerDrawer(strId : string, drawer: Sidebar) {
    this.drawerDict = this.drawerDict != null ? this.drawerDict : {};
    this.drawerDict[strId] = drawer;
  }

  public setSidenav(sidenav: Sidebar) {
    this.sidenav = sidenav;
  }
  public setDrawer(drawer: Sidebar, index?: number) {
    if (index == null || index == undefined) {
      this.drawer = drawer;
    } else {
      this.drawers[index] = drawer;
    }
  }
/*   public open() {
    if (this.sidenav != null) { return this.sidenav.visible = true; }
  }
  public close() {
    if (this.sidenav != null) { return this.sidenav.visible = false; }
  } */
  public toggle(): void {
    if (this.sidenav != null) { this.sidenav.visible = this.sidenav.visible?false:true; }

  }
  public newToggle(app, data?:any): void {
    if (this.sidenav != null) {
      //this.sidenav.visible = this.sidenav.visible?false:true;
      this.sidenav.visible = true;
    }
    this.openDrawer(app);
    this.currentapp.next({ message: app, data:data, visible:this.sidenav.visible });
  }

  public onApp(): Observable<any> {
    return this.currentapp.asObservable();
  }
  public openDrawer(strId ?: string): void {
    if (this.drawer != null && strId == null) { this.sidenav.visible = true; }
    if (strId != null && this.drawerDict != null && this.drawerDict[strId] != null) {
      this.drawerDict[strId].visible = true;
    }
  }
  public closeDrawer(strId ?: string): void {
    if (this.drawer != null && strId == null) { this.sidenav.visible = false; }
    if (strId != null && this.drawerDict != null && this.drawerDict[strId] != null) {
      this.drawerDict[strId].visible = false;
    }
  }
  public toggleDrawer(strId ?: string): void {
    if (this.drawer != null && strId == null) { this.sidenav.visible = this.sidenav.visible?false:true; }
    if (strId != null && this.drawerDict != null && this.drawerDict[strId] != null) {
      this.drawerDict[strId].visible = this.drawerDict[strId].visible?false:true;
    }
  }
  public getContactFormStructure(){
    return [
      {
        header    : "Details",
        fields    : ['addressBy', 'title', 'first_name', 'last_name', 'contact_partner'],
      },
      {
        header    : "Contact",
        fields    : ['company', 'email', 'email_2', 'mobile', 'phone', 'phone_2', 'address'],
      },
      {
        header    : "Others",
        fields    : ['gender','date_of_birth'],
      }
    ]
  }
  public getOrgFormStructure(){
    return [
      {
        header    : "Details",
        fields    : ['category', 'name', 'legal_form', 'language',  "suffix_name"],
        isTwoLine : true
      },
      {
        header    : "Legal Details",
        fields    : ['registration_no','vat_no', 'vat_id_no'],
        isTwoLine : true
      },
      {
        header    : "Address",
        fields    : ['reg', 'billing', 'shipping'],
        isTwoLine : false
      },
      {
        header    : "Contact Details",
        fields    : ["email", "email_2", "mobile", "fax_number", "phone", "phone_2"],
        isTwoLine : false
      }
    ]
  }
}
