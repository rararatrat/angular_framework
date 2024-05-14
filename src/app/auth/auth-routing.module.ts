import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { LogoutComponent } from './logout/logout.component';
import { RegisterComponent } from './register/register.component';
import { VerifyComponent } from './verify/verify.component';
import { VerifyEmailComponent } from './verify-email/verify-email.component';
import { VerifyPasswordComponent } from './verify-password/verify-password.component';

const routes: Routes = [
  {path: 'login', component: LoginComponent },
  {path: 'logout', component: LogoutComponent },
  {path: 'register', component: RegisterComponent },
  {path: 'verify', component: VerifyComponent },
  {path: 'verify-email', component: VerifyEmailComponent },
  {path: 'verify-password', component: VerifyPasswordComponent },
  {path: 'forgotPassword', component: VerifyPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AuthRoutingModule { }
