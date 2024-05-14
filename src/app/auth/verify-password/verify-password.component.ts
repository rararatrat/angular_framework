import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'eg-verify-password',
  templateUrl: './verify-password.component.html',
  styleUrls: ['./verify-password.component.scss']
})
export class VerifyPasswordComponent implements OnInit {
  private _subscription = new Subscription();
  public isVerified     : boolean = false;
  public loading        : boolean = true;
  public linkSent       : boolean = false;

  public user_details   : any;
  public showText       : boolean = false;
  public form           : FormGroup;
  public password_1     : any = null;
  public password_2     : any = null;
  public passwordMatch  : boolean = false;

  public username       : any = null;
  public usernameValid  : boolean = false;
  public msg            : any = null;
  public orgDetails     : any;

  constructor(  private _router: Router,
                private _app : AppService,
                private _route: ActivatedRoute,
                private _auth  : AuthService,
                private _fb: FormBuilder) {

      this.loading = true;

      this._subscription.add(this._route.queryParams.subscribe({
        next: res => {
          if(Object.keys(res).length != 0){
            this.user_details = res;
          }else {
            this.isVerified = null
          }
        }
      }));
    }

  ngOnInit(): void {
    this._auth._lib.pageTitle("Verify Password");
    /* this.loading = true */
    this.form =this._fb.group({
      password_1: new FormControl(null, [Validators.required, Validators.minLength(4)]),
      password_2: new FormControl(null, [Validators.required, Validators.minLength(4)])
    })
    this._subscription.add(
      this._app.orgSubject.subscribe(res => {
        this.orgDetails = res;
        setTimeout(() => {
          this.loading = false;
        }, 10);

      })
    );
  }

  changePwd(){
    //this.user_details.append({password: this.password_2});
    const password = {password: this.password_2};
    const user = {...this.user_details, ...password}
    this._auth.verifyPassword(user).subscribe({
      next : (res) => {
        console.log(res)
      },
      error : err => {
        this.loading = false;
        this.isVerified = false;
        this.msg = err.error.error.details.detail;
      },
      complete : () => {
        this.isVerified = true;
      }
    })

  }

  sendResetPasswordLink(){
    const params = {login: this.username};

    this._auth.resetPasswordLink(params).subscribe({
      next : (res) => {
        this.msg = res.content
      },
      error : err => {
        this.loading = false;
        this.isVerified = null;
        this.usernameValid = null;
        this.msg = err.error.error.details.detail;
        //console.log()
      },
      complete : () => {
        this.isVerified = null;
        this.linkSent = true;
      }
    })
  }

  validatePwd(password, value){
    if(password == "1"){
      this.passwordMatch = this.password_1 == value;
    }else {
      this.passwordMatch = this.password_2 == value && this.password_2 != null;
    }
  }

  validateUsername(value){
    const newStr = new String(value)
    this.usernameValid = newStr.length > 3 ? true : false;
  }

  togglePassword(){
    this.showText = this.showText==true?false:true;
  }
}
