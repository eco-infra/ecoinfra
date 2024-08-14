import arg from 'arg';

export default class MainCli {
  private token: string;

  private breakdown: boolean

  private apply: boolean

  private _project: string;

  private projectName: string;

  public args: arg.Result<any>

  constructor(argResults: arg.Result<any>, project?: string) {
    this.args = argResults;

    // Check if the only argument provided is '--help'
    if (this.args['--help'] && Object.keys(this.args).length === 1) {
      this.displayHelp();
      process.exit(0);
    }

    if (!this.args['--token']) throw new Error('Specify token --token')

    if (!this.args['--project-name']) throw new Error('Specify project name --project-name')

    this.token = this.args['--token']
    this.breakdown = this.args['--breakdown'] ?? false
    this.apply = this.args['--apply'] ?? false
    this._project = this.setProjectPath(project)
    this.projectName = this.args['--project-name']
  }

  /**
     * @description Set the project path, making sure that the path ends with /
     */
  setProjectPath(path?: string) {
    if (!path) return './'

    return path.endsWith('/') ? path : path.concat('/')
  }

  get project(): string {
    return this._project;
  }

  getToken(): string {
    return this.token
  }

  getProjectName(): string {
    return this.projectName
  }

  getApply(): boolean {
    return this.apply
  }

  getBreakdown(): boolean {
    return this.breakdown
  }

  listHelpCommands(): Array<{ key: string; value: string }> {
    return [
      { key: '--help', value: 'Display help information' },
      { key: '--token', value: 'Specify the API token' },
      { key: '--project-name', value: 'Specify the project name' },
      { key: '--breakdown', value: 'Enable or disable breakdown analysis' },
      { key: '--apply', value: 'Apply changes' },
    ];
  }

  /**
   * @description Display the help commands in a formatted way
   */
  displayHelp(): void {
    console.log('Available Commands:');
    this.listHelpCommands().forEach((command) => {
      console.log(`${command.key} => ${command.value}`);
    });
  }
}
