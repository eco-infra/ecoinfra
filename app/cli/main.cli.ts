import arg from 'arg';

export default class MainCli {
  private token: string;

  private breakdown: boolean;

  private projectName: string;

  private inputFile: string;

  private fileType: 'plan' | 'state' = 'plan';

  public args: arg.Result<any>;

  constructor(argResults: arg.Result<any>) {
    this.args = argResults;

    if (!this.args['--token']) throw new Error('Specify token --token');

    if (!this.args['--project-name']) throw new Error('Specify project name --project-name');

    // Determine input file - prefer new --file, fallback to legacy options
    const file = this.args['--file'];
    const planFile = this.args['--plan-file'];
    const stateFile = this.args['--state-file'];

    // Count how many file options are provided
    const fileOptions = [file, planFile, stateFile].filter(Boolean);

    if (fileOptions.length === 0) {
      throw new Error('Specify input file with --file <path> (or legacy --plan-file/--state-file)');
    }

    if (fileOptions.length > 1) {
      throw new Error('Specify only one input file option');
    }

    // Use whichever file option was provided
    this.inputFile = file || planFile || stateFile!;

    this.token = this.args['--token'];
    this.breakdown = this.args['--breakdown'] ?? false;
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

  getInputFile(): string {
    return this.inputFile;
  }

  // Legacy methods for backward compatibility
  getPlanFile(): string | null {
    return this.args['--plan-file'] || null;
  }

  getStateFile(): string | null {
    return this.args['--state-file'] || null;
  }

  getFileType(): 'plan' | 'state' {
    return this.fileType;
  }

  setFileType(fileType: 'plan' | 'state') {
    this.fileType = fileType;
  }
}
