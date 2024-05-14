import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { InPlaceConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { Image } from 'primeng/image';
import { environment as env } from 'src/environment/environment';

@Component({
  selector: 'eg-image',
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ImageComponent),
    multi: true,
  }]
})
export class ImageComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor {
  @ViewChild('imageContent') image          : Image;
  @ViewChild('imagePanel')   imagePanel     : any;
  @Input('config') config                   : InPlaceConfig;

  @Input("formGroup")       formGroup       : FormGroup = null;
  @Input("formControlName") formControlName : any;
  @Input("topic")           topic           : any;

  @Input("preview")         preview         : boolean = true;
  @Input("isEditable")      isEditable      : boolean = false;
  @Input("src")             src             : any = env.noImagUrl;
  @Input("styleClass")      styleClass      : any ;
  @Input("imageClass")      imageClass      : any ;
  @Input("width")           width           : any = null;
  @Input("height")          height          : any = null;
  @Input("alt")             alt             : any = null;
  @Input('filesArr')        filesArr        : any = [];
  @Output('callback')       callback        = new EventEmitter();
  @Input("isDeletable")     isDeletable     : boolean = false;

  public overlay        : boolean = false;
  public imagenotFound  : boolean = false;

  public env = env;

  public onChange = (value: any) => { console.log(value)};
  public onBlur   = (touched: boolean) => {};
  writeValue(value: string) : void {}
  registerOnChange(fn: any) : void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onBlur  = fn; }

  constructor(private _wr: WrapperService, private _cdr: ChangeDetectorRef){}

  ngOnInit(): void {}

  imageErr(event){
    this._wr.libraryService.noImageUrl(event);
    this.imagenotFound = true;
  }

  imgPreview(event){
    this.image.maskVisible = true;
    this.image.previewVisible = true;
    this.image.src = (this.imagenotFound)? env.noImagUrl : this.image.src;
  }

  editImage(event){
    this.overlay = true;
  }

  update(param?, t?){
    this.callback.emit(param);
  }

  uploadImage(param){
    let apiParams : any = {};
    let tempFiles = param.files

    tempFiles.forEach((file, i) => {
      apiParams['file' + (i+1)] = {type: "file", file};
    });

    let formdat = new FormData()

    formdat.append("id", "1")
    formdat.append("avatar", tempFiles[0])

    formdat.forEach((value,key) => {
      console.log(key+" "+value)
    })
    console.log(formdat)
  }


  ngAfterViewInit(): void {
    if(!this.image.src){
      this.image.src = env.noImagUrl;
    }
    this.image.maskVisible = false;
    this.image.previewVisible = false;
    this.image.onImageClick = () => {};
    this._cdr.detectChanges();
  }

  clearImage($event: MouseEvent) {
    this.filesArr = null;
    this.formGroup.get(this.formControlName)?.setValue(undefined); //set to undefined so to distinguish something when saving
    this.image.src = env.noImagUrl;
    this.callback.emit({delete: true});
    //$event.stopPropagation();
  }

  ngOnDestroy(): void {

  }
}
