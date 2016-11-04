import { Component, ViewChild } from '@angular/core';
import { Platform, MenuController, Nav } from 'ionic-angular';
import { environment } from '../environments/environment';
import { nonamePage } from "../pages/noname-page/noname-page";
import { BackgroundGeolocation } from 'ionic-native';

@Component({
  templateUrl: 'app.html',
})
export class MyApp {

  @ViewChild(Nav) public nav: Nav;

  public rootPage: any;
  public pages: Array<{ title: string, component: any }>;
  private menu: MenuController;
  private platform: Platform;

  constructor(platform: Platform, menu: MenuController) {

    this.platform = platform;
    this.menu = menu;

    this.rootPage = nonamePage;
    this.initializeApp();

    // set our app's pages
    this.pages = [
      { title: 'noname', component: nonamePage },
    ];
  }

  private initializeApp(): void {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.

      // https://github.com/lathonez/clicker/issues/148#issuecomment-254436635
      // StatusBar.styleDefault();
// IMPORTANT: BackgroundGeolocation must be called within app.ts and or before Geolocation. Otherwise the platform will not ask you for background tracking permission.

      // BackgroundGeolocation is highly configurable. See platform specific configuration options
      let config = {
        desiredAccuracy: 10,
        stationaryRadius: 20,
        distanceFilter: 30,
        debug: true, //  enable this hear sounds for background-geolocation life-cycle.
        stopOnTerminate: false, // enable this to clear background location settings when the app terminates
      };

      BackgroundGeolocation.configure((location) => {
        console.log('[js] BackgroundGeolocation callback:  ' + location.latitude + ',' + location.longitude);

        // IMPORTANT:  You must execute the finish method here to inform the native plugin that you're finished,
        // and the background-task may be completed.  You must do this regardless if your HTTP request is successful or not.
        // IF YOU DON'T, ios will CRASH YOUR APP for spending too much time in the background.
        BackgroundGeolocation.finish(); // FOR IOS ONLY

      }, (error) => {
        console.log('BackgroundGeolocation error');
      }, config);

      // Turn ON the background-geolocation system.  The user will be tracked whenever they suspend the app.
      BackgroundGeolocation.start();
      console.log('production: ' + environment.production);
    });
  }

  public openPage(page: any): void {
    // close the menu when clicking a link from the menu
    this.menu.close();
    // navigate to the new page if it is not the current page
    this.nav.setRoot(page.component);
  };
}
