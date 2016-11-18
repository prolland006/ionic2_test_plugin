import {Injectable } from "@angular/core";
import {log,  PRIORITY_ERROR} from "./log";
import {BackgroundGeolocation, BackgroundMode, Geolocation, Geoposition} from 'ionic-native';
import Timer = NodeJS.Timer;
import {Platform, Events} from "ionic-angular";
import {Observable} from "rxjs";


@Injectable()
export class BackgroundGeolocationService {

    trackerInterval: Timer;
    locations: any;
    public watch: any;

    // BackgroundGeolocation is highly configurable. See platform specific configuration options
    backGroundConfig = {
        interval: 1000,
        locationTimeout: 100,
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        debug: true, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false // enable this to clear background location settings when the app terminates
    };


    // Foreground Tracking
    foreGroundOptions = {
        frequency: 2000,
        enableHighAccuracy: true,
        maximumAge: Infinity,
        timeout: 30000
    };

    constructor(private platform: Platform, public trace: log, private events: Events) {

        if (this.platform.is('android')) {
            this.platform.ready().then(() => {

                this.trace.info(`platform android ready, Foreground tracking` );
                this.startTracking();

            }).catch(err => {
                this.trace.error(this, 'constructor', `error:${err}`);
            });

        }
    }

    foreGroundWatchPosition() {
        this.watch = Geolocation.watchPosition(this.foreGroundOptions)
            .subscribe((position: any) => {
                    if (position.code === undefined) {
                        this.trace.info(`Foreground.Watch ${position.coords.latitude},${position.coords.longitude}`);
                        this.events.publish('BackgroundGeolocationService:setCurrentForegroundLocation', position);
                    } else {
                        this.trace.error(this,'constructor',position.message);
                    }
                },
                (error)=>{this.trace.error(this,'foreGroundWatchPosition',error)},
                ()=>this.trace.info('watchPosition success'));

    }

    backgroundConfigureAndStart() {
        this.trace.info(`Background tracking` );
        BackgroundGeolocation.configure((location) => {
            this.trace.info(`configure  ${location.latitude},${location.longitude}`);

            this.setCurrentLocation(location);
            this.trackerInterval = setInterval(() => {
                this.refreshLocations();
            }, 2000);

            // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
            // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
            // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
            //BackgroundGeolocation.finish(); // FOR IOS ONLY

        }, (error) => {
            this.trace.error(this,'constructor',error);
        }, this.backGroundConfig);
    }


    refreshLocations(): void {
        BackgroundGeolocation.getLocations().then(locations => {
            this.locations = locations;
            if (locations.length != 0) {
                this.setCurrentLocation(locations[locations.length-1]);
            }
        }).catch(error => {
            this.trace.error(this,'refreshLocations', `error:${error.toString()}`);
        });

        // Foreground Tracking
        Geolocation.getCurrentPosition(this.foreGroundOptions)
            .then((position: Geoposition) => {
                this.trace.info(`Foregrnd.getCurrentPos : ${position.coords.latitude},${position.coords.longitude}`);
            }).catch((error)=>{
                if (error.code == 3) {
                    this.trace.info(`Foregrnd.getcurrentPos timeout`);
                }
                this.trace.error(this,'refreshLocations',`error Foregrnd.getCurrentPos:${error.toString()}`);
            });
    }

    startTracking(): void {
        this.trace.info('startTracker');
        this.foreGroundWatchPosition();
        this.backgroundConfigureAndStart();
        BackgroundGeolocation.deleteAllLocations();
        BackgroundGeolocation.start();
        BackgroundMode.setDefaults({ text:'Doing geoloc tasks.'});
        BackgroundMode.enable();
        this.backGroundOnActivate();
    }

    backGroundOnActivate() {
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
            error => this.trace.error(this,'backGroundOnActivate',`error:${error}`),
            () => this.trace.info(`finished`)
        );

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
            this.trace.error(this,'stopTracking',error);
        });
        BackgroundGeolocation.stop();
    }
}
