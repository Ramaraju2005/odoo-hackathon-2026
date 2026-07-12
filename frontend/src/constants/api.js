export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  API_BASE_URL,
  // Auth
  AUTH_LOGIN: "/auth/login",
  AUTH_REGISTER: "/auth/register",

  // Vehicles
  VEHICLES_LIST: "/vehicles",
  VEHICLES_CREATE: "/vehicles",
  VEHICLES_UPDATE: (id) => `/vehicles/${id}`,
  VEHICLES_DELETE: (id) => `/vehicles/${id}`,
  VEHICLES_GET: (id) => `/vehicles/${id}`,
  VEHICLES_AVAILABLE: "/vehicles/available/dispatch",
  VEHICLES_FUEL_EFFICIENCY: (id) => `/vehicles/${id}/fuel-efficiency`,
  VEHICLES_OPERATIONAL_COST: (id) => `/vehicles/${id}/operational-cost`,

  // Drivers
  DRIVERS_LIST: "/drivers",
  DRIVERS_CREATE: "/drivers",
  DRIVERS_UPDATE: (id) => `/drivers/${id}`,
  DRIVERS_DELETE: (id) => `/drivers/${id}`,
  DRIVERS_GET: (id) => `/drivers/${id}`,
  DRIVERS_AVAILABLE: "/drivers/available/dispatch",
  DRIVERS_EXPIRED_LICENSES: "/drivers/licenses/expired",
  DRIVERS_EXPIRING_LICENSES: "/drivers/licenses/expiring",

  // Trips
  TRIPS_LIST: "/trips",
  TRIPS_CREATE: "/trips",
  TRIPS_UPDATE: (id) => `/trips/${id}`,
  TRIPS_GET: (id) => `/trips/${id}`,
  TRIPS_DISPATCH: (id) => `/trips/${id}/dispatch`,
  TRIPS_COMPLETE: (id) => `/trips/${id}/complete`,
  TRIPS_CANCEL: (id) => `/trips/${id}/cancel`,
  TRIPS_ACTIVE: "/trips/active/list",
  TRIPS_PENDING: "/trips/pending/list",

  // Maintenance
  MAINTENANCE_LIST: "/maintenance",
  MAINTENANCE_CREATE: "/maintenance",
  MAINTENANCE_UPDATE: (id) => `/maintenance/${id}`,
  MAINTENANCE_DELETE: (id) => `/maintenance/${id}`,
  MAINTENANCE_GET: (id) => `/maintenance/${id}`,
  MAINTENANCE_CLOSE: (id) => `/maintenance/${id}/close`,
  MAINTENANCE_ACTIVE: "/maintenance/active/list",
  MAINTENANCE_COST: (vehicleId) => `/maintenance/vehicle/${vehicleId}/cost`,

  // Fuel
  FUEL_LIST: "/fuel",
  FUEL_CREATE: "/fuel",
  FUEL_UPDATE: (id) => `/fuel/${id}`,
  FUEL_DELETE: (id) => `/fuel/${id}`,
  FUEL_GET: (id) => `/fuel/${id}`,
  FUEL_CONSUMPTION: (vehicleId) => `/fuel/vehicle/${vehicleId}/consumption`,
  FUEL_EFFICIENCY: (vehicleId) => `/fuel/vehicle/${vehicleId}/efficiency`,

  // Expenses
  EXPENSES_LIST: "/expenses",
  EXPENSES_CREATE: "/expenses",
  EXPENSES_UPDATE: (id) => `/expenses/${id}`,
  EXPENSES_DELETE: (id) => `/expenses/${id}`,
  EXPENSES_GET: (id) => `/expenses/${id}`,
  EXPENSES_BY_VEHICLE: (vehicleId) => `/expenses/vehicle/${vehicleId}/expenses`,
  EXPENSES_BY_TYPE: (type) => `/expenses/type/${type}/expenses`,
  EXPENSES_OPERATIONAL_COST: (vehicleId) => `/expenses/vehicle/${vehicleId}/operational-cost`,

  // Dashboard
  DASHBOARD_KPIS: "/dashboard/kpis",
  DASHBOARD_FLEET_STATS: "/dashboard/fleet-stats",
  DASHBOARD_RECENT_TRIPS: "/dashboard/recent-trips",
  DASHBOARD_ACTIVITY_TIMELINE: "/dashboard/activity-timeline",
  DASHBOARD_OPERATIONAL_COSTS: "/dashboard/operational-costs",

  // Reports
  REPORTS_FUEL_EFFICIENCY: "/reports/fuel-efficiency",
  REPORTS_FLEET_UTILIZATION: "/reports/fleet-utilization",
  REPORTS_OPERATIONAL_COST: "/reports/operational-cost",
  REPORTS_VEHICLE_ROI: "/reports/vehicle-roi",
  REPORTS_TRIPS: "/reports/trips",
  REPORTS_MAINTENANCE: "/reports/maintenance",
  REPORTS_EXPORT: (type) => `/reports/export/${type}`,
};

export const STATUSES = {
  VEHICLE: {
    AVAILABLE: "AVAILABLE",
    ON_TRIP: "ON_TRIP",
    IN_SHOP: "IN_SHOP",
    RETIRED: "RETIRED",
  },
  DRIVER: {
    AVAILABLE: "AVAILABLE",
    ON_TRIP: "ON_TRIP",
    OFF_DUTY: "OFF_DUTY",
    SUSPENDED: "SUSPENDED",
  },
  TRIP: {
    DRAFT: "DRAFT",
    DISPATCHED: "DISPATCHED",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  },
};

export const USER_ROLES = {
  ADMIN: "ADMIN",
  FLEET_MANAGER: "FLEET_MANAGER",
  DRIVER: "DRIVER",
  SAFETY_OFFICER: "SAFETY_OFFICER",
  FINANCIAL_ANALYST: "FINANCIAL_ANALYST",
  DISPATCHER: "DISPATCHER",
};
