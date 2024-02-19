import MainCli from '../cli/main.cli';
import LoggerUtil from '../utils/logger.util';

export default class Output {
  constructor(public cli: MainCli) {}

  logResults(log: LoggerUtil, asciText:string, stringTable:string, asciChart:string) {
    log.purple(asciText)
    log.purple(stringTable)
    log.purple(asciChart)
  }
}
