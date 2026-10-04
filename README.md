<div align="center">

# VELVETROW

*A premium movie ticket booking experience*

![Last Commit](https://img.shields.io/badge/last%20commit-today-brightgreen)
![JavaScript](https://img.shields.io/badge/javascript-98.8%25-yellow)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat&logo=node.js&logoColor=white)

**Built with the tools and technologies:**

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Clerk](https://img.shields.io/badge/Clerk-6C47FF?style=for-the-badge&logo=clerk&logoColor=white)
![Razorpay](https://img.shields.io/badge/Razorpay-0C8CE9?style=for-the-badge&logo=razorpay&logoColor=white)
![Inngest](https://img.shields.io/badge/Inngest-000000?style=for-the-badge&logo=inngest&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

<br />

## 🎦 LIVE DEMO 🌐

**Website** 👉 [velvetrow.vercel.app](https://velvetrow.vercel.app)

**Admin Dashboard** 👉 [velvetrow.vercel.app/admin](https://velvetrow.vercel.app/admin)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
- [Project Structure](#project-structure)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 📖 Overview

**VelvetRow** is a full-stack movie ticket booking application built with the MERN stack. It provides users with a seamless experience to discover movies, book tickets with interactive seat selection, and manage bookings securely with Razorpay payment integration.

### Key Highlights

- 🎬 **Movie Discovery** - Browse and explore movie catalogs
- 🎟️ **Ticket Booking** - Interactive seat selection with real-time availability
- 💳 **Secure Payments** - Razorpay payment integration (Indian market)
- 🔐 **User Authentication** - Clerk-powered authentication with social login
- 👨‍💼 **Admin Dashboard** - Comprehensive admin panel for management
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development
- 📱 **Responsive Design** - Mobile-first approach with Tailwind CSS

---

## ✨ Features

### 👤 User Features

| Feature | Description |
|:---|:---|
| **Authentication** | Sign up/login via email, Google, or phone (Clerk) |
| **Movie Browsing** | Browse movies with detailed information |
| **Movie Details** | View cast, synopsis, ratings, and trailers |
| **Seat Selection** | Interactive seat map with real-time availability |
| **Booking Management** | View and manage all your bookings |
| **Favorites** | Save favorite movies for quick access |
| **Payment Processing** | Secure checkout with Razorpay |

### 👑 Admin Features

| Feature | Description |
|:---|:---|
| **Dashboard** | View total bookings, revenue, active shows, and users |
| **Add Shows** | Add new movie shows with date, time, and price |
| **Show Management** | View and manage all active shows |
| **Booking Overview** | Monitor all user bookings |

### ⚙️ Smart Automation

| Feature | Description |
|:---|:---|
| **10-Minute Seat Reservation** | Seats are temporarily reserved during payment |
| **Automatic Seat Release** | Unpaid bookings automatically release seats |
| **Background Processing** | Powered by Inngest for scheduling and background tasks |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|:---|:---|
| React.js 18 | UI framework |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router DOM | Routing |
| Clerk | Authentication UI |
| Axios | HTTP requests |
| React Hot Toast | Notifications |
| Lucide React | Icons |

### Backend

| Technology | Purpose |
|:---|:---|
| Node.js | Runtime environment |
| Express.js | Web framework |
| MongoDB Atlas | Database |
| Mongoose | ODM |
| Clerk | Authentication middleware |
| Razorpay | Payment processing |
| Inngest | Background jobs |
| Nodemailer | Email sending |
| Axios | HTTP requests |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- Clerk account
- Razorpay account
- Inngest account (optional, for background jobs)

### Environment Variables

Create `.env` files in both `client` and `server` directories:

#### Client (`client/.env`)

```bash
env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx

# Backend API URL
VITE_BASE_URL=http://localhost:3000

# Currency Symbol
VITE_CURRENCY=₹

# TMDB Image Base URL
VITE_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p/original
```

#### Server (server/.env)
```bash
env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/velvetrow

# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxxx

# TMDB API
TMDB_API_KEY=eyJxxxxxxxxxxxxxxxxxx

# Razorpay
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxx

# Inngest (Optional)
INNGEST_EVENT_KEY=evt_xxxxxxxxxx
INNGEST_SIGNING_KEY=sig_xxxxxxxxxx

# Email Notifications (Optional)
SENDER_EMAIL=your-email@example.com
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

## Configuration & Admin Guidelines

### Security Notice
* **Razorpay Checkout** uses the key ID returned by the backend order endpoint. **Do not** expose or configure the Razorpay key secret in the client.
* `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` must be a matching pair from the same Razorpay account and mode.
* `RAZORPAY_WEBHOOK_SECRET` is a separate secret generated in the Razorpay webhook settings.

### Theater Tickets and Check-In
* **Adding & Updating Shows:** Admins enter the theater name and address when adding a show, or update an existing show from **Admin → List Shows**. An optional HTTP(S) map link is displayed with paid tickets.
* **Ticketing:** Each paid seat receives its own QR ticket. Pending bookings do not receive usable tickets.
* **Check-In Validation:** Tickets can be checked in from **Admin → Scan Tickets** once per seat. Scanning is active starting one hour before showtime through the scheduled end of the movie (showtime plus movie runtime).


### Installation

#### Clone the repository

```bash
git clone https://github.com/nihalmohammad705-debug/velvetrow.git
cd velvetrow
```

#### Install server dependencies

```bash
cd server
npm install
```

#### Install client dependencies

```bash
cd ../client
npm install
```

### Running the Application

#### Start the backend server

```bash
cd ../server
npm run server
```

#### Start the frontend development server

```bash
cd ../client
npm run dev
```

#### Access the application

* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:3000`
* **Admin Panel:** `http://localhost:5173/admin`

#### Make yourself an admin

In **Clerk Dashboard** → **Users** → **Your User** → **Private Metadata** → Add:

```json
{ 
  "role": "admin" 
}
```


## Authentication & Authorization

### User Sign-In
* **Authentication Provider:** Sign in to the application using your configured **Clerk user account**.

### Admin Access & API Security
* **Role-Based Access Control (RBAC):** Admin API routes strictly allow users whose Clerk **private** or **public metadata** contains `"role": "admin"`.
* **Unauthorized Access:** Requests to admin endpoints will be rejected if this metadata field is missing or incorrect.


## 📁 Project Structure
```text
velvetrow/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── assets/                  # Images and static assets
│   │   ├── components/              # Reusable UI components
│   │   │   ├── admin/               # Admin components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── MovieCard.jsx
│   │   │   ├── Logo.jsx
│   │   │   └── ...
│   │   ├── pages/                   # Page components
│   │   │   ├── admin/               # Admin pages
│   │   │   ├── Home.jsx
│   │   │   ├── Movies.jsx
│   │   │   ├── MovieDetails.jsx
│   │   │   ├── SeatLayout.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   └── Favorite.jsx
│   │   ├── context/                 # React Context providers
│   │   ├── lib/                     # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/                      # Public assets
│   ├── .env.example                 # Environment variables template
│   └── package.json
│
├── server/                          # Backend Node.js application
│   ├── config/                      # Configuration files
│   ├── controllers/                 # Route controllers
│   ├── models/                      # MongoDB models
│   ├── routes/                      # API routes
│   ├── middleware/                  # Custom middleware
│   ├── inngest/                     # Background job handlers
│   ├── server.js                    # Main entry point
│   ├── .env.example                 # Environment variables template
│   └── package.json
│
├── api/                             # Vercel serverless functions
│   └── index.js
│
├── vercel.json                      # Vercel deployment configuration
├── .gitignore
└── README.md
```

## 📡 API Documentation

### Movie & Show Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/show/all` | Get all shows |
| `GET` | `/api/show/:movieId` | Get show details |
| `POST` | `/api/show/add` | Add new show (Admin) |
| `GET` | `/api/show/now-playing` | Get now playing movies (Admin) |

#### Booking Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/booking/create` | Create new booking |
| `POST` | `/api/booking/verify-payment` | Verify payment |
| `GET` | `/api/booking/seats/:showId` | Get occupied seats |

### Admin Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/admin/is-admin` | Check if user is admin |
| `GET` | `/api/admin/dashboard` | Get dashboard data |
| `GET` | `/api/admin/all-shows` | Get all shows |
| `GET` | `/api/admin/all-bookings` | Get all bookings |

### User Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/user/bookings` | Get user bookings |
| `POST` | `/api/user/update-favorite` | Update favorite movies |
| `GET` | `/api/user/favorites` | Get favorite movies |

## 🚀 Deployment

### Push your code to GitHub

```bash
git add .
git commit -m "Deploy to Vercel"
git push
```

### Deploy to Vercel

1. Import your repository to [Vercel](https://vercel.com).
2. Add your environment variables in **Vercel Dashboard → Settings → Environment Variables**.
3. Deploy the application.


### Environment Variables on Vercel

| Variable | Value |
| :--- | :--- |
| `MONGODB_URI` | MongoDB connection string |
| `CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `TMDB_API_KEY` | TMDB API key |
| `RAZORPAY_KEY_ID` | Razorpay key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook secret |
| `INNGEST_EVENT_KEY` | Inngest event key |
| `INNGEST_SIGNING_KEY` | Inngest signing key |

## 🧪 Testing

### Test Payment
Use the following Razorpay credentials to execute test transactions:

* **Card Number:** `4111 1111 1111 1111`
* **Expiry:** Any future date (e.g., `12/30`)
* **CVV:** Any 3 digits (e.g., `123`)
* **OTP:** `1234`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/amazing-feature
   ```
5. Open a Pull Request

## 📄 License

This project is for educational purposes only. Built as a learning project.