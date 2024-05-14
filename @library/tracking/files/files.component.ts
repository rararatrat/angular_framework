import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Core } from '@eagna-io/core';
import { INoDataFound } from '@library/library.interface';
import { WrapperService } from '@library/service/wrapper.service';

@Component({
  selector: 'eg-files',
  templateUrl: './files.component.html',
  styleUrls: ['./files.component.scss']
})
export class FilesComponent implements OnInit, OnDestroy {

  @Input('data') data : any
  public visible : boolean = false;
  public noDataConfig   : INoDataFound;

  constructor(private _wr : WrapperService){

  }

  trackByFn(index, item) {
    return item.id; // unique id corresponding to the item
  }

  ngOnInit(): void {
    this.noDataConfig = {
      action:"Add",
      message: Core.Localize('no_files_uploaded_yet'),
      hasCallback : true,
      callback : (p) => {
        this.openDialog(p)
      },
      icon:"fa-solid fa-file"
    }
  }

  uploadFile(data){
    let temp = {
      id    : this.data.id,
      files :  this._wr.libraryService.toFormData(data)
    }

    this.data.api$(temp, "patch").subscribe({
      next : (res) => {
        console.log(res);
      },
      complete : () => {

      }
    })


    //this.data.service[this.data.context]()
  }

  openDialog(event){
    this.visible = !this.visible;
  }

  handleCallback(event, data){
    console.log(event, data)
  }


  ngOnDestroy(): void {

  }


}
