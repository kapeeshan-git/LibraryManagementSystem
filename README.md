# University Library Management System (ULMS)

**University of Vavuniya | Faculty of Applied Science**  
**Course Module:** IT3162 — Group Project (Group 12)  
**Supervisor:** Ms. Sivasoruby Kanapathipillai  

---

## 🛠️ Technology Stack

- **Frontend:** React 19 + Vite + Tailwind CSS + Lucide Icons + Axios
- **Backend:** Python + Django 6 + Django REST Framework (DRF) + SimpleJWT
- **Database:** MySQL 8.0 / SQLite (configurable via `.env`)
- **Version Control:** Git & GitHub (`https://github.com/kapeeshan-git/LibraryManagementSystem`)

---

## 🚀 Quick Start Guide

### 1. Backend Setup & Run

Open a terminal in the project root:

```bash
# Activate virtual environment
.\.venv\Scripts\Activate.ps1   # (or source .venv/bin/activate on Linux/Mac)

# Navigate to backend
cd backend

# Verify database migrations
python manage.py migrate

# (Optional) Seed sample data (patrons, books, barcodes, departments)
python seed_data.py

# Start Django development server
python manage.py runserver 127.0.0.1:8000
```

The Django REST API will be available at: `http://127.0.0.1:8000/api/`  
The Django Admin interface is at: `http://127.0.0.1:8000/admin/`

---

### 2. Frontend Setup & Run

Open a second terminal window:

```bash
cd frontend

# Install dependencies (already pre-installed)
npm install

# Start Vite dev server
npm run dev
```

Open your browser at: `http://localhost:5173/`

---

## 👥 Default Test Accounts

| Role | Username / Reg No | Password | Description |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` | `Admin@123` | Full control, User management, CSV import, Audit reports |
| **Librarian** | `librarian` | `Librarian@123` | Circulation desk, Issue/Return, Fines receipting, Paper approvals |
| **Lecturer** | `lecturer` | `Lecturer@123` | Borrowing privileges, Research paper upload and tracking |
| **Student** | `2022/ICT/125` | `Password@123` | OPAC discovery, Desk pickup holds, Due date tracking, Renewals |

*(Group 12 members are pre-seeded with their university registration numbers: `2022/ICT/47`, `2022/ICT/89`, `2022/ICT/101`, `2022/ICT/112`, `2022/ICT/122`, `2022/ICT/125` with password `Password@123`)*.

---

## ⏰ Background Cron Commands

Run these automated background commands manually or via Windows Task Scheduler / Linux cron:

```bash
# 1. Compute daily overdue fines and dispatch user alert notifications
python manage.py process_daily_fines

# 2. Expire uncollected 48-hour desk hold reservations and reallocate copies to next patrons
python manage.py expire_holds
```
