
import { ChangeDetectorRef, Injectable, Injector } from "@angular/core";
import { LibraryService } from "./library.service";
import { ConfirmationService, MessageService } from "primeng/api";
import { DialogService} from 'primeng/dynamicdialog';
import { HelperService, CoreService, AbstractCoreService, SharedService, GridService, SideBarService} from '@eagna-io/core';
import { ContainerService } from "./container.service";
import { CommunicationService } from "./communication.service";
import { Location } from "@angular/common";
import { DeviceService } from "./device.service";


@Injectable({ providedIn: 'root' })
export class WrapperService {
  private _libraryService: LibraryService;
  public get libraryService(): LibraryService {
    if(!this._libraryService){
      this._libraryService = this._injector.get(LibraryService);
    }
    return this._libraryService;
  }

  private _confirmationService: ConfirmationService;
  public get confirmationService(): ConfirmationService {
    if(!this._confirmationService){
      this._confirmationService = this._injector.get(ConfirmationService);
    }
    return this._confirmationService;
  }

  private _messageService: MessageService;
  public get messageService(): MessageService {
    if(!this._messageService){
      this._messageService = this._injector.get(MessageService);
    }
    return this._messageService;
  }

  private _dialogService: DialogService;
  public get dialogService(): DialogService {
    if(!this._dialogService){
      this._dialogService = this._injector.get(DialogService);
    }
    return this._dialogService;
  }

  private _helperService: HelperService;
  public get helperService(): HelperService {
    if(!this._helperService){
      this._helperService = this._injector.get(HelperService);
    }
    return this._helperService;
  }

  private _coreService: CoreService;
  public get coreService(): CoreService {
    if(!this._coreService){
      this._coreService = this._injector.get(CoreService);
    }
    return this._coreService;

  }

  private _sharedService: SharedService;
  public get sharedService(): SharedService {
    if(!this._sharedService){
      this._sharedService = this._injector.get(SharedService);
    }
    return this._sharedService;

  }

  private _containerService: ContainerService;
  public get containerService(): ContainerService {
    if(!this._containerService){
      this._containerService = this._injector.get(ContainerService);
    }
    return this._containerService;

  }

  private _gridService: GridService;
  public get gridService(): GridService {
    if(!this._gridService){
      this._gridService = this._injector.get(GridService);
    }
    return this._gridService;

  }

  private _communicationService: CommunicationService;
  public get communicationService(): CommunicationService {
    if(!this._communicationService){
      this._communicationService = this._injector.get(CommunicationService);
    }
    return this._communicationService;

  }

  private _sidebarService: SideBarService;
  public get sidebarService(): SideBarService {
    if(!this._sidebarService){
      this._sidebarService = this._injector.get(SideBarService);
    }
    return this._sidebarService;

  }

  private _cdr: ChangeDetectorRef;
  public get cdr(): ChangeDetectorRef {
    if(!this._cdr){
      this._cdr = this._injector.get(ChangeDetectorRef);
    }
    return this._cdr;
  }

  private _loc: Location;
  public get loc(): Location {
    if(!this._loc){
      this._loc = this._injector.get(Location);
    }
    return this._loc;
  }

  private _device: DeviceService;
  public get device(): DeviceService {
    if(!this._device){
      this._device = this._injector.get(DeviceService);
    }
    return this._device;
  }

  constructor(private _injector: Injector) { }
}
