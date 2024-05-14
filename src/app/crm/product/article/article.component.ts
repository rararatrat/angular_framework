import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { IContainerWrapper } from '@library/library.interface';
import { CrmService } from '../../crm.service';
import { Core } from '@eagna-io/core';
import { ArticleDetailComponent } from './article-detail/article-detail.component';
import { ActivatedRoute } from '@angular/router';
import { Article } from './article';

@Component({
  selector: 'eg-article',
  /* templateUrl: './article.component.html',
  styleUrls: ['./article.component.scss'] */
  template: `<eg-grid-list [gridListId]="'grid-product-article'"
                [type]="type"
                [showHeader]="true"
                [(config)]="config">
              </eg-grid-list>`,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleComponent implements OnInit, OnDestroy {
  public type   : "list" | "grid" | "stats" = "grid";
  public config : IContainerWrapper;
  public form   : any =  Article.getArticleFormProperties(this);
  constructor(private _crm:CrmService, private _activatedRoute: ActivatedRoute){

    this.config = {
      reloaded : true,
      viewtype: this.type,
      params : {},
      apiService : (p, m, n?) => this._crm.product_item(p, m, n),
      title : Core.Localize("product_item", {count: 2}),
      detailComponent: ArticleDetailComponent,
      formProperties  : this.form['formProperties'],
      includedFields  : this.form['includedFields'],
      formStructure   : this.form['formStructure'],
      defaultColumns: {columns: {state: [
        "user",
        "company",
        "deliverer_code",
        "deliverer_name",
        "deliverer_description",
        "code",
        "name",
        "description",
        "purchase_price",
        "sale_price",
        "purchase_total",
        "sale_total",
        "currency",
        "tax_income",
        "tax",
        "tax_expense",
        "unit",
        "is_stock",
        "stock_location",
        "stock_area",
        "stock_nr",
        "stock_min_nr",
        "stock_reserved_nr",
        "stock_available_nr",
        "stock_picked_nr",
        "stock_disposed_nr",
        "stock_ordered_nr",
        "width",
        "height",
        "weight",
        "volume",
        "html_text",
        "remarks",
        "delivery_price",
        "article_group_id",
        "created_on",
        "updated_on",
        "files",
        "task",
        "actions"
    ]}}
    }
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

}
