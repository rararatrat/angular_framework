import { ChangeDetectorRef, Component, Input, OnInit, Optional } from '@angular/core';
import { HelperService, SharedService, apiMethod } from '@eagna-io/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DetailsContainerConfig, InPlaceConfig, objArrayType } from '@library/library.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DetailsConfig } from '@library/class/details-config';
import { ActivatedRoute } from '@angular/router';
import { WrapperService } from '@library/service/wrapper.service';
import { CrmService } from 'src/app/crm/crm.service';
import { Project } from '../../project.static';

@Component({
  selector: 'eg-conditions-detail',
  templateUrl: './conditions-detail.component.html',
  styleUrls: ['./conditions-detail.component.scss'],
})
export class ConditionsDetailComponent {
  @Input() param: any;

  api = (p?: any, method?: apiMethod, nextUrl?) => this._crmService.project_condition(p, method, nextUrl);

  private _ref: DynamicDialogRef;
  public isChanged: boolean;
  public objArray: any;
  public editingField: string;
  public formGroup: FormGroup;
  public inPlaceConf: InPlaceConfig;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _fb: FormBuilder,
    private _wr: WrapperService,
    private _crmService: CrmService,
    private _crf: ChangeDetectorRef,
    private _sharedService: SharedService,
    @Optional() public ref: DynamicDialogRef,
    @Optional() public dialogConfig: DynamicDialogConfig) {
      this._sharedService.globalVars.gridListChanged = false;
    }

  public config             : DetailsContainerConfig = null;
  public detailsConfig      : DetailsConfig;

  ngOnInit(): void {
    this.initDetailsContainer();
  }

  initDetailsContainer() {
    this.config = {
      hasHeader     : false,
      header        : (this.dialogConfig?.data?.title ? `${this.dialogConfig?.data?.title} Details` : "Details Menu"),
      subheader     : "Conditions Details",
      dialogConfig  : this.dialogConfig,
      dialogRef     : this.ref,
      /* data          : this.data,
      itemId        : (this.id || this._activatedRoute?.snapshot?.params?.['id']), */
      detailsApi$    : (param, method, nextUrl)   => {
        return this.api(param, method, nextUrl);
      },
      hasUpdates    : true,
      updateApi$    : (param, method, nextUrl)   => {
        return this._crmService.project_updates(param, method, nextUrl);
      },
      hasComments   : true,
      commentsApi$  : (param, method, nextUrl)   => {
        return this._crmService.project_comments(param, method, nextUrl);
      },
      hasLogs       : true,
      logsApi$      : (param, method, nextUrl)   => {
        return this._crmService.project_logs(param, method, nextUrl);
      },
      formProperty: {formProperties: Project.getTeamProperties()}
    };
    this.detailsConfig = new DetailsConfig({config: this.config, fb: this._fb, wr: this._wr, cdr: this._crf});
  }

  public afterSaved(isChanged){
    if(this.dialogConfig?.data){
      this.dialogConfig.data.isChanged = isChanged;
    }
    this._sharedService.globalVars.gridListChanged = isChanged;
  }
}
