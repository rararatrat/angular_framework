import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpClient} from '@angular/common/http';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, tap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ConfirmDialogResult, CONFIRM_DIALOG_TYPE, CustomDialogConfig, EagnaListener, HelperService } from '@eagna-io/core';
import { LibraryService } from '@library/service/library.service';
import { Location } from '@angular/common';

@Injectable()
export class HttpRequestsInterceptor implements HttpInterceptor {
  //private _resentForRefresh: boolean;
  private _resentForRefresh = false;
  private _refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private _retried = false;
  private _reloadedOnce = false;
  
  constructor(
    private _messageService: MessageService,
    private _helper: HelperService,
    public _eagnaListener: EagnaListener,
    private _lib: LibraryService,
    private _location: Location,
  ) {}
  public customDialogConfig: CustomDialogConfig = {
    visible: true,
    position: 'top',
    content: `You have requested an operation that requires e-mail verification. An email has been sent to your account.\nPlease provide the token in the field below: `,
    header: `OTP Required`,
    dialogType: CONFIRM_DIALOG_TYPE.TOKEN,
    onConfirm: (tokenDialogResult: ConfirmDialogResult) => {

    },
    onCancel: (cancelData: any) => {
    }
  };

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const _locPath = this._location.path();
    const token = localStorage.getItem('at');
    if (this._helper.isNotEmpty(token) && (!request.params?.get('noTokenRequired') || request.params.get('noTokenRequired') !== 'true')) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    else {
      request = request.clone({
        params: null,
      });
    }
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if(!this._retried){
          this._retried = true;
          if (err.status === 401) { } else if (err.status == 418) {
            this.customDialogConfig.data = { err, request }
            this._eagnaListener.customDialogOpened$.emit(this.customDialogConfig)
          } else if(err.status === 0 || err.statusText == 'Unknown Error'){
            let _redirectTo = '/';
            const _tmp = (_locPath != "") ? _locPath : "/";
            if(!['/auth/login', '/login', ''].includes(_tmp)){
              _redirectTo = _tmp;
            }
            localStorage.clear();
            this._lib.setLocalStorage('lastUrl', _redirectTo);
            //this._helper.gotoPage({pageName: ["/auth/login"], extraParams: {}});
            this._helper.gotoPage({pageName: ["error"], extraParams: {}});
          }

          let error;
          let summary;

          if (this._helper.isNotEmpty(err.error?.content?.results)) {
            error = err.error.content.results;
          } else {
            if (this._helper.isNotEmpty(err.error?.error?.details)) {
              summary = err.error?.error?.message;
              error = err.error.error.details;
            } else {
              error = err.message || err.error.message || err.statusText;
            }
          }

          const printError = typeof error != "string" ? error?.detail?.replace("'", "") : error;
          /* console.log({err}) */
          if(err?.error?.error?.details?.detail == 'Invalid token header. No credentials provided.' && err?.error?.error?.status_code == 401){
            if (!this._resentForRefresh) {
              this._resentForRefresh = true;
              this._refreshTokenSubject.next(null);

              const token = this._lib.getLocalStorage("rt");
              if (token)
                return this._lib.refreshToken(token).pipe(
                  switchMap((res: any) => {
                    this._resentForRefresh = false;
                    this._lib.setLocalStorage("at", res.access_token);
                    this._lib.setLocalStorage("rt", res.refresh_token);
                    this._refreshTokenSubject.next(res.access_token);

                    //return next.handle(this.addTokenHeader(request, newToken.accessToken));
                    return next.handle(request.clone({
                      setHeaders: {
                        Authorization: `Bearer ${res.access_token}`,
                      },
                    }));
                  }),
                  catchError((err) => {
                    console.error("**** HTTP Interceptor ****", {err, summary, printError});
                    this._messageService.add({ severity: 'error', summary: (summary || 'Error'), detail: printError });
                    this._resentForRefresh = false;

                    let _redirectTo = '/';
                    const _tmp = (_locPath != "") ? _locPath : "/";
                    if(!_tmp || ['/auth/login', '/login', ''].includes(_tmp)){
                      //do nothing
                    } else{
                      _redirectTo = _tmp;
                    }
                    localStorage.clear();
                    this._lib.setLocalStorage('lastUrl', _redirectTo);

                    /* this._router.navigate(["/auth/login"]); */
                    setTimeout(() => {
                      location.reload();
                    });
                    return throwError(() => err);
                  })
                );
            }

            return this._refreshTokenSubject.pipe(
              filter(token => token !== null),
              take(1),
              switchMap((token) => {
                return next.handle(request.clone({
                  setHeaders: {
                    Authorization: `Bearer ${token}`,
                  },
                }))
              }
              )
            );
          } else{
            let _err_specific;
            if(typeof err?.error?.error?.details=='object'){
              try {
                _err_specific = JSON.stringify(err?.error?.error?.details);
              } catch (error) {}
            }
            this._messageService.add({ severity: 'error', summary: (summary || 'Error'), detail: _err_specific || printError });
            /* if(!this._reloadedOnce){
              this._reloadedOnce = true;
              setTimeout(() => {
                location.reload();
              });
            } */
          }
        } else{
          let _err_specific;
          if(typeof err?.error?.error?.details=='object'){
            try {
              _err_specific = JSON.stringify(err?.error?.error?.details);
            } catch (error) {}
          }
          this._messageService.add({ severity: 'error', summary: 'Error', detail: _err_specific || '' });
        }
        return throwError(() => err);
      }),

    );
  }
}
