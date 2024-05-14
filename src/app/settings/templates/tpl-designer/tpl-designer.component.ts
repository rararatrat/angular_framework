import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Optional, Output, SimpleChanges } from '@angular/core';
import { IContainerWrapper, IPositionPreviewData, ITemplateSettings, InPlaceConfig, pageSetup, template_type } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { MessageService } from 'primeng/api';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Templates } from '../templates.static';
import { SalesMockData } from '../data/sales.data';
import { Core, GridResponse, MESSAGE_SEVERITY, ResponseObj, SubSink } from '@eagna-io/core';
import { SettingsService } from '../../settings.service';
import { forkJoin, isEmpty, map, tap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment as env } from 'src/environment/environment';
import { ImageComponent } from '@library/content-display/image/image.component';
import { DocumentTemplate } from '../../crm-settings/document/document.static';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'eg-tpl-designer',
  templateUrl: './tpl-designer.component.html',
  styleUrls: ['./tpl-designer.component.scss'] 
})
export class TplDesignerComponent implements OnInit, OnChanges, OnDestroy{
  //@ViewChild('egPreview') egPreview                   : PosPreviewComponent;
  @Input('template_type') template_type               : template_type;
  @Output('template_typeChange') template_typeChange  : any = new EventEmitter();

  @Input('settings') settings                         : ITemplateSettings = null;
  @Output('settingsChange') settingsChange            : any = new EventEmitter();

  @Input('data') data                                 : any = null;
  @Output('dataChange') dataChange                    : any = new EventEmitter();

  @Input('rawdata') rawdata                           : any = null;
  @Output('rawdataChange') rawdataChange              : any = new EventEmitter();

  @Input('topicId') topicId                           : any = null;
  @Output('topicIdChange') topicIdChange              : any = new EventEmitter();

  @Input('orig_template_type') orig_template_type     : string = 'quotes';

  public settingsError        : boolean;
  public isLoading            : boolean = true;

  private _old_template_type  : string;
  private _label_from_type    : string;
  private _renderType         : any = null;
  private _subs               : SubSink = new SubSink();
  public stateOptions       : any[] = [ {label: Core.Localize('setting', {count: 2}), value: 'settings'},
                                        {label: this._titleCase.transform(Core.Localize('template')), value: 'templates'}
                                      ];
  public stateValue         : string = 'settings';
  public template_list      : any = null;
  public tLoading           : boolean = true;
  public isDefault          : boolean = false;
  formGroup                 : FormGroup;
  config                    : InPlaceConfig;
  savedData                 = {
    companyLogo: [],
    docBackgroundCover: [],
    docBackgroundSheet: []
  };

  public envUrl = (env.apiUrl || '').substring(0, (env.apiUrl || '').length-1);
  private _firstChangedSet = false;
  private _isEmpty = true;
  private _docConfigPermissions: { create?: boolean; read?: boolean; update?: boolean; delete?: boolean; role?: any; message?: any; };
  private _docConfigFields: any[];
  private _succeedingTemplate: any[];
  public isMockData = true;

  constructor(  private _messageService         : MessageService,
                private _fb                     : FormBuilder,
                private _wr                     : WrapperService,
                private _settingsService        : SettingsService,
                private _titleCase              : TitleCasePipe,
                @Optional() public ref          : DynamicDialogRef,
                @Optional() public dialogConfig : DynamicDialogConfig<IPositionPreviewData>)
  {
    this._renderType = this._wr.libraryService.getRenderedType(this.dialogConfig, this.dialogConfig?.data);
    console.log({renderType: this._renderType});
    if(this._renderType == 'dialog'){
      this.isMockData = false;
    }
  }

  private _mapToTemplateSettings(template, pageSetup){
    this.rawdata            = {template,pageSetup};
    const _mapped           = Templates.resultsToSettings(template, pageSetup);
    this.settings           = _mapped.template[0];
  }

