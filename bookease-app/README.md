# BookEase — Platform-Based Online Booking System

A full-featured, production-structured React booking platform with dual portals (Admin + Customer), localStorage persistence, JWT-style auth, and a fully responsive UI.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in your browser
http://localhost:5173
```

---

## 🔐 Demo Accounts

| Role          | Email                  | Password   |
|---------------|------------------------|------------|
| Administrator | admin@bookease.com     | admin123   |
| Customer      | maria@email.com        | user123    |
| Customer      | juan@email.com         | user123    |
| Customer      | ana@email.com          | user123    |

---

## 📁 Project Structure

```
bookease-app/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                  # Entry point
    ├── App.jsx                   # Root router (landing / auth / portal)
    │
    ├── styles/
    │   ├── globals.css           # Variables, reset, base typography
    │   └── components.css        # All reusable component styles
    │
    ├── context/
    │   └── AppContext.jsx        # Global state: DB + auth via useReducer
    │
    ├── hooks/
    │   ├── useToast.js           # Toast notification queue
    │   └── useSidebar.js         # Responsive sidebar open/close
    │
    ├── utils/
    │   ├── db.js                 # localStorage DB layer + seed data + reducer
    │   ├── auth.js               # JWT-style token helpers
    │   └── helpers.js            # Formatting, constants, utilities
    │
    ├── components/
    │   ├── ui/                   # Reusable UI primitives
    │   │   ├── Badge.jsx
    │   │   ├── BarChart.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── Modal.jsx
    │   │   ├── ProgressBar.jsx
    │   │   ├── StatCard.jsx
    │   │   ├── Toast.jsx
    │   │   └── Toggle.jsx
    │   │
    │   ├── layout/               # Structural shell components
    │   │   ├── AppLayout.jsx     # Sidebar + main area wrapper
    │   │   ├── Sidebar.jsx       # Reusable sidebar shell
    │   │   └── Topbar.jsx        # Sticky header
    │   │
    │   ├── booking/              # Multi-step booking wizard
    │   │   ├── BookingWizard.jsx # Wizard orchestrator + step indicator
    │   │   ├── ServicePicker.jsx # Step 1 — choose service
    │   │   ├── DateTimePicker.jsx# Step 2 — pick date & time
    │   │   └── BookingConfirm.jsx# Step 3 — review & confirm
    │   │
    │   ├── admin/
    │   │   └── AdminSidebar.jsx  # Admin nav wired to DB (pending badge)
    │   │
    │   └── user/
    │       └── UserSidebar.jsx   # Customer nav
    │
    └── pages/
        ├── Landing.jsx           # Public landing page
        ├── AuthScreen.jsx        # Login + Registration
        ├── AdminPortal.jsx       # Admin shell + page routing
        ├── UserPortal.jsx        # User shell + page routing
        │
        ├── admin/
        │   ├── Dashboard.jsx     # Stats, weekly chart, today schedule
        │   ├── Bookings.jsx      # Full CRUD table + detail modal
        │   ├── Calendar.jsx      # Monthly calendar with day detail
        │   ├── Services.jsx      # Service CRUD with toggle
        │   ├── Customers.jsx     # Customer list + edit modal
        │   ├── Reports.jsx       # KPIs, charts, status distribution
        │   └── Settings.jsx      # Business profile, rules, hours
        │
        └── user/
            ├── Home.jsx          # Overview + quick actions
            ├── MyBookings.jsx    # Bookings with cancel/reschedule
            ├── Services.jsx      # Browse services
            └── Profile.jsx       # View + edit profile + change password
```

---

## 🗄️ Data Persistence

All data is stored in **localStorage** under the key `bookease_db_v3`.  
This means:
- Data survives page refreshes and tab closes
- Sessions are restored automatically (7-day token TTL)
- To reset to seed data, run `localStorage.clear()` in the browser console

---

## ✨ Features

### Admin Portal
- **Dashboard** — live clock, stat cards, weekly bar chart, today's schedule, recent bookings
- **All Bookings** — search, filter by status/service, confirm/complete/cancel, detail modal, CSV export
- **Calendar** — monthly grid with booking dots, clickable day detail panel
- **Services** — add/edit/delete, active toggle, booking count per service
- **Customers** — search, view bookings + spend, edit info + reset password
- **Reports** — revenue KPIs, monthly chart, per-service progress bars, status distribution
- **Settings** — business profile, booking rules, notification toggles, working hours per day

### Customer Portal
- **Home** — greeting, stats (total / upcoming / spent), upcoming list, quick action cards
- **New Booking** — 3-step wizard with real slot availability checking
- **My Bookings** — grouped upcoming/completed/cancelled, reschedule + cancel modals
- **Browse Services** — service cards with Book Now buttons
- **Profile** — view details, edit name/phone, change password with verification

---

## 🛠️ Tech Stack

| Layer      | Technology                                  |
|------------|---------------------------------------------|
| Framework  | React 18 + Vite                             |
| State      | React Context + useReducer                  |
| Database   | localStorage (structured JSON)              |
| Auth       | Base64 JWT-style tokens in localStorage     |
| Styling    | Pure CSS with custom properties (no Tailwind) |
| Fonts      | Instrument Serif + Sora (Google Fonts)      |
