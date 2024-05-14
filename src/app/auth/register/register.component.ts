import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SubSink } from 'subsink2';
import { NavigationExtras, Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit, OnDestroy {

  public registerForm: FormGroup;
  public subs : SubSink = new SubSink();

  constructor(private _auth: AuthService, private _router: Router) {

    this.registerForm = new FormGroup({
      username: new FormControl(null, [Validators.required, Validators.minLength(4)]),
      password: new FormControl(null, [Validators.required, Validators.minLength(4)]),
      email: new FormControl(null, [Validators.required, Validators.minLength(4)]),
      first_name: new FormControl(null, [Validators.required, Validators.minLength(4)]),
      last_name: new FormControl(null, [Validators.required, Validators.minLength(4)])
    })

  }

  ngOnInit(): void {
    this._auth._lib.pageTitle("Register");
  }

  register() {
    let register$ = this._auth.signUp(this.registerForm.getRawValue());
    this.subs.sink = register$.subscribe({
      next: res => {
        const navigationExtras: NavigationExtras = {
          state: res
        };
        this._router.navigate(['auth/verify'], navigationExtras);
      },
      complete: () => { },
      error: err => { }
    });


  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
