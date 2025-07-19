import * as figlet from 'figlet';
import Output from './output';

export default class ASCITextOutput extends Output {
  public async getASCIText() {
    let text = 'Summary';

    if (this.cli.getFileType() === 'plan') {
      text = 'Planned'
    }

    if (this.cli.getBreakdown()) {
      text = 'Breakdown'
    }

    return figlet.textSync(`Emission ${text}`, {
      horizontalLayout: 'default',
      verticalLayout: 'default',
      width: 80,
      whitespaceBreak: true,
    });
  }
}
