import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './search.component';
import { SearchDetailComponent } from './search-detail/search-detail.component';
import { CoreModule } from '@eagna-io/core';
import { LibraryModule } from '@library/library.module';
import { SearchRoutingModule } from './search-routing.module';



@NgModule({
  declarations: [
    SearchComponent,
    SearchDetailComponent
    ],
  imports: [
    CommonModule,
    CoreModule,
    LibraryModule,
    SearchRoutingModule
  ]
})
export class SearchModule { }
