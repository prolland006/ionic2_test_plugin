'use strict';

import { Component } from '@angular/core';
import {Platform, NavController} from "ionic-angular/index";
import { ViewChild, ElementRef } from '@angular/core';
import Timer = NodeJS.Timer;
import { BackgroundGeolocation } from 'ionic-native';

declare let google;

@Component({
  selector: 'noname-page',
  templateUrl: 'noname-page.html',
})

export class nonamePage {

  @ViewChild('map') mapElement: ElementRef;
  map: any = null;

  public title: string = 'Noname';
  latitude: string = '';
  longitude: string = '';
  locations: any;
  trackerInterval: Timer;

  constructor(public navCtrl: NavController, private platform: Platform) {

    if (this.platform.is('android')) {
      this.platform.ready().then(() => {

        // BackgroundGeolocation is highly configurable. See platform specific configuration options
        let config = {
          interval: 2000,
          locationTimeout: 2,
          desiredAccuracy: 10,
          stationaryRadius: 20,
          distanceFilter: 30,
          debug: true, //  enable this hear sounds for background-geolocation life-cycle.
          stopOnTerminate: false, // enable this to clear background location settings when the app terminates
        };

        BackgroundGeolocation.configure((location) => {
          console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);

          this.setCurrentLocation({latitude:location.latitude, longitude:location.longitude});
          this.startTrackingInterval();

          // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
          // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
          // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
          //BackgroundGeolocation.finish(); // FOR IOS ONLY

        }, (error) => {
          console.log('BackgroundGeolocation error');
        }, config);


      }).catch(err=> {
        console.log(err);
      });
    }
    
  }

  initMap(location: {latitude:string, longitude:string}) {
    let latLng = new google.maps.LatLng(location.latitude, location.longitude);

    let mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    if (this.map == null) {
      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    } else {
      this.map.setCenter(latLng);
    }
    this.addMarker();
  }

  addLocation(locations: any): void {
    this.locations = locations;
  }

  startTrackingInterval(): void {
    this.trackerInterval = setInterval(() => { this.refreshLocations(); }, 3000);
  }

  refreshLocations(): void {
    BackgroundGeolocation.getLocations().then(locations => {
      this.locations = locations;
      if (locations.length != 0) {
        this.setCurrentLocation(locations[locations.length-1]);
      }
    }).catch(error => {
      console.log(error);
    });
  }

  startTracker(): void {
    BackgroundGeolocation.deleteAllLocations();
    BackgroundGeolocation.start();
  }

  setCurrentLocation(location: {latitude:string, longitude:string}) {
    if ((this.latitude == location.latitude) && (this.longitude == location.longitude)) {
      return;
    }
    this.latitude = location.latitude;
    this.longitude = location.longitude;
    this.initMap(location);
  }

  stopTracking(): void {
    clearInterval(this.trackerInterval);
    BackgroundGeolocation.getLocations().then(locations => {
      this.locations = locations;
      if (locations.length != 0) {
        this.setCurrentLocation(locations[locations.length-1]);
      }
    }).catch(error => {
      console.log(error);
    });
    BackgroundGeolocation.stop();
  }

  addMarker(){
    if (this.map == null)return;

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter()
    });

    let content = "<h4>Information!</h4>";

    this.addInfoWindow(marker, content);

  }

  addInfoWindow(marker, content) {

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  public onGainChange(): void {
    return;
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
