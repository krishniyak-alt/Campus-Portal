# 🎓 Campus Lost & Found Portal

> **Tagline:** *Lost something? Found something? Let's help it find its way back.*

A complete, modern, responsive full-stack web application built for college campuses. Students can report lost belongings, post found items, search directory listings with smart filters, claim lost items securely with proof verification, and track their reports in a personalized dashboard. Administrators have full moderation control over users, reports, claims, and platform analytics.

---

## 🌟 Key Features

### 1. Student Portal
- **User Authentication**: Student registration with Student ID & Department validation, JWT authentication, and secure password hashing via bcrypt.
- **Report Lost Item**: Detailed lost report submission with location, date, time, category, image upload preview, and contact preferences.
- **Report Found Item**: Found report submission specifying safe storage locations (e.g. Security Desk, Library Reception).
- **Browse & Search Directory**: Real-time keyword search, category filtering (ID Card, Electronics, Water Bottle, Notebook, Keys, Bags, Accessories, Clothing), type pills (Lost vs Found), status filter, and pagination.
- **Item Ownership Claim System**: Secure modal-based claim process requiring claimants to state secret identifying details and upload proof receipts/photos.
- **Personalized Student Dashboard**: Overview metrics, tabbed views for "My Reports" and "My Claims", status update controls, and report editing/deletion.

### 2. Administrator Panel
- **Analytics Overview**: Dynamic counters for Total Registered Users, Total Lost Items, Total Found Items, Successfully Returned Belongings, and Pending Claims.
- **Item Moderation**: View all reports across campus, search/filter, delete inappropriate/fake reports, and update status.
- **User Management**: Overview of registered students with ID numbers and departments; ability to remove non-compliant accounts.
- **Claims Oversight**: Review claim statements and proof attachments with one-click approval or rejection.

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, React Router DOM v6, Tailwind CSS v3, Framer Motion, Lucide Icons, Axios, React Hot Toast.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose ORM), JWT (JsonWebToken), bcryptjs, CORS, dotenv, Multer.
- **Cloud Storage**: Cloudinary integration for cloud image hosting with automatic fallback to local disk static file serving.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v16.0 or higher)
- MongoDB (Local MongoDB instance or MongoDB Atlas URI)

### 1. Backend Setup
```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# (Optional) Seed the database with demo users & sample lost/found reports
npm run seed

# Start development server
npm run dev
```
The Express backend server will run on `http://localhost:5000`.

#### Demo Credentials (Populated by `npm run seed`):
- **Admin**: `admin@campus.edu` | Password: `Admin@123`
- **Student 1**: `alex.johnson@student.campus.edu` | Password: `Student@123`
- **Student 2**: `sarah.smith@student.campus.edu` | Password: `Student@123`

### 2. Frontend Setup
```bash
# Navigate to client directory
cd client

# Install dependencies
npm install

# Start Vite frontend server
npm run dev
```
The React frontend web application will run on `http://localhost:5173`.

---

## 📡 REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new student account.
- `POST /api/auth/login` — Authenticate user & return JWT token.
- `GET  /api/auth/me` — Fetch current user profile (Protected).

### Items / Reports (`/api/items`)
- `GET    /api/items` — Get all items with query filters (`?type=lost&category=Electronics&search=wallet&status=active&sort=newest&page=1`).
- `GET    /api/items/:id` — Get detailed information for a single item.
- `GET    /api/items/my-reports` — Fetch reports created by the logged-in user (Protected).
- `POST   /api/items` — Create a lost or found report with photo upload (Protected).
- `PUT    /api/items/:id` — Update report details (Owner / Admin).
- `DELETE /api/items/:id` — Delete report (Owner / Admin).
- `PATCH  /api/items/:id/status` — Update item status (`active`, `claimed`, `resolved`).

### Claim Requests (`/api/claims`)
- `POST  /api/claims` — Submit an ownership claim request with proof (Protected).
- `GET   /api/claims/my-claims` — Get claims submitted by the logged-in user (Protected).
- `GET   /api/claims/item/:itemId` — Get all claims for a specific item (Owner / Admin).
- `PATCH /api/claims/:id` — Approve or reject a claim (Owner / Admin).

### Admin Panel (`/api/admin`)
- `GET    /api/admin/stats` — Aggregate platform statistics.
- `GET    /api/admin/users` — List all registered users.
- `GET    /api/admin/items` — List all items for moderation.
- `GET    /api/admin/claims` — List all claim requests.
- `DELETE /api/admin/items/:id` — Admin forced deletion of report.
- `DELETE /api/admin/users/:id` — Admin removal of user account.

---

## 🌐 Production Deployment Instructions

### 1. MongoDB Atlas Database Setup
1. Create a free account on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Build a Shared Cluster (M0 Free Tier).
3. Under **Database Access**, create a user with read & write permissions.
4. Under **Network Access**, add IP `0.0.0.0/0` (Allows access from deployment platforms).
5. Click **Connect** → **Drivers** and copy your Connection String:
   `mongodb+srv://<username>:<password>@cluster0.mongodb.net/campus_lost_found?retryWrites=true&w=majority`

### 2. Cloudinary Media Storage Setup
1. Register for a free account at [Cloudinary](https://cloudinary.com).
2. From your Dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret
3. Add these keys to your backend environment variables.

### 3. Backend Deployment (Render / Railway)
1. Push your repository to GitHub.
2. Log into [Render](https://render.com) or [Railway](https://railway.app).
3. Create a **New Web Service** and select your GitHub repository.
4. Set Root Directory to `server`.
5. Set Build Command: `npm install`
6. Set Start Command: `node server.js`
7. Add Environment Variables:
   - `PORT` = `5000`
   - `MONGODB_URI` = `your_mongodb_atlas_connection_string`
   - `JWT_SECRET` = `your_super_secret_jwt_key`
   - `CLIENT_URL` = `https://your-frontend-domain.vercel.app`
   - `CLOUDINARY_CLOUD_NAME` = `your_cloud_name`
   - `CLOUDINARY_API_KEY` = `your_api_key`
   - `CLOUDINARY_API_SECRET` = `your_api_secret`
8. Deploy and copy your backend URL (e.g. `https://campus-lost-found-backend.onrender.com`).

### 4. Frontend Deployment (Vercel)
1. Log into [Vercel](https://vercel.com).
2. Click **Add New** → **Project** and import your GitHub repository.
3. Set Framework Preset to **Vite**.
4. Set Root Directory to `client`.
5. Add Environment Variable:
   - `VITE_API_URL` = `https://campus-lost-found-backend.onrender.com/api`
6. Click **Deploy**. Your application will be live at a public URL!
