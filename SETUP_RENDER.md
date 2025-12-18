# 🚀 Timesheet App Deployment Guide

This document provides step-by-step instructions for deploying the **refactored Timesheet Application** (React + Node.js + PostgreSQL) to [Render.com](https://render.com).

The application is configured to use **Render Blueprints** (`render.yaml`), which automates the setup of the web server and the database.

---

## ✅ 1. Push Code to GitHub

Before deploying, your code must be on GitHub.

1.  Open your terminal in the project folder.
2.  Initialize and push (if you haven't already linked a repo):

    ```bash
    # 1. Initialize Git
    git init
    git branch -M main

    # 2. Add all files
    git add .

    # 3. Commit changes
    git commit -m "Refactor: Unified React+Node+Postgres stack for Render"

    # 4. Link to your GitHub Repository
    # Replace the URL below with your actual repository URL
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

    # 5. Push code
    git push -u origin main
    ```

---

## 🔹 2. Deployment on Render (Recommended DB Auto-Creation)

This method uses the `render.yaml` file to automatically create the database and link it to the app.

1.  Sign up/Log in to [dashboard.render.com](https://dashboard.render.com).
2.  Click the **New +** button in the top right.
3.  Select **Blueprint Instance**.
4.  Connect your GitHub account and select your **Timesheet Repository**.
5.  **Service Name**: You might be asked to confirm the service name (e.g., `timesheet-app`).
6.  **Click Apply**.

Render will now:
1.  Provision a **Free PostgreSQL Database**.
2.  Build the **React Frontend** (Vite).
3.  Start the **Node.js Backend**.
4.  Inject the `DATABASE_URL` automatically.

---

## 🔹 3. Manual Deployment (Alternative)

If you prefer to set up services manually:

### Step A: Create Database
1.  Click **New +** -> **PostgreSQL**.
2.  Name: `timesheet-db`.
3.  Copy the **Internal Database URL** once created.

### Step B: Create Web Service
1.  Click **New +** -> **Web Service**.
2.  Connect your repo.
3.  **Build Command**: `npm run build`
4.  **Start Command**: `npm start`
5.  **Environment Variables**:
    *   Key: `DATABASE_URL`
    *   Value: Paste the Internal Database URL from Step A.

---

## 🛠 Verification & Troubleshooting

### How to check if it worked?
1.  Wait for the deployment to finish (green checkmark).
2.  Click the URL provided by Render (e.g., `https://timesheet-app-xyz.onrender.com`).
3.  You should see the **Login Page**.

### Common Issues
*   **White Screen / 404**: Check the Render logs. Ensure `npm run build` completed successfully and `dist/index.html` was generated.
*   **Database Error**: Upon first launch, the app will log `✅ Database schema synchronized` or an error. If you see connection errors, ensure the `DATABASE_URL` is correct.

---

## 🔑 Default Admin Credentials

Once the database is created, the system generates a default admin account:

*   **Username**: `admin@pristonix`
*   **Password**: `!pristonixadmin@2025`
*   **Role**: Admin

*Login with these credentials to start adding employees.*
