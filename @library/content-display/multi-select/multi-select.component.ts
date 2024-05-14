import { Component, EventEmitter, forwardRef, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { AutocompleteConfig } from '@library/library.interface';
import { groupBy, map, mergeMap, of, tap, toArray } from 'rxjs';
import { SubSink } from 'subsink2';
import { ContentDisplayService } from '../content-display.service';
import { WrapperService } from '@library/service/wrapper.service';

@Component({
  selector: 'eg-multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MultiSelectComponent),
    multi: true,
  }]
})
export class MultiSelectComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @ViewChild('multiSelectForm') multiSelectForm : any;
  @ViewChild('treeSelectForm') treeSelectForm : any;

  @Input("formGroup")       formGroup       : FormGroup = null;
  @Input("formControlName") formControlName : any;
  @Input("topic")           topic           : any;
  @Input("placeholder")     placeholder     : string;

  @Input("styleClass")      styleClass      : any;
  @Input("attribute")       attribute       : AutocompleteConfig;
  @Input("selected")        selected        : any;
  @Input("displayVal")      displayVal      : any;

  @Input("tree")            tree            : boolean = false;

  @Output("selectedChange") selectedChange  = new EventEmitter<any>();
  @Output("callback")       callback        = new EventEmitter();

  public isLoading        : boolean = false;
  public api$             : any;
  public results          : any = [];
  public filterFields     : any;
  public currTopic        : any;
  public currQuery        : any;
  private _subs           : SubSink = new SubSink();

  public nodes : any = []; //temp
  public selectedNodes : any = []; //temp

  @Input() mapNodes       ?: (_data: any[]) => any[];
  @Input() mode           : 'view' | 'add' | 'edit' = 'add';

  public onChange = (value: any) => {};
  public onBlur = (touched: boolean) => {};

  writeValue(value: string) : void {}
  registerOnChange(fn: any) : void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onBlur  = fn; }

  constructor(private _contentService: ContentDisplayService, private _wr:WrapperService){}

  ngOnInit(): void {
    this._fetchData(this.formControlName);
    let val = this.formGroup.get(this.formControlName).value;

    if(this.tree){
      /* const tVal = this._createTree(val);
      tVal.map(e => {
        return this._createTree(val);
      })

      this.nodes = tVal; */
    }else {
      this.nodes = val;
    }
  }


  public imageErr(event){
    this._wr.libraryService.noImageUrl(event);
  }

  private _fetchData(topic:any){
    switch (topic) {
      case "content":
        this.api$ = this._contentService.settings.content_types({limit: 1000});

        this._treeStructure();
        break;

      case "resources":
      case "member":
      case "user":
        this.api$ = this._contentService.settings.user_list({limit: 1000});
        this._search(this.api$, false);
        break;

      /* case "team":
        this.api$ = this._contentService.crm?.project_team({limit: 1000});
        this._search(this.api$, false);
        break; */


      case "sales_positions":
        this.api$ = this._contentService.crm?.sales_positions({limit: 1000});
        this._search(this.api$, false);
        break;

      case "role":
        this.api$ = this._contentService.settings?.user_role({limit: 1000});
        this._search(this.api$, false);
        break;
    }
  }
  public updateTree(data){}

  private _createTree(data){
    /* console.log({createTree: data}); */
    let obj = {};
    if(data){
      data.forEach(item => {
        if (!obj[item.name]) {
          obj[item.name] = [];
        }
        obj[item.name].push({
            key:item.content_type,
            label: capitalizeFirstLetter(item.description),
            icon: "pi pi-video",
            data: item,
          })
      });
    }
    return Object.keys(obj).map(key => ({
      key:key,
      label: capitalizeFirstLetter(key),
      data: key,
      expandedIcon: "pi pi-folder-open",
      collapsedIcon: "pi pi-folder",
      children: obj[key]
    }))

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

  }

  private _treeStructure(){
    this.tree = true;
    this._subs.sink = this.api$.pipe(
      map((res:any) => {
        const data = res.content.results;
        const _toReturn = this._createTree(data);
        return _toReturn;
      })
    ).subscribe({
      next: (res:any) => {
        this.results = res;
      },
      complete : () => {
        this.isLoading = false;

        if(this.tree /* && this.mode != 'add' */){
          const _formValue = (this.formGroup.get(this.formControlName)?.value || []);

          const _recurNodes = (_children: any[] = []) => {
            for (const _child of _children) {
              if((_child?.children || []).length > 0){
                _recurNodes(_child?.children);
              } else{
                //check 
                if(_child?.data?.id && _formValue.includes(_child.data.id)){
                  this.nodes.push(_child)
                }
              }  
            }
          };

          //console.log({toMap: this.results});
          //user provided mapping function
          if(this.mapNodes){
            this.nodes = this.mapNodes(this.results);
            //this.nodes = this.results[0]?.children[0];
          } else if(this.results?.length > 0){
            //by default form value is in a form of number[] which are the ids of the selected children
            _recurNodes(this.results);
          }
          //this.nodes = this.results[0]?.children
        }
      }
    });

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }



  }

  private _search(event:any, isPaginate:boolean=false) {
    this.isLoading = true;
    this._subs.sink = this.api$.subscribe({
      next: (res:any) => {
        this.results        = res.hasOwnProperty("content")? res.content.results : res;
        this.filterFields   = Object.keys(this.results[0]).toString();
      },
      complete : () => {
        this.isLoading = false;
      }
    });

  }

  public onSelect(event, type?:"selected"|"unselected" ){
    const getSelectedNodes = (arr, shared, action:"selected"|"unselected") => {
      if(action == 'unselected'){
        shared = shared.filter( (el:any) => {
          return !arr.find(e => {
            return e.id == el.id;
          });
        });
      }else{
        shared = shared.concat(arr)
      }
      return shared;
    }

    let retVal = {
      id : [],
      name : [],
      data : null
    }
    let arr = [];
    let arr2 = [];

    if(this.tree){

      /* if(event.node?.parent == undefined){
        console.log({here: 'noParent'});
        arr = event.node.children.map( e => {
          return {
            id:e.data.id,
            name : e.data.description
          }
        })
        this.selectedNodes = getSelectedNodes(arr, this.selectedNodes, type);
        
        retVal = {
          id : this.selectedNodes.map(e => e.id),
          name : this.selectedNodes.map(e => e.name),
          data : this.selectedNodes
        }
      } */

      const arrVal = (this.nodes || []).map(_node => _node?.data?.id).filter(_id => _id != null);
      this.formGroup.get(this.formControlName).setValue(arrVal);

    }else{
      this.selectedNodes = event.value
      retVal = {
        id : event.value?.map(e => e.id),
        name : event.value?.map(e => e.username),
        data: event.value
      }

      this.formGroup.get(this.formControlName).setValue(retVal.id);
    }



    //this.formGroup.get(this.formControlName).setValue(retVal.id);
    this.callback.emit(retVal);
  }

  

  ngOnDestroy(): void {
    this._subs.unsubscribe();
  }


}
