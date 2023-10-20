import {RawResource} from "../main";
import fetch from "node-fetch";
import MainCli from "../cli/main.cli";

type emission = {
    CO2eMonthly: number
    runDate: Date
    moduleName: string
    resourceName: string
    diff: {
        now: number
        percentageChange: number
        prev: number
    },
}
type Run = {
    emissions: emission[]
}

export type CalculateResponse = {
    runs: Run[]
    diff: {
        now: number
        percentageChange: number
        prev: number
    }
}

export default class EmissionsService {
    constructor(private cli: MainCli) {
    }
    URL = "https://gj464f7ctf.execute-api.eu-west-1.amazonaws.com/PRELIVE/calculate"

    async calculate(resources: RawResource[]): Promise<CalculateResponse> {
        try {
            const headers = {
                'Authorization': this.cli.getToken(),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }

            const queryParams = new URLSearchParams({projectName: this.cli.getProjectName()})

            const size = new TextEncoder().encode(JSON.stringify(resources)).length
            const kiloBytes = size / 1024;
            const megaBytes = kiloBytes / 1024;

            if(megaBytes > 10) {
                console.log(`Size of payload: ${megaBytes.toFixed(2)} MB`)
            }

            const response = await fetch(this.URL + (this.cli.getApply() ? '/apply' : '') + '?' + queryParams, {
                body: JSON.stringify(resources),
                method: "POST",
                headers,
            })
            if (response.status > 199 && response.status < 300) {
                const json = await response.json()
                return json
            }
            throw new Error(response.statusText)
        } catch (err) {
            throw err
        }
    }
}