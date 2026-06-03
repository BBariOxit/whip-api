# 🚀 Whip API

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🎯 Introduction
Whip API is the backend engine powering the Whip App. It handles all complex business logic, database operations, robust authentication, and real-time connectivity to provide a seamless experience for the frontend application.

## 🛠 Tech Stack
The backend is engineered using industry-standard technologies:
- **Core:** Node.js & Express.js
- **Database:** MongoDB (Native Driver for optimized querying)
- **Authentication:** JWT (JSON Web Token) & bcryptjs for robust security.
- **File Storage:** Cloudinary & Multer (for lightweight and efficient file uploads).
- **Real-time:** Socket.io (for instant real-time data synchronization).
- **Transpiler:** Babel (for writing modern ES6+ Javascript).

## 🔥 Key Features
Core capabilities of the API include:
- 🔐 **Secure Authentication & Authorization:** Comprehensive token-based security (Access/Refresh Tokens).
- ⚡ **RESTful Architecture:** Fast, reliable, and standardized API endpoints.
- 📡 **WebSocket Support:** Integrated Socket.io for responsive real-time features.
- ☁️ **Cloud Storage Integration:** Direct file upload and management via Cloudinary.

## 🚀 Getting Started
Follow these steps to get the development environment running locally:

```bash
# 1. Clone the repository
git clone <repo-url>

# 2. Navigate to the backend directory
cd whip-api

# 3. Install dependencies
npm install

# 4. Start the development server (with hot-reload via nodemon)
npm run dev
```

## ⚙️ Environment Variables
Properly configuring environment variables is required for the application to function correctly. 
Create a `.env` file in the root directory based on `.env.example` and fill in the necessary details:

```env
MONGODB_URI='<your-mongodb-connection-string>'
DATABASE_NAME='<your-database-name>'
LOCAL_DEV_APP_HOST='localhost'
LOCAL_DEV_APP_PORT=8017

# JWT Configuration
ACCESS_TOKEN_SECRET_SIGNATURE='<your-secret-key>'
ACCESS_TOKEN_LIFE='14d'
REFRESH_TOKEN_SECRET_SIGNATURE='<your-refresh-secret-key>'
REFRESH_TOKEN_LIFE='30d'

# Cloudinary (For image uploads)
CLOUDINARY_CLOUD_NAME='<your-cloud-name>'
CLOUDINARY_API_KEY='<your-api-key>'
CLOUDINARY_API_SECRET='<your-api-secret>'
```

*(Refer to the `.env.example` file in the repository for additional configuration keys).*

## 🤝 Contributing & License
- **Contributing:** This is an open-source project, and Pull Requests (PRs) or bug reports are highly appreciated. Please ensure your changes are thoroughly tested locally before submitting a PR.
- **License:** Distributed under the MIT License. You are free to use and modify this project.
