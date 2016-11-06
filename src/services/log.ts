
import {Injectable} from "@angular/core";
export const PRIORITY_INFO = 1;
export const PRIORITY_ERROR = 2;

const MAXSIZE = 22;

@Injectable()
export class log {

  public fifoTrace: {level: number, message: string }[];

  constructor() {
    this.fifoTrace = new Array(MAXSIZE);
    this.fifoTrace.fill({level: PRIORITY_INFO, message: '' });
    this.log({level: PRIORITY_INFO, message: 'create log'});
  }

  log(msg: {level: number, message: string }) {
    this.fifoTrace.shift();
    this.fifoTrace.push(msg);
    console.log(msg.message);
  }

}
