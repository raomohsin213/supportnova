# 🆓 Deploy SupportNova 100% FREE (No Credit Card Required)

Railway now requires a credit card to activate accounts. Here are the **two best 100% free cloud alternatives** that **never ask for a credit card**, plus an instant local tunnel option.

---

## 🏆 Option 1: Render.com (Recommended - 2 Minutes)

[Render](https://render.com) offers free web services that run Docker containers without needing any credit card.

### Step-by-Step Instructions:

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Update for free Render and HuggingFace deployment"
   git push origin main
   ```

2. **Sign up on Render**:
   - Go to **[dashboard.render.com](https://dashboard.render.com/)**.
   - Click **"Sign in with GitHub"** (No credit card is ever requested).

3. **Deploy the Web Service**:
   - Click **"New +"** in the top right ➜ Select **"Web Service"**.
   - Choose **"Build and deploy from a Git repository"** ➜ Click **Next**.
   - Connect your repository: **`raomohsin213/supportnova`**.

4. **Configure Settings**:
   - **Name**: `supportnova`
   - **Language / Runtime**: **Docker** (Render will automatically detect your `Dockerfile`)
   - **Instance Type**: Select **Free** ($0/month)

5. **Set Environment Variables**:
   Under **Environment Variables**, click **Add Environment Variable**:
   - `GEMINI_API_KEY` = *your Google Gemini API key*
   - `ENVIRONMENT` = `production`
   - *(Optional)* `MONGODB_URI` = *your MongoDB Atlas connection string (SQLite works automatically if left blank)*

6. **Click "Deploy Web Service"**:
   - Render will build the Vite frontend and Python backend into a single container.
   - Once complete, you will get a permanent public URL: `https://supportnova.onrender.com`!

---

## 🚀 Option 2: Hugging Face Spaces (Best for AI & Free 16GB RAM)

[Hugging Face Spaces](https://huggingface.co/spaces) provides **free 2-core CPU, 16 GB RAM Docker containers**. They **never** ask for a credit card.

### Step-by-Step Instructions:

1. **Sign in to Hugging Face**:
   - Go to [huggingface.co/spaces](https://huggingface.co/spaces) and create a free account.

2. **Create New Space**:
   - Click **"Create new Space"**.
   - Space Name: `supportnova`
   - License: `mit` or `apache-2.0`
   - Space SDK: Select **Docker** ➜ **Blank**.
   - Space hardware: **Free CPU (2 vCPU, 16GB RAM)**.
   - Visibility: **Public**.
   - Click **"Create Space"**.

3. **Sync or Push Repository**:
   Hugging Face provides a Git clone URL. You can push your existing repository directly:
   ```bash
   git remote add hf https://huggingface.co/spaces/<YOUR-USERNAME>/supportnova
   git push -u hf main
   ```
   *(Or link it via the GitHub Actions integration if preferred).*

4. **Add Secret (Variables)**:
   - In your Space, go to **Settings** ➜ **Variables and secrets**.
   - Under **Secrets**, click **New secret**:
     - Name: `GEMINI_API_KEY`
     - Value: *your Google Gemini API key*

5. **Live Space**:
   - Hugging Face automatically detects `Dockerfile`, runs on port `7860`, and makes your full-stack app live at:
     `https://<your-username>-supportnova.hf.space`

---

## ⚡ Option 3: Instant Live URL in 10 Seconds (Pinggy / LocalTunnel)

If you need a public URL **right now** for a demo, testing, or review without waiting for cloud builds:

1. Start SupportNova locally:
   ```cmd
   start.bat
   ```
2. Open a new terminal and run:
   ```bash
   npx pinggy -p 5173
   ```
   or
   ```bash
   npx localtunnel --port 5173
   ```
3. You will immediately get a live public `https://...` link that anyone in the world can open on their phone or laptop.

---

## 🛡️ Default Demo Logins
- **System Admin**: `admin@supportnova.io` / `Admin123!`
- **Support Manager**: `manager@supportnova.io` / `Manager123!`
- **Reviewer / QA**: `reviewer@supportnova.io` / `Reviewer123!`
- **Support Agent**: `agent@supportnova.io` / `Agent123!`
- **Customer**: `customer@supportnova.io` / `Customer123!`
