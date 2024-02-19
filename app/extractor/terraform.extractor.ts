import fs from 'fs';
import hcl from 'hcl2-parser';

import MainCli from '../cli/main.cli';

export type Provider = Record<string, unknown[]>

export interface RawResource {
    /** @description Resource Type */
    resource: string,
    /** @description Resource Name */
    name: string,
    /** @description All Parameters */
    parameters: Record<string, string | undefined>[],
    /** @description Module Name */
    module: string
    /** @description the provider region */
    provider?: Provider
}

export type Terraform = Record<string, unknown>
export type Data = Record<string, unknown>
export type Module = Record<string, unknown>
export type Resource = Record<string, unknown>

export type Variable = Record<string, {
    type?: string;
    default?: string;
    description?: string;
    validation?: string;
}[]>

export type Output = Record<string, {
    value: string;
    description?: string;
}>

export interface MainTerraform {
    data?: Data | null;
    module?: Module | null;
    resource?: Resource | null;
    locals?: Record<string, unknown> | null;
    provider?: Provider | null;
    terraform?: Terraform | null;
    variable?: Variable | null;
    output?: Output | null;
}

export type TerraformValues = MainTerraform[]
export type TerraformObjectsKeydByModule = Record<string, TerraformValues>

type VariableParamKey = Record<string, string>

export default class TerraformExtractor {
  constructor(private project: string) {}

  private terraformObjectsKeydByModule: TerraformObjectsKeydByModule[] = []

  private resources: RawResource[][] = []

  private formattedResource: RawResource[] = []

  readTerraformFiles(files: string[], rootPath: string) {
    const terraformObjects = []

    for (const file of files) {
      const path = `${rootPath}/${file}`

      if (file === '.terraform') continue

      if (file.includes('.tf')) {
        const content = fs.readFileSync(path);
        const terraform = hcl.parseToObject(content);
        terraformObjects.push(terraform)
      }
    }

    return terraformObjects.flat(1)
  }

  readTerraformModuleFiles(rootPath: string) {
    const terraformObjects = []
    let files: string[]

    try {
      files = fs.readdirSync(rootPath)
    } catch (e) {
      files = []
    }

    for (const file of files) {
      const path = `${rootPath}/${file}`

      // eslint-disable-next-line no-continue
      if (file === '.terraform') continue

      if (file.includes('.tf')) {
        const content = fs.readFileSync(path);
        const terraform = hcl.parseToObject(content)
          .filter((t: Record<any, any>) => t !== null && Object.values(t).length > 0);
        terraformObjects.push(terraform)
      }
    }

    return terraformObjects.flat(1)
  }

  populateTerraformObjectsFromFilesByKeys(files: string[], rootPath: string) {
    this.terraformObjectsKeydByModule = [{
      [this.project]: this
        .readTerraformFiles(files, rootPath),
    }]
  }

  populateTerraformObjectsByKeys(moduleContents: Record<string, any>, cli: MainCli) {
    // eslint-disable-next-line no-restricted-syntax
    for (const module of moduleContents.Modules) {
      const key = module.Key === '' ? `${cli.project}-root` : module.Key
      const dir = module.Dir === '.' ? '/' : module.Dir
      this.terraformObjectsKeydByModule
        .push({ [key as string]: this.readTerraformModuleFiles(cli.project + dir) })
    }

    return this.terraformObjectsKeydByModule;
  }

  parsePropertiesFromModule(module: any[], key: string): RawResource[] {
    const resources: RawResource[] = []

    for (let i = 0; i < module.length; i++) {
      if (module[i]?.resource) {
        Object.keys(module[i].resource).forEach((r) => {
          Object.keys(module[i].resource[r]).forEach((name: string) => {
            resources.push({
              resource: r,
              name,
              parameters: module[i].resource[r][name],
              module: key,
              provider: module[i]?.provider,
            })
          })
        })
      }
    }

    return resources
  }

  /**
   * @description Check if the parameter is relevant to emissions
   * We do this to save us sending irrelevant parameters to the emissions API
   * @TODO move this to an API call.
   * @param param
   */
  paramIsRelevantToEmissions(param: string) {
    const relevantParams = [
      'instance_class',
      'instance_type',
    ]

    return relevantParams.includes(param)
  }

  /**
   * @description Check if the resource is relevant to emissions
   * We do this to save us sending irrelevant resources to the emissions API
   * @TODO move this to an API call.
   * @param resourceKey
   */
  resourceIsRelevantToEmissions(resourceKey: string) {
    const relevantResources = [
      'aws_db_instance',
      'aws_neptune_cluster_instance',
      'aws_docdb_cluster_instance',
      'aws_rds_cluster_instance',
      'aws_instance',
      'aws_cloud9_environment_ec2',
      'aws_batch_compute_environment',
      'aws_elasticache_cluster',
      'aws_memorydb_cluster',
      'aws_apprunner_service',
      'aws_redshift_cluster',
      'aws_lambda_function',
    ]

    return relevantResources.includes(resourceKey)
  }

