# 💡 SochX — Where Ideas Go Live

> An interactive, scalable innovation platform designed to discover, validate, and launch student innovations and youth startup ideas into real-world projects.

---

## 📌 Overview

**SochX** is a full-stack ecosystem where innovators submit ideas, gather community feedback, receive dynamic upvotes, and track execution. The platform is engineered from scratch with a strong focus on high performance, relational data integrity, and role-based moderation.

---

## 🛠️ Tech Stack

- **Frontend:** React.js (Pure Vanilla CSS — zero UI frameworks, strictly no Tailwind CSS)
- **Backend:** Node.js & Express.js (RESTful API Engine)
- **Database:** MySQL (Managed via XAMPP Server)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt.js password hashing
- **HTTP Client:** Axios (Interceptors configured for Bearer token injection and global error handling)

---

## 🌟 Key Features

- **Public Innovation Feed:** Real-time search, category filtering (`Technology`, `Social`, `Sustainability`, etc.), and popularity ranking algorithms.
- **Author-Only Context Controls:** Custom three-dots dropdown menu rendered exclusively for the idea's original author, enabling in-place editing modals and deletion.
- **Transactional Upvoting:** Concurrency-safe voting engine utilizing composite unique keys (`UNIQUE KEY (ideaId, userId)`) to enforce strictly one verified vote per user.
- **Authoritative Admin Control Center:** Dedicated administrative suite to review submitted ideas, toggle workflow states (`Pending` ➔ `Approved` ➔ `Inactive`), and monitor platform-wide telemetry.
- **Role-Based Security:** Protected route wrappers for authenticated users and system administrators.

---

## 📊 System Architecture & Data Flow

```text
[ Client / Browser ]
       │
       ▼  (React.js + Pure Vanilla CSS)
[ Auth & Session Handlers ]
       ├── Register / Login ───────► JWT Storage & AuthContext
       ├── Submit Innovation Idea ─► Initial Status: PENDING
       └── Interactive Upvote ─────► Debounced Toggle API Call
       │
       ▼
[ Node.js + Express REST API ]
       ├── CORS & Request Interceptor
       ├── JWT Verification Middleware
       └── Role & Ownership Authorization Guard
       │
       ▼
[ Relational MySQL Engine (XAMPP) ]
       ├── `users` (Hashed Passwords, Role, Badges)
       ├── `ideas` (Title, Problem, Solution, Status)
       └── `idea_upvotes` (Composite Unique Key: ideaId + userId)
       │
       ▼
[ Moderation & Display Layer ]
       ├── Admin Panel: Review ➔ Approve / Mark Inactive / Delete
       └── Public Feed: Displays 'APPROVED' Ideas Only
