import { Injectable } from '@angular/core';

import { AnonymousSubject, Subject } from 'rxjs/internal/Subject';
import { webSocket } from "rxjs/webSocket";
import Favico from 'favico.js';


@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private subject: AnonymousSubject<MessageEvent>;
  public notification$: any = new Subject<any>();
 /*  private config: SocketIoConfig = {
    url: 'ws://localhost:8000/',
    options: {
      transports: ['websocket']
    }
  }; */
  public favico = new Favico({
    animation: 'none',
    bgColor: '#9f0000',
    textColor: '#9f0000',
    position : 'up'
  });

  constructor() {

  }

  public wssNotification() {
    return webSocket('ws://localhost:8000/ws/comms/notifications/');
  }

  public updateNotificationfavicon(){
    let hasNotif = JSON.parse(localStorage.getItem("new_notif"));
    if(hasNotif){
      this.favico.badge(1);
    }else{
      this.favico.badge(0);
    }

  }

}
