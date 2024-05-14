import { ChangeDetectorRef, ContentChild, Injectable, OnDestroy, TemplateRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CellCustomActions, COLUMN_TYPE, ConfirmDialogResult, Core, ExtendedGridDefinition, GridService, HelperService, MenuItems, MESSAGE_SEVERITY, RouteObserverService } from "@eagna-io/core";
import { AddComponent } from "@library/container-collection/add/add.component";
import { ProcessFormComponent } from "@library/container-collection/process-form/process-form.component";
import { IAddComponentData, IContainerWrapper, PermissionConfig, STATUS, objArrayType, typeActionsAllowed } from "@library/library.interface";
import { CellEditingStartedEvent, RowDoubleClickedEvent, SelectionChangedEvent, ColDef, ColGroupDef } from "ag-grid-community";
import { MenuItem, MessageService, ConfirmationService, PrimeIcons } from "primeng/api";
import { DialogService, DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { StatusStatic } from "./status.static";

@Injectable({providedIn: 'root'})
export class ContainerService extends RouteObserverService implements OnDestroy{
    isFiltering: boolean;
    @ContentChild('formTemplate') formTemplateRef: TemplateRef<any>;

    constructor(private _helper: HelperService,
        private _dialogService: DialogService,
        private _messageService: MessageService,
        private _confirmationService: ConfirmationService,
        private _gridService: GridService,
        private _activatedRoute: ActivatedRoute,
        private _router: Router
        ){
          super(_activatedRoute, _router);
          this.snapshotLoaded = true;
        }

    onRouteReady(): void {}
    onRouteReloaded(): void {
      if(!this.hasRouterChild){
        this.hasSetConfigInitialised = false;
      }
    }

    private _stateTabMenu : {item: MenuItems};
    private _ref          : DynamicDialogRef;
    private _pi = PrimeIcons;
    private _status : any = StatusStatic.SALES_STATUS_VAL;

    public hasSetConfigInitialised : boolean = false;
    public hasRouterChild : boolean = false;

    public addAction(param: IContainerWrapper, mode: 'view' | 'add' | 'edit' = 'add', item?, editingField?: string){
      const _delBtnEnabled = (param.gridParams == undefined || param?.gridParams?.api?.getSelectedNodes()?.length == undefined) ? true :param?.gridParams?.api?.getSelectedNodes()?.length > 0;
      let _modalHeight;
      if(param?.modalHeight){
        _modalHeight = param.modalHeight;
      } else if(!param.noModalHeight){
        _modalHeight = "100%";
      }

      if(mode == 'add' || (_delBtnEnabled && item)){
        const _updateRec = this._updateRecords(param, mode);
        const _process = (param.hasOwnProperty('isProcess') && param.isProcess) ? ProcessFormComponent : AddComponent;
        const _dialogConf = <DynamicDialogConfig<IAddComponentData>>{
            id: "temp",//Math.random(),
            data: {
                item                    : item,
                isProcess               : param?.isProcess || false,
                process_form            : param?.process_form || null,
                permission              : param.permission,
                aggs                    : param.res?.content?.aggs,
                hideDeleteButton        : true,
                mode                    : mode,
                fields                  : param.gridFields,
                api                     : (p, m) => param.apiService(p, (mode != 'add' ? 'patch': 'put')) ,
                api$                    : (p, m) => param.apiService(p,m),
                title                   : param.title,
                description             : param.description,
                params                  : param?.params,
                requiredFields          : _updateRec?.['required'],
                excludedFields          : _updateRec?.['excluded'],
                includedFields          : _updateRec?.['included'],
                lockedFields            : _updateRec?.['locked'],
                formStructure           : _updateRec?.['formStructure'],
                fromComponent           : (param.fromComponent || ''),
                formProperties          : param.formProperties,
                editingField            : editingField, //WHEN coming from grid as Object (autocomplete, select)
                editorFieldConfigs      : param.editorFieldConfigs,
                hasAddCallbackOverride  : (param.hasAddCallbackOverride == true),
                isReadonly              : (param.isReadonly == true),
            },
            header                      : this._helper.stripHtml(Core.Localize((mode || 'view'), {item: param.title})),
            showHeader                  : ((mode != 'view' || param.detailComponent == undefined) && param.addEditComponent == undefined),
            width                       : (param?.modalWidth || '50vw'), //TODO: no modal width
            position                    : "top",
            transitionOptions           : "0s",
            duplicate                   : true,
            ...(_modalHeight ? {height: _modalHeight} : {})
        };


        const _addEdit  = (param.addEditComponent ? param.addEditComponent : _process)
        const _view     = (param.detailComponent ? param.detailComponent : _process)

        const _render   = (mode == 'view') ? _view : _addEdit;
        this._ref       = this._dialogService.open(_render, _dialogConf);

        this.subscription.add(this._ref?.onClose.subscribe(result => {

            if ((<ConfirmDialogResult>result)?.isConfirmed) {
              if(!param.hasAddCallbackOverride){
                this._messageService.add({
                  detail: Core.Localize('successfullySaved') ,
                  severity: MESSAGE_SEVERITY.SUCCESS,
                  summary: 'Success'});
              }
              param.addCallback?.(result);
            } else if(_dialogConf?.data?.isChanged){
              param.addCallback?.(result);
            }
            this._ref = undefined; //reset the ref to avoid duplicate call
        }));
      } else{
        this._messageService.add({detail: `${Core.Localize("nothingTo", {mode})}`, severity: MESSAGE_SEVERITY.WARN}); //Nothing to {mode}.
      }
    }

    private _deleteAction(param: IContainerWrapper, selected){
      const _delBtnEnabled = (param.gridParams == undefined || param?.gridParams?.api?.getSelectedNodes()?.length == undefined) ? true :param?.gridParams?.api?.getSelectedNodes()?.length > 0;
      if(_delBtnEnabled && selected){
          this._confirmationService.confirm({
          message: `
            <div class="mt-3 fs-14"> ${Core.Localize("confirmDeleteMessage")}</div>
            `,
          header: Core.Localize('deleteConfirmationHeader'),
          icon: 'pi pi-info-circle',
          acceptLabel: Core.Localize('yes'),
          rejectLabel: Core.Localize('no'),
          accept: () => {
              this.subscription.add(param.apiService((typeof selected == "object" ? {...selected, ...param.params} : {id: selected}), 'delete').subscribe(result => { //code 204
                  this._messageService.add({detail: Core.Localize("successfullyDeleted") , severity: MESSAGE_SEVERITY.SUCCESS}); //Successfully deleted.
                  param.deleteCallback?.(result);
              }));
          }});
      } else {
          this._messageService.add({detail: Core.Localize("nothingTo", {mode: 'delete'}) , severity: MESSAGE_SEVERITY.WARN});
      }
    }

    private _updateRecords(params:IContainerWrapper, mode: "view" | "add" | "edit" = "add", item?){
      if(params.hasOwnProperty(mode) && params[mode] != null && (params[mode].excludedFields?.length > 0 || params[mode].includedFields?.length > 0  )){
        return {
          required: params[mode].requiredFields || [],
          locked: [...(params[mode].lockedFields || []), ...(mode == 'add' ?['id', 'mig_id']:[]) ],
          excluded: [...(params[mode].excludedFields || []), ...(mode == 'add' ?['id', 'mig_id']:[]) ],
          included: [...(params[mode].includedFields || []), ...(mode == 'edit' ? ['id']:[]) ],
          formStructure: [...(params[mode].formStructure || []), ...(mode == 'edit' ? ['id']:[]) ]
        }
      }else{
        return {
          required: params.requiredFields || [],
          locked  : [...(params.lockedFields || []), ...(mode != 'add' ? ['id', 'mig_id'] : [])],
          excluded: [...(params.excludedFields || []), ...(mode == 'add' ? ['id', 'mig_id'] : [])],
          included: [...(params.includedFields || [])],
          formStructure: [...(params.formStructure || [])]
        }
      }
    }

    public dialogAction(mode: "view" | "add" | "edit" | "delete", param: IContainerWrapper, item?){
      if(param.hasOwnProperty(mode) && param[mode].hasOwnProperty("callback") && param[mode].callback != null ){
        param[mode].callback(param, item);
      }else{
        if (mode != "delete"){
          if(mode != "add"){

            if(mode == "edit" && !param.permission?.update){

              this._messageService.add({detail: Core.Localize('noEditAccess'), severity: MESSAGE_SEVERITY.WARN});
            } else{

              this.addAction(param, mode, item);
            }
          }else{
            if(!param.permission?.create){
              this._messageService.add({detail: Core.Localize('noCreateAccess'), severity: MESSAGE_SEVERITY.WARN});
            } else{
              this.addAction(param, 'add', param.initValue); //here
            }
          }
        } else{
          if(!param.permission?.delete){
            this._messageService.add({detail: Core.Localize('noDeleteAccess'), severity: MESSAGE_SEVERITY.WARN});
          } else{
            const _selected = item;
            this._deleteAction(param, _selected);
          }
        }
      }
    }

    private _getActionsSubMenu(param: IContainerWrapper): MenuItem[]{
      const _subMenus: MenuItem[] = [
        {
            id: 'view',
            label: Core.Localize('actionsSubMenuView'),
            icon: 'pi pi-pencil',
            command: p => {
              this.dialogAction("view", param, param.gridParams?.api?.getSelectedRows()[0]);
            }
        },
        {
            id: 'new',
            label: Core.Localize('new'),
            icon: 'pi pi-plus',
            command: p => {
                this.dialogAction("add", param, param.initValue);
            }
        },
        {
            id: 'edit',
            label: Core.Localize('edit'),
            icon: 'pi pi-pencil',
            command: p => {
                this.dialogAction("edit", param, param.gridParams?.api?.getSelectedRows()[0]);
            }
        },
        {
            id: 'delete',
            label: Core.Localize('delete'),
            icon: 'pi pi-trash',
            disabled: false,
            command: (event) => {
              this.dialogAction("delete", param, param.gridParams?.api?.getSelectedRows()[0]);
            }
        }
      ];

      if(!param.isReadonly){
        if(param.amendSubMenus){
          return param.amendSubMenus(_subMenus, param);
        }
      } else if(!param.amendSubMenus){
        return _subMenus.filter(_s => _s.id == 'view');
      }

      return _subMenus;
    }

    private _statusFieldCheck(param: IContainerWrapper): boolean {
      let _fieldCheck : boolean = false;
        param.gridFields?.forEach((f) => {
          if(!_fieldCheck && param.statusField == f?.field){
            _fieldCheck = true;
          }
        })
        return _fieldCheck;

    }

    private _setMenuActions(param: IContainerWrapper, forceReplace = false, searchCallback?: (param)=>void){
      const _subMenus = this._getActionsSubMenu(param);
      const _fieldCheck = this._statusFieldCheck(param);

      let tItems: MenuItems[] = (_subMenus || []).length > 0 ? [{
        label: Core.Localize('action', {count: 2}),
        icon: 'pi pi-plus',
        items: _subMenus
      }] : [];

      param.config.menuType = "menubar";
      param.config.menuDisplay = "both";

      if(_fieldCheck){
        param.config = {
          ...param.config,
          containerType : "twocolumn",
          items         : this._getStatusFields(param, _subMenus, searchCallback)
        }
      } else{
        let copyMenuItems :any = Object.assign([], param.config.items);
        if(param.config.hasOwnProperty('items') && param.config.items.length > 0){
          if(forceReplace){
            param.config.items =  tItems;
          } else{
            param.config.items = tItems.concat(copyMenuItems);
          }
        } else if(param.stateTabs?.length > 0){

          param.config = {...param.config, items: param.stateTabs?.map(_m => (
            {
            ..._m,
            items: tItems.concat(_m.items)
          }))};
        } else {
          param.config = {...param.config, items: tItems};
        }
      }
    }

    private _getStatusFields(param: IContainerWrapper, menuItems:any, searchCallback?: (param)=>void){
      let that = this;
      let status = param?.res?.content?.aggs?.find(_agg => {
        const _k = Object.keys(_agg)?.[0];
        return _k == param?.statusField;
      })?.[param?.statusField];

      let tItems = [
        {
          id: 'all',
          label: Core.Localize('all'),
          icon: 'fa-solid fa-circle',
          onClick: (item?, parentIndex?, event?) => {
            this.filterStatus(param, {item:item});
          },
          items: [{
            label: 'Actions',
            titleAbbr: 'bus',
            icon: 'pi pi-plus',
            items: menuItems
          }],
          onSearch: (a) => {
            searchCallback?.(a);
          }
        }
      ].concat(status.filter(_s => {
          const _label = (_s?.[param.statusField + '__name'] || _s?.[param.statusField]);
          return _label != undefined;
        })
        .map(_s => {
        const _label = (_s?.[param.statusField + '__name'] || _s?.[param.statusField]);
        const _stat = checkStatus(_label);
        const _labelToTranslate = (typeof _stat == "object") ? _stat.name : _label; 
        return{
          id: (typeof _stat == "object") ? _stat.value : _label,
          label: `${ param.skipTranslation ? _labelToTranslate : Core.Localize(_labelToTranslate) }`,
          icon: (typeof _stat == "object") ? _stat.icon : 'fa-solid fa-circle',
          class: (typeof _stat == "object") ? _stat.color_class : '',
          onClick: (item?, parentIndex?, event?) => {
            this.filterStatus(param, {item:item});
          },
          items: [{
            label: 'Actions',
            titleAbbr: 'bus',
            icon: 'pi pi-plus',
            items: menuItems
          }],
          onSearch: (a) => {
            searchCallback?.(a);
          }
        }
      }));

      return tItems;


      function checkStatus(label){
        if(that._status[label] != undefined){
          return that._status[label];
        }else{
          return label;
        }


      }
    }

    public setContainerConfig(param: IContainerWrapper, forceReplace = false, searchCallback?: (param)=>void){

        this._setMenuActions(param, forceReplace, searchCallback);

      this.hasSetConfigInitialised = true;
    }

    public setContainerConfigForList(param: IContainerWrapper){
      if(!this.hasSetConfigInitialised){
        this._setMenuActions(param);
      }
      this.hasSetConfigInitialised = true;
    }

    public _viewAction(p: any, param: IContainerWrapper, _activatedRoute){
      const _selected = p.api?.getSelectedRows();
      const item = _selected?.[0];

      if(param.selectionCallback){
        if(_selected?.length > 0){
          param.selectionCallback(item, p);
        } else{
          param.selectionCallback();
        }
      } else {
        //if(param.withDetailRoute){
          if(_activatedRoute){
            if(item?.id){
              if(param.withDetailRoute){
                //this._helper.gotoPage({pageName: [item.id], extraParams: {relativeTo: (isChildRendered ? _activatedRoute.parent : _activatedRoute)}});
                //const isChildRendered = this._helper?.isNotEmpty(this.snapshotParams) && this.snapshotParams['id'] && _activatedRoute?.parent;
                //const isChildRendered = this._helper?.isNotEmpty(this.snapshotParams) && Object.keys(this.snapshotParams).length > 0 && _activatedRoute?.parent;
                const isChildRendered = (this._helper?.isNotEmpty(this.snapshotParams) && Object.keys(this.snapshotParams).length > 0 && _activatedRoute?.parent?.component != null);
                if(isChildRendered){
                  //this.dialogAction("view", param, _selected);
                  this.dialogAction("view", param, item);
                } else{
                  this._helper.gotoPage({pageName: [item.id], extraParams: {relativeTo: _activatedRoute}});
                }
              } else{
                //this.dialogAction("view", param, _selected);
                this.dialogAction("view", param, item);
              }
            } else{
              this._messageService.add({detail: Core.Localize('noItemIdFound') , severity: MESSAGE_SEVERITY.WARN});
            }
          } else{
            this._messageService.add({detail: Core.Localize('noActivatedRouteFound') , severity: MESSAGE_SEVERITY.WARN});
          }
        //}
      }
    }

    public getExtendedGridDefn(param: IContainerWrapper, _activatedRoute?: ActivatedRoute, searchCallback?: (param)=>void): ExtendedGridDefinition{
        return {
            amendColDefs: (colDefs, _firstResult) => {
              return this._setGridStatusActionCols(param, colDefs, _activatedRoute);
            },
            onCellEditingStarted: (event: CellEditingStartedEvent) => {
              if(event.column?.getColDef().type?.includes(COLUMN_TYPE.NEW_AUTOCOMPLETE_COLUMN) ){ //RT: to prevent double opening\
                event.api?.stopEditing(true);
                event.event?.stopPropagation();
                event.event?.preventDefault();
                this.addAction(param, 'view', event?.data, (event.colDef?.field || event.colDef?.colId));
              }
            },
            onCellEditingStopped: (event: any) => { /* event: CellEditingStoppedEvent */
              if(!event.column?.getColDef().type?.includes(COLUMN_TYPE.NEW_AUTOCOMPLETE_COLUMN) && event?.valueChanged /* event?.oldValue != event?.newValue */){
                const _colId = event.column.getColId();
                this.subscription.add(param.apiService({id: event.data?.['id'], [_colId]: event.newValue}, 'patch').subscribe(res => {
                    this._messageService.add({detail: 'Successfully saved.' , severity: MESSAGE_SEVERITY.SUCCESS});
                }));
              }
            },
            extraContextMenuItems: (p) => {
              const _selected = p.api?.getSelectedRows?.()?.[0];
              const _toRet = [];

              if(!(param?.excludedMenus || []).includes('view')){
                _toRet.push({
                    item: {
                    name: Core.Localize('actionsSubMenuView'),
                    disabled: !_selected,
                    icon: `<i class="${!_selected ? this._pi.EYE_SLASH : this._pi.EYE}"></i>`,
                    cssClasses: ['cursor-pointer'],
                    action: () => {
                        this.dialogAction("view", param, _selected);
                        /* this._viewAction(p, param, _activatedRoute); p?.node?.setSelected?.(true, true); */
                      },
                    }
                });
              }

              if(!param.isReadonly){
                if(!(param?.excludedMenus || []).includes('new')){
                  _toRet.push({
                    item: {
                    name: Core.Localize('new'),
                    icon: `<i class="pi pi-plus"></i>`,
                    cssClasses: ['cursor-pointer'],
                    action: () => {
                            this.dialogAction("add", param, _selected);
                        },
                    }
                  });
                }

                if(!(param?.excludedMenus || []).includes('edit')){
                  _toRet.push({
                    item: {
                    name: Core.Localize('edit', {item: (_selected?.name || (_selected?.id ? `${Core.Localize('item_item', {item: _selected.id})}` : ''))}),
                    disabled: !_selected,
                    icon: `<i class="${this._pi.PENCIL}"></i>`,
                    cssClasses: ['cursor-pointer'],
                    action: () => {
                            this.dialogAction("edit", param, _selected);
                        },
                    }
                  });
                }

                if(!(param?.excludedMenus || []).includes('delete')){
                  _toRet.push({
                    item: {
                    disabled: !_selected,
                    name: Core.Localize('delete'),
                    icon: `<i class="${this._pi.TRASH}"></i>`,
                    cssClasses: ['cursor-pointer'],
                    action: () => {
                        this.dialogAction("delete", param, _selected);
                    }
                    }
                  });
                }
              }

              return _toRet;
            },
            onGridReady: (p) => {
              if(!this.hasSetConfigInitialised){
                this.setContainerConfig(param);
              }
              //this.setContainerConfig(param);
            },
            onFirstDataRendered: (p) => {
              //RT if(this._statusFieldCheck(param)){
                this._setMenuActions(param, false, searchCallback);
              //}
              if(this.isFiltering){
                setTimeout(() => {
                  this.filterStatus(param);
                });
                this.isFiltering = false;
              }
            },
            onRowDoubleClicked: (p: RowDoubleClickedEvent) => {
              if(!param.gridActionsColumnConfig?.enable){
                this._viewAction(p, param, _activatedRoute);
              }
            },
            onSelectionChanged: (p: SelectionChangedEvent) => {
              const _selected = p.api.getSelectedRows();

              if(_selected?.length == 0){
                if(param.selectionCallback){
                  param.selectionCallback();
                } else {
                  if(param.withDetailRoute){
                    if(_activatedRoute){
                      if(_activatedRoute?.firstChild){
                        this._helper.gotoPage({pageName: ['..'], extraParams: {relativeTo: _activatedRoute.firstChild}});
                      } /* else{
                        //this._messageService.add({detail: Core.Localize('unableToGoBack') , severity: MESSAGE_SEVERITY.WARN});
                      } */
                    } else{
                      this._messageService.add({detail: Core.Localize('noActivatedRouteFound') , severity: MESSAGE_SEVERITY.WARN});
                    }
                  }
                }
              }
            },
            rowSelection: (param?.withDetailRoute ? "single" : "multiple"),
            ...param.extendedGridDefOverride,
        }
    }

    public filterStatus(param: IContainerWrapper, pMenu?: {item: MenuItems}){
      let _pMenu;
      if(pMenu){
        this._stateTabMenu = pMenu;
        _pMenu = pMenu;
      } else{
        _pMenu = this._stateTabMenu;
      }

      if(_pMenu){
        const _filterModel = param.gridParams?.api?.getFilterModel();
        const _statusFilter = {
          filterType: "multi",
          filterModels: [
              null,
              {
                  values: [_pMenu.item.id ||""],
                  filterType: "set"
              }
          ]
        }
        const _activeFilter = {[param.statusField]: (_pMenu.item.id != 'all' ? _statusFilter : null)}
        /* RT FILTERING KEY TO USE _fieldToUse  */
        const _colId = param.statusField;
        let _fieldToUse = _colId;
        const aggVal = this._gridService.aggsValue?.find((eachAgg) => eachAgg.hasOwnProperty(_colId));
        if(aggVal && aggVal[_colId]?.[0]){
          Object.keys(aggVal[_colId]?.[0]).forEach(_eaKey => {
            if(_eaKey != 'count'){
              const _fSplit = _eaKey.split("__");
              if(_fSplit?.length > 0 && _fSplit[1]){
                  _fieldToUse = _eaKey;
              }
            }
          });
        }

        param.params = {...param.params, ...{[_fieldToUse]: _activeFilter?.[_colId]?.filterModels[1]?.values}};
        //END

        if(param.viewtype == "grid"){
          param.gridParams?.api?.setFilterModel({..._filterModel, ..._activeFilter });
        } else{
          param.listFilterCallback?.(param.params);
        }
      }
    }

    public _setGridStatusActionCols(param: IContainerWrapper, colDefs: ColDef[], _activatedRoute: ActivatedRoute): (ColDef | ColGroupDef)[]{
      //dates and status field
      const isStatusFieldCheck = this._statusFieldCheck(param);
      const _coldefToReturn = colDefs.map(_col => {
          //for DATES make type EDITABLE + DATE
          const _isDate = param?.gridFields?.find(_f => _f.field == _col.field)?.form == "date";
          let _toReturn: ColDef = {..._col,
                  ...(['id'].includes(_col.field) ? {} : ({
                      type: [...((isStatusFieldCheck && _col.field == param.statusField) ? [] : (param.isReadonly ? [] : [COLUMN_TYPE.EDITABLE_COLUMN])),
                      ...(_isDate ? [COLUMN_TYPE.DATE_COLUMN] : []),
                      ...(_col.type ? (Array.isArray(_col.type) ? _col.type : [_col.type]) : [])]}
                  ))
          };

          //for valid statusField append actions

          if(isStatusFieldCheck && _col.field == param?.statusField){
            const _actions: CellCustomActions[] = [
              {   colId: param?.statusField,
                  isHidden: false,
                  text: (p) => {
                    const _stat = p?.data?.__data__?.[param?.statusField] || p?.data?.[param?.statusField];
                    return Core.Localize(_stat?.name || _stat);
                  },
                  /* mode: 'badge',
                  badgeClass: (p) => (STATUS.byName[_stat]?.primeClass || 'warning'), */
                  isReversedTextAndIcon: true,
                  useButton: false,
                  icon: (p) => {
                    const _stat = p?.data?.__data__?.[param?.statusField] || p?.data?.[param?.statusField];
                    return _stat?.icon || PrimeIcons.INFO_CIRCLE
                  },
                  btnClass: 'cursor-pointer',
                  iconClass: 'pr-1'
              }];
              _toReturn = {..._toReturn,
                  //cellClass: 'no-padding no-margin fs-9 center'
                  /* field: param?.statusField, cellRenderer: 'cellCustom', width: 120, minWidth: 120, pinned: 'right', hide: false,
                  cellClass: (p) => 'center full-width full-height text-primary ' + (_stat?.color_class || ''), */
                  field: param?.statusField, cellRenderer: 'cellCustom', width: 120, minWidth: 120, pinned: 'right', hide: false,
                  cellClass: (p) => {
                    const _stat = p?.data?.__data__?.[param?.statusField] || p?.data?.[param?.statusField];
                    return 'font-medium text-center full-width full-height text-primary ' + (_stat?.color_class || '')
                  },
                  /* valueFormatter: (p) => { console.log({p}); return 'here' + p.value?.value }, */
                  cellRendererParams: (p: any) => {
                    const _stat = p?.data?.__data__?.[param?.statusField] || p?.data?.[param?.statusField];
                    if(_stat?.name || _stat){
                      return {actions: _actions};
                    }
                    return {};
                  }
              }
          }
          return _toReturn;
      });

      //append actions column
      if(param.gridActionsColumnConfig?.enable){
        let _actionsAllowed: CellCustomActions[];
        _actionsAllowed = (<typeActionsAllowed[]>['view']).filter(act => {
          return ((param.gridActionsColumnConfig?.actions || []).length == 0 || param.gridActionsColumnConfig?.actions?.findIndex(cAct => cAct == act) >= 0)
        }).map((_action: typeActionsAllowed) => {
          let _onClick: (e, p) => void;
          let _title: string;

          switch(_action){
            case "view":
              _title = Core.Localize('viewItem');
              _onClick = (e, p) => { this._viewAction(p, param, _activatedRoute) }
            break;
          }

          return {
            /* text: _action, */
            /* mode: 'button', */
            title: _title,
            colId: (param.statusField == "actions" ? "action" : "actions"),
            useButton: false,
            icon: PrimeIcons.INFO_CIRCLE,
            isHidden: false,
            btnClass: 'cursor-pointer',
            iconClass: 'w-full',
            clickCallback: (event, p) => {
              event?.preventDefault();
              event?.stopPropagation();
              p?.node?.setSelected?.(true, true);
              _onClick?.(event, p);
            }
          }
        });
        if(_actionsAllowed?.length > 0){
          const _actionColumn: ColDef = {
            field: (param.statusField == "actions" ? "actions_1" : "actions"), cellRenderer: 'cellCustom', maxWidth: 50, resizable: false, pinned: 'left', hide: false, cellClass: 'p-1 center full-width full-height bg-primary-faded text-primary',
            cellRendererParams: (p: any) => ({
              actions: _actionsAllowed
            })
          }
          return _coldefToReturn?.concat([_actionColumn])
        }
      }

      return _coldefToReturn;
    }

    override ngOnDestroy(): void {
      this.subscription.unsubscribe();
      this.snapshotLoaded = false;
      this.hasSetConfigInitialised = false;
    }
}
