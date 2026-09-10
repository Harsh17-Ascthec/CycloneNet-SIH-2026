# SIH 2026 Submission Guide

Use this checklist before sharing your GitHub repository link.

## Required repository content

- Actual source code is present.
- `README.md` explains the project clearly.
- PS ID and PS title are included.
- Problem statement and proposed solution are explained.
- Key features are listed.
- Technology stack is listed.
- Setup and run instructions work.
- Team members and roles are mentioned.
- Important screenshots or prototype photos are included in `assets/screenshots/`.
- Final PPT/presentation is placed in `submission/` whenever practical.
- If the PPT is too large for GitHub, add a publicly accessible Google Drive/OneDrive link in `submission/PRESENTATION.md`.
- A demo video link is provided in `submission/DEMO.md` (optional, but strongly recommended).

## Technical review items

- No API keys, passwords, access tokens, or private secrets in commits.
- `.gitignore` includes `venv/`, `.venv/`, `__pycache__/`, `.env`, and IDE configuration files.
- `requirements.txt` installs successfully in a clean environment.
- Code can be started using the documented commands in `README.md`.
- Main workflows execute without runtime errors.

## Recommended final step

Clone the repository into a fresh directory on another machine or isolated environment:

```bash
git clone <YOUR_REPOSITORY_LINK>
cd <PROJECT_FOLDER>
pip install -r requirements.txt
python -m uvicorn backend.app:app --reload --port 8000
```

Verify that the dashboard loads, image upload works, and predictions execute as expected.
