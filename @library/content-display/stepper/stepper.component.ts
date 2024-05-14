import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MenuItems } from '@eagna-io/core';
import { MenuItem } from 'primeng/api';

export interface IStepper{
  title         : String,
  description   : String,
  icon          : String,
  status        ?: any,
  time_stamp    ?: any,
  user          ?: any,
  onClick       ?: (param?:any, event?: Event) => void;
}

@Component({
  selector: 'eg-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss']
})
export class StepperComponent implements OnInit, OnDestroy {

  @Input('steps') steps : IStepper[];

  constructor(){

  }

  ngOnInit(): void {
    this.steps = [
      {
        title : "temp1",
        description : "Temporaray 1",
        icon  : "fa-solid fa-check-circle",
        status:"approved",
        user: {first_name: "vig", last_name:"nesh"},
        time_stamp: new Date(),
        onClick(param, event) {
          console.log(param, event)
        },
      },
      {
        title : "temp1",
        description : "Temporaray 1",
        icon  : "fa-solid fa-check-circle",
        status:"rejected",
        onClick(param, event) {
          console.log(param, event)
        },
      },
      {
        title : "temp1",
        description : "Temporaray 1",
        icon  : "fa-solid fa-check-circle",
        status:"pending",
        onClick(param, event) {
          console.log("param", event)
        },
      },
    ]
  }

  onSelected(event){

  }

  ngOnDestroy(): void {

  }

}
