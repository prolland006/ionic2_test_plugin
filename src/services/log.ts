
import {Injectable} from "@angular/core";
import {logMessage} from "./log-message";
export const PRIORITY_INFO = 1;
export const PRIORITY_ERROR = 2;

const MAXSIZE = 22;

@Injectable()
export class log {

  public fifoTrace: logMessage[];

  constructor() {
    this.fifoTrace = new Array(MAXSIZE);
    this.fifoTrace.fill(new logMessage({classe: '', method: '', level: PRIORITY_INFO, message: '' }));
    this.log({level: PRIORITY_INFO, message: 'create log'});
  }

  log(msg: {classe ?: string, method?: string, level?: number, message: string}) {
    this.fifoTrace.shift();
    let logMsg = new logMessage(msg);
    this.fifoTrace.push(logMsg);
    console.log(logMsg.toString());
  }

  info(message: string) {
    this.log({ message: message});
  }

  error(message: string) {
    this.log({ level: PRIORITY_ERROR, message: message});
  }

}