  getTemplateList(): any[] {
    const _tmpList = (this.template_list || []).slice(0);
    let _toReturn = [];
    if(_tmpList?.length){
      _toReturn = _tmpList.filter(_t => _t.id == 1);
      /* if(this.rawdata?.template?.id > 1){
        _toReturn = _toReturn.concat(_tmpList.filter(_t => _t.id == this.rawdata?.template?.id));
      } */
      if((this._succeedingTemplate || []).length > 0){
        _toReturn = _toReturn.concat(_tmpList.filter(_t => this._succeedingTemplate.map(_tpl => _tpl.doc_template.id).includes(_t.id)));
      }

      if(!_toReturn){
        _toReturn = _tmpList[0];
      }
    }

    return _toReturn;
  }

  createNewTamplate() {
    const _api = (p?, m?, n?) => this._settingsService.doc_config(p, m, n);
    const _fp = DocumentTemplate.getDocumentConfigFormProperties();

    const _doAdd = () => {
      const iContainerWrapper: IContainerWrapper = {
        apiService    : _api,
        permission    : this._docConfigPermissions,
        gridFields    : this._docConfigFields,
        title         : Core.Localize('template'),
        initValue     : {eg_content_type: this.orig_template_type},
        noModalHeight : true,
        addCallback   : (p2) => {
          if(p2?.isConfirmed){
            this.template_list = (this.template_list || []).concat([p2.apiData]);
          }
        },
        formProperties: _fp.formProperties,
        formStructure: _fp.formStructure,
      };
      this._wr.containerService.dialogAction('add', iContainerWrapper);
    }

    if(!this._docConfigFields || !this._docConfigPermissions){
      _api({}, 'options').subscribe(res => {
        this._docConfigFields = res.content.fields;
        this._docConfigPermissions = res.content.permission;
        _doAdd();
      });
    } else{
      _doAdd();
    }

    //this._subs.sink = (p.apiService({}, 'post').subscribe((res: ResponseObj<GridResponse>) => {
      
    //}));
  }

  private _getSucceedingTemplates(){
    this._settingsService.doc_config({
      limit: 100,
      eg_content_type__content_model: [this.template_type]
    }, 'post').pipe(map(res => {
      if(this._wr.libraryService.checkGridEmptyFirstResult(res)){
        res.content.results = [];
      } else {
        res.content.results = res.content.results.filter(_r => _r.doc_template?.id > 1);
      }
      return res;
    })).subscribe(res => {
      this._succeedingTemplate = res.content.results;
    });
  }

  ngOnInit(): void {
    if(this._renderType == 'dialog'){
      this._setData(this.dialogConfig?.data.item);

      if(!this.template_type){
        this.template_type = this.dialogConfig.data.template_type;
      }

      if(this.template_type && !this.settings){
        this._subs.id('fetchSetupBasedOnTplType').sink = this._settingsService.doc_config({eg_content_type__content_model: this.template_type}, 'post').subscribe({
          next: (res: ResponseObj<GridResponse>) => {
            this._isEmpty = this._wr.libraryService.checkGridEmptyFirstResult(res);
            if(!this._isEmpty){
              const _firstResult = res?.content?.results?.[0];
              const _fork$ = {
                setup   : this._settingsService.doc_setup({id: _firstResult?.doc_setup.id}, "post"),
                template: this._settingsService.doc_templates({id: _firstResult?.doc_template.id}, "post"),
              }
              this._subs.sink = forkJoin(_fork$).subscribe({
                next : ({setup, template}) => {
                  this._mapToTemplateSettings(template?.content?.results?.[0], setup?.content?.results?.[0]);
                },
                complete : () => {},
                error : (err) => {}
              })
            } else {
              if(!this.settings){
                this.settings = Templates.getDefaultDocConfig();
              }
            }
            
            if(!this._docConfigFields || !this._docConfigPermissions){
              this._docConfigFields = res.content.fields;
              this._docConfigPermissions = res.content.permission;
            }

          }, complete() {}});
      } else{
        if(!this.template_type){
          this.template_type = 'quotes';
        }
        if(!this.settings){
          this.settings = Templates.getDefaultDocConfig();
        }
      }
    }else{
      if(!this.template_type){ //only when called via root
        this.template_type = 'quotes';
      }
      this._setData(this.data);
    }

    this._buildFormData();

    this._getSucceedingTemplates();

    if(this.stateValue == "templates"){
      this._fetchTemplates();
    }

    this._old_template_type = this.template_type + '';
    this._initSettings('from Init');
  }

