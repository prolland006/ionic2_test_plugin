import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import {log, PRIORITY_INFO} from "../../services/log";

@Component({
  selector: 'page-log-page',
  templateUrl: 'log-page.html',
})
export class LogPage {

  public title: string = 'Log';

  constructor(public navCtrl: NavController, public fifoTrace: log) {
    this.fifoTrace.log({ level: PRIORITY_INFO, message: 'create LogPage' });
  }

}
