# MainCLI

  

This page explains the `main.cli.ts` file and how command-line arguments are handled in Eco-Infra. Eco-Infra parses command-line arguments [arg]([https://www.npmjs.com/package/arg]), an NPM library.

  

## Methods

  

### Setter Methods

  

|Method |Description | Type | Use Case |

|---|----|----|----|

| `setProjectPath(path?: string`) { ... }| Sets the project path and ensures that the path ends with a `/`. | string| |

  

### Getter Methods

  

|Method |Description | Type | Use Case |

|---|----|----|----|

| `project()`| Returns the project path. | string| |

| `getToken()`| Returns the token. |string | | 

| `getProjectName()`| Returns the project name. | string| | 

| `getApply()`|Returns whether the apply flag is set. | boolean| | 

| `getBreakdown()`|Returns whether the breakdown flag is set. | boolean | |