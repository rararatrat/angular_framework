import {ChangeDetectorRef, Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { DetailsConfig } from '@library/class/details-config';

@Component({
  selector: 'eg-template',
  templateUrl: './template.component.html'
})
export class TemplateComponent implements OnInit {
  @Input("config") config               ?: "complete" | "semi" | "basic";
  @Input("mode") mode                   ?: "add" | "edit" | "view" = "view";
  @Input("layout") layout               ?: "flex" | "grid" | "table" | "label" = "flex";
  @Input("rendererType") rendererType   ?: "icon" | "name" | "icon-name" = "icon-name";
  @Input("isTwoLine") isTwoLine         ?: boolean = false;
  @Input("hasTitle") hasTitle           ?: boolean = true;
  @Input("title") title                 ?: string | any;
  @Input("titleClass") titleClass       ?: string;
  @Input("hasIcon") hasIcon             ?: boolean = true;
  @Input("icon") icon                   ?: string = "fa-solid fa-circle";
  @Input("iconClass") iconClass         ?: string;
  @Input("field") field                 ?: string | any;
  @Input("detailsConfig") detailsConfig ?: DetailsConfig;
  @Input("egClass") egClass             ?: string;
  @Input("isRequired") isRequired       ?: boolean = false;
  @Input("hasForm") hasForm             ?: boolean = true;
  @Input("options") options             ?: any[] = [];
  @Input("isChanged") isChanged         = false;
  @Input("isReadonly") isReadonly       = false;
  @Input('data') data               : any;
  @Input() parentFormGroupKey: string;
  @Input() parentFormGroupKeyIndex: number;

  /*the Below is used only for Table View  */
  @Input("isLast") isLast               : boolean =  false;
  @Input("row_class") row_class         : string = " ";
  @Input("attr_class") attr_class       : string = "w-5";
  @Input("value_class") value_class     : string = " ";

  @Output("isChangedChange") isChangedChange  = new EventEmitter<any>();
  @Output("frmCtrlUpdated") frmCtrlUpdated  = new EventEmitter<any>();

  /* for select or autocomplete: currently configured only for select */
  @Output('optionsChange') optionsChange = new EventEmitter<any>();

  @ContentChild('formTemplate') formTemplateRef: TemplateRef<any>;

  public files              : { [file_name: string]: File[]; } = {};
  public hasDetailConfig    : Boolean = false;
  public editMode = false;
  public noControlFound     = false;
  constructor(private _cdr: ChangeDetectorRef){}

  ngOnInit(): void {


    if(this.detailsConfig){
      if(this.field){
        //console.log({detailsConfig: this.detailsConfig, objArray: this.detailsConfig.objArray, field: this.field});


        this.data = this.detailsConfig.objArray[this.field];
        this.hasDetailConfig = true;

        if(!this.detailsConfig?.formGroup?.get(this.field)){
          this.noControlFound = true;
        }
      }

      if(this.title == undefined){
        this.title = this.detailsConfig?.objArray?.[this.field]?.['title'] || '';
      }
    } else{
      /* this.noControlFound = true; */
    }

    this._cdr.detectChanges();
  }

  afterSaved(event){
    this.isChangedChange.emit({event, field:this.field});
  }

  onFrmCtrlUpdated($event: any) {
    this.frmCtrlUpdated.emit($event);
  }
}
