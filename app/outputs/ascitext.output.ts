import * as figlet from 'figlet';
import Output from './output';

export default class ASCITextOutput extends Output {
  public async getASCIText() {
    return figlet.textSync(`Emission ${this.cli.getBreakdown() ? 'Breakdown' : 'Summary'}`, {
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true,
    });
  }
}
