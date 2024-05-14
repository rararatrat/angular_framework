import { ChangeDetectorRef, Component, Input, Optional } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Core } from '@eagna-io/core';
import { DetailsConfig } from '@library/class/details-config';
import { DetailsContainerConfig, FormStructure, IPositionPreviewData, objArrayType } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CrmService } from 'src/app/crm/crm.service';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Sales } from '../../sales';
import { PositionPreviewComponent } from 'src/app/position-preview/position-preview.component';
import { TplDesignerComponent } from 'src/app/settings/templates/tpl-designer/tpl-designer.component';

@Component({
  selector: 'eg-statements-detail',
  templateUrl: './statements-detail.component.html',
  styleUrls: ['./statements-detail.component.scss']
})
export class StatementsDetailComponent {

  detailsConfig: DetailsConfig;
  config: DetailsContainerConfig;
  activeIndex = 0;

  constructor(
    private _ws: WrapperService,
    private _fb: FormBuilder,
    private _cd: ChangeDetectorRef,
    private _crm: CrmService,
    private _activatedRoute: ActivatedRoute,
    private _dialogService          : DialogService,
    @Optional() public ref: DynamicDialogRef,
    @Optional() public dialogConfig : DynamicDialogConfig<any>){
  }

  @Input() params;
  @Input() data;

  public loading = true;
  public fp: {formProperties: objArrayType, formStructure: (string | FormStructure)[]};
  public mode: "add" | "edit" | "view";
  private _renderedType: string;
  private _title = Core.Localize("statements");
  private _ref: DynamicDialogRef;
  private _subs = new Subscription();

  ngOnInit(){
    const that = this;
    this._renderedType = this._ws.libraryService.getRenderedType(this.dialogConfig, this.data);
    this.mode = this._renderedType == "route" ? "view" : this.dialogConfig?.data?.mode;
    this.fp = Sales.getStatementsFormProperties();

    const _itemId = this._renderedType == "route" ? this._activatedRoute?.snapshot?.params?.['id'] : (this.dialogConfig?.data?.item?.id);
    const header = this._title;
    this.config = {
      hasHeader: true,
      showDetailbar: true,
      hasUpdates    : true,
      showNavbar: true,
      navbarExpanded: true,
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
      detailsApi$     : (param, method, nextUrl)   => this._crm.manual_entries(param, method, nextUrl),
      actionItems: [
        {
          label:"Preview",
          icon: "fa-solid fa-magnifying-glass-dollar",
          styleClass : "text-lg",
          command : (event) => {
            const _dialogConf = <DynamicDialogConfig<IPositionPreviewData>>{
              data: {
                item: this.detailsConfig?.data,
                template_type: 'accountstatement'
              },
              header: Core.Localize('statements'),
              showHeader: true,
              maximizable: true,
              width: '85vw',
              styleClass: 'bg-primary-faded'
            };
            this._ref = this._dialogService.open(PositionPreviewComponent, _dialogConf);
          },
        },
        {
          label:"Edit Template",
          icon: "fa-solid fa-pen-to-square",
          styleClass : "text-lg",
          command : (event) => {
            const _dialogConf = <DynamicDialogConfig<IPositionPreviewData>>{
              data: {
                item: this.detailsConfig?.data,
                template_type: 'accountstatement'
              },
              header: Core.Localize('statements'),
              showHeader: true,
              maximizable: true,
              width: '85vw',
              styleClass: 'bg-primary-faded'
            };
            this._ref = this._dialogService.open(TplDesignerComponent, _dialogConf);
          },
        },
      ],
      onApiComplete   : (param, event) => {
        //setTimeout(() => {
          this.loading = false;
        //})
      },
      formProperty: {
        formProperties: this.fp.formProperties,
        formStructure: this.fp.formStructure
      },
      sidebar: {
        header,
        items : [
          {
            label:"Positions",
            icon: "fa-solid fa-file-contract",
            subTitle: "Positions",
            selected: (this.activeIndex == 0) ? true : false,
            onClick : (event) => {
              this.activeIndex = 0;
            },
          },
          {
            label:"Address",
            icon: "fa-solid fa-file-contract",
            subTitle: "Adress",
            selected: (this.activeIndex == 1) ? true : false,
            onClick : (event) => {
              this.activeIndex = 1;
            },
          },
          {
            label:"Texts",
            icon: "fa-solid fa-file-contract",
            subTitle: "Texts",
            selected: (this.activeIndex == 2) ? true : false,
            onClick : (event) => {
              this.activeIndex = 2;
            },
          }
        ]
      }
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
