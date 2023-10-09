import {CalculateResponse} from "../services/emissions.service";
import Output from "./output";

const Table = require('cli-table');

export default class ChartOutput extends Output{
    getChartData(results: CalculateResponse) {
        const resourceDiff = results.runs.slice(-80)

        let multiChart: number[][] = []
        let tableData = resourceDiff.slice(-1)[0].emissions.map((e) => {
            return [`${e.moduleName}.${e.resourceName}`, e.CO2eMonthly]
        }).sort((a, b) => Number(b[1]) - Number(a[1]))

        if (this.cli.getBreakdown()) {
            resourceDiff.forEach((r) => {
                r.emissions.forEach((e, k) => {
                    if (e) {
                        if (multiChart[k] === undefined) multiChart[k] = []
                        multiChart[k].push(e.CO2eMonthly)
                    }
                })
            })
        } else {
            let charts: number[] = []
            resourceDiff.slice(-80).forEach((r) => {
                if (r?.emissions.length) {
                    const dailyTotal = r.emissions.reduce((a, b) => a + b.CO2eMonthly, 0)
                    charts.push(dailyTotal)
                }
            })
            multiChart.push(charts)
        }
        return {multiChart, table: this.getTable(tableData)}
    }

    getTable(tableData: any[]){
        const table = new Table({
            head: ['Resource', 'Emission CO2e/month'], colWidths: [75, 25]
        });

        table.push(
            ...tableData
        );

        return table
    }
}