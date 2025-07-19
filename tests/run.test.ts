import {
  afterEach, before, describe, it, mock,
} from 'node:test';
import assert = require('assert');
import MainCli from '../app/cli/main.cli';
import TerraformDataExtractor from '../app/extractor/terraform-data.extractor';

describe('TerraformDataExtractor Test', async () => {
  before(() => {
    mock.reset();
  });
  afterEach(() => {
    mock.reset();
  });

  await it('Should extract resources from plan data', async () => {
    const argResults = {
      '--token': 'token',
      '--login': 'login',
      '--project-name': 'project-name',
      '--breakdown': false,
      '--apply': false,
      '--use-plan': true,
      '-fill': 'test-plan.json',
    };
    const mainCli = new MainCli(argResults, 'test-project');
    const extractor = new TerraformDataExtractor(mainCli);

    const mockPlanData = {
      format_version: '1.2',
      terraform_version: '1.6.0',
      resource_changes: [
        {
          address: 'aws_instance.example',
          mode: 'managed',
          type: 'aws_instance',
          name: 'example',
          provider_name: 'registry.terraform.io/hashicorp/aws',
          change: {
            actions: ['create'],
            before: null,
            after: {
              instance_type: 't3.micro',
              region: 'us-east-1',
            },
            after_unknown: {},
            before_sensitive: {},
            after_sensitive: {},
          },
        },
      ],
    };

    // Set the plan data for testing
    extractor.setTerraformData(mockPlanData);
    const resources = extractor.getFormattedResources();

    assert(resources.length === 1);
    assert(resources[0].resource === 'aws_instance');
    assert(resources[0].name === 'example');
    assert(resources[0].module === 'root');
    assert(resources[0].action === 'create');
  });

  await it('Should filter irrelevant resources', async () => {
    const argResults = {
      '--token': 'token',
      '--login': 'login',
      '--project-name': 'project-name',
      '--breakdown': false,
      '--apply': false,
      '--use-plan': true,
      '-fill': 'test-plan.json',
    };
    const mainCli = new MainCli(argResults, 'test-project');
    const extractor = new TerraformDataExtractor(mainCli);

    const mockPlanData = {
      format_version: '1.2',
      terraform_version: '1.6.0',
      resource_changes: [
        {
          address: 'aws_s3_bucket.example',
          mode: 'managed',
          type: 'aws_s3_bucket',
          name: 'example',
          provider_name: 'registry.terraform.io/hashicorp/aws',
          change: {
            actions: ['create'],
            before: null,
            after: {
              bucket: 'my-bucket',
            },
            after_unknown: {},
            before_sensitive: {},
            after_sensitive: {},
          },
        },
      ],
    };

    // Set the plan data for testing
    extractor.setTerraformData(mockPlanData);
    const resources = extractor.getFormattedResources();

    assert(resources.length === 0); // S3 bucket is not relevant for emissions
  });

  await it('Should handle various provider configurations', async () => {
    const argResults = {
      '--token': 'token',
      '--login': 'login',
      '--project-name': 'project-name',
      '--breakdown': false,
      '-fill': 'test-plan.json',
    };
    const mainCli = new MainCli(argResults, 'test-project');
    const extractor = new TerraformDataExtractor(mainCli);

    const mockPlanData = {
      format_version: '1.2',
      terraform_version: '1.6.0',
      configuration: {
        provider_config: {
          aws: {
            name: 'aws',
            full_name: 'registry.terraform.io/hashicorp/aws',
            expressions: {
              region: {
                constant_value: 'us-east-1',
              },
              profile: {
                references: ['var.aws_profile'],
              },
            },
          },
          'aws.west': {
            name: 'aws',
            full_name: 'registry.terraform.io/hashicorp/aws',
            expressions: {
              region: {
                constant_value: 'us-west-2',
              },
            },
          },
        },
      },
      resource_changes: [
        {
          address: 'aws_instance.example',
          mode: 'managed',
          type: 'aws_instance',
          name: 'example',
          provider_name: 'registry.terraform.io/hashicorp/aws',
          change: {
            actions: ['create'],
            before: null,
            after: {
              instance_type: 't3.micro',
            },
            after_unknown: {},
            before_sensitive: {},
            after_sensitive: {},
          },
        },
      ],
    };

    extractor.setTerraformData(mockPlanData);
    const resources = extractor.getFormattedResources();

    assert(resources.length === 1, 'Expected one resource to be extracted');
    assert(resources[0].resource === 'aws_instance', "Expected resource type to be 'aws_instance'");
    assert(resources[0].provider, 'Expected provider information to be present');
    assert(resources[0].provider.aws, 'Expected AWS provider configuration to be present');
    assert(resources[0].provider.aws[0].region === 'us-east-1', "Expected AWS region to be 'us-east-1'");
  });

  await it('Should handle provider configurations without expressions', async () => {
    const argResults = {
      '--token': 'token',
      '--login': 'login',
      '--project-name': 'project-name',
      '--breakdown': false,
      '-fill': 'test-plan.json',
    };
    const mainCli = new MainCli(argResults, 'test-project');
    const extractor = new TerraformDataExtractor(mainCli);

    const mockPlanData = {
      format_version: '1.2',
      terraform_version: '1.6.0',
      configuration: {
        provider_config: {
          aws: {
            name: 'aws',
            full_name: 'registry.terraform.io/hashicorp/aws',
            region: 'eu-west-1',
            access_key: 'test-key',
          },
        },
      },
      resource_changes: [
        {
          address: 'aws_instance.example',
          mode: 'managed',
          type: 'aws_instance',
          name: 'example',
          provider_name: 'registry.terraform.io/hashicorp/aws',
          change: {
            actions: ['create'],
            before: null,
            after: {
              instance_type: 't3.micro',
            },
            after_unknown: {},
            before_sensitive: {},
            after_sensitive: {},
          },
        },
      ],
    };

    extractor.setTerraformData(mockPlanData);
    const resources = extractor.getFormattedResources();

    assert(resources.length === 1);
    assert(resources[0].provider);
    assert(resources[0].provider.aws);
    assert(resources[0].provider.aws[0].region === 'eu-west-1');
    assert(resources[0].provider.aws[0].access_key === 'test-key');
  });

  await it('Should handle missing provider configuration gracefully', async () => {
    const argResults = {
      '--token': 'token',
      '--login': 'login',
      '--project-name': 'project-name',
      '--breakdown': false,
      '-fill': 'test-plan.json',
    };
    const mainCli = new MainCli(argResults, 'test-project');
    const extractor = new TerraformDataExtractor(mainCli);

    const mockPlanData = {
      format_version: '1.2',
      terraform_version: '1.6.0',
      resource_changes: [
        {
          address: 'aws_instance.example',
          mode: 'managed',
          type: 'aws_instance',
          name: 'example',
          provider_name: 'registry.terraform.io/hashicorp/aws',
          change: {
            actions: ['create'],
            before: null,
            after: {
              instance_type: 't3.micro',
            },
            after_unknown: {},
            before_sensitive: {},
            after_sensitive: {},
          },
        },
      ],
    };

    extractor.setTerraformData(mockPlanData);
    const resources = extractor.getFormattedResources();

    assert(resources.length === 1);
    assert(resources[0].resource === 'aws_instance');
    // Should handle missing provider config gracefully
    assert(resources[0].provider === undefined);
  });

  await it('Should handle multi-provider configurations', async () => {
    const argResults = {
      '--token': 'token',
      '--login': 'login',
      '--project-name': 'project-name',
      '--breakdown': false,
      '-fill': 'test-plan.json',
    };
    const mainCli = new MainCli(argResults, 'test-project');
    const extractor = new TerraformDataExtractor(mainCli);

    const mockPlanData = {
      format_version: '1.2',
      terraform_version: '1.6.0',
      configuration: {
        provider_config: {
          aws: {
            name: 'aws',
            full_name: 'registry.terraform.io/hashicorp/aws',
            expressions: {
              region: { constant_value: 'us-east-1' },
            },
          },
          azurerm: {
            name: 'azurerm',
            full_name: 'registry.terraform.io/hashicorp/azurerm',
            expressions: {
              location: { constant_value: 'East US' },
            },
          },
        },
      },
      resource_changes: [
        {
          address: 'aws_instance.example',
          mode: 'managed',
          type: 'aws_instance',
          name: 'example',
          provider_name: 'registry.terraform.io/hashicorp/aws',
          change: {
            actions: ['create'],
            before: null,
            after: { instance_type: 't3.micro' },
            after_unknown: {},
            before_sensitive: {},
            after_sensitive: {},
          },
        },
      ],
    };

    extractor.setTerraformData(mockPlanData);
    const resources = extractor.getFormattedResources();

    assert(resources.length === 1);
    assert(resources[0].provider);
    assert(resources[0].provider.aws);
    assert(resources[0].provider.aws[0].region === 'us-east-1');
    // Should not include azurerm config for aws resource
    assert(!resources[0].provider.azurerm);
  });
});
