---
name: Bug
about: Use this template for creating a new bug report.
title: "Bug Title"
labels: bug
assignees: iamdavidmt
- type: dropdown
  id: os
  attributes:
    label: What OS do you use?
    options:
      - Linux
      - Windows
      - Mac
  validations:
    required: true
- type: input
  id: terraform
  attributes:
    label: Terraform Version
    description: "What is your Terraform Version?"
    placeholder: "$ terraform --version
Terraform v1.3.7
on linux_amd64
"
  validations:
    required: true
- type: input
  id: description
  attributes:
    label: Bug description
    description: "Please describe the bug"
    placeholder: "Whenever I run the tool, it does this..."
  validations:
    required: true
---