  private extractParameterValue(
    r: any,
    paramKey: string,
    key: string,
    modules: any[],
    variables: CallableFunction,
    previousVariableValue?: string | undefined,
  ): string {
    let defaultVariableValue: string | undefined = previousVariableValue

    const variable = variables(key)

    if (variable) {
      defaultVariableValue = variable[paramKey]
        ? variable[paramKey]
          .find((v: VariableParamKey) => v?.default)?.default : undefined
    }

    if (String(r)?.includes('var.') && this.paramIsRelevantToEmissions(paramKey)) {
      const foundModule = modules.find((m) => {
        if (m[key]) return true

        if (m[`${this.project}-root.${key}`]) return true
      })

      if (!defaultVariableValue) {
        defaultVariableValue = variables(key.split('.').slice(0, -1).join('.'))
          ? variables(key)[paramKey]?.find((v: VariableParamKey) => v?.default)?.default
          : undefined
      }

      if (foundModule) {
        const values = Object.values(foundModule).flat(3)
        const foundValue = values
          .find((p: any) => p[paramKey]) as Record<string, string | undefined> | undefined

        const newKey = Object.keys(foundModule)[0].split('.').slice(0, -1).join('.')

        if (foundValue) {
          defaultVariableValue = foundValue[paramKey]
        }

        return this.extractParameterValue(
          defaultVariableValue,
          paramKey,
          newKey,
          modules,
          variables,
          defaultVariableValue,
        )
      }
    }

    return r
  }

  /**
     * @description Populate the variables for a resource within a module
     */
  resolveVariables() {
    const modules: any[] = []

    this.terraformObjectsKeydByModule.forEach((terraformObjectModules) => {
      const key = Object.keys(terraformObjectModules)[0]

      if (Object.keys(terraformObjectModules).length > 1) {
        throw new Error('Multiple keys found in terraformObjectModules')
      }

      terraformObjectModules[key].forEach((module: any) => {
        if (module?.module) {
          Object.keys(module.module).forEach((m: any) => {
            modules.push({ [`${key}.${m}`]: module.module[m] })
          })
        }
      })
    })

    this.terraformObjectsKeydByModule
      .map((terraformObjectModules: TerraformObjectsKeydByModule) => {
        const key = Object.keys(terraformObjectModules)[0]

        const getVariables = (newKey: string) => {
          const foundModule = this.terraformObjectsKeydByModule
            .find((m: TerraformObjectsKeydByModule) => m[newKey])

          if (foundModule) {
            return foundModule[newKey] ? foundModule[newKey]
              .find((module: any) => module?.variable)?.variable : undefined
          }

          return undefined
        }
        /**
         * @description Extract the parameter value from the module
         * @TODO refactor to make this more readable
         */
        terraformObjectModules[key] = terraformObjectModules[key].map((module: any) => {
          if (module?.resource) {
            Object.keys(module.resource).forEach((resourceKey: any) => {
              const resourceTypeKey = Object.keys(module.resource[resourceKey])[0]

              if (!this.resourceIsRelevantToEmissions(resourceKey)) return module
              Object.values(module.resource[resourceKey]).forEach((resources: any) => {
                resources.forEach((resource: any, j: number) => {
                  Object.values(resource).forEach((r: any, v) => {
                    const paramKey = Object.keys(resource)[v]
                    const variables = getVariables(key)
                    let defaultVariableValue: string | undefined

                    if (variables) {
                      defaultVariableValue = variables[paramKey] ? variables[paramKey]
                        .find((vpk: VariableParamKey) => vpk?.default)?.default : undefined
                    }
                    module.resource[resourceKey][resourceTypeKey][j][paramKey] = this
                      .extractParameterValue(
                        r,
                        paramKey,
                        key,
                        modules,
                        getVariables,
                        defaultVariableValue,
                      )
                  })
                })
              })
            })
          }

          return module
        })

        return terraformObjectModules
      })
  }

  /**
     * @description Remove empty arrays and flatten array level by 1
     */
  formatResources() {
    for (const terraformObjectModules of this.terraformObjectsKeydByModule) {
      const key = Object.keys(terraformObjectModules)[0]
      const module = terraformObjectModules[key]
      const resources = this.parsePropertiesFromModule(module, key)

      this.resources.push(resources)
    }
    this.formattedResource = this.resources.filter((e) => e.length > 0).flat(1)
  }

  /**
   * @description Populate the provider for a resource within a module
   * if there is no provider defined
   */
  populateProvider() {
    const root = this.terraformObjectsKeydByModule.find((m) => Object.keys(m)[0] === `${this.project}-root`)
    const rootProvider = root?.[`${this.project}-root`]?.find((m: any) => m?.provider)?.provider as Provider

    this.formattedResource.map((r) => {
      if (r.provider) return r
      r.provider = rootProvider

      return r
    })
  }

  getFormattedResources(): RawResource[] {
    this.resolveVariables()
    this.formatResources()
    this.populateProvider()

    return this.formattedResource
  }
}
