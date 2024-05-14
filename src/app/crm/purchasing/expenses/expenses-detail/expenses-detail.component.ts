import { ChangeDetectorRef, Component, Input, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Core, GridResponse, ResponseObj } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, FormStructure, IPositionPreviewData, objArrayType } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription, tap } from 'rxjs';
import { Purchasing } from '../../purchasing';
import { PositionPreviewComponent } from 'src/app/position-preview/position-preview.component';
import { TplDesignerComponent } from 'src/app/settings/templates/tpl-designer/tpl-designer.component';

@Component({
  selector: 'eg-expenses-detail',
  templateUrl: './expenses-detail.component.html',
  styleUrls: ['./expenses-detail.component.scss']
})
export class ExpensesDetailComponent {

  detailsConfig: DetailsConfig;
  config: DetailsContainerConfig;

  constructor(
    private _ws: WrapperService,
    private _fb: FormBuilder,
    private _cd: ChangeDetectorRef,
    private _crm: CrmService,
    private _activatedRoute: ActivatedRoute,
    private _dialogService: DialogService,
    @Optional() public ref: DynamicDialogRef,
    @Optional() public dialogConfig : DynamicDialogConfig<any>){
  }

  @Input() params;
  @Input() data;

  public loading = true;
  public fp: {formProperties: objArrayType, formStructure: (string | FormStructure)[]};
  public mode: "add" | "edit" | "view";
  private _renderedType: string;
  private _ref: DynamicDialogRef;
  private _subs = new Subscription();

  ngOnInit(){
    const that = this;
    this._renderedType = this._ws.libraryService.getRenderedType(this.dialogConfig, this.data);
    this.mode = this._renderedType == "route" ? "view" : this.dialogConfig?.data?.mode;
    this.fp = Purchasing.getExpenseProperties();

    const _itemId = this._renderedType == "route" ? this._activatedRoute?.snapshot?.params?.['id'] : (this.dialogConfig?.data?.item?.id);
    let _reinit = false;
    this.config = {
      hasHeader: true,
      showDetailbar: true,
      hasUpdates    : true,
      updateApi$    : (param, method, nextUrl)   => {
        return this._crm.project_updates(param, method, nextUrl);
      },
      hasComments   : true,
      commentsApi$  : (param, method, nextUrl)   => {
        return this._crm.project_comments(param, method, nextUrl);
      },
      hasLogs       : true,
      logsApi$      : (param, method, nextUrl)   => {
        return this._crm.project_logs(param, method, nextUrl);
      },
      header: Core.Localize('manual_entry'),
      params: {...this.params, limit: 100},
      itemId        : _itemId,
      detailsApi$     : (param, method, nextUrl)   => {
        console.log({param, method, nextUrl});
        if(method == 'patch'){
          const _toUpdateParam = Object.assign({}, param);
          delete _toUpdateParam.id;
          const _key = Object.keys(_toUpdateParam)?.[0];
          if(['base_currency_amt', 'exchange_rate', 'amount'].includes(_key)){
            _reinit = true;
            const _fg = this.detailsConfig.formGroup;
            switch(_key){
              case 'base_currency_amt':
                _toUpdateParam.amount = (_fg.get('exchange_rate')?.value || 0) * _toUpdateParam[_key];
                _fg.get('amount')?.setValue(_toUpdateParam.amount, {emitEvent: false});
                break;
              case 'exchange_rate':
                _toUpdateParam.amount = (_fg.get('base_currency_amt')?.value || 0) * _toUpdateParam[_key];
                _fg.get('amount')?.setValue(_toUpdateParam.amount, {emitEvent: false});
                break;
              case 'amount':
                _toUpdateParam.exchange_rate = _toUpdateParam[_key] / (_fg.get('base_currency_amt')?.value || 0);
                _fg.get('exchange_rate')?.setValue(_toUpdateParam.exchange_rate, {emitEvent: false});
                break;
            }
            param = {...param, ..._toUpdateParam};
          }
        }
        return this._crm.purchasing_expenses(param, method, nextUrl).pipe(tap((res: ResponseObj<GridResponse>) => {
          if(res.status.status_code == 201 && _reinit){
            this.detailsConfig.isLoading = true;
            this.loading = true;
            setTimeout(() => {
              this.detailsConfig.isLoading = false;
              this.loading = false;
            })
          }
        }))
      },
      actionItems: [
        {
          label: Core.Localize('Preview'),
          icon: "fa-solid fa-magnifying-glass-dollar",
          styleClass : "text-lg",
          command : (event) => {
            const _dialogConf = <DynamicDialogConfig<IPositionPreviewData>>{
              data: {
                item: this.detailsConfig?.data,
                template_type: 'expenses'
              },
              header: Core.Localize('expense'),
              showHeader: true,
              maximizable: true,
              width: '85vw',
              styleClass: 'bg-primary-faded'
            };
            this._ref = this._dialogService.open(PositionPreviewComponent, _dialogConf);
          },
        },
        {
          label: Core.Localize('edit', {item: Core.Localize('template')}),
          icon: "fa-solid fa-pen-to-square",
          styleClass : "text-lg",
          command : (event) => {
            const _dialogConf = <DynamicDialogConfig<IPositionPreviewData>>{
              data: {
                item: this.detailsConfig?.data,
                template_type: 'expenses'
              },
              header: Core.Localize('expense'),
              showHeader: true,
              maximizable: true,
              width: '85vw',
              styleClass: 'bg-primary-faded'
            };
            this._ref = this._dialogService.open(TplDesignerComponent, _dialogConf);
          },
        }
      ],
      onApiComplete   : (param, event) => {
        this.loading = false;
      },
      formProperty: {
        formProperties: this.fp.formProperties,
        formStructure: this.fp.formStructure,
      },
    }

    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._ws, cdr: this._cd});
  }

  onSend() {
    /* RT enable when edit mode
    const rawValue = this.detailsConfig.formGroup.getRawValue();
    console.log({rawValue});
    this._subs.add(this.detailsConfig?.api(rawValue, "patch").subscribe((res) => {
      this._ws.helperService.gotoPage({pageName: ['..'], extraParams: {relativeTo: this._activatedRoute}})
    })); */
  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  public toggle(index){
    this.fp.formStructure[index]['collapsed'] = !this.fp.formStructure[index]['collapsed'];
  }

  frmCtrlUpdated($event: {data: any, formControl: string}) {
  }

  ngOnDestroy(){
    this._subs.unsubscribe();
  }
}
