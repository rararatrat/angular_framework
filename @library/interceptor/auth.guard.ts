import { Injectable } from "@angular/core";
import { CanActivate, Router } from "@angular/router";
import { LibraryService } from "@library/service/library.service";
import { AuthService } from "../../src/app/auth/auth.service";


@Injectable({ providedIn: "root" })
export class AuthGuard implements CanActivate {
  constructor(private _authService: AuthService, private _router: Router, private _lib: LibraryService) { }

  canActivate(): boolean {
    // console.log(this._authService.getUser());
    // if (this._authService.isAuthorized(["apple", "development engineer"])) {

    if (this._authService.isLoggedIn()) {
      return true;
    } else {
      if(!this._lib.getLocalStorage("landedUrl")){
        console.log(this._lib.getLocalStorage("landedUrl"));
        this._lib.setLocalStorage("landedUrl", window.location.hash.slice(1));
      }
      this._router.navigate(["/auth/login"]);
      return false;
    }
  }

  /*canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
   canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canDeactivate(
    component: unknown,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return true;
  }
  canLoad(
    route: Route,
    segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return true;
  } */
}
