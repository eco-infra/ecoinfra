---
name: Question
about: Use this template for creating a new issue.
title: "Question Title"
labels: question
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
  id: question
  attributes:
    label: Question
    description: "What is your Question?"
    placeholder: "Whenever I run the tool, it does this..."
  validations:
    required: true
---