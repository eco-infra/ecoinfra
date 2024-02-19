import arg from 'arg';

export default class MainCli {
  private token: string;

  private breakdown: boolean

  private apply: boolean

  private _project: string;

  private projectName: string;

  constructor(project?: string) {
    const args = arg({
      '--token': String,
      '--login': String,
      '--project-name': String,
      '--breakdown': Boolean,
      '--apply': Boolean,
    });

    if (!args['--token']) throw new Error('Specify token --token')

    if (!args['--project-name']) throw new Error('Specify project name --project-name')
    this.token = args['--token']
    this.breakdown = args['--breakdown'] ?? false
    this.apply = args['--apply'] ?? false
    this._project = this.setProjectPath(project)
    this.projectName = args['--project-name']
  }

  /**
     * @description Set the project path, making sure that the path ends with /
     * @param path
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
}
