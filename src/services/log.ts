
import {Injectable, NgZone} from "@angular/core";
import {logMessage} from "./log-message";
export const PRIORITY_INFO = 1;
export const PRIORITY_ERROR = 2;

const MAXSIZE = 20;

@Injectable()
export class log {

  public fifoTrace: logMessage[];

  constructor(public zone: NgZone) {
    this.fifoTrace = new Array(MAXSIZE);
    this.fifoTrace.fill(new logMessage({classe: '', method: '', level: PRIORITY_INFO, message: '' }));
    this.log({level: PRIORITY_INFO, message: 'create log'});
  }

  gogo() {
    throw new Error('null log exception error');
  }

  log(msg: {classe ?: string, method?: string, level?: number, message: string}) {
    if (msg == null) {
      this.log({classe:'log', method:'log', level:PRIORITY_ERROR, message:'null log exception error'})
      throw new Error('null log exception error');
    }
    if (msg.message == null) {
      this.log({classe:'log', method:'log', level:PRIORITY_ERROR, message:'null log message exception error'})
      throw new Error('null log exception error');
    }
    this.zone.run(()=>{
      let match = this.fifoTrace[this.fifoTrace.length-1].message.match(/^(.+)\((\d+)\)$/);

      if ((this.fifoTrace[this.fifoTrace.length-1].message == msg.message)) {
        this.fifoTrace[this.fifoTrace.length - 1].message = this.incMessage(msg.message);

      } else if ((match != null) && (match[1] == msg.message)) {
        this.fifoTrace[this.fifoTrace.length - 1].message = this.incMessage(this.fifoTrace[this.fifoTrace.length - 1].message);

      } else {
        let logMsg = new logMessage(msg);
        this.fifoTrace.shift();
        this.fifoTrace.push(logMsg);
      }

    });
    console.log(this.fifoTrace[this.fifoTrace.length-1].message);
  }

  info(message: string) {
    this.log({ message: message});
  }

  /**
   * "toto" --> "toto(1)"
   * "toto(1)" --> "toto(2)"
   * @param message
   */
  incMessage(message) {
    if (message.length == 0) {
      return "(1)";
    }
    let match = message.match(/^(.+)\((\d+)\)$/);
    if ((message.length >= 3) && (match == null)) {  // "toto" --> "toto(1)"
      return message.concat("(1)");
    }
    let nb = parseInt(match[2])+1;
    return `${match[1]}(${nb})`;
  }

  error(message: string) {
    this.log({ level: PRIORITY_ERROR, message: message});
  }

}
