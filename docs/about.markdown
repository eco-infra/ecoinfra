---
layout: page
title: About
permalink: /about/
---

<style>
  .about-hero {
    background: linear-gradient(135deg, #F1FAF5 0%, #E8F5E8 100%);
    padding: 3rem 2rem;
    border-radius: 16px;
    margin: 2rem 0;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .about-hero::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(126, 179, 66, 0.1) 0%, transparent 70%);
    animation: float 8s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-15px) rotate(180deg); }
  }

  .mission-section {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    margin: 2rem 0;
    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.1);
    border-left: 4px solid #7CB342;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .feature-item {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(46, 125, 50, 0.1);
    border-top: 3px solid #7CB342;
    transition: transform 0.3s ease;
  }

  .feature-item:hover {
    transform: translateY(-4px);
  }
</style>

<div class="about-hero">
  <div style="position: relative; z-index: 1;">
    <h1 style="color: #2E7D32; font-size: 2.5rem; margin-bottom: 1rem;">🌱 About EcoInfra</h1>
    <p style="font-size: 1.2rem; color: #424242; margin-bottom: 1rem;">
      Building a sustainable future, one infrastructure deployment at a time
    </p>
    <p style="color: #78909C; font-size: 1rem;">
      Open-source Infrastructure-as-Code emission calculator for environmentally conscious developers
    </p>
  </div>
</div>

<div class="mission-section">
  <h2 style="color: #2E7D32; margin-bottom: 1.5rem;">🎯 Our Mission</h2>
  <p style="color: #424242; font-size: 1.1rem; line-height: 1.7; margin-bottom: 1.5rem;">
    <strong>EcoInfra</strong> is an open-source Infrastructure-as-Code (IaC) emission calculator designed to help organizations and developers measure, understand, and reduce the carbon footprint of their cloud infrastructure.
  </p>
  <p style="color: #424242; font-size: 1.1rem; line-height: 1.7;">
    Our CLI tool analyzes your infrastructure plans and reports estimated emissions, empowering you to make greener choices in your cloud deployments. We believe that transparency and measurement are the first steps toward building a more sustainable digital future.
  </p>
</div>

<div style="margin: 3rem 0;">
  <h2 style="color: #2E7D32; text-align: center; margin-bottom: 2rem;">✨ Features</h2>

  <div class="features-grid">
    <div class="feature-item">
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">🔧 CI/CD Integration</h3>
      <p style="color: #424242; font-size: 0.95rem;">
        Quick integration into CI/CD pipelines with our lightweight CLI tool. Monitor carbon impact with every deployment.
      </p>
    </div>

    <div class="feature-item">
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">📊 IaC Support</h3>
      <p style="color: #424242; font-size: 0.95rem;">
        Support for major Infrastructure-as-Code formats, starting with Terraform and expanding to more platforms.
      </p>
    </div>

    <div class="feature-item">
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">📈 Detailed Reporting</h3>
      <p style="color: #424242; font-size: 0.95rem;">
        Comprehensive breakdowns and reporting with resource-level emissions data for informed decision-making.
      </p>
    </div>

    <div class="feature-item">
      <h3 style="color: #2E7D32; margin-bottom: 1rem;">🌍 Open Source</h3>
      <p style="color: #424242; font-size: 0.95rem;">
        Community-driven development with transparent methodologies and open-source accessibility for all.
      </p>
    </div>
  </div>
</div>

<div style="background: #F1FAF5; padding: 2rem; border-radius: 12px; margin: 3rem 0; text-align: center; border-left: 4px solid #7CB342;">
  <h2 style="color: #2E7D32; margin-bottom: 1rem;">🚀 Learn More</h2>
  <p style="color: #424242; margin-bottom: 2rem;">
    Ready to start measuring your infrastructure's carbon footprint?
  </p>
  <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
    <a href="main-cli.html" style="background: #7CB342; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 500; box-shadow: 0 4px 12px rgba(126, 179, 66, 0.3);">
      📖 CLI Reference
    </a>
    <a href="https://github.com/eco-infra/ecoinfra" style="background: #2E7D32; color: white; padding: 1rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 500; box-shadow: 0 4px 12px rgba(46, 125, 50, 0.3);">
      🔗 GitHub Repository
    </a>
  </div>
</div>

- [GitHub Repository](https://github.com/eco-infra)
- [Contact Us](mailto:contact@eco-infra.com)
- [Twitter](https://twitter.com/ecoinfrastatus)

Help us build a more sustainable cloud!
