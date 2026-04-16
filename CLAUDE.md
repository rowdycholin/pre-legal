# Pre Legal Project Level

## Overview

This is a SaaS project to allow user to draft legal documents based on templates in the templates directory. The user can carryout an AI Chat in order to establish what document to use and how to fill in the fields. The available documents are covered in catalogue.json file in the project root directory, included here:

@catalogue.json

Before we start: the initial implementation is a frontend only prototype that supports the Mutual NDA document with no AI Chat.

## Development Process
When instructed to build a feature:

1. Use your Atlassian tool to read the feature instruction from Jira.  
2. Develop the feature on a branch name similar to the Jira ticket number.  
3. Do not skip any step in the feature-dev 7 step process.  
4. Thoroughly test the feature with unit tests and integration tests and fix any issues before proceeding further.  
5. Submit a PR with your github tools

## AI Design

When writing code to call LLMs use openrouter to call the model gpt-oss-120b model. There is a .env in the project root with the openrouter API key. You should use structured outputs so you can interpret the results and populate the field in the legal documents.

## Technical Design

The entire project should be packaged into a docker container.  
The backend should be in a backend/ directory and be a uv project, using FastAPI.
There should be a database for users using SQLLite. The application should have a login script with the option to create a new user as well.   
The frontend should be in the frontend/ directory.  
Consider statically building the frontend and serving it via FastApi, if that will work.  
There should be scripts in the scripts/ directory to stop and start the container. Create for Linux, MacOS and Windows using PowerShell. 


Backend available at http://localhost:8000

## Color Scheme

- **Accent Yellow:** #ecad0a
- **Blue Primary:** #209dd7
- **Purple Seconday:** #753991 (submit buttons)
- **Dark Navy:** #032147 (headings)
- **Gray Text:** #888888

## Branding & Visuals
- **Fitness Aesthetic:** Professional, clean, and movement-focused.
- **Model Attire:** Black athletic leggings (Lululemon style) for all visual descriptions.
- **Tone:** Encouraging but grounded and expert-led.

## Commands
- **Dev:** `npm run dev`
- **Build:** `npm run build`
- **Lint:** `npm run lint`