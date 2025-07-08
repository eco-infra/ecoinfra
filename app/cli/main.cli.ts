import arg from 'arg';

export default class MainCli {
  private token: string;

  private breakdown: boolean;

  private projectName: string;

  private planFile: string;

  public args: arg.Result<any>;

  constructor(argResults: arg.Result<any>) {
    this.args = argResults;

    if (!this.args['--token']) throw new Error('Specify token --token');

    if (!this.args['--project-name']) throw new Error('Specify project name --project-name');

    if (!this.args['--plan-file']) throw new Error('Specify plan file --plan-file <path>');

    this.token = this.args['--token'];
    this.breakdown = this.args['--breakdown'] ?? false;
    this.planFile = this.args['--plan-file'];
    this.projectName = this.args['--project-name'];
  }

  getToken(): string {
    return this.token;
  }

  getProjectName(): string {
    return this.projectName;
  }

  getBreakdown(): boolean {
    return this.breakdown;
  }

  getPlanFile(): string {
    return this.planFile;
  }
}
