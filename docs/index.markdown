---
layout: home
title: EcoInfra Documentation
nav_order: 1
---

<style>
  .hero-section {
    background: linear-gradient(135deg, #F1FAF5 0%, #E8F5E8 100%);
    padding: 3rem 2rem;
    border-radius: 16px;
    margin: 2rem 0;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .hero-section::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(126, 179, 66, 0.1) 0%, transparent 70%);
    animation: float 6s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }

  .feature-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin: 3rem 0;
  }

  .feature-card {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1);
    border-left: 4px solid #7CB342;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .feature-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(46, 125, 50, 0.2);
  }

  .quick-start-steps {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    margin: 2rem 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
</style>

<div class="hero-section">
  <div class="hero-content">
    <h1 style="color: #2E7D32; font-size: 2.5rem; margin-bottom: 1rem;">🌱 EcoInfra Documentation</h1>
    <p style="font-size: 1.2rem; color: #424242; margin-bottom: 2rem;">
      The open-source Infrastructure-as-Code carbon emission calculator that helps you build sustainable cloud infrastructure.
    </p>
    <p style="color: #78909C; font-size: 1rem;">
      Measure, understand, and reduce your cloud infrastructure's environmental impact — right from your terminal.
    </p>
  </div>
</div>

<div class="quick-start-steps">
  <h2 style="color: #2E7D32; text-align: center; margin-bottom: 2rem;">🚀 Quick Start</h2>

  <div style="display: flex; justify-content: space-around; flex-wrap: wrap; gap: 1rem;">
    <div style="text-align: center; flex: 1; min-width: 200px;">
      <div style="background: #7CB342; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold;">1</div>
      <h3 style="color: #2E7D32;">Install the CLI</h3>
      <p style="color: #78909C;">Download from releases or build from source</p>
    </div>

    <div style="text-align: center; flex: 1; min-width: 200px;">
      <div style="background: #7CB342; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold;">2</div>
      <h3 style="color: #2E7D32;">Get Your Token</h3>
      <p style="color: #78909C;">Authenticate with your EcoInfra API key</p>
    </div>

    <div style="text-align: center; flex: 1; min-width: 200px;">
      <div style="background: #7CB342; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; font-weight: bold;">3</div>
      <h3 style="color: #2E7D32;">Analyze & Optimize</h3>
      <p style="color: #78909C;">Run your first carbon footprint analysis</p>
    </div>
  </div>

  <div style="text-align: center; margin-top: 2rem;">
    <a href="main-cli.html" style="background: #7CB342; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 500; box-shadow: 0 4px 12px rgba(126, 179, 66, 0.3); transition: all 0.3s ease;">
      📖 View CLI Reference
    </a>
  </div>
</div>

<div class="feature-grid">
  <div class="feature-card">
    <h3 style="color: #2E7D32; margin-bottom: 1rem;">🔧 Easy CLI Integration</h3>
    <p style="color: #424242;">Analyze your infrastructure with a single command. Seamlessly integrate into your existing CI/CD pipelines and development workflow.</p>
  </div>

  <div class="feature-card">
    <h3 style="color: #2E7D32; margin-bottom: 1rem;">📊 Detailed Emission Reports</h3>
    <p style="color: #424242;">Get comprehensive breakdowns by resource, project, or environment. Understand exactly where your carbon footprint comes from.</p>
  </div>

  <div class="feature-card">
    <h3 style="color: #2E7D32; margin-bottom: 1rem;">🔒 Secure & Transparent</h3>
    <p style="color: #424242;">Your credentials and data are handled with care. Open-source transparency means you can verify our security practices.</p>
  </div>

  <div class="feature-card">
    <h3 style="color: #2E7D32; margin-bottom: 1rem;">🌍 Sustainability Focus</h3>
    <p style="color: #424242;">Built specifically for environmentally conscious developers and organizations committed to reducing their cloud carbon footprint.</p>
  </div>
</div>

## Get Started

- [CLI Reference & Usage](main-cli.md)
- [About EcoInfra](about.markdown)

---

For more information, visit [eco-infra.com](https://eco-infra.com) or contact us at [contact@eco-infra.com](mailto:contact@eco-infra.com).