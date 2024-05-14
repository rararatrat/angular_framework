import { Component, Input, Optional, ViewChild } from '@angular/core';
import { CrmService } from '../crm.service';
import { LibraryService } from '@library/service/library.service';
import { IPositionPreviewData, ITemplateSettings, pageSetup, template_type } from '@library/library.interface';
import { PositionPreviewComponent } from 'src/app/position-preview/position-preview.component';
import { Position } from '../sales/position/position';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { WrapperService } from '@library/service/wrapper.service';
import { MessageService } from 'primeng/api';
import { Core, MESSAGE_SEVERITY } from '@eagna-io/core';

@Component({
  selector: 'eg-position-wrapper',
  templateUrl: './position-wrapper.component.html',
  styleUrls: ['./position-wrapper.component.scss']
})
export class PositionWrapperComponent {
  constructor(
    private _lib: LibraryService,
    private _messageService: MessageService,

    @Optional() public ref: DynamicDialogRef,
    @Optional() public dialogConfig : DynamicDialogConfig<IPositionPreviewData>){}

  //TODO: data per template_type
  /* private _data: any; */
  public data: any;

  //public api = (p, m) => this._crm.sales_positions(p, m);

  /* TODO: template_type to be received from root */
  @Input()
  template_type: template_type;

  @ViewChild('egPreview') egPreview: PositionPreviewComponent;

  @Input('settings') settings: ITemplateSettings = null;
  settingsError: boolean;

  private _old_template_type: string;

  private _label_from_type: string;

  get label_from_type(): string{
    return Position.getLabelFromType(this.template_type);
  }

  private _getDefaultTemplateSetup(){
    return {
        headerOptions: {
            showDate: true,
            showValidUntil: true,
            showCompanyContact: true,
            showCustomerNumber: true,
            showProjectName: true,
            showVATNumber: true
        },
        columnOptions: {
            showPositionNumber: true,
            showAmount: true,
            showUnitPrice: true
        },
        footer: {
            companyNameAndAddress: true,
            companyEmailAddress: true,
            companyPhone: true,
            bankAccountInfo: true,
            vatNumber: true,
            euVATNumber: true,
            mobile: true,
            fax: true,
            website: true,
        },
        appendPDF: false
    }
    //return Position.getDefaultSetup();
  };

  ngOnInit(){
    const _dataType = this._lib.getRenderedType(this.dialogConfig, this.dialogConfig?.data);

    //console.log({_dataType});

    //set data and settings from dialog
    if(_dataType == 'dialog'){
        if(!this.data){
            this.data = this.dialogConfig.data.item;
        }
        if(!this.template_type){
            this.template_type = this.dialogConfig.data.template_type;
        }
    } else{
        if(!this.template_type){ //only when called via root
            this.template_type = 'quotes';
        }
        this._setDefaultData();
    }

    this._old_template_type = this.template_type + '';
    this._initSettings('from Init');
  }

  private _setDefaultData(){
    const _defaultData: any = Position.getTestData(this.label_from_type);

    // TODO here to update whatever the data/settings needed
    // switch(this.template_type){
    //     case ''
    // }
    this.data = Object.assign({}, _defaultData);
  }

  onSave() {
    try {
        this._lib.setLocalStorage('doc_template_settings', JSON.stringify(this.settings));
        this._messageService.add({severity: MESSAGE_SEVERITY.SUCCESS,summary: Core.Localize('successfullySaved')});
    } catch (error) {
        this._messageService.add({severity: MESSAGE_SEVERITY.WARN, summary: Core.Localize('error'), detail: (typeof error == 'object' ? JSON.stringify(error) : error)});
    }
  }

  public _initSettings(_fromWhere){
    console.log({_initSettings: _fromWhere});

    /* if(!this.settings){
        const _currSettings = this._lib.getLocalStorage('doc_template_settings');
        if(_currSettings){
            try {
                this.settings = JSON.parse(_currSettings);
            } catch (error) {
                this.settingsError = true;
            }
        }
    } */

    if(!this.settings || !this.settings?.setup){
        //to be able to supply default data for each setup
        this.resetSettings();
    }
  }

  public resetSettings(){
    let _defaultSettings: pageSetup = {...this.settings?.setup, ...this._getDefaultTemplateSetup()};
    switch(this.template_type){
        case "quotes": break;
        case "order":
        break;
    }

    //this.settings = Position.getDefaultDocConfig();
    this.settings = {
        companyLogo: '',
        template: {
            titleColor: '#000000',
            lineColor: 'var(--border-color)',
            textColor: '#000000',
        },
        templateEl: {
            noPagebreak: false,
            showCompanyAddress: true,
            showCompanyLogo: true,
            showLines: true,
            showPageNumbers: false,
            columnHeadings: false,
        },
        font: {
            size: 11,
            heading: 13,
            recipient: 11,
            company: 11,
        },
        letterHead: {
          docBackgroundCover: '',
          docBackgroundSheet: ''
        },
        distance: {
            topMargin: 12,
            bottomMargin: 12,
            leftMargin: 12,
            rightMargin: 12,
            headerLine: 0
        },
        recipient: {
            align: 'left',
            leftRight: 0,
            upDown: 0
        },
        setup: _defaultSettings
    };
  }

  ngDoCheck(){
    /* console.log({old: this._old_template_type, new: this.template_type}); */
    if(this._old_template_type && this._old_template_type != this.template_type){
      this._old_template_type = this.template_type + '';
      this._initSettings('from changed');
      this.egPreview?.processContentPreview('from wrapper');
    }
  }
}
