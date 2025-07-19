---
layout: default
title: CLI Reference
nav_order: 2
---

<style>
  .cli-section {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    margin: 2rem 0;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1);
    border-left: 4px solid #7CB342;
  }
  
  .installation-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 2rem 0;
  }
  
  .install-option {
    background: #F1FAF5;
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid #7CB342;
  }
  
  .step-container {
    background: linear-gradient(135deg, #F1FAF5 0%, #E8F5E8 100%);
    padding: 2rem;
    border-radius: 12px;
    margin: 2rem 0;
  }
  
  .step {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    margin: 1rem 0;
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);
  }
</style>

# 🌱 EcoInfra CLI Reference

<div style="background: linear-gradient(135deg, #F1FAF5 0%, #E8F5E8 100%); padding: 2rem; border-radius: 12px; margin: 2rem 0; text-align: center;">
  <h2 style="color: #2E7D32; margin-bottom: 1rem;">Sustainable Infrastructure Analysis</h2>
  <p style="color: #424242; font-size: 1.1rem;">
    The EcoInfra CLI helps you analyze your Infrastructure-as-Code (IaC) plans and estimate the carbon footprint of your cloud deployments.
  </p>
</div>

<div class="cli-section">
  <h2 style="color: #2E7D32;">🚀 Installation</h2>
  
  <div class="installation-grid">
    <div class="install-option">
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">📦 Pre-built Binaries</h3>
      <p style="color: #424242; margin-bottom: 1rem;">Download the latest release for your platform:</p>
      <a href="https://github.com/eco-infra/ecoinfra/releases" style="background: #7CB342; color: white; padding: 0.75rem 1.5rem; border-radius: 6px; text-decoration: none; font-weight: 500;">
        GitHub Releases
      </a>
    </div>
    
    <div class="install-option">
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">🔧 Build from Source</h3>
      <p style="color: #424242; margin-bottom: 1rem;">For the latest features and development:</p>
      <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem;">
        git clone git@github.com:eco-infra/ecoinfra.git<br>
        npm install<br>
        npm run package
      </div>
    </div>
  </div>
</div>

<div class="cli-section">
  <h2 style="color: #2E7D32;">⚡ Getting Started</h2>
  
  <div class="step-container">
    <div class="step">
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">
        <span style="background: #7CB342; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 1rem; font-size: 0.9rem;">1</span>
        Generate Terraform JSON File
      </h3>
      <p style="color: #424242; margin-bottom: 1rem;">Choose one of the following options:</p>

      <div style="margin-bottom: 1.5rem;">
        <h4 style="color: #2E7D32; margin-bottom: 0.5rem;">📋 For Plan Analysis (Future Changes)</h4>
        <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem;">
          terraform plan -out=plan.out<br>
          terraform show -json plan.out > plan.json
        </div>
      </div>

      <div>
        <h4 style="color: #2E7D32; margin-bottom: 0.5rem;">🏗️ For State Analysis (Current Infrastructure)</h4>
        <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem;">
          terraform show -json > state.json
        </div>
      </div>
    </div>
    
    <div class="step">
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">
        <span style="background: #7CB342; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 1rem; font-size: 0.9rem;">2</span>
        Get Your API Token
      </h3>
      <p style="color: #424242; margin-bottom: 1rem;">
        Log in at <a href="https://eco-infra.com" style="color: #7CB342; text-decoration: none; font-weight: 500;">eco-infra.com</a>, 
        go to your profile, and create an API key.
      </p>
    </div>
    
    <div class="step">
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">
        <span style="background: #7CB342; color: white; width: 30px; height: 30px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 1rem; font-size: 0.9rem;">3</span>
        Run the CLI Analysis
      </h3>
      <p style="color: #424242; margin-bottom: 1rem;">Execute the EcoInfra CLI with your JSON file:</p>

      <div style="margin-bottom: 1rem;">
        <h4 style="color: #2E7D32; margin-bottom: 0.5rem;">For Plan Analysis:</h4>
        <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem;">
          ./ecoinfra-PLATFORM --token &lt;YOUR_TOKEN&gt; --project-name "&lt;PROJECT_NAME&gt;" --file plan.json
        </div>
      </div>

      <div>
        <h4 style="color: #2E7D32; margin-bottom: 0.5rem;">For State Analysis:</h4>
        <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem;">
          ./ecoinfra-PLATFORM --token &lt;YOUR_TOKEN&gt; --project-name "&lt;PROJECT_NAME&gt;" --file state.json
        </div>
      </div>
    </div>
  </div>
</div>

