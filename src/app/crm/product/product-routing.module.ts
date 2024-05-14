import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductTypeComponent } from './product-type/product-type.component';
import { InventoryAreaComponent } from './inventory-area/inventory-area.component';
import { InventoryLocationComponent } from './inventory-location/inventory-location.component';
import { ArticleComponent } from './article/article.component';
import { ArticleDetailComponent } from './article/article-detail/article-detail.component';
import { ProductComponent } from './product.component';

const routes: Routes = [
  { path: '', component: ProductComponent, data: { title: "titles.product_item", pluralCount: 2}, runGuardsAndResolvers: "paramsOrQueryParamsChange",
    children :[
      { path: 'article', component: ArticleComponent, data: { title: "titles.product_item", pluralCount: 2 }, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        children: [{ path: ':id', component: ArticleDetailComponent, data: { title: "titles.product_article_detail" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}]},
      
      { path: 'article_type', component: ProductTypeComponent, data: { title: "titles.product_type" }, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        /* children: [{ path: ':id', component: ProductTypeDetailComponent, data: { title: "titles.product_type_detail" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}] */},
      
      { path: 'stock_area', component: InventoryAreaComponent, data: { title: "titles.stock_area" }, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        /* children: [{ path: ':id', component: InventoryAreaDetailComponent, data: { title: "titles.inventory_area_detail" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}] */},
      
      { path: 'stock_location', component: InventoryLocationComponent, data: { title: "titles.stock_location" }, runGuardsAndResolvers: "paramsOrQueryParamsChange",
        /* children: [{ path: ':id', component: InventoryLocationDetailComponent, data: { title: "titles.stock_location_detail" }, runGuardsAndResolvers: "paramsOrQueryParamsChange"}] */},
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