  private _buildFormData() {
     const _toForm = {
      companyLogo: [{value: '', disabled: false}],
      docBackgroundCover: [{value: '', disabled: false}],
      docBackgroundSheet: [{value: '', disabled: false}],

    } 
    this.formGroup = this._fb?.group(_toForm);
    this.config = {
      method: 'callback',
      formGroup: this.formGroup,
      isWholeForm: false
    }
  }

  imgUploadCallback(egImg: ImageComponent, data, frmCtrl, model){
    if(data?.delete || (data || []).length > 0){
      //to replace the settings image memory and be replaced by the one that's being uploaded
      if(this.settings){
        if(model && this.settings[model]){
          if(!data.delete){
            this.settings[model][frmCtrl] = '';
          } else{
            if(frmCtrl == 'docBackgroundCover'){
              this.settings.letterHead.showDocBackgroundCover = false;
            } else if(frmCtrl == 'docBackgroundSheet'){
              this.settings.letterHead.showDocBackgroundSheet = false;
            }
            this.settings[model][frmCtrl] = env.noImagUrl;
          }
        } else {
          if(data.delete){
            this.settings[frmCtrl] = env.noImagUrl;
          } else{
            this.settings[frmCtrl] = '';
          }
        }
      }

      if(!data?.delete){
        this.config.formGroup.get(frmCtrl)?.setValue(data?.[0]);
        this.config.formGroup.updateValueAndValidity();
      }
    }

    if(egImg){
      egImg.overlay = false;
    }

    /* const _fd = new FormData();
    _fd.append('id', this.rawdata?.template?.id);
    _fd.append(frmCtrl, data?.[0]);

    this._settings.doc_templates(_fd, 'patch').subscribe(res => { 
      //console.log({doc_template_update: res}); TODO msgService
    }); */
  }

  private _initSettings(param){
    if(!this.settings || !this.settings?.setup){
      this.reset();
    }
    
    this._setupImages();
    this.isLoading = false;
  }

  private _setData(data){
      const _defaultSalesData : any = SalesMockData.getTestData(this.label_from_type);
      this.data = (data == null) ? _defaultSalesData : this.data;
  }

  private _fetchTemplates(){
    this._subs.id('tpl').sink = this._settingsService.doc_templates({limit:100}, "post").subscribe({
      next      : (res) => {
        this.template_list = res.content.results;
      },
      error     : (err) => {},
      complete  : () => {this.tLoading = false},
    })
  }

