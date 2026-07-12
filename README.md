# 🚚 TransitOps - Smart Transport Operations Platform

<p align="center">
  <img src="screenshots/dashboard.png" alt="Dashboard" width="100%">
</p>

<p align="center">
A modern Fleet & Transport Management System built to digitize logistics operations including fleet management, driver management, trip dispatching, maintenance tracking, fuel management, and operational analytics.
</p>

---

## 📌 Project Overview

TransitOps is an end-to-end transport operations platform that enables logistics companies to efficiently manage their vehicles, drivers, trips, maintenance records, fuel expenses, and business analytics through one centralized dashboard.

The platform was developed as a full-stack web application with a clean UI, responsive dashboard, and real-time operational insights.

---

# ✨ Features

- 📊 Real-time Dashboard
- 🚛 Fleet Registry
- 👨‍✈️ Driver Management
- 🚚 Trip Dispatcher
- 🔧 Maintenance Logs
- ⛽ Fuel & Expense Tracking
- 📈 Reports & Analytics
- 🔍 Search & Filters
- 📄 Vehicle Documents
- 📤 PDF Report Export

---

# 🏠 Dashboard

<p align="center">
<img src="screenshots/dashboard.png" width="100%">
</p>

The dashboard provides a quick overview of the entire transport operation.

### Features

- Active Vehicles
- Available Vehicles
- Vehicles Under Maintenance
- Active Trips
- Pending Trips
- Drivers On Duty
- Fleet Utilization
- Recent Trips
- Live Vehicle Status
- Vehicle Type Filter
- Status Filter
- Region Filter

---

# 🚛 Fleet Registry

<p align="center">
<img src="screenshots/fleet.png" width="100%">
</p>

Manage all vehicles from a centralized fleet registry.

### Features

- Register New Vehicle
- Update Vehicle Details
- Delete Vehicle
- View Vehicle Documents
- Search by Registration Number
- Filter by Vehicle Type
- Filter by Vehicle Status

### Vehicle Information

- Registration Number
- Vehicle Name
- Vehicle Type
- Capacity
- Odometer Reading
- Acquisition Cost
- Current Status

---

# 👨‍✈️ Driver Management

<p align="center">
<img src="screenshots/drivers.png" width="100%">
</p>

Maintain complete driver profiles and monitor driver safety.

### Features

- Add Drivers
- Edit Driver Information
- Delete Drivers
- License Expiry Tracking
- Driver Availability
- Safety Monitoring
- Contact Details
- Trip Completion Percentage

---

# 🚚 Trip Dispatcher

<p align="center">
<img src="screenshots/trips.png" width="100%">
</p>

Assign vehicles and drivers for new transportation requests.

### Features

- Create Trips
- Assign Vehicle
- Assign Driver
- Dispatch Trips
- Complete Trips
- Cancel Trips
- Live Dispatch Board
- Trip Status Tracking

### Trip Lifecycle

```
Draft
   │
   ▼
Dispatched
   │
   ▼
Completed

or

Cancelled
```

---

# 🔧 Maintenance Management

<p align="center">
<img src="screenshots/maintenance.png" width="100%">
</p>

Track maintenance history and service schedules.

### Features

- Log Maintenance
- Record Service Type
- Maintenance Cost
- Service Date
- Vehicle History
- Completed Services
- Pending Maintenance

---

# ⛽ Fuel & Expense Management

<p align="center">
<img src="screenshots/fuel-expenses.png" width="100%">
</p>

Manage operational expenses including fuel, tolls, and maintenance.

### Fuel Logs

- Fuel Quantity
- Fuel Cost
- Vehicle
- Date

### Other Expenses

- Toll Charges
- Maintenance Charges
- Miscellaneous Expenses

---

# 📈 Reports & Analytics

<p align="center">
<img src="screenshots/analytics.png" width="100%">
</p>

Gain insights into fleet performance through analytics.

### Dashboard Metrics

- Fuel Efficiency
- Fleet Utilization
- Operational Cost
- Vehicle ROI

### Reports

- Monthly Revenue
- Costliest Vehicles
- Fuel Usage
- Maintenance Expenses

### Export

- Export Reports as PDF

---

# 🛠 Technology Stack

## Frontend

- React.js
- Tailwind CSS
- React Router DOM
- Axios

## Backend

- Node.js
- Express.js

## Database

- PostgreSQL

## Authentication

- JWT Authentication

---

# 📂 Folder Structure

```
TransitOps
│
├── frontend
│   ├── components
│   ├── pages
│   ├── context
│   ├── services
│   ├── assets
│   └── App.jsx
│
├── backend
│   ├── controllers
│   ├── routes
│   ├── middleware
│   ├── models
│   ├── config
│   └── server.js
│
└── README.md
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/transitops.git
cd transitops
```

---

## Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

DATABASE_URL=postgres://username:password@localhost:5432/transitops

JWT_SECRET=your_secret_key
```

Run backend

```bash
npm run dev
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 📊 Core Modules

| Module | Description |
|---------|-------------|
| Dashboard | Overall operational overview |
| Fleet | Vehicle registration & management |
| Drivers | Driver profiles & safety |
| Trips | Trip dispatch & monitoring |
| Maintenance | Vehicle servicing records |
| Fuel | Fuel & expense tracking |
| Analytics | Business reports & KPIs |

---

# 🔮 Future Enhancements

- 📍 Live GPS Tracking
- 🗺 Route Optimization
- 🤖 Predictive Maintenance using AI
- 📱 Driver Mobile App
- 🔔 SMS & Email Notifications
- 📦 Inventory Management
- 🌍 Multi-Branch Support
- ☁ Cloud Deployment
- 📡 IoT Vehicle Integration

---

# 🔐 Demo Credentials

TransitOps comes preloaded with demo users for testing the Role-Based Access Control (RBAC) system.

Each role has different permissions and access to various modules within the application.

| Name | Role | Email | Password |
|------|------|--------|----------|
| **Admin User** | `ADMIN` | `admin@transitops.com` | `admin123` |
| **John Manager** | `FLEET_MANAGER` | `manager@transitops.com` | `user1234` |
| **Sarah Dispatcher** | `DISPATCHER` | `dispatcher@transitops.com` | `user1234` |
| **Mike Safety** | `SAFETY_OFFICER` | `safety@transitops.com` | `user1234` |
| **Emma Analyst** | `FINANCIAL_ANALYST` | `analyst@transitops.com` | `user1234` |

> **Note:** These accounts are automatically created when running the database seed script (`seed.js`).

---

# 👥 Role-Based Access Control (RBAC)

TransitOps implements Role-Based Access Control to ensure that users can only access features relevant to their responsibilities.

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full system access including fleet, drivers, trips, maintenance, fuel management, analytics, settings, and user management. |
| **FLEET_MANAGER** | Manage vehicle registrations, update fleet information, and oversee maintenance records. |
| **DISPATCHER** | Create and manage trips, assign available drivers and vehicles, and monitor trip statuses. |
| **SAFETY_OFFICER** | Manage driver profiles, verify licenses, monitor safety records, and review compliance. |
| **FINANCIAL_ANALYST** | Access fuel logs, operational expenses, reports, analytics, and export financial summaries. |

---

## 🌱 Seed Database

Populate the database with demo data by running:

```bash
npm run seed
```

This command creates:

- 👤 Demo Users
- 🚚 Vehicles
- 👨‍✈️ Drivers
- 🗺️ Trips
- 🔧 Maintenance Records
- ⛽ Fuel Logs
- 📊 Expense Records

Once the seed process completes, you can log in using any of the demo credentials above to explore the application with different access levels.

---
