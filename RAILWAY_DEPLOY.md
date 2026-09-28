# 🚀 Deploying SupportNova on Railway

This repository is pre-configured for **instant 1-click single-service deployment** on [Railway](https://railway.app). The multi-stage `Dockerfile` compiles the Vite React frontend and serves both the frontend web app and the FastAPI REST backend from a single unified container with zero CORS hassle.

---

## ⚡ Quick Deployment (2 Minutes)

### Method A: Via Railway Web Dashboard (Recommended)

1. **Commit and Push your changes to GitHub**:
   ```bash
   git add .
   git commit -m "Configure SupportNova for Railway deployment"
   git push origin main
   ```

2. **Open Railway Dashboard**:
   - Go to [railway.app](https://railway.app) and sign in.
   - Click **"New Project"** -> **"Deploy from GitHub repo"**.
   - Select your repository: `raomohsin213/supportnova`.

3. **Railway Auto-Detection**:
   - Railway will automatically detect [`Dockerfile`](file:///c:/Users/asp.APTECHNK1/Desktop/supportnova/supportnova/Dockerfile) and [`railway.json`](file:///c:/Users/asp.APTECHNK1/Desktop/supportnova/supportnova/railway.json).
   - Click **Deploy Now**.

4. **Add Environment Variables (Variables Tab)**:
   Navigate to your service -> **Variables** and add:
   | Variable | Value / Description | Required? |
   |---|---|---|
   | `GEMINI_API_KEY` | Your Google Gemini API Key | Recommended for AI classification |
   | `MONGODB_URI` | `mongodb+srv://...` (Atlas connection string) | Optional (SQLite works out of the box) |
   | `JWT_SECRET` | Any random 32+ character string (read by `backend/app/services/auth.py`) | Strongly recommended (the built-in default is public in the repo) |
   | `ENVIRONMENT` | `production` | Set automatically by Docker |
   | `PORT` | — | Injected by Railway; do not set |

   > **Note:** The bundled SQLite database (`backend/support_nova.db`) lives inside the container, so tickets and uploads created on Railway are reset on every redeploy. Set `MONGODB_URI` if you need data to persist.

5. **Generate Public Domain**:
   - Go to **Settings** -> **Networking** -> **Generate Domain**.
   - Your application will be live at `https://<your-project>.up.railway.app`!

---

### Method B: Via Railway CLI

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Login and Link**:
   ```bash
   railway login
   railway init
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables --set GEMINI_API_KEY="your-gemini-key"
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Generate / Open Domain**:
   ```bash
   railway domain
   railway open
   ```

---

## 🔍 Health & Verification

Once deployed, you can verify your service:
- **Web App**: `https://<your-domain>.up.railway.app/`
- **Health Check**: `https://<your-domain>.up.railway.app/health`
- **Swagger API Docs**: `https://<your-domain>.up.railway.app/docs`
- **API Status**: `https://<your-domain>.up.railway.app/api`

---

## 🛡️ Default Demo Accounts
- **System Admin**: `admin@supportnova.io` / `Admin123!`
- **Support Manager**: `manager@supportnova.io` / `Manager123!`
- **Reviewer / QA**: `reviewer@supportnova.io` / `Reviewer123!`
- **Support Agent**: `agent@supportnova.io` / `Agent123!`
- **Customer**: `customer@supportnova.io` / `Customer123!`
