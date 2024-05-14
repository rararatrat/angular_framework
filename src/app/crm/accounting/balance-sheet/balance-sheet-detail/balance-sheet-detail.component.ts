import { ChangeDetectorRef, Component, Input, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Core } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, FormStructure, objArrayType } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { Accounting } from '../../accounting.static';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'eg-balance-sheet-detail',
  templateUrl: './balance-sheet-detail.component.html',
  styleUrls: ['./balance-sheet-detail.component.scss']
})
export class BalanceSheetDetailComponent {
  detailsConfig: DetailsConfig;
  config: DetailsContainerConfig;
  
  constructor(
    private _ws: WrapperService,
    private _fb: FormBuilder,
    private _cd: ChangeDetectorRef,
    private _crm: CrmService,
    private _activatedRoute: ActivatedRoute,
    @Optional() public ref: DynamicDialogRef,
    @Optional() public dialogConfig : DynamicDialogConfig<any>){
  }
    
  @Input() params;
  @Input() data;

  public loading = true;
  public fp: {formProperties: objArrayType, formStructure: (string | FormStructure)[]};
  public mode: "add" | "edit" | "view";
  private _renderedType: string;
  private _subs = new Subscription();
    
  ngOnInit(){
    const that = this;
    this._renderedType = this._ws.libraryService.getRenderedType(this.dialogConfig, this.data);
    this.mode = this._renderedType == "route" ? "view" : this.dialogConfig?.data?.mode;
    this.fp = Accounting.getBalanceSheetFormProperties();

    const _itemId = this._renderedType == "route" ? this._activatedRoute?.snapshot?.params?.['id'] : (this.dialogConfig?.data?.item?.id);
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
      detailsApi$     : (param, method, nextUrl)   => this._crm.balance_sheets(param, method, nextUrl),
      onApiComplete   : (param, event) => {
        //setTimeout(() => {
          this.loading = false;
        //})
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

  frmCtrlUpdated($event: {data: any, formControl: string}) {}

  ngOnDestroy(){
    this._subs.unsubscribe();
  }
}
