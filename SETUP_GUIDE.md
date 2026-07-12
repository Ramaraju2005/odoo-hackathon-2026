# TransitOps - Smart Transport Operations Platform

## Project Setup & Running Guide

### Architecture Overview
- **Frontend**: React 19 + React Router 7 + TailwindCSS 4 + Vite 8
- **Backend**: Express.js 5 + Prisma 6 + PostgreSQL
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT-based with bcrypt hashing

### Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+)
- npm or yarn

### Backend Setup

#### 1. Install Dependencies
```bash
cd backend
npm install
```

#### 2. Configure Environment Variables
Edit `backend/.env`:
```
PORT=5000
DATABASE_URL=postgresql://username:password@localhost:5432/transitops
JWT_SECRET=TransitOpsSuperSecretKey
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

#### 3. Create PostgreSQL Database
```bash
createdb transitops
```

#### 4. Run Prisma Migrations
```bash
npm run migrate
```

#### 5. Seed Database with Demo Data
```bash
npm run seed
```

#### 6. Start Backend Server
```bash
npm run dev
```
Backend will run on: `http://localhost:5000`

### Frontend Setup

#### 1. Install Dependencies
```bash
cd frontend
npm install
```

#### 2. Configure Environment Variables
Create/edit `frontend/.env`:
```
VITE_API_URL=http://localhost:5000/api
```

#### 3. Start Development Server
```bash
npm run dev
```
Frontend will run on: `http://localhost:5173`

### Available Demo Credentials

**Admin User:**
- Email: `admin@transitops.com`
- Password: `admin123`

**Other Demo Users:**
- fleet_manager@transitops.com / password123
- dispatcher@transitops.com / password123
- safety_officer@transitops.com / password123
- financial_analyst@transitops.com / password123

### API Endpoints

#### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user

#### Vehicles
- `GET /api/vehicles` - List all vehicles
- `POST /api/vehicles` - Create vehicle
- `GET /api/vehicles/:id` - Get vehicle details
- `PUT /api/vehicles/:id` - Update vehicle
- `DELETE /api/vehicles/:id` - Delete vehicle
- `GET /api/vehicles/available/dispatch` - Get available vehicles for dispatch

#### Drivers
- `GET /api/drivers` - List all drivers
- `POST /api/drivers` - Create driver
- `GET /api/drivers/:id` - Get driver details
- `PUT /api/drivers/:id` - Update driver
- `DELETE /api/drivers/:id` - Delete driver
- `GET /api/drivers/available/dispatch` - Get available drivers for dispatch

