import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatsComponent } from './chats/chats.component';
import { OtpTokenComponent, TimePipe } from './otp-token/otp-token.component';
import { NotificationComponent } from './notification/notification.component';
import { CoreModule } from '@eagna-io/core';
import { NgOtpInputModule } from 'ng-otp-input';




@NgModule({
  declarations: [
    ChatsComponent,
    OtpTokenComponent,
    NotificationComponent,
    TimePipe
  ],
  imports: [
    CommonModule,
    CoreModule,
    NgOtpInputModule,

  ],
  exports: [
    ChatsComponent,
    OtpTokenComponent,
    NotificationComponent
  ]
})
export class CommunicationModule { }