<div class="cli-section">
  <h2 style="color: #2E7D32;">📝 Usage</h2>
  
  <div style="background: #F1FAF5; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #7CB342;">
    <h3 style="color: #2E7D32; margin-bottom: 1rem;">Command Syntax</h3>
    <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem;">
      ecoinfra --token &lt;API_TOKEN&gt; --project-name &lt;PROJECT_NAME&gt; --file &lt;TERRAFORM_JSON_FILE&gt; [options]
    </div>
    <p style="color: #78909C; font-size: 0.9rem; margin-top: 0.5rem;">
      The tool automatically detects whether the file is a Terraform plan or state JSON and processes it accordingly.
    </p>
  </div>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin: 2rem 0;">
    <div>
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">Required Options</h3>
      <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);">
        <div style="margin-bottom: 1rem;">
          <code style="background: #7CB342; color: white; padding: 0.3rem 0.6rem; border-radius: 4px;">--token</code>
          <p style="color: #424242; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Your EcoInfra API key</p>
        </div>
        <div style="margin-bottom: 1rem;">
          <code style="background: #7CB342; color: white; padding: 0.3rem 0.6rem; border-radius: 4px;">--project-name</code>
          <p style="color: #424242; margin: 0.5rem 0 0 0; font-size: 0.9rem;">A unique name for your project</p>
        </div>
        <div>
          <code style="background: #7CB342; color: white; padding: 0.3rem 0.6rem; border-radius: 4px;">--file</code>
          <p style="color: #424242; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Path to Terraform JSON file (plan or state - auto-detected)</p>
        </div>
      </div>
    </div>
    
    <div>
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">Optional Flags</h3>
      <div style="background: white; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);">
        <div style="margin-bottom: 1rem;">
          <code style="background: #81D4FA; color: #2E7D32; padding: 0.3rem 0.6rem; border-radius: 4px;">--breakdown</code>
          <p style="color: #424242; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Show detailed resource-by-resource emissions breakdown</p>
        </div>
        <div style="margin-bottom: 1rem;">
          <code style="background: #81D4FA; color: #2E7D32; padding: 0.3rem 0.6rem; border-radius: 4px;">--apply</code>
          <p style="color: #424242; margin: 0.5rem 0 0 0; font-size: 0.9rem;">Mark this run as an applied deployment</p>
        </div>
        <div style="margin-top: 1.5rem; padding: 1rem; background: #F1FAF5; border-radius: 6px; border-left: 3px solid #7CB342;">
          <h4 style="color: #2E7D32; margin-bottom: 0.5rem; font-size: 0.9rem;">Legacy Options (Deprecated)</h4>
          <div style="margin-bottom: 0.5rem;">
            <code style="background: #ECEFF1; color: #78909C; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.8rem;">--plan-file</code>
            <span style="color: #78909C; font-size: 0.8rem; margin-left: 0.5rem;">Use --file instead</span>
          </div>
          <div>
            <code style="background: #ECEFF1; color: #78909C; padding: 0.2rem 0.4rem; border-radius: 3px; font-size: 0.8rem;">--state-file</code>
            <span style="color: #78909C; font-size: 0.8rem; margin-left: 0.5rem;">Use --file instead</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="cli-section">
  <h2 style="color: #2E7D32;">💡 Examples</h2>
  
  <div style="margin: 2rem 0;">
    <h3 style="color: #2E7D32; margin-bottom: 1rem;">Plan Analysis (Future Changes)</h3>
    <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem; margin-bottom: 1rem;">
      ecoinfra --token c3dc55b6-78a0-43ad-2513-a751e76553de \<br>
      &nbsp;&nbsp;--project-name "Production Account" \<br>
      &nbsp;&nbsp;--file plan.json
    </div>
    <p style="color: #78909C; font-size: 0.9rem;">Analyzes the carbon impact of planned infrastructure changes before applying them. File type is auto-detected.</p>
  </div>

  <div style="margin: 2rem 0;">
    <h3 style="color: #2E7D32; margin-bottom: 1rem;">State Analysis (Current Infrastructure)</h3>
    <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem; margin-bottom: 1rem;">
      ecoinfra --token c3dc55b6-78a0-43ad-2513-a751e76553de \<br>
      &nbsp;&nbsp;--project-name "Production Account" \<br>
      &nbsp;&nbsp;--file state.json
    </div>
    <p style="color: #78909C; font-size: 0.9rem;">Analyzes the carbon footprint of your currently deployed infrastructure. File type is auto-detected.</p>
  </div>

  <div style="margin: 2rem 0;">
    <h3 style="color: #2E7D32; margin-bottom: 1rem;">Detailed Breakdown</h3>
    <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem; margin-bottom: 1rem;">
      ecoinfra --token c3dc55b6-78a0-43ad-2513-a751e76553de \<br>
      &nbsp;&nbsp;--project-name "Production Account" \<br>
      &nbsp;&nbsp;--file terraform.json \<br>
      &nbsp;&nbsp;--breakdown
    </div>
    <p style="color: #78909C; font-size: 0.9rem;">Includes resource-by-resource emissions data for detailed analysis. Works with both plan and state files automatically.</p>
  </div>
</div>

<div class="cli-section">
  <h2 style="color: #2E7D32;">🛠️ CI/CD Integration</h2>
  
  <p style="color: #424242; margin-bottom: 2rem;">
    Integrate EcoInfra into your continuous integration pipelines to automatically track the carbon impact of infrastructure changes.
  </p>
  
  <h3 style="color: #2E7D32; margin-bottom: 1rem;">GitHub Actions Example</h3>
  <div style="background: #2E7D32; color: white; padding: 1rem; border-radius: 6px; font-family: monospace; font-size: 0.9rem; margin-bottom: 1rem;">
    - name: Eco-Infra Carbon Analysis<br>
    &nbsp;&nbsp;uses: ecoinfra/ecoinfra-action@v1.1.2<br>
    &nbsp;&nbsp;with:<br>
    &nbsp;&nbsp;&nbsp;&nbsp;token: ${{ secrets.ECOINFRA_TOKEN }}<br>
    &nbsp;&nbsp;&nbsp;&nbsp;project-name: 'my-project'<br>
    &nbsp;&nbsp;&nbsp;&nbsp;plan-file: './terraform/plan.json'
  </div>
  
  <div style="background: #F1FAF5; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #7CB342;">
    <h4 style="color: #2E7D32; margin-bottom: 1rem;">💡 Pro Tip</h4>
    <p style="color: #424242; margin: 0;">
      Set up branch protection rules to require carbon impact analysis before merging infrastructure changes. 
      This helps maintain awareness of environmental impact across your team.
    </p>
  </div>
</div>
