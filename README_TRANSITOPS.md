# 🚚 TransitOps - Smart Transport Operations Platform

A comprehensive full-stack fleet management and transport operations system built for the Odoo Hackathon 2026.

## 🎯 Overview

TransitOps is a modern web application designed to streamline fleet management, driver coordination, trip scheduling, and operational analytics for transport companies. The platform provides real-time visibility into fleet operations, maintenance tracking, fuel management, and comprehensive reporting capabilities.

## 🏗️ Technology Stack

### Frontend
- **React 19** - UI framework
- **React Router 7** - Client-side routing
- **TailwindCSS 4** - Utility-first CSS framework
- **Vite 8** - Build tool and dev server
- **Context API** - State management

### Backend
- **Express.js 5** - Web framework
- **Prisma 6** - ORM and database toolkit
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Helmet** - Security headers

## ✨ Key Features

### 🚗 Vehicle Management
- Complete vehicle lifecycle management
- Real-time availability tracking
- Fuel efficiency calculations
- Operational cost monitoring
- Vehicle status transitions (AVAILABLE, ON_TRIP, IN_SHOP, RETIRED)

### 👤 Driver Management
- Driver profile management
- License tracking with expiry validation
- Availability management
- Safety score monitoring
- Automatic license expiry detection

### 🛣️ Trip Management
- Trip creation with cargo weight validation
- Automatic status transitions (DRAFT → DISPATCHED → COMPLETED)
- Real-time vehicle and driver assignment
- Cargo weight capacity enforcement
- Trip cancellation support

### 🔧 Maintenance Management
- Maintenance record creation and tracking
- Automatic vehicle status management during maintenance
- Cost tracking per vehicle
- Maintenance history

### ⛽ Fuel Management
- Fuel log tracking with cost analysis
- Fuel efficiency calculations
- Average fuel cost monitoring
- Consumption analytics

### 💰 Expense Management
- Multi-category expense tracking (FUEL, TOLL, MAINTENANCE, OTHER)
- Expense aggregation
- ROI calculations
- Cost analysis per vehicle

### 📊 Dashboard & Analytics
- Real-time KPI metrics
- Fleet utilization percentages
- Operational cost breakdown
- Activity timeline
- Six comprehensive report types:
  - Fuel Efficiency Report
  - Fleet Utilization Report
  - Operational Cost Report
  - Vehicle ROI Report
  - Trips Report
  - Maintenance Report
- CSV export functionality

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Six user roles: ADMIN, FLEET_MANAGER, DRIVER, DISPATCHER, SAFETY_OFFICER, FINANCIAL_ANALYST
- Secure password hashing with bcrypt

## 📁 Project Structure

```
odoo-hackathon-2026/
├── backend/
│   ├── src/
│   │   ├── app.js                 # Express app setup
│   │   ├── server.js              # Server startup
│   │   ├── config/                # Configuration files
│   │   │   ├── db.js              # Database setup
│   │   │   └── env.js             # Environment variables
│   │   ├── middleware/            # Express middleware
│   │   │   ├── auth.middleware.js
│   │   │   ├── error.middleware.js
│   │   │   ├── role.middleware.js
│   │   │   └── validate.middleware.js
│   │   ├── modules/               # Feature modules
│   │   │   ├── auth/
│   │   │   ├── vehicles/
│   │   │   ├── drivers/
│   │   │   ├── trips/
│   │   │   ├── maintenance/
│   │   │   ├── fuel/
│   │   │   ├── expenses/
│   │   │   ├── dashboard/
│   │   │   └── reports/
│   │   ├── routes/                # API routes aggregation
│   │   └── shared/                # Shared utilities
│   │       ├── constants/
│   │       ├── errors/
│   │       └── utils/
│   ├── prisma/
│   │   ├── schema.prisma          # Database schema
│   │   ├── seed.js                # Database seeding
│   │   └── migrations/            # Prisma migrations
│   ├── .env                       # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   ├── App.css
│   │   ├── index.css              # Tailwind imports
│   │   ├── components/            # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/                 # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── VehiclesPage.jsx
│   │   │   ├── DriversPage.jsx
│   │   │   ├── TripsPage.jsx
│   │   │   ├── MaintenancePage.jsx
│   │   │   ├── FuelExpensesPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── context/               # React Context
│   │   │   └── AuthContext.jsx
│   │   ├── services/              # API services
│   │   │   └── apiService.js
│   │   ├── constants/             # Application constants
│   │   │   └── api.js
│   │   └── assets/
│   ├── .env
│   ├── vite.config.js
│   └── package.json
├── SETUP_GUIDE.md                 # Detailed setup instructions
└── README.md                      # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm run migrate      # Run database migrations
npm run seed         # Seed demo data
npm run dev          # Start backend server (port 5000)
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev          # Start dev server (port 5173)
```

