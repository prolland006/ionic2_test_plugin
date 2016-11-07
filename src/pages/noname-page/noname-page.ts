'use strict';

import {Component, Renderer} from '@angular/core';
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
              public backgroundGeolocationService:BackgroundGeolocationService) {

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

  setCurrentLocation(location: {latitude:string, longitude:string}) {
    this.trace.info(`nonamePage.setCurrentLocation  ${location.latitude},${location.longitude}`);

    if ((this.latitude == location.latitude) && (this.longitude == location.longitude)) {
      return;
    }

    this.latitude = location.latitude;
    this.longitude = location.longitude;

    if(this.connectivityService.isOnline()) {
      this.initMap(location);
    } else {
      this.trace.info(`your mobile is offline`);
    }
  }

  addMarker(location: {latitude:string, longitude:string}){
    if (this.map == null)return;

      let latLng = new google.maps.LatLng(location.latitude, location.longitude);
      let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: latLng
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
