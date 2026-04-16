# Pre Legal Project Level

## Overview

This is a SaaS project to allow user to draft legal documents based on templates in the templates directory. The user can carryout an AI Chat in order to establish what document to use and how to fill in the fields. The available documents are covered in catalogue.json file in the project root directory, included here:

@catalogue.json

## Current Status (as of 2026-04-16)

**KAN-6 complete.** The V1 foundation is built and running. The app is fully containerised and accessible at http://localhost:8000.

What is implemented:
- **Frontend:** Next.js 16 static export served by FastAPI. Login page with JWT auth. Mutual NDA creator with live preview and PDF download. Brand color scheme applied.
- **Backend:** FastAPI (uv project) at `backend/`. Endpoints: `POST /auth/login`, `POST /api/download` (returns PDF via WeasyPrint). SQLite database scaffolded at `/app/data/pre_legal.db` (persisted via Docker volume).
- **Auth:** Hardcoded credentials (`user` / `password`) — registration and real user management deferred to a future ticket.
- **Docker:** Single container, multi-stage build. Run with `./scripts/start.sh` or `./scripts/start.ps1`.
- **Documents:** Mutual NDA only. All other documents in `catalog.json` are defined but not yet implemented.

What is **not yet** implemented:
- AI Chat / OpenRouter integration
- User registration and real auth
- Support for the remaining 11 document types beyond Mutual NDA

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

- **Container:** Single Docker container, multi-stage build (Node builds frontend, Python runs FastAPI). Managed via `docker-compose.yml` at the project root.
- **Backend:** `backend/` — uv project, FastAPI, Python 3.12. Runs on port 8000 and serves both the API and the static frontend.
- **Frontend:** `frontend/` — Next.js 16, React 19, TypeScript, Tailwind v4. Built as a static export (`output: 'export'`) and served by FastAPI.
- **Database:** SQLite at `/app/data/pre_legal.db`, persisted via Docker volume.
- **Auth:** JWT-based. Tokens issued by `POST /auth/login`, stored in `localStorage`, sent as `Authorization: Bearer` header.
- **PDF generation:** WeasyPrint converts the NDA HTML template to PDF server-side.
- **Scripts:** `scripts/` — `start.sh` / `stop.sh` (Linux/macOS), `start.ps1` / `stop.ps1` (Windows PowerShell).

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

**Run the app (Docker):**
- `./scripts/start.sh` — build and start (Linux/macOS)
- `./scripts/start.ps1` — build and start (Windows PowerShell)
- `./scripts/stop.sh` / `./scripts/stop.ps1` — stop the container

**Frontend development only:**
- `npm run dev` — Next.js dev server (no backend; auth and download won't work)
- `npm run build` — static export to `frontend/out/`
- `npm run lint` — ESLint
- `npm test` — Jest unit tests