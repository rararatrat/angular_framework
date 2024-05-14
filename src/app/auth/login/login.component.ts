import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { User } from '@library/class/user';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink2';
import { WrapperService } from '@library/service/wrapper.service';
import { LibraryService } from '@library/service/library.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  public loading : boolean = false;
  public user : User;
  public loginForm : FormGroup;
  public subs : SubSink = new SubSink();

  constructor(public _auth: AuthService, private _wr: WrapperService, private _cdr: ChangeDetectorRef){
    this.user = new User(this._auth);
  }

  ngOnInit(): void {
    this._auth._lib.pageTitle("Log-In");
    this.loginForm = new FormGroup({
      username: new FormControl(null, [Validators.required, Validators.minLength(4)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(4)])
    })
  }

  public login(){
    const username = this.loginForm.get("username").value;
    const password = this.loginForm.get("password").value;
    this.subs.sink = this._auth.login(username, password).subscribe({
      next  :(res) => {},
      error :(err) => {},
      complete :() => {
        this._cdr.detectChanges();
      },
    })
  }

  public socialSignIn(param){
    this.user.socialSignIn(param);
  }

  public sendEmail(){

  }

  public toggleRegLogIn(){

  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


}
