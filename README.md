# 🚀 Whip API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=white&labelColor=333333) ![Express](https://img.shields.io/badge/Express-4.18-000000?logo=express&logoColor=white&labelColor=333333) ![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white&labelColor=333333) ![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white&labelColor=333333) ![Cloudinary](https://img.shields.io/badge/Media-Cloudinary-3448C5?logo=cloudinary&logoColor=white&labelColor=333333) ![Socket.io](https://img.shields.io/badge/Realtime-Socket.io-010101?logo=socket.io&logoColor=white&labelColor=333333)

## 🎯 Introduction
Whip API is the backend engine powering the **Whip App** frontend (separate repository). It handles all business logic, database operations, authentication & authorization, transactional email, media storage, and real-time connectivity to deliver a seamless collaborative experience.

## 🛠 Tech Stack
- **Core:** Node.js 20 & Express.js
- **Database:** MongoDB 7 (native driver) with compound & TTL indexes
- **Auth:** JWT (access/refresh tokens) & bcryptjs; Google OAuth token verification
- **Validation:** Joi (schema validation at every write)
- **File Storage:** Cloudinary & Multer (avatars, covers, attachments, logos)
- **Email:** Brevo (transactional emails for invites & notifications)
- **Real-time:** Socket.io (per-user & per-card rooms)
- **Transpiler:** Babel (modern ES6+ JavaScript)

## 🔥 Key Features & Modules
- 🔐 **Auth & RBAC:** JWT access/refresh flow, workspace roles (Owner / Admin / Member) and a dynamic board-level access-control middleware.
- 🏢 **Workspaces:** members, email invitations, role management, ownership transfer, leave/delete with cascading cleanup.
- 📋 **Boards / Columns / Cards:** full CRUD, drag-and-drop ordering, templates, archiving, and visibility (private / public / workspace-visible).
- 💬 **Comments & @Mentions:** threaded comments with server-side mention parsing that triggers notifications.
- 🔔 **Notifications:** in-app (real-time via Socket.io) **and** email, per-user preferences, with automatic cleanup via a TTL index.
- 📨 **Invitations:** board & workspace invites delivered through Brevo email.
- 🔎 **Search & Sort:** board title search (regex-escaped, safe) and sorting scoped to the boards a user can actually access.
- ☁️ **Media:** direct Cloudinary uploads and management.

## 🚀 Getting Started
Follow these steps to get the development environment running locally:

```bash
# 1. Clone the repository
git clone <repo-url>

# 2. Navigate to the backend directory
cd whip-api

# 3. Install dependencies
npm install

# 4. Start the development server (hot-reload via nodemon)
npm run dev
```

## ⚙️ Environment Variables
Create a `.env` file in the root directory based on `.env.example` and fill in your values:

```env
# Database
MONGODB_URI='<your-mongodb-connection-string>'
DATABASE_NAME='<your-database-name>'

# Server & domains
LOCAL_DEV_APP_HOST='localhost'
LOCAL_DEV_APP_PORT=8017
AUTHOR='<your-name>'
WEBSITE_DOMAIN_DEVELOPMENT='http://localhost:5173'
WEBSITE_DOMAIN_PRODUCTION='<your-production-frontend-url>'

# JWT Authentication
ACCESS_TOKEN_SECRET_SIGNATURE='<your-secret-key>'
ACCESS_TOKEN_LIFE='1h'
REFRESH_TOKEN_SECRET_SIGNATURE='<your-refresh-secret-key>'
REFRESH_TOKEN_LIFE='14d'

# Cloudinary (media uploads)
CLOUDINARY_CLOUD_NAME='<your-cloud-name>'
CLOUDINARY_API_KEY='<your-api-key>'
CLOUDINARY_API_SECRET='<your-api-secret>'

# Email (Brevo transactional email)
BREVO_API_KEY='<your-brevo-api-key>'
ADMIN_EMAIL_ADDRESS='<verified-sender-email>'
ADMIN_EMAIL_NAME='<sender-display-name>'

# Google OAuth (token verification)
VITE_GOOGLE_CLIENT_ID='<your-google-oauth-client-id>'

# GitHub OAuth (use separate apps for local and production)
GITHUB_CLIENT_ID_LOCAL='<your-local-client-id>'
GITHUB_CLIENT_SECRET_LOCAL='<your-local-client-secret>'
GITHUB_CLIENT_ID_PRODUCTION='<your-production-client-id>'
GITHUB_CLIENT_SECRET_PRODUCTION='<your-production-client-secret>'
```

Each GitHub OAuth App callback URL must be exactly `<matching-frontend-origin>/login`.

*(See `.env.example` for the full list, including optional GitHub OAuth keys.)*

## 🐳 Deployment
A `Dockerfile` and `docker-compose.yml` are included for containerized deployment. See **`DEPLOYMENT_GUIDE.md`** for step-by-step instructions.

## 🤝 Contributing & License
- **Contributing:** This is an open-source project, and Pull Requests (PRs) or bug reports are highly appreciated. Please ensure your changes are thoroughly tested locally before submitting a PR.
- **License:** Distributed under the MIT License. You are free to use and modify this project.
