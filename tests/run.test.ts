import {
  afterEach,
  before,
  describe,
  it,
  mock,
} from 'node:test';
import assert = require('assert');
import MainCli from '../app/cli/main.cli';
import EmissionsService from '../app/services/emissions.service';

/**
 * @description Run Test
 * Initial test, to check if the project is able to run
 * @TODO Add more tests and move mocking anssd casing to a separate files
 */
describe('Run Test', async () => {
  before(() => {
    mock.reset()
  })
  afterEach(() => {
    mock.reset()
  })

  await it('Should be able to run the project', async (t) => {
    const argResults = {
      '--token': 'token',
      '--login': 'login',
      '--project-name': 'project-name',
      '--breakdown': false,
      '--apply': false,
    }
    const mockFetch = mock.fn(() => ({
      status: 200,
      json: () => ({
        runs: [],
        diff: {
          now: 0,
          percentageChange: 0,
          prev: 0,
        },
      }),
    }))
    t.mock.method(EmissionsService.prototype, 'makeRequest', mockFetch)
    const mainCli = new MainCli(argResults, 'test-project')
    const emissionsService = new EmissionsService(mainCli)
    const response = await emissionsService.calculate([])
    assert(response.runs.length === 0)
  })
})
