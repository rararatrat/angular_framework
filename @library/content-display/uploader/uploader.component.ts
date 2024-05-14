import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Core, SharedService } from '@eagna-io/core';
import { INoDataFound, InPlaceConfig } from '@library/library.interface';

@Component({
  selector: 'eag-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {
  constructor(private _sharedService: SharedService, private _cdr : ChangeDetectorRef) {


   }

  @ViewChild("pFile") pFile: any;
  @Input('config') config     : InPlaceConfig
  @Input() showUploadButton   : boolean = true;
  @Input() accept             : string = 'image/*';
  @Input() url                : string = 'https:test.eagna.io/upload';
  @Input() maxFileSize        : number = 1000000;
  @Input() multiple           : boolean = true;
  @Input() mode               : 'basic' | 'advanced' = 'advanced';
  @Input() autoUpload         : boolean = false;
  @Input() formGroup          ?: FormGroup;
  @Input() formControlName    ?: any;
  @Input() labelFormatted     !: string;
  @Input() imgSrc             : any;
  @Input() label              ?: string;
  @Input() styleClass         : any;
  @Input() showCancelButton   : boolean = true;
  @Input() isFile             : boolean = true;
  @Input() isNew              : boolean = false;

  @Input('filesArr') filesArr : any = [];

  @Output('ngModelChange') ngModelChange    = new EventEmitter<string>();
  @Output('imgApiCallback') imgApiCallback  = new EventEmitter<any>();
  @Output('callback') callback              = new EventEmitter<any>();

  public invalidConfig = {invalid: false, message: ''};
  public fileName = "files[]";
  //public filesArr : any = [];
  public hasFiles : boolean = false;
  public visible  : boolean = false;
  public noDataConfig : INoDataFound;

  protected onChange($event: any) {
    this.ngModelChange.emit($event);
  }

  protected onBasicUploadAuto($event: any) {
    console.log({onBasicUploadAuto: $event});

    let tempFiles = $event.files;
    let frmData;

    frmData = new FormData();
    tempFiles?.forEach(_f => {
      frmData.append(this.multiple ? "files" /* "files[]" */ : this.label, _f);
    });
    this.visible = false;
    this.formGroup?.get(this.label)?.setValue(frmData);
    this.formGroup?.get(this.label)?.updateValueAndValidity();
    this.imgApiCallback.emit(tempFiles);
  }

  ngOnInit(): void {
    if(!this.multiple){
      if(!this.label){
        this.invalidConfig = {invalid: true, message: 'Turning off multiple mode requires label'};
      } else{
        this.fileName = this.label;
      }
    }
    if(this.formGroup != null || undefined){

      this._getFiles();
      this._cdr.markForCheck();
      this._cdr.detectChanges();
    }

    this.noDataConfig = {
      action : "Add",
      message: Core.Localize('no_files_uploaded_yet'),
      hasCallback : true,
      icon : "fa-solid fa-database",
      topic: "Files",
      callback : (p) => {
        this.visible = !this.visible;
      }
    }

  }

  private _getFiles(){
      const fcName = (this.formControlName == null) ? this.label : this.formControlName;
      let fcFiles = this.formGroup?.get(fcName)?.value;
      if(fcFiles?.length > 0){
        this.filesArr = this.filesArr?.concat(fcFiles);
        this.hasFiles = true;
      }
      /* this._cdr.detectChanges(); */
  }

  onSelect($event: any) {
    console.log({onSelect: $event, mode: this.mode});
    if(!this.isNew){
      this.onBasicUploadAuto({...$event, files: $event?.currentFiles});
    }

    //this._sharedService.globalVars.files = {...this._sharedService.globalVars.files, ...{[this.label]: $event.currentFiles } };

    /* let tempFiles = $event.currentFiles;
    let frmData;

    frmData = new FormData(); */
    // tempFiles?.forEach(_f => {
    //   frmData.append(this.multiple ? "files" /* "files[]" */ : this.label, _f);
    // });

    //this._sharedService.globalVars.files = {...this._sharedService.globalVars.files, ...{[this.label]: $event.currentFiles } };
    //this.imgApiCallback.emit(frmData);
    //this.imgApiCallback.emit({[this.label]: $event.currentFiles});
    /* console.log({formGroup: this.formGroup});
    this.formGroup?.controls?.[this.label]?.setValue([]); */
    //console.log({form: this.formGroup?.get(this.label)})

    /* if(!this.autoUpload){
      this.formGroup?.get(this.label)?.updateValueAndValidity();
      this.imgApiCallback.emit($event.currentFiles);
      this.filesArr = $event.currentFiles
    } */
  }
}