  public manageTemplates(action, data:any){
    switch(action){
      case "preview":
        let tpl = Templates.resultsToSettings(data,this.rawdata.pageSetup)
        this.settings = tpl.template[0]
        break;
      case "set_default":
        this._subs.id('topic').sink = this._settingsService.doc_config({id:this.topicId, doc_template:data.id}, 'patch').subscribe(res=> {
          let tpl = Templates.resultsToSettings(data,this.rawdata.pageSetup)
          this.settings = tpl.template[0]
          this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,
            summary: Core.Localize('successfullySaved')});
        })
        break;

    }
  }

  public togglemenu(event){
    if(event == "templates"){
      this._fetchTemplates();
    }
  }

  get label_from_type(): string{
    return Templates.getLabelFromType(this.template_type);
  }

  public reset(){
    //let setup : pageSetup = {...this.settings?.setup, ...Templates.getDefaultTplSetup()};
    this.settings = Templates.getDefaultDocConfig();
  }

  public onSave() {
    const _r = Templates.settingsToReqParams(this.settings, this.rawdata);
    
    //tweak the form value if there're new images to be uploaded
    let _tmpTemplateData : any = Object.assign({}, _r.template);
    let _hasToUpload = false;

    /* Logo and Covers */
    const _logo = this.formGroup?.value?.companyLogo;
    if(_logo){//something is changed upon upload (files content)
      _tmpTemplateData.company_logo = _logo;
      _hasToUpload = true;
    } else{
      if(_logo === undefined){ //comes from deletion
        _tmpTemplateData.company_logo = null;
      } else { //untouched, remove from parameter
        delete _tmpTemplateData.company_logo;
      }
    }

    const _bgCover = this.formGroup?.value?.docBackgroundCover;
    if(_bgCover){//something is changed upon upload (files content)
      _tmpTemplateData.doc_background_cover = _bgCover;
      _hasToUpload = true;
    } else{
      if(_bgCover === undefined){ //comes from deletion
        _tmpTemplateData.doc_background_cover = null;
      } else { //untouched, remove from parameter
        delete _tmpTemplateData.doc_background_cover;
      }
    }

    const _bgSheet = this.formGroup?.value?.docBackgroundSheet;
    if(_bgCover){//something is changed upon upload (files content)
      _tmpTemplateData.doc_background_sheet = _bgSheet;
      _hasToUpload = true;
    } else{
      if(_bgSheet === undefined){ //comes from deletion, resubmit the file to null
        _tmpTemplateData.doc_background_sheet = null;
      } else { //untouched, remove from parameter
        delete _tmpTemplateData.doc_background_sheet;
      }
    }

    /* RT: to avoid resaving orgId */
    if(!_tmpTemplateData?.org_id){
      delete _tmpTemplateData.org_id;
    }

    //then convert to form Data if there's something to upload
    if(_hasToUpload){
      _tmpTemplateData = this._wr.helperService.toFormData(_tmpTemplateData);
    }

    const _fork$ = {
      setup   : this._settingsService.doc_setup(_r.pageSetup, "patch"),
      template: this._settingsService.doc_templates(_tmpTemplateData, "patch"),
    }

    this._subs.sink = forkJoin(_fork$).subscribe({
      next : ({setup, template}) => {
        const _t      = Templates.resultsToSettings(template.content.results[0], setup.content.results[0]);
        this.rawdata  = {template:template.content.results[0],pageSetup:setup.content.results[0]}
        this.settings = _t.template[0];
        this._setupImages();
      },
      complete : () => {
        this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,
          summary: Core.Localize('successfullySaved')});

        this.formGroup.reset();
      },
      error : (err) => {
        this._messageService.add({severity: MESSAGE_SEVERITY.WARN,
          summary: Core.Localize('error'),
          detail: (typeof err == 'object' ? JSON.stringify(err) : err)});
      }
    });
  }

  private _setupImages() {
    if(this.settings?.companyLogo){
      this.savedData.companyLogo = [{name: this.settings?.companyLogo}];
    }

    if(this.settings?.letterHead){
      if(this.settings.letterHead.docBackgroundCover){
        this.settings.letterHead.showDocBackgroundCover = true;

        this.savedData.docBackgroundCover = [{name: this.settings.letterHead.docBackgroundCover}];
      }
      if(this.settings.letterHead.docBackgroundSheet){
        this.settings.letterHead.showDocBackgroundSheet = true;
        this.savedData.docBackgroundCover = [{name: this.settings.letterHead.docBackgroundSheet}];
      }
    }
  }

  letterHeaderChanged(isSet: boolean, _imgData: any){
    if(!isSet){
      this.formGroup?.get(_imgData.frmCtrl)?.setValue(undefined);
      this.imgUploadCallback(null, {delete: true}, _imgData.frmCtrl, 'letterHead');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['settings'] && !changes['settings'].firstChange && !this._firstChangedSet){
      this._firstChangedSet = true;
      this._setupImages();
    }
    if(changes['template_type']?.currentValue != changes['template_type']?.previousValue && !changes['template_type']?.firstChange){
      this._getSucceedingTemplates();
    }
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }
}
