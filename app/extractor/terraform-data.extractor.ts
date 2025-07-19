import fs from 'fs';
import MainCli from '../cli/main.cli';

export type Provider = Record<string, unknown[]>;

export interface RawResource {
    /** @description Resource Type */
    resource: string;
    /** @description Resource Name */
    name: string;
    /** @description All Parameters */
    parameters: Record<string, string | undefined>[];
    /** @description Module Name */
    module: string;
    /** @description the provider region */
    provider?: Provider;
    /** @description the action to be performed (create, update, delete) */
    action?: string;
}

export interface TerraformPlanResource {
    address: string;
    mode: string;
    type: string;
    name: string;
    provider_name: string;
    change: {
        actions: string[];
        before: any;
        after: any;
        after_unknown: any;
        before_sensitive: any;
        after_sensitive: any;
    };
}

export interface TerraformStateResource {
    address: string;
    mode: string;
    type: string;
    name: string;
    index?: string | number;
    provider_name: string;
    schema_version: number;
    values: any;
    sensitive_values: any;
}

export interface TerraformState {
    format_version: string;
    terraform_version: string;
    values: {
        root_module: {
            resources: TerraformStateResource[];
            child_modules?: any[];
        };
    };
}

export interface TerraformPlan {
    format_version: string;
    terraform_version: string;
    planned_values?: {
        root_module: {
            resources: any[];
            child_modules?: any[];
        };
    };
    resource_changes: TerraformPlanResource[];
    configuration?: {
        provider_config?: Record<string, any>;
        root_module?: {
            resources?: any[];
            module_calls?: any[];
        };
    };
    prior_state?: {
        values?: {
            root_module: {
                resources: any[];
                child_modules?: any[];
            };
        };
    };
}

export type TerraformData = TerraformPlan | TerraformState;

export default class TerraformDataExtractor {
  constructor(private cli: MainCli) {
  }

  private terraformData: TerraformData = {} as TerraformData;

  private formattedResources: RawResource[] = [];

  public setTerraformData(data: TerraformData) {
    this.terraformData = data
  }

  /**
     * @description Detect if the JSON data is a plan or state file
     * @param data The parsed JSON data
     */
  private detectFileType(data: any): 'plan' | 'state' {
    // Plan files have resource_changes, state files have values
    if (data.resource_changes && Array.isArray(data.resource_changes)) {
      this.cli.setFileType('plan')

      return 'plan';
    }

    if (data.values && data.values.root_module) {
      this.cli.setFileType('state')

      return 'state';
    }
    throw new Error('Unable to determine file type. File must be a Terraform plan or state JSON.');
  }

