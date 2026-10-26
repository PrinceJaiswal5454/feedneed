# 🌱 FeedNeed — Full-Stack MERN Social Food-Sharing & NGO Platform

**FeedNeed** is a complete, responsive, beginner-friendly **MERN Stack** (`MongoDB`, `Express.js`, `React`, `Node.js`) web application that connects households and events with surplus food to neighbors in need, and connects verified NGOs with volunteers and donors.

---

## ✨ Key Features

1. **Three Account Roles (`individual`, `ngo`, `admin`)**:
   - **Individual Users**: Share surplus food with photos and safety timestamps, edit/delete posts, browse nearby donations, request food, and mark handovers as completed.
   - **NGO Accounts**: Create verified-style organization profiles, launch donation drives with itemized food/supply checklists, describe beneficiary needs, set schedules, and recruit/verify volunteers.
   - **Admins**: Verify or reject NGO registrations, review community food-safety/moderation reports, suspend abusive accounts, and flag inappropriate listings.
2. **Privacy & Contact Protection**:
   - User phone numbers and exact pickup/drop-off addresses are **protected by default** (`backend/utils/privacyHelper.js`).
   - Exact addresses and phone numbers are only unlocked when the owner explicitly consents or accepts a pickup/volunteer request. Passwords are hashed with `bcryptjs` and never returned in API responses (`select: false`).
3. **Food Safety Compliance & Disclaimers**:
   - Every food listing requires preparation time, safe-consumption expiry deadline, storage condition, vegetarian/non-vegetarian classification, and a mandatory food-safety declaration checklist.
   - Server-side validation blocks expired food from being posted.
4. **Non-Duplicate Impact Rewards, Badges & Leaderboard**:
   - **+15 Points**: Creating a valid surplus food post
   - **+40 Points**: Completing a verified food donation handover
   - **+50 Points**: Completing a verified NGO volunteer shift
   - **+35 Points**: Supporting an NGO campaign with food/supplies
   - Uses a compound unique index on `RewardTransaction` (`{ user: 1, actionType: 1, referenceId: 1 }`) to strictly prevent duplicate rewards for the same completed activity.

---

## 📁 Clean Project Folder Structure

```text
feedneed/
├── package.json                 # Root helper scripts
├── README.md                    # Complete setup & API documentation
├── backend/                     # Node.js + Express.js + Mongoose REST API
│   ├── package.json
│   ├── .env.example             # Environment variable template (no hardcoded secrets)
│   ├── server.js                # Express app entry point
│   ├── config/
│   │   └── db.js                # MongoDB Mongoose connection
│   ├── models/                  # 8 Mongoose schemas
│   │   ├── User.js
│   │   ├── FoodPost.js
│   │   ├── DonationRequest.js
│   │   ├── NGOCampaign.js
│   │   ├── VolunteerApplication.js
│   │   ├── RewardTransaction.js
│   │   ├── Notification.js
│   │   └── Report.js
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT verification & Role-Based Access Control
│   │   ├── uploadMiddleware.js  # Safe Multer image upload filter (JPG/PNG/WEBP, 5MB max)
│   │   └── errorMiddleware.js   # Centralized Express error handling
│   ├── utils/
│   │   ├── rewardHelper.js      # Idempotent points, levels & badge engine
│   │   └── privacyHelper.js     # Masks phone numbers & exact addresses until consent
│   ├── controllers/             # Modular route controllers
│   ├── routes/                  # Express REST API routers
│   └── seed/
│       └── seedData.js          # Clean database reset utility (0 demo accounts)
└── frontend/                    # React + Plain JS + Plain CSS + React Router (Vite)
    ├── package.json
    ├── .env.example
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api/apiClient.js
        ├── context/AuthContext.jsx
        ├── components/          # Navbar, Footer, FoodCard, SafetyBanner
        ├── pages/               # All 12 responsive pages
        └── styles/global.css    # Green, Cream & Orange responsive CSS design system
```

---

## 🚀 Beginner-Friendly Local Setup Instructions

### Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB**: Either **MongoDB Community Server** running locally on port `27017` OR a free **MongoDB Atlas** cloud cluster URI.

### Step 1: Configure Backend Environment Variables
```bash
cd backend
cp .env.example .env
```
Open `backend/.env` and set your `MONGO_URI` and a strong random `JWT_SECRET`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/feedneed
JWT_SECRET=your_super_secret_random_jwt_key_here_at_least_32_characters
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

### Step 2: Install Dependencies
```bash
# Install backend packages
cd backend
npm install
```

### Step 3: Start the Backend & Frontend Servers
Open two terminal windows:

**Terminal 1 (Backend API on `http://localhost:5000`):**
```bash
cd backend
npm run dev
```

**Terminal 2 (React Frontend on `http://localhost:5173`):**
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Once running, visit `http://localhost:5173/register` to create your own **Individual**, **NGO**, or **Admin** account.

---

## 📡 REST API Documentation

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register an `individual`, `ngo`, or `admin` account (hashes password with bcrypt) |
| `POST` | `/api/auth/login` | Public | Authenticate user and return signed JWT token |
| `GET` | `/api/auth/me` | Private | Get current user profile and recent reward transactions |
| `PUT` | `/api/auth/profile` | Private | Update profile, NGO details, and contact privacy preferences |
| `GET` | `/api/food` | Public/OptAuth | List food posts with search, category, dietary, status & city filters |
| `GET` | `/api/food/:id` | Public/OptAuth | Get single food post (masks exact address/phone unless authorized) |
| `POST` | `/api/food` | Private | Create food post (+15 points awarded idempotently) |
| `PUT` | `/api/food/:id` | Private (Owner/Admin) | Edit food post details or status |
| `DELETE` | `/api/food/:id` | Private (Owner/Admin) | Delete food post and pending requests |
| `POST` | `/api/requests` | Private | Request pickup for an available food post (notifies donor) |
| `GET` | `/api/requests/my` | Private | Get incoming requests (as donor) and outgoing requests (as requester) |
| `PUT` | `/api/requests/:id/status` | Private (Donor) | Accept or decline request (Accepting unlocks protected address & phone) |
| `PUT` | `/api/requests/:id/complete` | Private | Mark donation completed (+40 points to donor, prevents duplicates) |
| `GET` | `/api/campaigns` | Public/OptAuth | Browse NGO campaigns with search and city filters |
| `GET` | `/api/campaigns/:id` | Public/OptAuth | Get NGO campaign details, required items checklist & pledges |
| `POST` | `/api/campaigns` | Private (`ngo`/`admin`) | Publish a new NGO donation drive |
| `POST` | `/api/campaigns/:id/pledge` | Private | Pledge food/supplies to an NGO campaign (+35 points) |
| `POST` | `/api/volunteers/apply` | Private | Apply as a volunteer for an NGO campaign |
| `GET` | `/api/volunteers/my` | Private | Get volunteer applications (individual view + NGO coordinator view) |
| `PUT` | `/api/volunteers/:id/status` | Private (`ngo`/`admin`) | Accept volunteer or verify completed hours (+50 points) |
| `GET` | `/api/rewards/leaderboard` | Public | Live MongoDB aggregate impact stats, leaderboard, levels & badges |
| `GET` | `/api/notifications` | Private | Fetch user notifications and unread count |
| `PUT` | `/api/notifications/read` | Private | Mark notifications as read |
| `POST` | `/api/admin/reports` | Private | Report unsafe/expired food or policy violations |
| `GET` | `/api/admin/overview` | Private (`admin`) | Admin overview of all users, pending NGOs, reports & posts |
| `PUT` | `/api/admin/ngos/:id/verify` | Private (`admin`) | Approve (`verified`) or reject NGO verification status |
| `PUT` | `/api/admin/users/:id/suspend` | Private (`admin`) | Suspend or reinstate a user account |
| `PUT` | `/api/admin/reports/:id` | Private (`admin`) | Resolve or dismiss a report and optionally flag the target post |
