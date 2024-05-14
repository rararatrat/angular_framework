import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChildren } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Data, Params, Router } from '@angular/router';
import { RouteObserverService } from '@eagna-io/core';
import * as L from 'leaflet';
/* import { faLocationDot } from "@fortawesome/free-solid-svg-icons"; */

@Component({
  selector: 'eg-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent extends RouteObserverService implements OnInit, OnDestroy {
  @Input('mapType')         mapType : "google" | "leaflet" = "google";
  @Output('mapTypeChange')  mapTypeChange = new EventEmitter();
  @Input('data')            data : any;
  @Output('dataChange')   dataChange = new EventEmitter();

  @ViewChildren("gMap")        gMap            : ElementRef;

  private _map              : any;
  private _temp             : any = {
    lat: 10.438756156820116,
    lon: 77.5206658983979
  }
  public options      : any;
  public overlays     : any = [];
  public infoWindow : any;

  constructor(private _activatedRoute: ActivatedRoute,
    private _router: Router,){
      super(_activatedRoute, _router);
    }

  ngOnInit(): void {
    this._initComponent();
  }


  onRouteReloaded(event,snapshot, rootData, rootParams) : void{}
  onRouteReady(event,snapshot, rootData, rootParams): void {}

  private _initComponent(){
    switch (this.mapType) {
      case "google":
        this._initGoogle(this.data);
        break;
      case "leaflet":
        setTimeout(() => {
          this._initLeaflet(this.data);
        }, 10);
        break;

      default:
        break;
    }
  }

  private _initLeaflet(address): void {
    let centerOfMap = L.latLng(10.438756156820116, 77.5206658983979);
    const map = L.map('map', {
      center: centerOfMap,
      zoom: 1
    });

    this._map = map;
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 0,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });
    tiles.addTo(this._map);
    let greenIcon = L.divIcon({
      html: '<i class="fa-solid fa-location-dot fa-2x"></i>',
      iconSize: [10, 10],
      className: 'text-primary'
    });
    address.forEach(element => {
      let latlng = L.latLng(element.lat, element.lon)
      let marker = L.marker(latlng, {icon: greenIcon}); //{icon: ''}

      let popup = L.popup();
      popup.setLatLng(latlng);
      popup.setContent(this._addressString(element))

      marker.bindPopup(popup)
      marker.addTo(this._map);
    });

  }

  private _initGoogle(address) :void {
    this.options = {
      disableDefaultUI: true,
      /* center:new google.maps.LatLng(40.5499490416043, 34.953640086323944), */

      zoom: 1,
      mapId: "2b7b3e8655c2bf94"
    };

    address.forEach(element => {
      const lat : number = +element.lat;
      const lon : number = +element.lon;
      const m = { position: {lat: lat, lng: lon},
                  icon: {
                    /* path: faLocationDot.icon[4] as string, */
                    fillColor: getComputedStyle(document.body).getPropertyValue('--primary'),
                    fillOpacity: 1,
                    /* anchor: new google.maps.Point(
                      faLocationDot.icon[0] / 2, // width
                      faLocationDot.icon[1] // height
                    ), */
                    strokeWeight: 1,
                    strokeColor: getComputedStyle(document.body).getPropertyValue('--primary'),
                    scale: 0.04,
                  },

                  title:JSON.stringify(element)}
      //let marker = new google.maps.Marker(m)
      let marker = null
      console.log(element);
      this.overlays.push(marker)
    });
  }

  public handleOverlay(event){
    //this.infoWindow = new google.maps.InfoWindow();
    this.infoWindow = null;
    const address = JSON.parse(event.overlay.title);
    const content =  this._addressString(address);
    this.infoWindow.setContent(content);
    this.infoWindow.open(event.map, event.overlay);
  }

  private _addressString(address){
    return `
    <div class="address-name bold">${address['name']}</div>
    <div class="address-street">${address['bldgNumber']}, ${address['street']}</div>
    <div class="address-state">${address['city']}, ${address['state']} ${address['zipcode']}</div>
    <div class="address-country">${address['country']}</div>
    `
  }

  override ngOnDestroy(): void {

  }

}
