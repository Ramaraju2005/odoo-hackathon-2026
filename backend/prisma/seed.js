const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

// Initialize Prisma Client
let prisma;

try {
  prisma = new PrismaClient();
} catch (error) {
  console.error("Failed to initialize Prisma Client:", error);
  process.exit(1);
}

async function main() {
  // Check connection
  if (!prisma) {
    throw new Error("Prisma client is not initialized");
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Database connection successful");
  } catch (error) {
    console.error("✗ Database connection failed:", error.message);
    throw error;
  }

  // Clear existing data
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@transitops.com",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
  });

  const fleetManager = await prisma.user.create({
    data: {
      name: "John Manager",
      email: "manager@transitops.com",
      password: userPassword,
      role: "FLEET_MANAGER",
      isActive: true,
    },
  });

  const dispatcher = await prisma.user.create({
    data: {
      name: "Sarah Dispatcher",
      email: "dispatcher@transitops.com",
      password: userPassword,
      role: "DISPATCHER",
      isActive: true,
    },
  });

  const safetyOfficer = await prisma.user.create({
    data: {
      name: "Mike Safety",
      email: "safety@transitops.com",
      password: userPassword,
      role: "SAFETY_OFFICER",
      isActive: true,
    },
  });

  const analyst = await prisma.user.create({
    data: {
      name: "Emma Analyst",
      email: "analyst@transitops.com",
      password: userPassword,
      role: "FINANCIAL_ANALYST",
      isActive: true,
    },
  });

  // Create vehicles
  const vehicles = await Promise.all([
    prisma.vehicle.create({
      data: {
        registrationNo: "VH-001",
        name: "Van-05",
        type: "Van",
        maxLoadCapacity: 500,
        odometer: 15000,
        acquisitionCost: 50000,
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.create({
      data: {
        registrationNo: "VH-002",
        name: "Truck-10",
        type: "Truck",
        maxLoadCapacity: 1000,
        odometer: 25000,
        acquisitionCost: 85000,
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.create({
      data: {
        registrationNo: "VH-003",
        name: "Truck-15",
        type: "Truck",
        maxLoadCapacity: 1500,
        odometer: 45000,
        acquisitionCost: 120000,
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.create({
      data: {
        registrationNo: "VH-004",
        name: "Pickup-08",
        type: "Pickup",
        maxLoadCapacity: 800,
        odometer: 8000,
        acquisitionCost: 45000,
        status: "AVAILABLE",
      },
    }),
    prisma.vehicle.create({
      data: {
        registrationNo: "VH-005",
        name: "Sedan-04",
        type: "Sedan",
        maxLoadCapacity: 400,
        odometer: 35000,
        acquisitionCost: 35000,
        status: "IN_SHOP",
      },
    }),
  ]);

  // Create drivers
  const drivers = await Promise.all([
    prisma.driver.create({
      data: {
        name: "Alex Johnson",
        licenseNo: "DL-001",
        licenseCategory: "HCV",
        licenseExpiryDate: new Date("2027-12-31"),
        contactNumber: "9876543210",
        safetyScore: 95,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.create({
      data: {
        name: "Beth Smith",
        licenseNo: "DL-002",
        licenseCategory: "LCV",
        licenseExpiryDate: new Date("2026-11-15"),
        contactNumber: "9876543211",
        safetyScore: 88,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.create({
      data: {
        name: "Charlie Brown",
        licenseNo: "DL-003",
        licenseCategory: "HCV",
        licenseExpiryDate: new Date("2025-06-30"),
        contactNumber: "9876543212",
        safetyScore: 85,
        status: "AVAILABLE",
      },
    }),
    prisma.driver.create({
      data: {
        name: "Diana Prince",
        licenseNo: "DL-004",
        licenseCategory: "LCV",
        licenseExpiryDate: new Date("2028-03-20"),
        contactNumber: "9876543213",
        safetyScore: 92,
        status: "OFF_DUTY",
      },
    }),
    prisma.driver.create({
      data: {
        name: "Eve Wilson",
        licenseNo: "DL-005",
        licenseCategory: "HCV",
        licenseExpiryDate: new Date("2025-01-15"),
        contactNumber: "9876543214",
        safetyScore: 70,
        status: "SUSPENDED",
      },
    }),
  ]);

  // Create trips
  const trips = await Promise.all([
    prisma.trip.create({
      data: {
        vehicleId: vehicles[0].id,
        driverId: drivers[0].id,
        source: "Mumbai",
        destination: "Pune",
        cargoWeight: 450,
        plannedDistance: 150,
        actualDistance: 155,
        fuelConsumed: 15,
        status: "COMPLETED",
        completedAt: new Date("2026-07-10"),
      },
    }),
    prisma.trip.create({
      data: {
        vehicleId: vehicles[1].id,
        driverId: drivers[1].id,
        source: "Delhi",
        destination: "Bangalore",
        cargoWeight: 950,
        plannedDistance: 2000,
        status: "DISPATCHED",
      },
    }),
    prisma.trip.create({
      data: {
        vehicleId: vehicles[2].id,
        driverId: drivers[2].id,
        source: "Chennai",
        destination: "Hyderabad",
        cargoWeight: 1400,
        plannedDistance: 600,
        status: "DRAFT",
      },
    }),
  ]);

  // Create fuel logs
  await Promise.all([
    prisma.fuelLog.create({
      data: {
        vehicleId: vehicles[0].id,
        liters: 50,
        cost: 6500,
        date: new Date("2026-07-10"),
      },
    }),
    prisma.fuelLog.create({
      data: {
        vehicleId: vehicles[0].id,
        liters: 45,
        cost: 5850,
        date: new Date("2026-07-08"),
      },
    }),
    prisma.fuelLog.create({
      data: {
        vehicleId: vehicles[1].id,
        liters: 80,
        cost: 10400,
        date: new Date("2026-07-09"),
      },
    }),
  ]);

  // Create maintenance logs
  await Promise.all([
    prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicles[4].id,
        description: "Oil Change",
        cost: 2500,
        startDate: new Date("2026-07-11"),
        endDate: null,
      },
    }),
    prisma.maintenanceLog.create({
      data: {
        vehicleId: vehicles[0].id,
        description: "Tire Replacement",
        cost: 5000,
        startDate: new Date("2026-06-15"),
        endDate: new Date("2026-06-16"),
      },
    }),
  ]);

  // Create expenses
  await Promise.all([
    prisma.expense.create({
      data: {
        vehicleId: vehicles[0].id,
        type: "TOLL",
        amount: 500,
        description: "Highway toll",
        date: new Date("2026-07-10"),
      },
    }),
    prisma.expense.create({
      data: {
        vehicleId: vehicles[1].id,
        type: "TOLL",
        amount: 1200,
        description: "Interstate toll",
        date: new Date("2026-07-09"),
      },
    }),
    prisma.expense.create({
      data: {
        vehicleId: vehicles[0].id,
        type: "MAINTENANCE",
        amount: 1500,
        description: "Brake inspection",
        date: new Date("2026-07-05"),
      },
    }),
  ]);

  console.log("Seed data created successfully!");
  console.log({
    users: { admin, fleetManager, dispatcher, safetyOfficer, analyst },
    vehicles: vehicles.length,
    drivers: drivers.length,
    trips: trips.length,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
