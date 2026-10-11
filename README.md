# University Library Management System (ULMS)

**University of Vavuniya | Faculty of Applied Science**  
**Course Module:** IT3162 — Group Project (Group 12)  
**Supervisor:** Ms. Sivasoruby Kanapathipillai  

---

## 🚀 Microservice Technology Stack

This system operates on a modern, decoupled **Microservice Architecture**:
- **Frontend:** React 19 + Vite + Tailwind CSS + Lucide Icons
- **API Gateway & Microservices:** Django 6 + Django REST Framework (DRF)
- **Database Architecture:** Database-per-Service (MySQL 8.0 via mysqlclient)
- **Event Messaging / Background Tasks:** django-q2 ORM broker
- **Authentication:** Cross-Service Stateless JWT Header Injection

---

## 🏗️ Architecture Overview

| Service | Port | Database | Responsibilities |
|---------|------|----------|------------------|
| **API Gateway** | 8000 | None | Request routing, JWT decoding, Header injection (X-User-Role) |
| **Catalog Service** | 8001 | lms_catalog | Books, Categories, Physical Copy Barcodes (OPAC) |
| **Repository Service**| 8002 | lms_repository | Digital assets, E-books, Research Papers, Peer Review |
| **Library Service** | 8003 | lms_library | Auth (JWT minting), Users, Circulation, Fines, Backups, Custom Fields |

---

## ⚙️ Quick Start Guide

### 1. Database Setup (MySQL)
Ensure you have MySQL running locally (127.0.0.1:3306) with the credentials oot:root.
Create the isolated microservice databases in MySQL Workbench:
`sql
CREATE DATABASE lms_library CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE lms_catalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE lms_repository CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
`
*(Note: If you need to rebuild the tables, navigate to each service folder and run python manage.py migrate).*

### 2. Launching the Entire System (1-Click)
I have created a powerful batch script that uses **Windows Terminal** to automatically launch all 7 background services in perfectly organized tabs and split-panes.

Simply double-click **start_lms.bat** in the root directory!

*(Alternatively, you can manually open 7 terminal tabs and run the commands below...)*

### 3. Manual Launch Instructions
Because this is a microservice ecosystem, you must start the Gateway, the 3 Services, and the 2 Background Workers. 

Open **6 separate terminal tabs** at the root of the project, activate the virtual environment (.\.venv\Scripts\Activate.ps1), and run the following commands:

**Terminal 1 (API Gateway):**
`ash
cd gateway
python manage.py runserver 8000
`
**Terminal 2 (Catalog Service):**
`ash
cd services/catalog_service
python manage.py runserver 8001
`
**Terminal 3 (Repository Service):**
`ash
cd services/repository_service
python manage.py runserver 8002
`
**Terminal 4 (Library Service):**
`ash
cd services/library_service
python manage.py runserver 8003
`
**Terminal 5 (Library Async Worker):**
`ash
cd services/library_service
python manage.py qcluster
`
**Terminal 6 (Repository Async Worker):**
`ash
cd services/repository_service
python manage.py qcluster
`

### 3. Launching the Frontend
Open a **7th terminal tab**:
`ash
cd frontend
npm install
npm run dev
`
Open your browser at: http://localhost:5173/

---

## 🔑 Default Test Accounts

| Role | Username | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Administrator** | dmin | dmin123 | Full control, Custom Fields engine, Backup management |
| **Librarian** | librarian | librarian123 | Circulation desk, Issue/Return, Catalog editing |
| **Lecturer** | lecturer | lecturer123 | Borrowing privileges, Research paper uploads |
| **Student** | student | student123 | OPAC discovery, Track loans and fines |

---

## 💡 Notable Architectural Features

1. **Google Forms-style Dynamic Fields:** Administrators can create dynamic properties for Patrons and Books (Text, Dropdown, Boolean) directly from the UI without database migrations. 
2. **Asynchronous Cross-Service Messaging:** Synchronous HTTP calls between microservices were eliminated. The system uses the **Outbox Pattern** via django-q2 to dispatch events (like checking out a book) to downstream services in the background.
3. **Database Denormalization for Speed:** The Circulation database explicitly caches standard book properties to achieve O(log n) loading times for patron dashboards without requiring crippling cross-service SQL joins.
4. **Gateway JWT Interception:** Downstream services (Catalog, Repository) trust the Gateway to decode the JWT and inject X-User-* HTTP headers, meaning they don't even need a User table in their database to enforce strict Role-Based Access Control!

