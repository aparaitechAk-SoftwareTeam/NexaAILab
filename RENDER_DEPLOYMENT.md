# Deploying NexaAI Lab Backend to Render (render.com)

This repository is pre-configured with a Render Blueprint (`render.yaml`) and optimized Node.js server settings for seamless deployment on Render.

---

## Method 1: Automatic 1-Click Blueprint (Recommended)

1. Log in to your **[Render Dashboard](https://dashboard.render.com/)**.
2. Click **New +** (top right) and select **Blueprint**.
3. Connect your GitHub repository:
   - **Repository**: `aparaitechAk-SoftwareTeam/NexaAILab`
   - **Branch**: `main`
4. Render will automatically read `render.yaml` and configure:
   - **Service Name**: `nexaai-lab-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
   - **Environment Variables**: Pre-filled with MongoDB Atlas connection string, JWT secrets, and CORS origins.
5. Click **Apply**.
6. Render will build and deploy your backend in ~1–2 minutes!

---

## Method 2: Manual Web Service Setup on Render

If you prefer to configure it manually:

1. In Render Dashboard, click **New +** ➔ **Web Service**.
2. Select your GitHub repository: `aparaitechAk-SoftwareTeam/NexaAILab`.
3. Configure the settings:
   - **Name**: `nexaai-lab-backend`
   - **Region**: `Singapore` (or `Frankfurt` / `Oregon`)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. Under **Advanced** ➔ **Health Check Path**: enter `/api/health`.
5. Under **Environment Variables**, add:
   | Key | Value |
   | :--- | :--- |
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | `mongodb://mailblast:Aparaitech2129@ac-rl6rdwo-shard-00-00.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-01.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-02.kmi9oku.mongodb.net:27017/nexaailab?ssl=true&replicaSet=atlas-3ebffw-shard-0&authSource=admin&appName=Cluster0` |
   | `MONGO_URI` | `mongodb://mailblast:Aparaitech2129@ac-rl6rdwo-shard-00-00.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-01.kmi9oku.mongodb.net:27017,ac-rl6rdwo-shard-00-02.kmi9oku.mongodb.net:27017/nexaailab?ssl=true&replicaSet=atlas-3ebffw-shard-0&authSource=admin&appName=Cluster0` |
   | `JWT_SECRET` | `analytixlabs_super_secure_jwt_secret_2026` |
   | `ADMIN_EMAIL` | `admin@example.com` |
   | `ADMIN_PASSWORD` | `Admin@123` |
   | `CLIENT_URL` | `https://nexaai.aparaitech.org` |
   | `ADMIN_URL` | `https://nexaai.aparaitech.org` |
6. Click **Create Web Service**.

---

## Connecting Frontend to Your Live Render Backend

Once Render finishes deploying, your live backend URL will be displayed at the top of your Render service page (e.g., `https://nexaai-lab-backend.onrender.com`).

To point your frontend to this live backend:
1. Update `frontend/.env`:
   ```env
   VITE_API_URL=https://nexaai-lab-backend.onrender.com/api
   ```
2. Commit and push:
   ```bash
   git add frontend/.env
   git commit -m "chore: connect frontend to live render backend"
   git push origin main
   ```
