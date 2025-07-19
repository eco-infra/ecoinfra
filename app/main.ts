import arg from 'arg';
import MainCli from './cli/main.cli';
import EmissionsService from './services/emissions.service';
import TerraformDataExtractor from './extractor/terraform-data.extractor';
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
      '--file': String,

      // Legacy support for backward compatibility
      '--plan-file': String,
      '--state-file': String,

      // Aliases
      '-f': '--file',
      '-p': '--plan-file',
      '-s': '--state-file',
    });

    const cli = new MainCli(argResults);
    const terraformExtractor = new TerraformDataExtractor(cli);
    let formattedResources;

    try {
      terraformExtractor.readTerraformFile(cli.getInputFile());
      formattedResources = terraformExtractor.getFormattedResources();

      const summary = terraformExtractor.getTerraformSummary();
      const fileTypeLabel = summary.fileType === 'plan' ? 'Plan' : 'State';

      log.primary(
        `${fileTypeLabel} analysis complete! Found ${summary.relevantResources} relevant resources out of ${summary.totalResources} total`,
      );
      log.info(`Auto-detected file type: ${summary.fileType}`);
      log.secondary(`Modules: ${summary.modules.join(', ')}`);
      log.secondary(`Actions: ${JSON.stringify(summary.actions)}`);
    } catch (err: any) {
      log.error(`Failed to read terraform file: ${err.message}`);

      return;
    }

    const emissionsService = new EmissionsService(cli);

    let results;

    try {
      results = await emissionsService.calculate(formattedResources, cli.getFileType());
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
    const totalEmissionsFromResults = results.diff.now;
    const previousEmisisonsFromResults = results.diff.prev;

    const asciChartOutput = new ASCIChartOutput(cli);

    const output = new Output(cli);
    output.logResults(
      log,
      asciText,
      output.cli.getFileType() === 'plan' ? `Previous: ${previousEmisisonsFromResults.toFixed(2).toString()} -> Panned: ${totalEmissionsFromResults.toFixed(2).toString()}` : table.toString(),
      output.cli.getFileType() === 'plan' ? '' : asciChartOutput.getASCICart(multiChart),
    );
  } catch (e) {
    log.error(`${e}`);
  }
}());
