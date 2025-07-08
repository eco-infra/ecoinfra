import fetch, { Response } from 'node-fetch';
import MainCli from '../cli/main.cli';
import { config } from '../config/config';
import { RawResource } from '../extractor/terraform-plan.extractor';

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

  URL = config().EMISSIONS_API_URL

  async makeRequest(
    resources: RawResource[],
    queryParams: URLSearchParams,
    headers: Record<string, string>,
  ): Promise<Response> {
    return fetch(`${this.URL}/apply?${queryParams}`, {
      body: JSON.stringify(resources),
      method: 'POST',
      headers,
    })
  }

  async calculate(resources: RawResource[]): Promise<CalculateResponse> {
    const headers = {
      Authorization: this.cli.getToken(),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }

    const queryParams = new URLSearchParams({ projectName: this.cli.getProjectName() })

    const size = new TextEncoder().encode(JSON.stringify(resources)).length
    const kiloBytes = size / 1024;
    const megaBytes = kiloBytes / 1024;

    if (megaBytes > 10) {
      console.log(`Size of payload: ${megaBytes.toFixed(2)} MB`)
    }

    const response = await this.makeRequest(resources, queryParams, headers)

    if (response.status > 199 && response.status < 300) {
      const json = await response.json()

      return json
    }

    throw new Error(response.statusText)
  }
}
