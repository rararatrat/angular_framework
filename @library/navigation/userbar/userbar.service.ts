import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Sidebar } from 'primeng/sidebar';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserbarService {


  constructor(private _http:HttpClient) { }


}