### Demo Credentials
```
Email: admin@transitops.com
Password: admin123
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions.

## 📊 Database Schema

### Core Models
- **User**: System users with role-based access
- **Vehicle**: Fleet vehicles with status tracking
- **Driver**: Driver profiles with license validation
- **Trip**: Trip records with complete lifecycle management
- **MaintenanceLog**: Vehicle maintenance records
- **FuelLog**: Fuel consumption and cost tracking
- **Expense**: Operational expenses by category

### Relationships
- Vehicle ←→ Trip (One-to-Many)
- Vehicle ←→ MaintenanceLog (One-to-Many)
- Vehicle ←→ FuelLog (One-to-Many)
- Vehicle ←→ Expense (One-to-Many)
- Driver ←→ Trip (One-to-Many)
- User ←→ Trip (One-to-Many, for dispatch tracking)

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register

### Vehicles
- `GET/POST /api/vehicles` - List/Create
- `GET/PUT/DELETE /api/vehicles/:id` - Read/Update/Delete
- `GET /api/vehicles/available/dispatch` - Available vehicles

### Drivers
- `GET/POST /api/drivers` - List/Create
- `GET/PUT/DELETE /api/drivers/:id` - Read/Update/Delete
- `GET /api/drivers/available/dispatch` - Available drivers

### Trips
- `GET/POST /api/trips` - List/Create
- `POST /api/trips/:id/dispatch` - Dispatch trip
- `POST /api/trips/:id/complete` - Complete trip
- `POST /api/trips/:id/cancel` - Cancel trip

### Maintenance
- `GET/POST /api/maintenance` - List/Create
- `POST /api/maintenance/:id/close` - Close maintenance

### Fuel & Expenses
- `GET/POST /api/fuel` - Fuel logs
- `GET/POST /api/expenses` - Expenses

### Dashboard
- `GET /api/dashboard/kpis` - KPI metrics
- `GET /api/dashboard/operational-costs` - Cost breakdown

### Reports
- `GET /api/reports/fuel-efficiency` - Fuel efficiency
- `GET /api/reports/fleet-utilization` - Fleet utilization
- `GET /api/reports/operational-cost` - Operational cost
- `GET /api/reports/vehicle-roi` - Vehicle ROI
- `GET /api/reports/trips` - Trips data
- `GET /api/reports/maintenance` - Maintenance data
- `GET /api/reports/export/:type` - CSV export

Full API documentation available in [SETUP_GUIDE.md](./SETUP_GUIDE.md).

## 🎨 Frontend Features

### Pages
1. **Login** - Authentication with demo credentials
2. **Dashboard** - KPI overview and fleet metrics
3. **Vehicles** - CRUD operations with status tracking
4. **Drivers** - License management and availability
5. **Trips** - Complete trip lifecycle management
6. **Maintenance** - Maintenance records tracking
7. **Fuel & Expenses** - Fuel and expense management
8. **Reports** - Comprehensive analytics and CSV export

### User Interface
- Responsive design for desktop and tablet
- Clean, modern Tailwind CSS styling
- Navigation sidebar with collapsible menu
- Status badges with color coding
- Modal forms for CRUD operations
- Real-time data updates
- Error handling and validation feedback

## 🛡️ Security Features

- **Authentication**: JWT-based with secure token storage
- **Authorization**: Role-based access control
- **Password Security**: bcrypt hashing
- **Input Validation**: Server-side and client-side
- **CORS Protection**: Configured backend CORS
- **Security Headers**: Helmet middleware
- **SQL Injection Prevention**: Prisma parameterized queries

## 📈 Business Logic

### Validation Rules
1. Vehicle assignment only to AVAILABLE vehicles
2. Driver assignment only to AVAILABLE drivers with valid licenses
3. Cargo weight validation against vehicle capacity
4. License expiry checks for dispatch
5. Automatic vehicle status transitions
6. Trip completion with distance and fuel tracking

### Calculations
- **Fuel Efficiency**: Distance / Fuel Consumed (km/liter)
- **Operational Cost**: Sum of (Fuel + Maintenance + Toll + Other expenses)
- **Fleet Utilization**: (Active Vehicles / Total Vehicles) × 100
- **Vehicle ROI**: ((Trip Revenue - Operational Costs) / Acquisition Cost) × 100

## 🧪 Testing

Demo data includes:
- 5 users with different roles
- 5 vehicles (various types and capacities)
- 5 drivers with license details
- 3 sample trips at different statuses
- Fuel logs, maintenance records, and expenses

## 🚀 Deployment

### Production Build
```bash
# Frontend
cd frontend
npm run build

# Backend
# Configure .env for production
NODE_ENV=production npm start
```

### Environment Variables
See `.env` files in backend and frontend directories.

## 📝 License

Built for Odoo Hackathon 2026

## 👥 Team

TransitOps Smart Transport Operations Platform - Hackathon 2026

---

**Need help?** Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed instructions and troubleshooting.
