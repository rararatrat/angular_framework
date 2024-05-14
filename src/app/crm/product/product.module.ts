import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { ArticleComponent } from './article/article.component';
import { ArticleDetailComponent } from './article/article-detail/article-detail.component';
import { ProductTypeComponent } from './product-type/product-type.component';
import { InventoryAreaComponent } from './inventory-area/inventory-area.component';
import { InventoryLocationComponent } from './inventory-location/inventory-location.component';
import { LibraryModule } from '@library/library.module';
import { GalleriaModule } from 'primeng/galleria';

const components = [
  ProductComponent,
  ArticleComponent,
  ArticleDetailComponent,
  ProductTypeComponent,
  InventoryAreaComponent,
  InventoryLocationComponent,
];

@NgModule({
  declarations: components,
  imports: [
    CommonModule,
    LibraryModule,
    ProductRoutingModule,
    GalleriaModule,
  ]
})
export class ProductModule { }
