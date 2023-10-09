import fs from "fs"

import MainCli from "./cli/main.cli";
import EmissionsService from "./services/emissions.service";
import TerraformExtractor from "./extractor/terraform.extractor";
import LoggerUtil from "./utils/logger.util";
import ASCITextOutput from "./outputs/ascitext.output";
import ChartOutput from "./outputs/chart.output";
import ASCIChartOutput from "./outputs/ascichart.output";
import arg from "arg";


export interface RawResource {
    /** @description Resource Type */
    resource: string,
    /** @description Resource Name */
    name: string,
    /** @description All Parameters */
    parameters: any[],
    /** @description Module Name */
    module: string
    /** @description the provider region */
    provider?: Record<string, Record<string, string>>
}

(async function () {
        const log = new LoggerUtil()


        try {
            const cli = new MainCli(process.argv.slice(-1)[0])

            const files = fs.readdirSync(cli.project)

            const extractor = new TerraformExtractor(cli.project)

            if (!files.find(f => f === '.terraform')) throw new Error('Please run terraform init')

            try {
                const moduleContents = JSON.parse(fs.readFileSync(cli.project + '.terraform/modules/modules.json', 'utf-8'))

                log.purple("Modules found!" + ` ${cli.project}`)

                extractor.populateTerraformObjectsByKeys(moduleContents, cli, files);
            } catch (err) {
                log.purple("No Modules found..." + ` ${cli.project}`)
                log.error(`${err}`)

                extractor.populateTerraformObjectsFromFilesByKeys(files, cli.project)
            }

            const emissionsService = new EmissionsService(cli)

            const formattedResources = extractor.getFormattedResources()

            const results = await emissionsService.calculate(formattedResources);
            console.log(results)

            const chartOutput = new ChartOutput(cli)
            const asciTextOutput = new ASCITextOutput(cli)

            const asciText = await asciTextOutput.getASCIText()

            let {multiChart, table} = chartOutput.getChartData(results);

            const asciChartOutput = new ASCIChartOutput(cli)


            log.purple(asciText)
            log.purple(table.toString());
            log.log(asciChartOutput.getASCICart(multiChart))
            // log.purple(`Change: ${results.totalDiff.percentageChange}`)
        } catch (e) {
            log.error(`${e}`)
        }
    }
    ()
)
;


