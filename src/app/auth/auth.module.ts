import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpRequestsInterceptor } from '@library/interceptor/http-request.interceptor';
import { AuthService } from './auth.service';
import { CoreModule } from '@eagna-io/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LogoutComponent } from './logout/logout.component';
import { RegisterComponent } from './register/register.component';
import { VerifyComponent } from './verify/verify.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { VerifyPasswordComponent } from './verify-password/verify-password.component';

const services    : any = [
  {provide: HTTP_INTERCEPTORS, useClass: HttpRequestsInterceptor, multi: true },
  AuthService
]

@NgModule({
  declarations: [
    LoginComponent,
    LogoutComponent,
    RegisterComponent,
    VerifyComponent,
    VerifyEmailComponent,
    VerifyPasswordComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class AuthModule { }
