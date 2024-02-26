import fs from 'fs'

import MainCli from './cli/main.cli';
import EmissionsService from './services/emissions.service';
import TerraformExtractor from './extractor/terraform.extractor';
import LoggerUtil from './utils/logger.util';
import ASCITextOutput from './outputs/ascitext.output';
import ChartOutput from './outputs/chart.output';
import ASCIChartOutput from './outputs/ascichart.output';
import Output from './outputs/output';

(async function () {
  const log = new LoggerUtil()

  try {
    const cli = new MainCli(process.argv.slice(-1)[0])

    const files = fs.readdirSync(cli.project)

    const extractor = new TerraformExtractor(cli.project)

    if (!files.find((f) => f === '.terraform')) throw new Error('Please run terraform init')

    try {
      const fileContents =fs.readFileSync(`${cli.project}.terraform/modules/modules.json`, 'utf-8')
      const moduleContents = JSON.parse(fileContents)

      log.purple(`Modules found! ${cli.project}`)

      extractor.populateTerraformObjectsByKeys(moduleContents, cli);
    } catch (err: any) {
      log.purple(`No Modules found. ${cli.project}`)

      if(err.code !== 'ENOENT') {
        log.error(`${err}`)
      }

      extractor.populateTerraformObjectsFromFilesByKeys(files, cli.project)
    }

    const formattedResources = extractor.getFormattedResources()

    const emissionsService = new EmissionsService(cli)

    let results;

    try {
      results = await emissionsService.calculate(formattedResources);
    } catch (e) {
      log.error('API Error: Please check your token and project name. If the error persists, please raise an issue via github.')
      log.info('https://github.com/eco-infra/ecoinfra/issues')
      log.error(`${e}`)

      return
    }

    const chartOutput = new ChartOutput(cli)

    const asciTextOutput = new ASCITextOutput(cli)

    const asciText = await asciTextOutput.getASCIText()

    const { multiChart, table } = chartOutput.getChartData(results);

    const asciChartOutput = new ASCIChartOutput(cli);

    const output = new Output(cli)
    output.logResults(log, asciText, table.toString(), asciChartOutput.getASCICart(multiChart))
  } catch (e) {
    log.error(`${e}`)
  }
}()
);
