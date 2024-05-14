import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { SearchComponent } from "./search.component";
import { SearchDetailComponent } from "./search-detail/search-detail.component";

const routes: Routes = [
  {path: '', component: SearchComponent, runGuardsAndResolvers: "paramsOrQueryParamsChange",
    data: {appId: 1, sidebarLoaderId: 'eag-search',  title: 'titles.search' },
    children:[
      {path: 'details', component: SearchDetailComponent, data: {title: 'titles.details' }, runGuardsAndResolvers: "paramsOrQueryParamsChange" },

    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SearchRoutingModule { }
