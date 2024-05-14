import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-logout',
  template: `
              <div class="w-full h-full flex flex-column align-items-center justify-content-center">
              <div class="flex">
                <img src="../../../assets/img/eagna/eagna_black.png" alt="" class="w-30rem">
              </div>
              <div class="flex mt-5">
                <span class="font-semibold text-3xl">Successfully Logged Out!</span>
              </div>
              <div class="flex mt-2">
                <span class="font-medium text-2xl">Thank You</span>
              </div>

              <div class="flex mt-4">
                <span class="font-medium text-2xl">
                  <a [routerLink]="['/auth/login']"  rel="noopener noreferrer">Back to Login</a>
                </span>
              </div>

            </div>

  `,
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit, OnDestroy {

  constructor(private _auth: AuthService){}

  ngOnInit(): void {
    this._auth.logout();
  }

  ngOnDestroy(): void {}

}
