import * as asciichart from 'asciichart';
import Output from './output';

export default class ASCIChartOutput extends Output {
  private config = {
    colors: [
      // Primary earthy green palette for charts
      asciichart.green, // Forest green tone
      asciichart.blue, // Sky blue tone
      asciichart.cyan, // Cool blue-green
      asciichart.default, // Neutral grey
      asciichart.yellow, // Eco beige tone (closest available)
      asciichart.white, // Light neutral
      asciichart.magenta, // Accent color (sparingly used)
      asciichart.red, // Warning/error data (sparingly used)
    ],
    height: 25,
  }

  getASCICart(multiChart: number[][]) {
    return asciichart.plot(multiChart, this.config)
  }
}
