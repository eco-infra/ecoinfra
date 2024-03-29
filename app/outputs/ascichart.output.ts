import * as asciichart from 'asciichart';
import Output from './output';

export default class ASCIChartOutput extends Output {
  private config = {
    colors: [
      asciichart.magenta,
      asciichart.blue,
      asciichart.green,
      asciichart.default,
      asciichart.red,
      asciichart.yellow,
      asciichart.cyan,
      asciichart.white,
    ],
    height: 25,
  }

  getASCICart(multiChart: number[][]) {
    return asciichart.plot(multiChart, this.config)
  }
}
