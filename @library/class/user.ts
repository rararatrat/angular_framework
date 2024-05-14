import { WrapperService } from "@library/service/wrapper.service";
import { AuthService } from "src/app/auth/auth.service";
import { SubSink } from 'subsink2';

export class User {

  public subs : SubSink = new SubSink()
  private _auth : any;
  private _wr   : WrapperService;
  public permission : any;
  public isLoading : boolean = true;

  constructor(auth?:AuthService){
    this._auth = auth;
  }


  public get permissions(){

    return null;
  }
  public set permissions(data){

  }

  public get apps(){
    return this._auth.fetchApp();
  }

  public get userPreference(){
    let pref = JSON.parse(this._auth._lib.getLocalStorage("userPref"));
    return pref;
  }

  public get meta(){
    let details = JSON.parse(this._auth._lib.getLocalStorage("user"));

    return {
      id        : details.id,
      name      : `${details.first_name} ${details.last_name}`,
      first_name: details.first_name,
      last_name : details.last_name,
      email     : details.email,
      picture   : details.picture

    };
  }

  public get id(){
    let details = JSON.parse(this._auth._lib.getLocalStorage("user"));
    return details['id'];

  }
  public get details(){
    let details = JSON.parse(this._auth._lib.getLocalStorage("user"));
    return details;
  }
  public set details(param:{key, value}){
    this.details[param.key] = param.value
    this._auth._lib.setLocalStorage("user", this.details);
  }

  public get isAdmin(){
    return this.details['is_superuser'];
  }
  public set isAdmin(data:boolean){
    this.details['is_superuser'] = data;
    this._auth._lib.setLocalStorage("user", this.details);
  }

  public socialSignIn(socialAccount){
    this.isLoading = true;
    this._auth._lib.setLocalStorage("socialAuth", socialAccount);
    this.subs.sink = this._auth.socialLogin("url", socialAccount).subscribe({
      next: res => {
        location.href = res.linkUrl;
      },
      error : err => {
        this.isLoading = false;
      },
      complete : () => {
        this.isLoading = false;
      }
    })
  }

  public socialToken(socialAccount, params){
    this.isLoading = true;
    this.subs.sink =  this._auth.socialLogin("token", socialAccount, params).subscribe({
      next: res => {
        this.isLoading = false;
      },
      error: err => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }



  public destroy(){
    this.subs.unsubscribe();
  }
}
