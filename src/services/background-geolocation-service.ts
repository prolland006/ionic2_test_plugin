import {Injectable } from "@angular/core";
import {log, PRIORITY_INFO, PRIORITY_ERROR} from "./log";
import { BackgroundGeolocation } from 'ionic-native';
import Timer = NodeJS.Timer;
import {Platform, Events} from "ionic-angular";

@Injectable()
export class BackgroundGeolocationService {

    trackerInterval: Timer;
    locations: any;

    constructor( private platform: Platform, public fifoTrace: log, private events: Events) {
        this.fifoTrace.log({ level: PRIORITY_INFO, message: 'create BackgroundGeolocationService' });

        if (this.platform.is('android')) {
            this.platform.ready().then(() => {

                this.fifoTrace.log({
                    level: PRIORITY_INFO,
                    message: `platform android ready`
                });

                // BackgroundGeolocation is highly configurable. See platform specific configuration options
                let config = {
                    interval: 1000,
                    locationTimeout: 100,
                    desiredAccuracy: 10,
                    stationaryRadius: 5,
                    distanceFilter: 5,
                    debug: true, //  enable this hear sounds for background-geolocation life-cycle.
                    stopOnTerminate: false // enable this to clear background location settings when the app terminates
                };

                BackgroundGeolocation.configure((location) => {
                    this.fifoTrace.log({
                        level: PRIORITY_INFO,
                        message: `configure  ${location.latitude},${location.longitude}`
                    });

                    this.setCurrentLocation(location);
                    this.startTrackingInterval();

                    // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                    // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
                    // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                    BackgroundGeolocation.finish(); // FOR IOS ONLY

                }, (error) => {
                    this.fifoTrace.log({
                        level: PRIORITY_ERROR,
                        message: 'BackgroundGeolocation error'
                    });
                }, config);


            }).catch(err => {
                console.log(err);
            });
            // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
            BackgroundGeolocation.start();

        }
    }

    startTrackingInterval(): void {
        this.trackerInterval = setInterval(() => { this.refreshLocations(); }, 2000);
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
        this.events.publish('BackgroundGeolocationService:setCurrentLocation', location);
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
}
