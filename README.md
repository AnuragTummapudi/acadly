# ACADLY — Faculty Engagement Portal

A full-stack web application built for **SRM University AP** to drive faculty engagement through recommendations, queries, gamification, and AI-powered insights.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?logo=drizzle&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?logo=tailwindcss&logoColor=white)

---

## Features

### Core Modules

| Module | Description |
|--------|-------------|
| **Recommendations** | Faculty share resources — courses, tools, restaurants, schools, workshops, and more |
| **Queries** | Raise queries to HODs/Deans with status tracking (Open → In Progress → Resolved) |
| **Leaderboard** | Gamified points system with top faculty rankings |
| **Faculty Calendar** | Personal event management with image uploads and reminders |
| **Academic Calendar** | University-wide events managed by Super Admins |
| **AI Insights** | Gemini-powered analytics for Deans and Super Admins |
| **Notifications** | Real-time notification system with read/unread tracking |

### Gamification (Points System)

| Action | Points |
|--------|--------|
| Create a recommendation | +5 |
| Post a comment | +3 |
| Raise a query | +3 |
| Upvote a recommendation | +1 |

### Role-Based Access

| Role | Access |
|------|--------|
| **Faculty** | Recommendations, Queries, Calendar, Leaderboard |
| **HOD** | All Faculty access + Respond to queries |
| **Dean** | All HOD access + AI Insights |
| **Super Admin** | Full access + Academic Calendar management |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS |
| Backend | Express.js, TypeScript |
| Database | PostgreSQL (NeonDB) |
| ORM | Drizzle ORM |
| Auth | Session-based (express-session + HTTP-only cookies) |
| AI | Google Gemini API |
| Validation | Zod (shared schemas) |
| State | TanStack React Query |

---

## Project Structure

```
Acadly-new/
├── client/                  # Frontend (React + Vite)
│   ├── components/          # Layout, NotificationDropdown
│   ├── pages/               # All page components
│   ├── providers/           # AuthProvider
│   ├── lib/                 # API helpers
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
├── server/                  # Backend (Express)
│   ├── index.ts             # Express server setup
│   ├── routes.ts            # All API routes
│   ├── db.ts                # Drizzle database connection
│   ├── seed.ts              # Profile seeding script
│   └── seed-data.ts         # Showcase data seeding
├── shared/                  # Shared code
│   └── schema.ts            # Drizzle schema (10 tables)
├── public/                  # Static assets
│   ├── srmap-logo.png       # University logo
│   └── srmap.jpg            # Campus image
├── vite.config.ts
├── tailwind.config.ts
├── drizzle.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or [NeonDB](https://neon.tech) account)

### 1. Clone & Install

```bash
git clone https://github.com/AnuragTummapudi/acadly.git
cd acadly
npm install
```

### 2. Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
SESSION_SECRET=your-session-secret
GEMINI_API_KEY=your-gemini-api-key  # Optional, for AI Insights
```

### 3. Push Database Schema

```bash
npm run db:push
```

### 4. Seed Data

```bash
# Seed user profiles
npx tsx server/seed.ts

# Seed showcase data (recommendations, queries, events, etc.)
npx tsx server/seed-data.ts
```

### 5. Run Development Servers

```bash
npm run dev
```

This starts both the backend (port 3000) and frontend (port 5173) concurrently.

Open **http://localhost:5173** in your browser.

---

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@srmap.edu.in` | `admin@123` |
| Dean | `dean.engineering@srmap.edu.in` | `dean@123` |
| HOD | `hod.cse@srmap.edu.in` | `murali@123` |
| Faculty | `aditya.sharma@srmap.edu.in` | `faculty@789` |

---

## Database Schema

10 tables managed via Drizzle ORM:

- `profiles` — User accounts with roles and points
- `recommendations` — Shared resources and suggestions
- `recommendation_comments` — Comments on recommendations
- `recommendation_upvotes` — Upvote tracking
- `queries` — Faculty queries with status workflow
- `faculty_calendars` — Calendar image uploads
- `faculty_events` — Personal events with reminders
- `academic_events` — University-wide events
- `notifications` — In-app notification system

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run build` | Build for production |
| `npm run db:push` | Push schema to database |

---

## License

This project is built for **SRM University AP, Amaravati**.
