import {Injectable } from "@angular/core";
import {log, PRIORITY_INFO, PRIORITY_ERROR} from "./log";
import {BackgroundGeolocation, BackgroundMode, Geolocation, Geoposition} from 'ionic-native';
import Timer = NodeJS.Timer;
import {Platform, Events} from "ionic-angular";
import {Observable} from "rxjs";
import {error} from "util";


@Injectable()
export class BackgroundGeolocationService {

    trackerInterval: Timer;
    locations: any;
    public watch: any;

    constructor(private platform: Platform, public trace: log, private events: Events) {
        this.trace.info('create BackgroundGeolocationService');

        if (this.platform.is('android')) {

            this.platform.ready().then(() => {

                this.trace.info(`platform android ready` );
                this.trace.info(`Foreground tracking` );

                // Foreground Tracking
                let options = {
                    frequency: 2000,
                    enableHighAccuracy: true,
                    maximumAge: Infinity,
                    timeout: 30000
                };

                this.watch = Geolocation.watchPosition(options)
//                    .filter((p: any) => p.code === undefined)
                    .subscribe((position: Geoposition ) => {
                        console.log('position',position);
                        this.trace.info(`ForegroundLocation : ${position.coords.latitude},${position.coords.longitude}`);
                        this.events.publish('BackgroundGeolocationService:setCurrentForegroundLocation', position);
                    },
                        (error)=>{this.trace.log({level:PRIORITY_ERROR,message:error,method:'constructor',classe:'BackgroundGeolocationService'})},
                        ()=>this.trace.info('watchPosition success'));

                  // BackgroundGeolocation is highly configurable. See platform specific configuration options
                let config = {
                    interval: 1000,
                    locationTimeout: 100,
                    desiredAccuracy: 10,
                    stationaryRadius: 20,
                    distanceFilter: 30,
                    debug: true, //  enable this hear sounds for background-geolocation life-cycle.
                    stopOnTerminate: false // enable this to clear background location settings when the app terminates
                };

                this.trace.info(`Background tracking` );
                BackgroundGeolocation.configure((location) => {
                    this.trace.info(`configure  ${location.latitude},${location.longitude}`);

                    this.setCurrentLocation(location);
                    this.startTrackingInterval();

                    // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
                    // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
                    // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
                    //BackgroundGeolocation.finish(); // FOR IOS ONLY

                }, (error) => {
                    this.trace.error(error);
                }, config);

                // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
                this.startTracker();

                BackgroundMode.setDefaults({ text:'Doing heavy tasks.'});
                // Enable background mode
                BackgroundMode.enable();

                // Called when background mode has been activated
                BackgroundMode.onactivate = () => {
                    return new Observable(observer=>{
                        setTimeout(function () {
                            // Modify the currently displayed notification
                            observer.next('one');
                            BackgroundMode.configure({
                                text:'background for more than 1s now.'
                            });
                        }, 1000);

                        setTimeout(function () {
                            // Modify the currently displayed notification
                            observer.next('two');
                            BackgroundMode.configure({
                                text:'background for more than 5s now.'
                            });
                        }, 5000);

                        setTimeout(function () {
                            // Modify the currently displayed notification
                            observer.complete();
                            BackgroundMode.configure({
                                text:' background for more than 10s.'
                            });
                        }, 10000);

                    });
                };

                BackgroundMode.onactivate().subscribe(
                    value => this.trace.info(`onactivate value:${value}`),
                    error => this.trace.log({level:PRIORITY_ERROR, message:`error:${error}`, method:'onactivate', classe:'BackgroundGeolocationService' }),
                    () => this.trace.info(`finished`)
                );


            }).catch(err => {
                this.trace.log({level:PRIORITY_ERROR, message:`error:${err}`, method:'constructor', classe:'BackgroundGeolocationService' });
            });

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
            console.log('err getLocations:',error);
            this.trace.log({level:PRIORITY_ERROR, message:`error:${error.toString()}`, method:'refreshlocations', classe:'BackgroundGeolocationService' });
        });

        // Foreground Tracking
        let options = {
            frequency: 2000,
            maximumAge: Infinity,
            enableHighAccuracy: true,
            timeout: 30000
        };

        this.trace.info('getCurrentPosition');
        Geolocation.getCurrentPosition(options)
            .then((position: Geoposition) => {
                console.log('position',position);
                this.trace.info(`ForegroundLocation.getCurrentPosition : ${position.coords.latitude},${position.coords.longitude}`);
            }).catch((error)=>{
                if (error.code == 3) {
                    this.trace.info(`ForegroundLocation : getcurrentPosition timeout`);
                }
                this.trace.log({level:PRIORITY_ERROR, message:`error getCurrentPosition:${error.toString()}`, method:'refreshlocations', classe:'BackgroundGeolocationService' });
            });
    }

    startTracker(): void {
        this.trace.info('startTracker');
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
            this.trace.error(error);
        });
        BackgroundGeolocation.stop();
    }
}
