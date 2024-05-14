import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserbarComponent } from './userbar/userbar.component';
import { RightbarComponent } from './rightbar/rightbar.component';
import { CoreModule } from '@eagna-io/core';
import { RightbarService } from './rightbar/rightbar.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommunicationModule } from '@library/communication/communication.module';

/* const component : any = [
  UserbarComponent,
  RightbarComponent

];
const module : any = [
  CommonModule,
  CoreModule,

];

const service : any = [
    RightbarService
]


@NgModule({
    declarations: [].concat(component),
    exports: [].concat(component),
    imports: [].concat(module),
    providers: [].concat(service),
}) */

@NgModule({
  declarations: [
    UserbarComponent,
    RightbarComponent,
  ],
  imports: [
    CommonModule,
    CoreModule,
    CommunicationModule
  ],
  exports: [
    UserbarComponent,
    RightbarComponent
  ]
})
export class NavigationModule { }
