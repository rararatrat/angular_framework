import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.scss']
})
export class VerifyComponent implements OnInit, OnDestroy {

getEmail(user_details: any) {
 return `<b [innerHTML]="${user_details?.email || 'un@kn.own'}"></b>`;
}
  private _verify_params : any;
  private _subscription = new Subscription();
  public isVerified : boolean = false;
  public loading : boolean = false;
  public user_details : any = {};
  public orgDetails     : any;

  constructor(private _router: Router, private _route: ActivatedRoute, private _app : AppService, private _auth  : AuthService) {
    this._subscription.add(this._route.queryParams.subscribe({
      next: queryParamsResult => {
        this._verify_params = queryParamsResult
      }
    }));

    this.user_details = this._router.getCurrentNavigation()?.extras?.state;

   }

  ngOnInit(): void {
    this._auth._lib.pageTitle("Verify User");
    this._subscription.add(
      this._app.orgSubject.subscribe(res => {
        this.orgDetails = res;
        setTimeout(() => {
          this.loading = false;
        }, 100);

      })
    )
    if(Object.keys(this._verify_params).length !== 0){
      this.loading = true;
      this._subscription.add(this._auth.verifyUser(this._verify_params).subscribe({
        next: res => {},
        error : err => {},
        complete: () => {
          this.isVerified = true;
          this.loading = false;
        }
      }));
    }

  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
