import { ChangeDetectorRef, Component, EventEmitter, forwardRef, Inject, Input, LOCALE_ID, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormArray, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Core, MESSAGE_SEVERITY } from '@eagna-io/core';
import { AutocompleteConfig, editorFieldConfigType, InPlaceConfig, NumberConfig, objArrayType } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';
import { Chips, ChipsClickEvent } from 'primeng/chips';
import { ColorPicker } from 'primeng/colorpicker';
import { AppStatic } from 'src/app/app.static';
import { SubSink } from 'subsink2';

@Component({
  selector: 'eg-crud-form',
  templateUrl: './crud-form.component.html',
  styleUrls: ['./crud-form.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CrudFormComponent),
    multi: true,
  }]
})

export class CrudFormComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('egInPlace') egInPlace : any;
  @Input('config')          config                : InPlaceConfig;
  @Input('type')            type                  : "mask" | "text" | "number" | "password" | "date" | "autocomplete" | "select" | "image" | "address" | "boolean" | "multiselect" | "file" | "radio" | "chips" | "chip-labels" | "color";
  @Input('displayVal')      displayVal            : any = null;
  @Input('icon')            icon                  : any = null;
  //@Input('data')            data                  : any = {};
  @Input('data')            data                  : any;
  @Input('options')         options               : any[] = [];
  @Input('placeholder')     placeholder           : string = null;
  @Input("formControlName") formControlName       : any = null;
  @Input("mode")            mode                  : 'view' | 'add' | 'edit' = 'view';
  private _fcNameCopy : any = null;

  @Input() objArray: objArrayType;

  @Input("topic")       topic                     : any;
  @Input("autoConfig")  autoConfig                : AutocompleteConfig;

  @Input("dateConfig")  dateConfig                : any;

  @Input("numberConfig")  numberConfig            : NumberConfig = {mode: 'decimal', minFractionDigits: 1};

  @Input("isDisabled")      isDisabled            : boolean = false;
  @Input("isEditable")      isEditable            : boolean = false;
  @Input() editorFieldConfigs                     ?: { [field: string]: editorFieldConfigType };

  @Input("styleClass") styleClass                 : any ="w-full";

  @Input("selected") selected                     : any;
  @Input("isRawText") isRawText                   : boolean = false;
  @Input("tinyMceConfig") tinyMceConfig           : any;

  @Input("mask_string")       mask_string                : string;

  @Input("isChanged") isChanged                   = false;
  @Output("isChangedChange") isChangedChange      = new EventEmitter<boolean>(false);

  @Output("frmCtrlUpdated") frmCtrlUpdated        = new EventEmitter<any>();
  @Input('dataCallback')    dataCallback          : (p, _f?: FormGroup) => void;

  @Output('optionsChange') optionsChange = new EventEmitter<any>();

  public colorPicker : string = null;

  public onChange = (value: any) => { /* console.log(value) */ };
  public onBlur   = (touched: boolean) => {};
  private _subs   : SubSink = new SubSink();
  public fcLoader : any  = null;
  public canEdit : boolean = false;
  public locale : any = AppStatic.savedLocale;

  /* private _value : any = null;
  private _fileFormData: FormData; */

  @Input() public files: {[file_name:string]: File[]} = {};

  /* @Output()
  public filesChange: EventEmitter<{[file_name:string]: File[]}> = new EventEmitter(); */

  public modelValue : any = null;
  private _currentData: any;

  @Input()
  parentFormGroupKey: string;

  @Input()
  parentFormGroupKeyIndex: number;

  minDate: Date;
  maxDate: Date;

  constructor(private _wr : WrapperService,
              private _cdr : ChangeDetectorRef){

  }

  writeValue(value: string) : void {}
  registerOnChange(fn: any) : void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onBlur  = fn; }


  ngOnInit(): void {
    this.canEdit = !this.config?.permission?.update;
    this.isDisabled = this.config?.formGroup.disabled || this.isDisabled;
    this.fcLoader = this.formControlName;

    const _modeValue  = this.config?.formGroup?.get(this.formControlName)?.value;

    if(this.type == "boolean"){
      this.modelValue   = (this.type == "boolean" ? (_modeValue == true) : _modeValue);
      this._subs.add(this.config?.formGroup?.get(this.formControlName).valueChanges.subscribe(boolNewVal => {
        if(typeof boolNewVal == 'boolean'){
          this.modelValue = boolNewVal;
          this._cdr.detectChanges();
        }
      }));
    }
    if(this.type == "color"){
      this.modelValue = this.config?.formGroup?.get(this.formControlName).value;
    }

    //TODO: extract here the field with specific

    /* let today = new Date();
    let month = today.getMonth();
    let year = today.getFullYear();
    let prevMonth = (month === 0) ? 11 : month -1;
    let prevYear = (prevMonth === 11) ? year - 1 : year;
    let nextMonth = (month === 11) ? 0 : month + 1;
    let nextYear = (nextMonth === 0) ? year + 1 : year;
    this.minDate = new Date();
    this.minDate.setMonth(prevMonth);
    this.minDate.setFullYear(prevYear);
    this.maxDate = new Date();
    this.maxDate.setMonth(nextMonth);
    this.maxDate.setFullYear(nextYear); */
  }

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }

  public cancel(){
    this.config.formGroup.get(this.formControlName).setValue(this._fcNameCopy);
    this.egInPlace?.deactivate();
  }

  public setMaskValue(value){
    //this.config.formGroup.get(this.formControlName).setValue(value);
  }

  private _save(event?, type?: string){
    switch (this.config.method) {
      case "callback":
        this.isChanged = true;
        this.isChangedChange.emit(this.isChanged);
        this.config.onUpdate(event);
        break;
      case "api":
        if(this.config.formGroup.get(this.formControlName)){
          let val = this.config.formGroup.get(this.formControlName).value;
          let apiParams = {
            id : this.config.formGroup.get("id")?.value,
            [this.formControlName] : val,
            ...(this._wr.helperService.isNotEmpty(this.files) ? this.files : {})
          };
          /* let val;

          //if(type != "uploadApiCallback"){
          if(this.type != 'file'){
            val = this.config.formGroup.get(this.formControlName).value;
            temp = {
              id : this.config.formGroup.get("id")?.value,
              [this.formControlName] : val
            }
          } else{
            this._fileFormData?.append?.("id", this.config.formGroup.get("id").value);
            temp = this._fileFormData;
          } */

          //files :  this._wr.libraryService.toFormData(data)
          if(this.config.paramUpdate){
            apiParams = this.config.paramUpdate(apiParams, this.formControlName);
          }

          this._subs.sink = this.config.api$(apiParams).subscribe({
            next: (res) => {
              this.isChanged = true;
              this.isChangedChange.emit(this.isChanged);
            },
            error : (err) => {
                this.egInPlace?.activate();
            },
            complete : () => {
              if(this.type != "address"){
                this.egInPlace?.deactivate();
              } else {
                this.fcLoader = null;
                this.config.formGroup.get(this.formControlName)?.setValue(val);

                setTimeout(() => {
                  this.fcLoader = this.formControlName;
                });
              }
              this.files = {};
              this._wr.messageService.add({detail: Core.Localize('successfullySaved') ,
                                          severity: MESSAGE_SEVERITY.SUCCESS,
                                          summary: 'Success'});
            }
          })
        }
        break;

      default:
        break;
    }

  }

  public handleCallback(event, type?){
    if((this._currentData != undefined && this._currentData != event) || this.type == 'date'){
      this.frmCtrlUpdated.emit({data:event, formControl:this.formControlName, formGroup: this.config.formGroup});
    }
    this._currentData = event;

    if(event && type == "uploadApiCallback"){
      this.files[this.formControlName] = event;
    }

    //this._value = event.id;
    this.displayVal = event?.name; //RT?

    if(!this.config?.mode || this.config?.mode == 'view'){
      this._save(event, type);
    } else if(type == "addressCreated" /* || this.type == 'date' */){
      this.data = event;
      /* this.frmCtrlUpdated.emit({data:event, formControl:this.formControlName});
      this.autoConfig.callback?.({data:event, formControl:this.formControlName}); */
      this.dataCallback?.({data:event, formControl:this.formControlName}, this.config?.formGroup);
    }
  }

  public onActivate(event){
    this._fcNameCopy = {...this.config.formGroup.get(this.formControlName)}.value
    this.config.formGroup.updateValueAndValidity();
  }

  public onDeactivate(event){
    this.config.formGroup.updateValueAndValidity();
  }

  public switchChanged(e) {
    console.log({switchChanged: e})
    if(this.config?.formGroup?.get(this.formControlName)){
      this.config.formGroup.get(this.formControlName).setValue(e);
    }
    //this.modelValue = e;
    this._cdr.detectChanges();
  }

  onChipClick(item: any, $event: any /* $event: MouseEvent */) {
    this.dataCallback?.(item, this.config?.formGroup);
  }

  getPrentFormGroup(): FormGroup<any> {
    const _toReturn = <FormGroup>this.config?.formGroup?.get(this.parentFormGroupKey);
    if(_toReturn && this.parentFormGroupKeyIndex >= 0){
      const _atKey = <FormGroup>(<FormArray><unknown>_toReturn).at(this.parentFormGroupKeyIndex);

      /* console.log({_atKey}); */

      if(_atKey){
        return _atKey;
      }
    }

    return _toReturn;
  }

  onChipsClick($event: ChipsClickEvent, _chip: Chips) {
    console.log({onChipsClick: $event, frmCtrl: this.config?.formGroup?.get(this.formControlName)?.value, _chip});
    console.log({_chipText: _chip?.inputViewChild?.nativeElement.value});

    const _copyChipValue = (_chip.value || []).slice(0);
    /* const _itemIndex = ( _copyChipValue).findIndex($event.value);
    if(_itemIndex >= 0){
      _chip.value = _copyChipValue.filter()
    } */
    const _newValue = _copyChipValue.filter(_cv => $event.value != _cv);
    console.log({_copyChipValue, _newValue});
    //_chip.value = _newValue;
    this.config?.formGroup?.get(this.formControlName)?.setValue(_newValue);
    //_chip.value = _newValue;

    if(_chip?.inputViewChild?.nativeElement){
      setTimeout(() => {
        _chip.inputViewChild.nativeElement.value = (_chip.inputViewChild.nativeElement.value ? _chip.inputViewChild.nativeElement.value + ';' : '') + $event.value;
      })
    }
  }  
}
