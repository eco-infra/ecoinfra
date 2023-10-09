import fs from "fs";
import hcl from "hcl2-parser";

import {RawResource} from "../main";
import MainCli from "../cli/main.cli";

export default class TerraformExtractor {
  constructor(private project: string) {
  }

  private terraformObjectsKeydByModule: Record<string, string[]>[] = []
  private resources: RawResource[][] = []
  private formattedResource: RawResource[] = []

  readTerraformFiles(files: string[], rootPath: string) {
    const terraformObjects = []
    for (const file of files) {
      const path = rootPath + '/' + file
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
      // The path within module.json does not exist anymore, probably stale
      files = []
    }

    for (const file of files) {
      const path = rootPath + '/' + file
      if (file === '.terraform') continue
      if (file.includes('.tf')) {
        const content = fs.readFileSync(path);
        const terraform = hcl.parseToObject(content);
        terraformObjects.push(terraform)
      }
    }
    return terraformObjects.flat(1)
  }


  populateTerraformObjectsFromFilesByKeys(files: string[], rootPath: string) {
    this.terraformObjectsKeydByModule = [{[this.project]: this.readTerraformFiles(files, rootPath)}]
  }

  getVarsForModule(module: Record<string, string>, files:string[]) {
    if(!module["Source"]) return []
    const modulePath = module["Source"].split("/").slice(1).join("/")
    console.log(modulePath,"modulePath")
    console.log(module,"module")
    console.log(module["Source"],"Source")

    const moduleFiles = fs.readdirSync(this.project+modulePath)

    const moduleFile = this.readTerraformFiles(moduleFiles, this.project + modulePath)

    // console.log("moduleFile", JSON.stringify(moduleFile, null, 2))


    for (const file of moduleFiles) {

      const fileContents = fs.readFileSync(this.project+modulePath+"/"+file)
      const terraform = hcl.parseToObject(fileContents);
      for (const tf of terraform) {
        if(tf?.variable) {
          for (const variable of Object.keys(tf?.variable)) {
            if (tf?.variable[variable]?.default) {
              console.log("default", tf?.variable[variable]?.default)
            } else {
                console.log(Object.keys(tf?.variable)[0])
            }
          }
        }
      }
    }
    console.log(moduleFiles,"moduleFiles")
    return this.readTerraformFiles(moduleFiles, this.project + modulePath)
  }

  resolveVarsForResourceWithinModule(module: Record<string, string>, files:string[]) {

  }

  populateTerraformObjectsByKeys(moduleContents: Record<any, any>, cli: MainCli, files: string[]) {
    for (const module of moduleContents["Modules"]) {
      const key = module["Key"] == "" ? `${cli.project}-root` : module["Key"]
      const dir = module["Dir"] == "." ? "/" :  module["Dir"]
      this.terraformObjectsKeydByModule.push({[key as string]: this.readTerraformModuleFiles(cli.project + dir)})
    }
    return this.terraformObjectsKeydByModule;
  }

  parsePropertiesFromModule(module: any[], key: string): { resources: RawResource[], modules: RawResource[], variables: any[] } {
    const resources: RawResource[] = []
    const variables:any[] = []
    const modules: RawResource[] = []
    for (let i = 0; i < module.length; i++) {
      if (module[i]?.variable) {
        Object.keys(module[i].variable).forEach(v => {
          variables.push({
            variable: v,
            value: module[i].variable[v],
            module: key,
            provider: module[i]?.provider
          })
        })
      }
      if (module[i]?.module) {
        Object.keys(module[i].module).forEach(m => {
          modules.push({
            resource: m,
            name: m,
            parameters: module[i].module[m],
            module: key,
            provider: module[i]?.provider
          })
        })
      }
      if (module[i]?.resource) {
        Object.keys(module[i].resource).forEach(r => {
          Object.keys(module[i].resource[r]).forEach((name: string) => {
            resources.push({
              resource: r,
              name: name,
              parameters: module[i].resource[r][name],
              module: key,
              provider: module[i]?.provider
            })
          })
        })
      }
    }
    return {resources, variables, modules}
  }

  resolveVariables(resources:RawResource[], variables:any[], modules:RawResource[]) {
    modules.forEach(m=> {
      const resource = resources.find(r => r.resource === r.resource && r.name === m.name)
      if(resource) {
        resource.parameters = m.parameters
      }
    })
  }

  /**
   * @description Remove empty arrays and flatten array level by 1
   */
  formatResources() {
    for (const terraformObjectModules of this.terraformObjectsKeydByModule) {
      const key = Object.keys(terraformObjectModules)[0]
      const module = terraformObjectModules[key]

      const {resources, variables, modules} = this.parsePropertiesFromModule(module, key)
      this.resources.push(resources)
    }
    this.formattedResource = this.resources.filter(e => e.length > 0).flat(1)
  }


  getFormattedResources(): RawResource[] {
    this.formatResources()
    return this.formattedResource
  }
}