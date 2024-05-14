import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'eg-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit{
  private _subscription = new Subscription();
  public isVerified     : boolean = false;
  public loading        : boolean = true;
  public user_details   : any;
  public msg            : any = null;
  public orgDetails     : any;

  constructor(private _router: Router, private _route: ActivatedRoute, private _app : AppService, private _auth  : AuthService) {
    this.loading = true;

      this._subscription.add(this._route.queryParams.subscribe({
        next: res => {
            this._verify(res);
            const params = { ...this._route.snapshot.queryParams };
            delete params['user_id']
            delete params['email']
            delete params['signature']
            delete params['timestamp']
            this._router.navigate([], { queryParams: params });
          }
      }));
  }
  ngOnInit(): void {
    this._auth._lib.pageTitle("Verify Email Address");
    this._subscription.add(
      this._app.orgSubject.subscribe(res => {
        this.orgDetails = res;
        setTimeout(() => {
          this.loading = false;
        }, 100);

      })
    )
  }

  public closeWindow(){
    window.open(location.href, "_self", "");
    window.close()
  }

  private _verify(params){
    if(Object.keys(this._route.snapshot.queryParams).length > 0){
      this._auth.verifyEmail(params).subscribe({
        next : (res) => {
          this.msg = res
        },
        error : err => {
          this.loading = false;
          this.isVerified = false;
        },
        complete : () => {
          this.isVerified = true;
          this.loading = false;
        }
      })
    }

  }
}
