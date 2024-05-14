import { ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { InfoCardConfig } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';


@Component({
  selector: 'eg-info-card',
  templateUrl: './info-card.component.html',
  styleUrls: ['./info-card.component.scss']
})


export class InfoCardComponent implements OnInit,  OnDestroy {

  @Input('styleClass') styleClass   : any;
  @Input('display') display         : "dogtag" | "stats" = "dogtag"
  @Input('config') config           : InfoCardConfig;
  @Output('configChange') configChange : any = new EventEmitter()

  public isLoading            : boolean = true;
  public isNull               : boolean = false;

  constructor(private _wr: WrapperService, private _cdr : ChangeDetectorRef){

  }

  public triggerChangeDetection() {
    this._cdr.markForCheck(); // Marks the component and its ancestors as dirty
    this._cdr.detectChanges(); // Triggers change detection for the component and its descendants
  }

  ngOnInit(): void {


   /*  this.config = {
      illustrationType : "icon",
      illustration : {
        icon : {class: 'fa-solid fa-home text-primary-faded', name:"home"}
      },
      topic: "home",
      value: "1000 / 1000"
    }
    this.config = {
      illustrationType : "image",
      illustration : {
        image : {url: 'http://localhost:8000/media/user/2__/picture/WebProfPic.png', name:"home", class:"w-4rem h-4rem"}
      },
      topic: "home",
      value: "1000 / 1000"
    }
 */
    setTimeout(() => {
        this.isLoading = false;
        this.triggerChangeDetection()
    }, 500);
  }

  public imageErr(event){
    this._wr.libraryService.noImageUrl(event);
  }

  ngOnDestroy(): void {

  }


}