#### Trips
- `GET /api/trips` - List all trips
- `POST /api/trips` - Create trip (DRAFT status)
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips/:id/dispatch` - Dispatch trip
- `POST /api/trips/:id/complete` - Complete trip
- `POST /api/trips/:id/cancel` - Cancel trip

#### Maintenance
- `GET /api/maintenance` - List all maintenance records
- `POST /api/maintenance` - Create maintenance record
- `POST /api/maintenance/:id/close` - Close maintenance record
- `DELETE /api/maintenance/:id` - Delete maintenance record

#### Fuel & Expenses
- `GET /api/fuel` - List fuel logs
- `POST /api/fuel` - Create fuel log
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense

#### Dashboard
- `GET /api/dashboard/kpis` - Get KPI metrics
- `GET /api/dashboard/operational-costs` - Get operational costs breakdown

#### Reports
- `GET /api/reports/fuel-efficiency` - Fuel efficiency report
- `GET /api/reports/fleet-utilization` - Fleet utilization report
- `GET /api/reports/operational-cost` - Operational cost report
- `GET /api/reports/vehicle-roi` - Vehicle ROI report
- `GET /api/reports/trips` - Trips report
- `GET /api/reports/maintenance` - Maintenance report
- `GET /api/reports/export/:type` - Export report as CSV

### Database Schema

#### Core Models
- **User**: Authentication and role management
- **Vehicle**: Fleet vehicle tracking
- **Driver**: Driver management with license validation
- **Trip**: Trip lifecycle management (DRAFT → DISPATCHED → COMPLETED)
- **MaintenanceLog**: Vehicle maintenance records
- **FuelLog**: Fuel consumption tracking
- **Expense**: Operational expense tracking

#### User Roles
- ADMIN: Full system access
- FLEET_MANAGER: Fleet management
- DRIVER: Limited to own trips
- DISPATCHER: Trip assignment
- SAFETY_OFFICER: Safety oversight
- FINANCIAL_ANALYST: Reports and analytics

#### Vehicle Status
- AVAILABLE: Ready for dispatch
- ON_TRIP: Currently on trip
- IN_SHOP: In maintenance
- RETIRED: Out of service

#### Trip Status
- DRAFT: Initial creation
- DISPATCHED: Assigned to driver and vehicle
- COMPLETED: Trip finished
- CANCELLED: Trip cancelled

### Key Features

#### Vehicle Management
- Add/edit/delete vehicles
- Track vehicle status and availability
- Calculate fuel efficiency (Distance/Fuel)
- Monitor operational costs

#### Driver Management
- Add/edit/delete drivers
- License tracking with expiry date validation
- Availability checking for dispatch
- Safety score monitoring

#### Trip Management
- Create trips with cargo weight validation
- Automatic status transitions on dispatch/complete
- Prevents over-capacity and unavailable vehicle assignment
- Calculate actual distance and fuel consumption on completion

#### Maintenance Tracking
- Create maintenance records (automatically sets vehicle to IN_SHOP)
- Close maintenance records (restores vehicle to AVAILABLE)
- Track maintenance costs per vehicle

#### Fuel & Expense Management
- Log fuel consumption and costs
- Track various expense types (FUEL, TOLL, MAINTENANCE, OTHER)
- Calculate fuel efficiency ratios

#### Dashboard
- KPI overview (vehicles, trips, drivers)
- Fleet utilization percentage
- Operational cost breakdown

#### Reporting
- Fuel efficiency analysis per vehicle
- Fleet utilization metrics
- Operational cost report with ROI calculation
- Vehicle ROI report
- Trips and maintenance reports
- CSV export for all reports

### Frontend Pages

- **Login Page**: Authentication with demo credentials
- **Dashboard**: KPI metrics and fleet overview
- **Vehicles**: CRUD operations and status tracking
- **Drivers**: License management and availability
- **Trips**: Trip lifecycle (create → dispatch → complete)
- **Maintenance**: Maintenance records and scheduling
- **Fuel & Expenses**: Fuel logs and expense tracking
- **Reports**: 6 comprehensive reports with CSV export

### Business Logic Validation

1. **Vehicle Assignment**: Only AVAILABLE vehicles can be assigned to trips
2. **Driver Assignment**: Only AVAILABLE drivers with valid licenses can be assigned
3. **Cargo Weight**: Cannot exceed vehicle maximum load capacity
4. **License Expiry**: Drivers with expired licenses cannot be dispatched
5. **Vehicle Status Transitions**: Automatic status changes (AVAILABLE ↔ ON_TRIP/IN_SHOP)
6. **Trip Completion**: Requires actual distance and fuel consumed
7. **Maintenance Impact**: Vehicle automatically unavailable during maintenance

### Development Notes

#### Run Backend Only
```bash
cd backend
npm run dev
```

#### Run Frontend Only
```bash
cd frontend
npm run dev
```

#### Database Migrations
```bash
# Run migrations
npm run migrate

# Create new migration
npx prisma migrate dev --name migration_name

# View database
npx prisma studio
```

#### Reset Database (Warning: Deletes all data)
```bash
npx prisma migrate reset
```

### Troubleshooting

#### Database Connection Error
- Ensure PostgreSQL is running
- Verify DATABASE_URL in .env matches your PostgreSQL credentials
- Check if database exists: `psql -l`

#### CORS Error
- Verify CORS_ORIGIN in backend .env matches frontend URL
- Check API_BASE_URL in frontend constants

#### Port Already in Use
- Backend: Change PORT in .env (default 5000)
- Frontend: Vite will automatically use next available port

#### JWT Token Issues
- Clear localStorage in browser
- Log in again to get new token
- Check JWT_SECRET is same in .env and code

### Production Deployment

1. Build frontend: `npm run build` in frontend/
2. Set environment variables for production
3. Run database migrations on production database
4. Deploy backend and frontend separately or together

---

Built for Odoo Hackathon 2026 - TransitOps Smart Transport Operations Platform