  /**
     * @description Read and parse Terraform JSON file (plan or state)
     * @param filePath Path to the Terraform JSON file
     */
  readTerraformFile(filePath: string): TerraformData {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const parsedData = JSON.parse(content);

      const fileType = this.detectFileType(parsedData);

      // Validate the structure based on detected type
      if (fileType === 'plan') {
        this.validatePlanStructure(parsedData);
      } else {
        this.validateStateStructure(parsedData);
      }

      if (parsedData === null) throw new Error('Invalid JSON');

      this.terraformData = parsedData;

      return this.terraformData;
    } catch (error) {
      throw new Error(`Failed to read or parse Terraform file: ${error}`);
    }
  }

  /**
     * @description Legacy method for backward compatibility
     * @param planPath Path to the Terraform plan JSON file
     */
  readPlanFile(planPath: string): TerraformPlan {
    const data = this.readTerraformFile(planPath);

    if (this.detectFileType(data) !== 'plan') {
      throw new Error('File is not a Terraform plan. Use readTerraformFile() for state files.');
    }

    return data as TerraformPlan;
  }

  /**
     * @description Validate plan file structure
     * @param data The parsed plan data
     */
  private validatePlanStructure(data: any): void {
    if (!data.resource_changes || !Array.isArray(data.resource_changes)) {
      throw new Error('Invalid plan file: missing or invalid resource_changes');
    }
  }

  /**
     * @description Validate state file structure
     * @param data The parsed state data
     */
  private validateStateStructure(data: any): void {
    if (
      !data.values
            || !data.values.root_module
            || !Array.isArray(data.values.root_module.resources)
    ) {
      throw new Error('Invalid state file: missing or invalid values.root_module.resources');
    }
  }

  /**
     * @description Check if the resource is relevant to emissions
     * We do this to save us sending irrelevant resources to the emissions API
     * @param resourceType
     */
  resourceIsRelevantToEmissions(resourceType: string): boolean {
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
    ];

    return relevantResources.includes(resourceType);
  }

  /**
     * @description Check if the parameter is relevant to emissions
     * @param param
     */
  paramIsRelevantToEmissions(param: string): boolean {
    const relevantParams = [
      'instance_class',
      'instance_type',
      'allocated_storage',
      'storage_type',
      'engine',
      'engine_version',
      'memory_size',
      'runtime',
      'timeout',
      'node_type',
      'num_cache_nodes',
      'cache_node_type',
      'replication_group_id',
      'cpu',
      'memory',
      'storage',
    ];

    return relevantParams.includes(param);
  }

  /**
     * @description Extract module name from resource address
     * @param address Resource address from plan
     */
  extractModuleName(address: string): string {
    const parts = address.split('.');

    if (parts.length > 2 && parts[0] === 'module') {
      return parts[1];
    }

    return 'root';
  }

  /**
     * @description Extract provider configuration from plan
     * @param planData The parsed plan data
     */
  extractProviderConfig(planData: TerraformPlan): Provider | undefined {
    if (!planData.configuration?.provider_config) {
      return undefined;
    }

    const providerConfig: Provider = {};

    Object.entries(planData.configuration.provider_config).forEach(
      ([providerKey, config]) => {
        if (!this.isValidProviderConfig(config)) {
          return;
        }

        const providerData = this.extractProviderData(config);

        // Store provider config if we found any data
        if (Object.keys(providerData).length > 0) {
          providerConfig[providerKey] = [providerData];
        }
      },
    );

    return Object.keys(providerConfig).length > 0 ? providerConfig : undefined;
  }

  /**
     * @description Extract provider data from various configuration formats
     * @param config The provider configuration object
     */
  private extractProviderData(config: any): Record<string, any> {
    const providerData: Record<string, any> = {};

    // Handle expressions (variables and constants)
    if ('expressions' in config && config.expressions) {
      const expressions = config.expressions as Record<string, any>;
      Object.entries(expressions).forEach(([key, value]) => {
        const extractedValue = this.extractValueFromExpression(value);

        if (extractedValue !== undefined) {
          providerData[key] = extractedValue;
        }
      });
    }

    // Handle direct configuration values (fallback or additional)
    const skipKeys = ['expressions', 'version_constraint', 'full_name', 'name'];
    Object.entries(config).forEach(([key, value]) => {
      if (!skipKeys.includes(key) && value !== undefined) {
        // Only add if not already extracted from expressions
        if (!(key in providerData)) {
          // Also extract values from direct config if they're expression objects
          const extractedValue = this.extractValueFromExpression(value);
          providerData[key] = extractedValue !== undefined ? extractedValue : value;
        }
      }
    });

    return providerData;
  }

  /**
     * @description Helper method to safely extract value from Terraform expression
     * @param value The value from the plan
     */
  private extractValueFromExpression(value: any): string | undefined {
    if (
      typeof value === 'string'
            || typeof value === 'number'
            || typeof value === 'boolean'
    ) {
      return String(value);
    }

    if (value && typeof value === 'object') {
      // Handle constant values
      if ('constant_value' in value && value.constant_value !== undefined) {
        return String(value.constant_value);
      }

      // Handle variable references
      if ('references' in value && Array.isArray(value.references)) {
        const references = value.references as string[];

        return `var.${references[0] || 'unknown'}`;
      }
    }

    return undefined;
  }

  /**
     * @description Helper method to normalize provider names
     * @param providerName The provider name from the plan
     */
  private normalizeProviderName(providerName: string): string {
    // Extract the actual provider name from various formats
    // e.g., "registry.terraform.io/hashicorp/aws" -> "aws"
    // e.g., "hashicorp/aws" -> "aws"
    // e.g., "aws" -> "aws"
    const parts = providerName.split('/');

    return parts[parts.length - 1];
  }

  /**
     * @description Helper method to check if a provider config is valid
     * @param config The provider configuration
     */
  private isValidProviderConfig(config: any): boolean {
    return config && typeof config === 'object';
  }

  /**
     * @description Filter and extract relevant parameters from resource configuration
     * @param resourceConfig The resource configuration object
     */
  extractRelevantParameters(
    resourceConfig: any,
  ): Record<string, string | undefined>[] {
    const relevantParams: Record<string, string | undefined> = {};

    if (!resourceConfig || typeof resourceConfig !== 'object') {
      return [relevantParams];
    }

    Object.entries(resourceConfig).forEach(([key, value]) => {
      if (this.paramIsRelevantToEmissions(key)) {
        const extractedValue = this.extractValueFromExpression(value);

        if (extractedValue !== undefined) {
          relevantParams[key] = extractedValue;
        }
      }
    });

    return [relevantParams];
  }

  /**
     * @description Extract provider configuration from state file resources
     * @param stateData The parsed state data
     */
  extractProviderConfigFromState(stateData: TerraformState): Provider | undefined {
    const providerConfig: Provider = {};
    const regionsByProvider: Record<string, Set<string>> = {};

    // Collect regions from all resources
    const collectRegions = (module: any) => {
      if (module.resources && Array.isArray(module.resources)) {
        module.resources.forEach((resource: TerraformStateResource) => {
          const providerName = this.normalizeProviderName(resource.provider_name);

          // Extract region from resource values
          const region = this.extractRegionFromResource(resource);

          if (region) {
            if (!regionsByProvider[providerName]) {
              regionsByProvider[providerName] = new Set();
            }
            regionsByProvider[providerName].add(region);
          }
        });
      }

      if (module.child_modules && Array.isArray(module.child_modules)) {
        module.child_modules.forEach((childModule: any) => {
          collectRegions(childModule);
        });
      }
    };

    collectRegions(stateData.values.root_module);

    // Build provider config from collected regions
    Object.entries(regionsByProvider).forEach(([providerName, regions]) => {
      const regionArray = Array.from(regions);
      // Use the first region if multiple regions exist
      const primaryRegion = regionArray[0];

      providerConfig[providerName] = [{
        region: primaryRegion,
        // Add other common provider attributes that might be needed
        ...(regionArray.length > 1 && { additional_regions: regionArray.slice(1) }),
      }];
    });

    return Object.keys(providerConfig).length > 0 ? providerConfig : undefined;
  }

  /**
     * @description Extract region from a resource's values
     * @param resource The state resource
     */
  private extractRegionFromResource(resource: TerraformStateResource): string | undefined {
    if (!resource.values || typeof resource.values !== 'object') {
      return undefined;
    }

    // Common region field names across different providers
    const regionFields = [
      'region', // AWS
      'location', // Azure
      'zone', // GCP
      'availability_zone', // AWS (extract region from AZ)
      'placement_group', // Some resources
    ];

    for (const field of regionFields) {
      const value = resource.values[field];

      if (typeof value === 'string' && value.trim()) {
        // For AWS availability zones, extract the region (e.g., us-east-1a -> us-east-1)
        if (field === 'availability_zone' && value.match(/^[a-z]+-[a-z]+-\d+[a-z]$/)) {
          return value.slice(0, -1); // Remove the last character (zone letter)
        }

        return value.trim();
      }
    }

    // Try to extract from nested objects
    const nestedObjects = ['placement', 'location_info', 'provider_config'];

    for (const nestedField of nestedObjects) {
      const nestedValue = resource.values[nestedField];

      if (nestedValue && typeof nestedValue === 'object') {
        for (const regionField of regionFields) {
          const regionValue = nestedValue[regionField];

          if (typeof regionValue === 'string' && regionValue.trim()) {
            return regionValue.trim();
          }
        }
      }
    }

    return undefined;
  }

  /**
     * @description Process resources from state file
     * @param stateData The parsed state data
     */
  processStateResources(stateData: TerraformState): RawResource[] {
    const resources: RawResource[] = [];
    const providerConfig = this.extractProviderConfigFromState(stateData);

    const processModule = (module: any, moduleName: string = 'root') => {
      if (module.resources && Array.isArray(module.resources)) {
        module.resources.forEach((resource: TerraformStateResource) => {
          // Only process relevant resources
          if (!this.resourceIsRelevantToEmissions(resource.type)) {
            return;
          }

          const parameters = this.extractRelevantParameters(resource.values || {});

          // Create a mock resource change for provider resolution
          const mockResourceChange: TerraformPlanResource = {
            address: resource.address,
            mode: resource.mode,
            type: resource.type,
            name: resource.name,
            provider_name: resource.provider_name,
            change: {
              actions: ['no-op'], // State represents current state
              before: resource.values,
              after: resource.values,
              after_unknown: {},
              before_sensitive: {},
              after_sensitive: {},
            },
          };

          // Get provider-specific config with region information extracted from state
          const resourceProvider = this.getProviderForResource(mockResourceChange, providerConfig);

          const formattedResource: RawResource = {
            resource: resource.type,
            name: resource.name,
            parameters,
            module: moduleName,
            provider: resourceProvider,
            action: 'existing', // State represents existing resources
          };

          resources.push(formattedResource);
        });
      }

      if (module.child_modules && Array.isArray(module.child_modules)) {
        module.child_modules.forEach((childModule: any) => {
          processModule(
            childModule,
            childModule.address ? childModule.address.replace('module.', '') : 'unknown',
          );
        });
      }
    };

    processModule(stateData.values.root_module);

    return resources;
  }

  /**
     * @description Process resource changes from the plan
     * @param planData The parsed plan data
     */
  processResourceChanges(planData: TerraformPlan): RawResource[] {
    const resources: RawResource[] = [];
    const providerConfig = this.extractProviderConfig(planData);

    planData.resource_changes.forEach((resourceChange) => {
      const {
        type, name, change, address,
      } = resourceChange;

      // Only process relevant resources
      if (!this.resourceIsRelevantToEmissions(type)) {
        return;
      }

      // Skip resources that will be deleted
      if (
        change.actions.includes('delete')
                && !change.actions.includes('create')
      ) {
        return;
      }

      // Use the 'after' state for create/update operations
      const resourceConfig = change.after || change.before || {};
      const parameters = this.extractRelevantParameters(resourceConfig);

      // Try to get provider-specific config for this resource
      const resourceProvider = this.getProviderForResource(
        resourceChange,
        providerConfig,
      );

      const resource: RawResource = {
        resource: type,
        name,
        parameters,
        module: this.extractModuleName(address),
        provider: resourceProvider,
        action: change.actions[0] || 'unknown',
      };

      resources.push(resource);
    });

    return resources;
  }

  /**
     * @description Get provider configuration for a specific resource
     * @param resourceChange The resource from the plan
     * @param globalProviderConfig The global provider configuration
     */
  getProviderForResource(
    resourceChange: TerraformPlanResource,
    globalProviderConfig?: Provider,
  ): Provider | undefined {
    if (!globalProviderConfig) {
      return undefined;
    }

    const normalizedProviderName = this.normalizeProviderName(
      resourceChange.provider_name,
    );

    // Try different matching strategies
    const matchingStrategy = this.findMatchingProvider(
      normalizedProviderName,
      globalProviderConfig,
    );

    return matchingStrategy;
  }

  /**
     * @description Find matching provider using various strategies
     * @param providerName The normalized provider name
     * @param globalProviderConfig The global provider configuration
     */
  private findMatchingProvider(
    providerName: string,
    globalProviderConfig: Provider,
  ): Provider | undefined {
    // Strategy 1: Exact match
    if (globalProviderConfig[providerName]) {
      return { [providerName]: globalProviderConfig[providerName] };
    }

    // Strategy 2: Case-insensitive match
    const lowerProviderName = providerName.toLowerCase();
    const caseInsensitiveMatch = Object.entries(globalProviderConfig).find(
      ([key]) => key.toLowerCase() === lowerProviderName,
    );

    if (caseInsensitiveMatch) {
      return { [caseInsensitiveMatch[0]]: caseInsensitiveMatch[1] };
    }

    // Strategy 3: Partial match (contains)
    const partialMatch = Object
      .entries(globalProviderConfig)
      .find(([key]) => key.includes(providerName) || providerName.includes(key));

    if (partialMatch) {
      return { [partialMatch[0]]: partialMatch[1] };
    }

    // Strategy 4: Alias or common name mapping
    const aliasedMatch = this.findProviderByAlias(
      providerName,
      globalProviderConfig,
    );

    if (aliasedMatch) {
      return aliasedMatch;
    }

    // Strategy 5: Fallback to first available provider if only one exists
    const providerKeys = Object.keys(globalProviderConfig);

    if (providerKeys.length === 1) {
      return { [providerKeys[0]]: globalProviderConfig[providerKeys[0]] };
    }

    // Strategy 6: Return global config as fallback
    return globalProviderConfig;
  }

  /**
     * @description Find provider by common aliases
     * @param providerName The provider name to find
     * @param globalProviderConfig The global provider configuration
     */
  private findProviderByAlias(
    providerName: string,
    globalProviderConfig: Provider,
  ): Provider | undefined {
    const commonAliases: Record<string, string[]> = {
      aws: ['amazon', 'amazonaws'],
      azurerm: ['azure', 'az'],
      google: ['gcp', 'gcloud'],
      kubernetes: ['k8s'],
      helm: ['helm3'],
    };

    // Check if the provider name is an alias for any known provider
    const aliasMatch = Object
      .entries(commonAliases)
      .find(([key, aliases]) => aliases.includes(providerName) || key === providerName);

    if (aliasMatch) {
      const [canonicalName] = aliasMatch;

      if (globalProviderConfig[canonicalName]) {
        return { [canonicalName]: globalProviderConfig[canonicalName] };
      }
    }

    return undefined;
  }

  /**
     * @description Process planned values from the plan (alternative approach)
     * @param planData The parsed plan data
     */
  processPlannedValues(planData: TerraformPlan): RawResource[] {
    const resources: RawResource[] = [];
    const providerConfig = this.extractProviderConfig(planData);

    if (!planData.planned_values?.root_module) {
      return resources;
    }

    const processModule = (module: any, moduleName: string = 'root') => {
      if (module.resources) {
        module.resources.forEach((resource: any) => {
          if (!this.resourceIsRelevantToEmissions(resource.type)) {
            return;
          }

          const parameters = this.extractRelevantParameters(
            resource.values || {},
          );

          // Create a mock resource change for provider resolution
          const mockResourceChange: TerraformPlanResource = {
            address: resource.address || `${resource.type}.${resource.name}`,
            mode: resource.mode || 'managed',
            type: resource.type,
            name: resource.name,
            provider_name: resource.provider_name || 'unknown',
            change: {
              actions: ['create'],
              before: null,
              after: resource.values || {},
              after_unknown: {},
              before_sensitive: {},
              after_sensitive: {},
            },
          };

          // Get provider-specific config for this resource
          const resourceProvider = this.getProviderForResource(
            mockResourceChange,
            providerConfig,
          );

          const formattedResource: RawResource = {
            resource: resource.type,
            name: resource.name,
            parameters,
            module: moduleName,
            provider: resourceProvider,
            action: 'create', // Planned values represent the desired state
          };

          resources.push(formattedResource);
        });
      }

      if (module.child_modules) {
        module.child_modules.forEach((childModule: any) => {
          processModule(
            childModule,
            childModule.address.replace('module.', ''),
          );
        });
      }
    };

    processModule(planData.planned_values.root_module);

    return resources;
  }

  /**
     * @description Get formatted resources from the terraform data (plan or state)
     * Automatically detects file type and processes accordingly
     */
  getFormattedResources(): RawResource[] {
    if (!this.terraformData) {
      throw new Error('No terraform data loaded. Call readTerraformFile first.');
    }

    const fileType = this.detectFileType(this.terraformData);
    let resources: RawResource[] = [];

    if (fileType === 'plan') {
      const planData = this.terraformData as TerraformPlan;

      // Primary approach: use resource_changes for more detailed change information
      resources = this.processResourceChanges(planData);

      // Fallback: use planned_values if resource_changes is empty or incomplete
      if (resources.length === 0 && planData.planned_values) {
        resources = this.processPlannedValues(planData);
      }
    } else {
      const stateData = this.terraformData as TerraformState;
      resources = this.processStateResources(stateData);
    }

    this.formattedResources = resources;

    return this.formattedResources;
  }

  /**
     * @description Get terraform data summary for logging
     */
  getTerraformSummary(): {
        totalResources: number;
        relevantResources: number;
        actions: Record<string, number>;
        modules: string[];
        fileType: 'plan' | 'state';
        } {
    if (!this.terraformData) {
      throw new Error('No terraform data loaded. Call readTerraformFile first.');
    }

    const fileType = this.detectFileType(this.terraformData);
    const actions: Record<string, number> = {};
    const modules = new Set<string>();
    let relevantResources = 0;
    let totalResources = 0;

    if (fileType === 'plan') {
      const planData = this.terraformData as TerraformPlan;

      planData.resource_changes.forEach((resource) => {
        const moduleName = this.extractModuleName(resource.address);
        modules.add(moduleName);

        if (this.resourceIsRelevantToEmissions(resource.type)) {
          relevantResources += 1;
        }

        resource.change.actions.forEach((action) => {
          actions[action] = (actions[action] || 0) + 1;
        });
      });

      totalResources = planData.resource_changes.length;
    } else {
      const stateData = this.terraformData as TerraformState;

      const countResources = (module: any) => {
        if (module.resources && Array.isArray(module.resources)) {
          module.resources.forEach((resource: TerraformStateResource) => {
            const moduleName = this.extractModuleName(resource.address);
            modules.add(moduleName);

            if (this.resourceIsRelevantToEmissions(resource.type)) {
              relevantResources += 1;
            }

            // State files represent existing resources
            actions.existing = (actions.existing || 0) + 1;
            totalResources += 1;
          });
        }

        if (module.child_modules && Array.isArray(module.child_modules)) {
          module.child_modules.forEach((childModule: any) => {
            countResources(childModule);
          });
        }
      };

      countResources(stateData.values.root_module);
    }

    return {
      totalResources,
      relevantResources,
      actions,
      modules: Array.from(modules),
      fileType,
    };
  }

  /**
     * @description Legacy method for backward compatibility
     */
  getPlanSummary(): {
        totalResources: number;
        relevantResources: number;
        actions: Record<string, number>;
        modules: string[];
        } {
    const summary = this.getTerraformSummary();

    return {
      totalResources: summary.totalResources,
      relevantResources: summary.relevantResources,
      actions: summary.actions,
      modules: summary.modules,
    };
  }
}
