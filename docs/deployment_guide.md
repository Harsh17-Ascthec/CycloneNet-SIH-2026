# CycloneNet — Deployment Guide (Hugging Face Spaces)

This guide provides step-by-step instructions to deploy **CycloneNet** to **Hugging Face Spaces** for a permanent, free public URL (with 16GB RAM CPU) suitable for Smart India Hackathon (SIH 2026) jury evaluations and demo submissions.

---

## Why Hugging Face Spaces?

| Feature | Hugging Face Spaces | Typical Free Hosts (Render/Railway) |
|---|---|---|
| **RAM** | **16 GB RAM (Free)** | 512 MB (Crashes with PyTorch OOM) |
| **vCPU** | 2 vCPU | 0.5 – 1 vCPU shared |
| **Model Hosting** | Native PyTorch & Deep Learning support | Strict file size / memory limits |
| **URL** | Free permanent HTTPS domain (`*.hf.space`) | Spins down after 15 min inactivity |
| **Pricing** | **100% Free** | Free tiers limited or paid credit card required |

---

## Prerequisites

1. A free account on [Hugging Face](https://huggingface.co/join).
2. Git installed on your computer.
3. Your model weights in `backend/`:
   - `trained cyclone model.pth` (~46 MB)
   - `cyclone_detector.pth` (~45 MB)

*(Note: Both weights are under 50 MB, which means they can be pushed directly without Git LFS complications).*

---

## Step 1: Create a New Space on Hugging Face

1. Log in to your [Hugging Face](https://huggingface.co/join) account.
2. Navigate to [https://huggingface.co/new-space](https://huggingface.co/new-space).
3. Fill in the following details:
   - **Space name:** `cyclonenet` (or `cyclonenet-sih-2026`)
   - **License:** `mit`
   - **Select the Space SDK:** Choose **`Docker`** ➔ **`Blank`**  
     *(⚠️ Important: Make sure to select **Docker**, not Gradio or Streamlit)*
   - **Space Hardware:** `CPU basic • 2 vCPU • 16 GB • Free`
   - **Visibility:** `Public`
4. Click **"Create Space"**.

---

## Step 2: Push Your Code to the Space

You can push your local project to your newly created Hugging Face Space using Git.

### 1. Get an Access Token (Password)
1. In Hugging Face, click your profile icon (top right) ➔ **Settings** ➔ **Access Tokens** (or visit [https://huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)).
2. Click **Create new token**, name it `Spaces-Deploy`, select type **Write**, and copy the token (`hf_...`).

### 2. Push via Terminal (PowerShell / Command Prompt)
Open your terminal in the project root directory (`C:\Users\harsh\OneDrive\Desktop\SIH Futuree Republic\web app`) and run:

```powershell
# 1. Initialize git if not already initialized
git init

# 2. Add all project files
git add .

# 3. Commit your changes
git commit -m "Deploy CycloneNet to Hugging Face Spaces"

# 4. Set main branch
git branch -M main

# 5. Add Hugging Face Space as a remote (Replace <YOUR_HF_USERNAME> and <SPACE_NAME>)
git remote add space https://huggingface.co/spaces/<YOUR_HF_USERNAME>/cyclonenet

# 6. Push to Hugging Face Space
git push --force space main
```

When prompted for credentials:
- **Username:** Your Hugging Face username
- **Password:** The Hugging Face **Access Token** you created (`hf_...`)

---

## Step 3: Monitor Build and Access Your App

1. Go to your Space page: `https://huggingface.co/spaces/<YOUR_HF_USERNAME>/cyclonenet`.
2. Click on the **"Building"** badge at the top to watch the live Docker build logs:
   - It will install system libraries and PyTorch CPU wheels.
   - It will launch the FastAPI server with Uvicorn on port `7860`.
3. Once the build completes, the status will turn to **"Running"** (Green).
4. The web application will load directly inside the Hugging Face interactive frame!

### Direct Full-Screen URL
You can access and share the clean full-screen link with SIH evaluators:
```
https://<YOUR_HF_USERNAME>-cyclonenet.hf.space
```
*(You can also find this link by clicking the three dots `⋮` at the top right of the Space ➔ "Embed this Space" or "Direct URL")*.

---

## Alternative: GitHub Actions Auto-Sync (Optional)

If you have already uploaded your project to GitHub and want Hugging Face Spaces to automatically update whenever you push to GitHub:

1. In your GitHub repository, go to **Settings** ➔ **Secrets and variables** ➔ **Actions**.
2. Add a new repository secret:
   - **Name:** `HF_TOKEN`
   - **Value:** Your Hugging Face Write Token (`hf_...`)
3. Create a workflow file `.github/workflows/sync_to_hf.yml`:

```yaml
name: Sync to Hugging Face Hub
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  sync-to-hub:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
          lfs: true
      - name: Push to HF Space
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: git push --force https://<YOUR_HF_USERNAME>:$HF_TOKEN@huggingface.co/spaces/<YOUR_HF_USERNAME>/cyclonenet main
```

---

## Troubleshooting

- **Container Port:** The Space requires the app to listen on port `7860`. Our `Dockerfile` and root `app.py` are already pre-configured to bind to `0.0.0.0:7860`.
- **Model Loading:** The Dockerfile automatically copies `backend/trained cyclone model.pth` and `backend/cyclone_detector.pth`. Both models run on CPU inference with PyTorch.
- **Restarting the Space:** If you make changes or need a fresh restart, click the three dots `⋮` in your Space ➔ **"Restart this Space"**.
