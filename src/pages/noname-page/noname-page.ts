'use strict';

import { Component } from '@angular/core';
import {Platform} from "ionic-angular/index";
import Timer = NodeJS.Timer;
import { MediaPlugin } from 'ionic-native';

const SRC_WAV_WIN = 'sound/win.wav';

@Component({
  templateUrl: 'noname-page.html',
})

export class nonamePage {
  
  mediaWinner: MediaPlugin = null;

  constructor(private platform: Platform) {
    if (this.platform.is('android')) {
      this.platform.ready().then(() => {
        this.mediaWinner = new MediaPlugin(this.getMediaURL(SRC_WAV_WIN));
      }).catch(err=> {
        console.log(err);
      });
    }
    
  }

  public title: string = 'Noname';

  public onGainChange(): void {
    return;
  }

  playWinnerSound() {
    this.platform.ready().then(() => {
      this.mediaWinner.play();
    }).catch(err=> {
      console.log(err);
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
