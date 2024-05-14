import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContainerComponent } from './container/container.component';
import { DetailsContainerComponent } from './details-container/details-container.component';
import { CoreModule } from '@eagna-io/core';
import { TrackingModule } from '@library/tracking/tracking.module';
import { AddComponent } from './add/add.component';
import { MainContainerComponent } from './main-container/main-container.component';
import { ContentDisplayModule } from '@library/content-display/content-display.module';
import { NavigationModule } from '@library/navigation/navigation.module';
import { GridListComponent } from './grid-list/grid-list.component';
import { TemplateComponent } from './template/template.component';
import { EmailRendererComponent } from './email-renderer/email-renderer.component';
import { FormRendererComponent } from './form-renderer/form-renderer.component';
import { ProcessFormComponent } from './process-form/process-form.component';

const component : any = [
  ContainerComponent,
  DetailsContainerComponent,
  MainContainerComponent,
  TemplateComponent,
  AddComponent,
  GridListComponent,
  EmailRendererComponent,
  FormRendererComponent,
  ProcessFormComponent
];
const module : any = [
  CommonModule,
  CoreModule,
];
const appmodule : any = [
  NavigationModule,
  ContentDisplayModule,
  TrackingModule
];

const service : any = [

]


@NgModule({
    declarations: [].concat(component),
    exports: [].concat(component),
    imports: [NavigationModule].concat(module, appmodule),
    providers: [].concat(service),
})
export class ContainerCollectionModule { }
