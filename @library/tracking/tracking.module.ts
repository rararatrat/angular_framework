import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UpdatesComponent } from './updates/updates.component';
import { CommentsComponent } from './comments/comments.component';
import { LogsComponent } from './logs/logs.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CoreModule } from '@eagna-io/core';
import { FilesComponent } from './files/files.component';
import { ContentDisplayModule } from '@library/content-display/content-display.module';

@NgModule({
  declarations: [
    UpdatesComponent,
    CommentsComponent,
    LogsComponent,
    FilesComponent
  ],
  imports: [
    CommonModule,
    CoreModule,
    FormsModule,
    ReactiveFormsModule,
    ContentDisplayModule

  ],
  exports: [
    UpdatesComponent,
    CommentsComponent,
    LogsComponent
  ]
})
export class TrackingModule { }
