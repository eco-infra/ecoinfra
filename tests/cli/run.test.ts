import {
  after,
  afterEach,
  before,
  describe,
  it,
  mock,
} from 'node:test';
import assert from 'assert';
import MainCli from '../../app/cli/main.cli';

describe('CLI help command', () => {
  let originalExit: typeof process.exit;
  let originalConsoleLog: typeof console.log;
  let exitCalledWith: number | undefined;
  let consoleOutput: string[] = [];

  before(() => {
    // Save the original process.exit and console.log functions
    originalExit = process.exit;
    originalConsoleLog = console.log;

    // Mock process.exit to prevent the test from exiting
    process.exit = (code: number) => { exitCalledWith = code as never; };

    // Mock console.log to capture the output
    console.log = (...args: any[]) => {
      consoleOutput.push(args.join(' '));
    };
  });

  afterEach(() => {
    // Reset the mock state after each test
    mock.reset();
    consoleOutput = [];
    exitCalledWith = undefined;
  });

  it('should display the help commands when --help is passed', () => {
    // Simulate passing the --help argument
    const args = { '--help': true };
    const mainCli = new MainCli(args);

    // Verify the output contains the expected commands
    const output = consoleOutput.join('\n');
    assert(output.includes('--help => Display help information'));
    assert(output.includes('--token => Specify the API token'));
    assert(output.includes('--project-name => Specify the project name'));
    assert(output.includes('--breakdown => Enable or disable breakdown analysis'));
    assert(output.includes('--apply => Apply changes'));

    // Verify that process.exit was called with code 0
    assert.strictEqual(exitCalledWith, 0);
  });

  after(() => {
    // Restore the original process.exit and console.log functions
    process.exit = originalExit;
    console.log = originalConsoleLog;
  });
});
