'use strict';

import {Component, Renderer, NgZone} from '@angular/core';
import {Platform, NavController, Events} from "ionic-angular/index";
import { ViewChild, ElementRef } from '@angular/core';
import Timer = NodeJS.Timer;
import {log, PRIORITY_INFO, PRIORITY_ERROR} from "../../services/log";
import {ConnectivityService} from "../../services/connectivity-service";
import {BackgroundGeolocationService} from "../../services/background-geolocation-service";

declare let google;

@Component({
  selector: 'noname-page',
  templateUrl: 'noname-page.html'
})

export class nonamePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any = null;

  public title: string = 'Noname';
  latitude: string = '';
  longitude: string = '';
  markerNb: number = 0;

  constructor(public navCtrl: NavController, private platform: Platform, public trace: log,
              public connectivityService: ConnectivityService, events: Events, renderer: Renderer,
              public backgroundGeolocationService:BackgroundGeolocationService, public zone: NgZone) {

    this.trace.info('create nonamePage');

    renderer.listenGlobal('document', 'online', (event) => {
      this.trace.info('you are online...');
    });

    renderer.listenGlobal('document', 'offline', (event) => {
      this.trace.info('you are offline...');
    });

    events.subscribe('BackgroundGeolocationService:setCurrentLocation', (location) => {
      this.setCurrentLocation(location[0]);
    });

    events.subscribe('BackgroundGeolocationService:setCurrentForegroundLocation', (location) => {
      this.setCurrentForegroundLocation(location[0]);
    });


  }

  initMap(location: {latitude:string, longitude:string}) {
    this.trace.info(`initMap  ${location.latitude},${location.longitude}`);
    let latLng = new google.maps.LatLng(location.latitude, location.longitude);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    if (this.map == null) {
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    }
    this.map.setCenter(latLng);
    this.addMarker(location);
  }

  setCurrentLocation(location: {latitude:string, longitude:string, provider: string}) {
    this.trace.info(`${location.latitude},${location.longitude},${location.provider}`);

    if ((this.latitude == location.latitude) && (this.longitude == location.longitude)) {
      return;
    }

    this.zone.run(() => {
      this.latitude = location.latitude;
      this.longitude = location.longitude;

      if(this.connectivityService.isOnline()) {
        this.initMap(location);
      } else {
        this.trace.info(`your mobile is offline`);
      }
    });

  }

  setCurrentForegroundLocation(location: any) {
    this.trace.info(`foreground: ${location.latitude},${location.longitude},${location.provider}`);
  }

  addMarker(location: {latitude:string, longitude:string}){
    if (this.map == null)return;

    let latLng = new google.maps.LatLng(location.latitude, location.longitude);

    /*let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });*/

    let marker = new google.maps.Circle({
      strokeColor: '#FF0000',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#FF0000',
      fillOpacity: 0.35,
      map: this.map,
      center: latLng,
      radius: 10
    });

    this.addInfoWindow(marker, `<h4>${this.markerNb++}</h4>`);
  }

  addInfoWindow(marker, content) {

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

   /*
   * set the media URL switch the platform
   */
  getMediaURL(mediaPath) {
    if (this.platform.is('android')) {
      return "/android_asset/www/assets/" + mediaPath;
    }
    return "../../assets/" + mediaPath;
  }

}
