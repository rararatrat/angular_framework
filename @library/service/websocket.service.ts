import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { share } from 'rxjs/operators';
import { environment as env } from 'src/environment/environment';
@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private websocket: WebSocket;
  private messageSubject: Subject<string> = new Subject<string>();

  constructor() { }

  public connect(reqUrl: string): Observable<any> {
    const url     = env.apiWs+reqUrl;
    const token   = localStorage.getItem('at');
    const headers = token ? { token: `eagna_-_${token}` } : {};
    const wsUrl   = `${url}?${new URLSearchParams(headers).toString()}`;

    const webSocket = new WebSocket(wsUrl);

    const observable = new Observable(observer => {
      webSocket.onopen = event => {
        console.log('WebSocket connection opened');
      };

      webSocket.onmessage = event => {
        observer.next(event.data);
      };

      webSocket.onerror = event => {
        observer.error(event);
      };

      return () => {
        webSocket.close();
      };
    });

    return observable.pipe(share());
  }

  public connect2(reqUrl: string) {
    const url     = env.apiWs+reqUrl;
    const token   = localStorage.getItem('at');
    const headers = token ? { token: `eagna_-_${token}` } : {};
    const wsUrl   = `${url}?${new URLSearchParams(headers).toString()}`;

    this.websocket = new WebSocket(wsUrl);
    console.log(this.websocket.readyState === WebSocket.OPEN)
    this.websocket.onopen = () => {

      console.log('WebSocket connection established.');
    };

    this.websocket.onmessage = (event) => {
      const message = event.data;
      console.log('WebSocket message received:', message);
      this.messageSubject.next(message); // Emit the received message
    };

    this.websocket.onclose = () => {
      console.log('WebSocket connection closed. Attempting to reconnect...');
      this.connect2(reqUrl); // Reconnect when the connection is closed
    };
  }

  send(message: string) {
    if (this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(message);
    } else {
      console.error('WebSocket connection is not open.');
    }
  }

  close() {
    this.websocket.close();
  }

  getMessageObservable(): Observable<string> {
    return this.messageSubject.asObservable();
  }
}
