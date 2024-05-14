import { AfterViewInit, ChangeDetectorRef, Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControlName, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Core, HelperService, SharedService } from '@eagna-io/core';
import { editorFieldConfigType } from '@library/library.interface';
import { EventObj } from '@tinymce/tinymce-angular/editor/Events';
//import { Editor as TinyMCEEditor, TinyMCE } from 'tinymce';
import { EditorComponent } from '@tinymce/tinymce-angular';

@Component({
  selector: 'eg-text-area',
  templateUrl: './text-area.component.html',
  styleUrls: ['./text-area.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => TextAreaComponent),
    multi: true,
  }]
})
export class TextAreaComponent implements ControlValueAccessor, AfterViewInit {
  @Input("isRawText") isRawText               : boolean = false;
  @Input("styleClass") styleClass             : string;
  @Input("formGroup") formGroup               : FormGroup = null;
  @Input("formControlName") formControlName   : any;
  @Input("cssStyles") cssStyles               : any;
  @Input("config") config                     : any;
  @Input("type") type                         : string;
  @Input() editorFieldConfig                  ?: editorFieldConfigType;

  @ViewChild('tinyMce') tinyMce               : EditorComponent;
  //public formControl: FormControl<any>;
  public onChange = (value: any) => { console.log(value)};
  public onBlur = (touched: boolean) => {};
  //public initTinyMce : RawEditorOptions;
  public initTinyMce : any;
  public toolbar: string|string[] = ''; //'undo redo | blocks | bold italic | alignleft aligncenter alignright alignjustify | indent outdent';
  public apiKey = this._sharedService?.tinyMceApiKey;
  //public tinyMCEPlugins = 'a11ychecker advcode advlist advtable anchor autocorrect autolink autoresize autosave casechange charmap checklist code codesample directionality editimage emoticons export footnotes formatpainter fullscreen help image importcss inlinecss insertdatetime link linkchecker lists media mediaembed mentions mergetags nonbreaking pagebreak pageembed permanentpen powerpaste preview quickbars save searchreplace table tableofcontents template tinycomments tinydrive tinymcespellchecker typography visualblocks visualchars wordcount';
  public tinyMCEPlugins = 'anchor autolink charmap code codesample directionality emoticons fullscreen help importcss autosave insertdatetime link lists nonbreaking pagebreak  preview quickbars save searchreplace table tinydrive visualblocks visualchars wordcount image media'; /*  autoresize template */
  public initialValue = '';
  private _afterLoaded = false;

  constructor(private _sharedService: SharedService, private _helper: HelperService, private _cd: ChangeDetectorRef){
    this.initTinyMce = {
      'height': '20rem',
      'content_style':  `body {
        background: #fff;
        font-size: 0.85rem;
      }`,
      /* 'setup':  (editor) => {
        console.log(editor);
      } */
    };    
  }
  
  writeValue(value: string) : void {}
  registerOnChange(fn: any) : void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onBlur  = fn; }

  private _getJsonValue(newVal){
    if(this.type == 'json'){
      if(newVal){
        try {
          /* if(typeof newVal == 'object'){
            newVal = Object.assign({}, newVal); //create a copy
            newVal = JSON.stringify(newVal);
          } */
  
          let toParse = {};
  
          if(typeof newVal == 'object'){
            toParse = Object.assign({}, newVal); //create a copy
          } else{
            const ugly = ((<any>this._helper.stripHtml((newVal || '').replaceAll(" ", "")))?.replaceAll?.("'", '"')).replaceAll("\n", "").replaceAll(" ", "");
            toParse = JSON.parse( ugly );
          }
          //console.log({ugly, pretty});
          const pretty = JSON.stringify(toParse, undefined, 4);
          return `<pre>${pretty}</pre>`;
        } catch (error) {
          /* console.warn(`textarea set content ${this.formControlName}`, error); */
          if(this.type == 'json'){
            this.formGroup.get(this.formControlName)?.setErrors({err: Core.Localize('invalid_item', {item: 'JSON'})})
            return newVal;
          }
        }
      } else{
        return '{}'
      }
    }
    return newVal;
  }

  ngOnInit(): void {
    this.initialValue = this._getJsonValue(this.formGroup?.get(this.formControlName)?.value || '');
    this.formGroup?.get(this.formControlName)
    if(this.config){
      this.initTinyMce = {...this.initTinyMce, ...this.config};
    }
    this.config = {...this.config, clearText: false};

    this.formGroup?.get(this.formControlName).valueChanges.subscribe((newVal) => {
      // console.log({clearText: this.config?.clearText});
    if(!this.initialValue){
      this.initialValue = newVal;
    }
    //this.tinyMce?.editor?.setContent(newVal);

    newVal = this._getJsonValue(newVal);

    if(this.config?.clearText==true || this.type == 'json'){
      this.tinyMce?.editor.setContent('');
    }
    this.tinyMce?.editor?.insertContent(newVal);
    //this._cd.detectChanges();
      
    });
  }

  onEditorChanged($event: any) {
    this.formGroup?.get(this.formControlName)?.setValue($event.editor.getContent(), {emitEvent: this.type == 'json' });
  }

  
  ngAfterViewInit(){
    this._afterLoaded = true;
    /* this.tinyMce?.addButton?.('mybutton', {
      text: "My Button",
      onclick: function () {
         alert("My Button clicked!");
      }
    }); */

    /* this.config.editor = this.tinyMce; */
  }

  /* textOnInit($event: EventObj<any>) {
    console.log({textOnInit: $event})

    $event.editor.addCommand('Test Button', (a: any, b: any, c?: any) => {
      console.log({a, b, c});
    });

    
  } */
}
