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

export default class TerraformPlanExtractor {
  constructor(private cli: MainCli) {
  }

  private planData: TerraformPlan | null = null;

  private formattedResources: RawResource[] = [];

  /**
     * @description Set plan data for testing purposes
     * @param planData The plan data to set
     */
  setPlanData(planData: TerraformPlan): void {
    this.planData = planData;
  }

  /**
     * @description Read and parse Terraform plan JSON file
     * @param planPath Path to the Terraform plan JSON file
     */
  readPlanFile(planPath: string): TerraformPlan {
    try {
      const content = fs.readFileSync(planPath, 'utf-8');
      this.planData = JSON.parse(content);

      return this.planData!;
    } catch (error) {
      throw new Error(`Failed to read or parse plan file: ${error}`);
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
     * @description Get formatted resources from the plan
     * Uses resource_changes by default, falls back to planned_values
     */
  getFormattedResources(): RawResource[] {
    if (!this.planData) {
      throw new Error('No plan data loaded. Call readPlanFile first.');
    }

    // Primary approach: use resource_changes for more detailed change information
    let resources = this.processResourceChanges(this.planData);

    // Fallback: use planned_values if resource_changes is empty or incomplete
    if (resources.length === 0 && this.planData.planned_values) {
      resources = this.processPlannedValues(this.planData);
    }

    this.formattedResources = resources;

    return this.formattedResources;
  }

  /**
     * @description Get plan summary for logging
     */
  getPlanSummary(): {
        totalResources: number;
        relevantResources: number;
        actions: Record<string, number>;
        modules: string[];
        } {
    if (!this.planData) {
      throw new Error('No plan data loaded. Call readPlanFile first.');
    }

    const actions: Record<string, number> = {};
    const modules = new Set<string>();
    let relevantResources = 0;

    this.planData.resource_changes.forEach((resource) => {
      const moduleName = this.extractModuleName(resource.address);
      modules.add(moduleName);

      if (this.resourceIsRelevantToEmissions(resource.type)) {
        relevantResources += 1;
      }

      resource.change.actions.forEach((action) => {
        actions[action] = (actions[action] || 0) + 1;
      });
    });

    return {
      totalResources: this.planData.resource_changes.length,
      relevantResources,
      actions,
      modules: Array.from(modules),
    };
  }
}
