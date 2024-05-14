import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, Optional } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Core, RouteObserverService, SharedService, apiMethod } from '@eagna-io/core';
import { ContainerConfig, DetailsContainerConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MenuItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ProfileService } from '../profile.service';
import { DetailsConfig } from '@library/class/details-config';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from '@library/class/user';
import { AuthService } from 'src/app/auth/auth.service';
import { Profile } from '../profile.static';
import { SubSink } from 'subsink2';
import { tap } from 'rxjs';

@Component({
  selector: 'eg-profile-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent extends RouteObserverService implements OnInit, OnDestroy {
  public detailsConfig      : DetailsConfig;
  public config             : DetailsContainerConfig  = null;
  public items              : MenuItem[];
  public data               : any;
  public activeIndex        : number = 0;
  public isChanged          : boolean;
  public objArray           : any;
  public editingField       : string;
  public user               : User;
  public passwordForm       : FormGroup;
  public emailForm          : FormGroup;
  public showText           : boolean = false;
  public msg                : string;
  private _subs             : SubSink = new SubSink();


  public api = (p?: any, method?: apiMethod, nextUrl?) => this._profile.user(p, method);

  constructor(private _wr                     : WrapperService,
              private _fb                     : FormBuilder,
              private _profile                : ProfileService,
              private _auth                   : AuthService,
              private _router                 : Router,
              private _sharedService          : SharedService,
              @Optional() public ref          : DynamicDialogRef,
              @Optional() private _route      : ActivatedRoute,
              @Optional() public dialogConfig : DynamicDialogConfig){
                super(_route, _router);
                this.user = new User(_auth);
                this._sharedService.globalVars.gridListChanged = false;
  }

  onRouteReady(event, snapshot, root, params): void{}
  onRouteReloaded(event, snapshot, root, params): void{}

  ngOnInit(): void {
    this._initDetailsContainer()
    this._initForms();


  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }
  private _initForms(){
    this.passwordForm = this._fb.group({
      password_1: new FormControl(null, [
        (c: AbstractControl) => Validators.required(c),
        Validators.pattern(Profile.form_validators['password']),
      ]),
      password  : new FormControl(null, [
        (c: AbstractControl) => Validators.required(c),
        Validators.pattern( Profile.form_validators['password']),
      ])
    },
    {
      validator: this.ConfirmedValidator('password_1', 'password'),
    })

    this.emailForm = this._fb.group({
      email_1: new FormControl(null, [
        (c: AbstractControl) => Validators.required(c),
        Validators.pattern( Profile.form_validators['email']),
      ]),
      email: new FormControl(null,[
        (c: AbstractControl) => Validators.required(c),
        Validators.pattern( Profile.form_validators['email']),
      ])
    },
    {
      validator: this.ConfirmedValidator('email_1', 'email'),
    })
  }

  private _initDetailsContainer(){
    let that = this;
    const header = Core.Localize("account");
    this.data = this.dialogConfig?.data?.item;
    let profileFormProperty = Profile.getProfileAccountForm();
    this.config = {
      showNavbar      : true,
      hasHeader       : false,
      header          : header,
      subheader       : Core.Localize("dContainerSubHeader", {header}),
      dialogConfig    : this.dialogConfig,
      showDetailbar   : false,
      dialogRef       : this.ref,
      params          : {id:this.user.id},
      itemId          : this.user.id,
      detailsApi$     : (param, method, nextUrl)   => {
        return this.api(param, method, nextUrl);
      },
      formProperty    : {
        includedFields  : profileFormProperty['includedFields'],
        formProperties  : profileFormProperty['formProperties']
      },
      sidebar       : {
        header,
        items  : [
          {
            label: Core.Localize('your_details'),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize('your_details_desc'),
            selected: (this.activeIndex == 0) ? true : false,
            onClick : (event) => {
              this.activeIndex = 0;
            },
          },
          {
            label: Core.Localize('manage_password'),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize('manage_password_desc'),
            selected: (this.activeIndex == 1),
            onClick : (event) => {
              this.msg = Profile.getFormErrorMessage()['password'];
            },
          },
          {
            label: Core.Localize('change_email'),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize('change_email_desc'),
            selected: (this.activeIndex == 2),
            onClick : (event) => {
              this.msg = Profile.getFormErrorMessage()['email'];
            },
          },
          {
            label: Core.Localize('provision_uri_mfa'),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize('provision_uri_mfa_desc'),
            selected: (this.activeIndex == 3)
          },
          {
            label: Core.Localize('preference', {count: 2}),
            icon: "fa-solid fa-bullseye",
            subTitle: Core.Localize('preference_desc'),
            selected: (this.activeIndex == 4)
          },
        ]

      }
    }
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr});
  }


  public togglePassword(){
    this.showText = this.showText==true?false:true;
  }

  public updateUser(form){
    const value = form.getRawValue();
    let postParams = {id: this.user.id, ...value}
    this._subs.sink =  this._profile.user(postParams, "patch").pipe(tap()).subscribe({
      next(value) {
        this.user.details = value.content.results[0]
      },
      complete() {
        form.reset()
      },
      error(err) {

      },
    })
  }

  public afterSaved(isChanged){
    if(this.dialogConfig?.data){
      this.dialogConfig.data.isChanged = isChanged;
      this._sharedService.globalVars.gridListChanged = isChanged;
    }
  }

  override ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  ConfirmedValidator(controlName: string, matchingControlName: string) {

    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (
        matchingControl.errors &&
        !matchingControl.errors['confirmedValidator']
      ) {
        return;
      }
      if (control.value !== matchingControl.value) {

        matchingControl.setErrors({ confirmedValidator: true });

      } else {

        matchingControl.setErrors(null);

      }
    };
  }
}
