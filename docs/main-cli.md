---
layout: default
title: CLI Reference
nav_order: 2
---

# EcoInfra CLI Reference

The EcoInfra CLI lets you analyze your Infrastructure-as-Code (IaC) plans and estimate the carbon footprint of your cloud deployments.

---

## 🚀 Installation

Download the latest release for your platform from the [GitHub Releases](https://github.com/eco-infra/ecoinfra/releases) page.

Or, to run from source:

```bash
git clone git@github.com:eco-infra/ecoinfra.git
npm install
npm run package
```

---

## ⚡ Getting Started

1. **Generate a Terraform plan file:**
   ```bash
   terraform plan -out=plan.out
   terraform show -json plan.out > plan.json
   ```

2. **Get your API token:**
   Log in at [eco-infra.com](https://eco-infra.com), go to your profile, and create an API key.

3. **Run the CLI:**
   ```bash
   ./ecoinfra-PLATFORM --token <YOUR_TOKEN> --project-name "<PROJECT_NAME>" --plan-file plan.json
   ```

---

## 📝 Usage

```bash
ecoinfra --token <API_TOKEN> --project-name <NAME> --plan-file <PATH_TO_PLAN_JSON> [options]
```

### Required Options

- `--token`
  Your EcoInfra API key.

- `--project-name`
  A unique name for your project.

- `--plan-file`
  Path to the Terraform plan JSON file.

### Optional Flags

- `--breakdown`
  Show a detailed resource-by-resource emissions breakdown.

- `--apply`
  Mark this run as an applied deployment.

---

## 💡 Examples

**Basic analysis:**
```bash
ecoinfra --token c3dc55b6-78a0-43ad-2513-a751e76553de --project-name "Production Account" --plan-file plan.json
```

**With breakdown:**
```bash
ecoinfra --token ... --project-name ... --plan-file plan.json --breakdown
```

---

## 🛠️ CI/CD Integration

You can use EcoInfra in CI pipelines.
Example for GitHub Actions:

```yaml
- name: Eco-Infra
  uses: ecoinfra/ecoinfra-action@v1.1.2
  with:
    token: ${{ secrets.ECOINFRA_TOKEN }}
    project-name: 'my-project'
    plan-file: './terraform/plan.json'
```

---

## 📚 Command Reference

| Option            | Required | Description                                      |
|-------------------|----------|--------------------------------------------------|
| `--token`         | Yes      | Your API key                                     |
| `--project-name`  | Yes      | Unique project name                              |
| `--plan-file`     | Yes      | Path to Terraform plan JSON                      |
| `--breakdown`     | No       | Show detailed breakdown                          |

---

## 🔍 Troubleshooting

- **Missing required arguments:**
  The CLI will prompt if `--token`, `--project-name`, or `--plan-file` are missing.

- **API errors:**
  Double-check your token and project name. If issues persist, open an issue on [GitHub](https://github.com/eco-infra/ecoinfra/issues).

---

For more details, visit [eco-infra.com](https://eco-infra.com) or see the [README](../README.md).
