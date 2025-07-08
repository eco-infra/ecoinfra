import arg from 'arg';
import MainCli from './cli/main.cli';
import EmissionsService from './services/emissions.service';
import TerraformPlanExtractor from './extractor/terraform-plan.extractor';
import LoggerUtil from './utils/logger.util';
import ASCITextOutput from './outputs/ascitext.output';
import ChartOutput from './outputs/chart.output';
import ASCIChartOutput from './outputs/ascichart.output';
import Output from './outputs/output';

(async function () {
  const log = new LoggerUtil();

  try {
    const argResults = arg({
      '--token': String,
      '--login': String,
      '--project-name': String,
      '--breakdown': Boolean,
      '--plan-file': String,
    });

    const cli = new MainCli(argResults);
    const planExtractor = new TerraformPlanExtractor(cli);
    let formattedResources;

    try {
      planExtractor.readPlanFile(cli.getPlanFile());
      formattedResources = planExtractor.getFormattedResources();

      const summary = planExtractor.getPlanSummary();
      log.purple(
        `Plan analysis complete! Found ${summary.relevantResources} relevant resources out of ${summary.totalResources} total`,
      );
      log.purple(`Modules: ${summary.modules.join(', ')}`);
      log.purple(`Actions: ${JSON.stringify(summary.actions)}`);
    } catch (err: any) {
      log.error(`Failed to read plan file: ${err.message}`);

      return;
    }

    const emissionsService = new EmissionsService(cli);

    let results;

    try {
      results = await emissionsService.calculate(formattedResources);
    } catch (e) {
      log.error(
        'API Error: Please check your token and project name. If the error persists, please raise an issue via github.',
      );
      log.info('https://github.com/eco-infra/ecoinfra/issues');
      log.error(`${e}`);

      return;
    }

    const chartOutput = new ChartOutput(cli);

    const asciTextOutput = new ASCITextOutput(cli);

    const asciText = await asciTextOutput.getASCIText();

    const { multiChart, table } = chartOutput.getChartData(results);

    const asciChartOutput = new ASCIChartOutput(cli);

    const output = new Output(cli);
    output.logResults(
      log,
      asciText,
      table.toString(),
      asciChartOutput.getASCICart(multiChart),
    );
  } catch (e) {
    log.error(`${e}`);
  }
}());
