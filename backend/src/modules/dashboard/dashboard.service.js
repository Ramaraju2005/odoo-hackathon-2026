const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class DashboardService {
  async getKPIs() {
    // Get vehicle counts
    const vehicleStats = await prisma.vehicle.groupBy({
      by: ["status"],
      _count: true,
    });

    const vehicleStatusMap = {};
    vehicleStats.forEach((stat) => {
      vehicleStatusMap[stat.status] = stat._count;
    });

    const activeVehicles = vehicleStatusMap["ON_TRIP"] || 0;
    const availableVehicles = vehicleStatusMap["AVAILABLE"] || 0;
    const vehiclesInMaintenance = vehicleStatusMap["IN_SHOP"] || 0;
    const totalVehicles = await prisma.vehicle.count();

    // Get trip counts
    const tripStats = await prisma.trip.groupBy({
      by: ["status"],
      _count: true,
    });

    const tripStatusMap = {};
    tripStats.forEach((stat) => {
      tripStatusMap[stat.status] = stat._count;
    });

    const activeTrips = tripStatusMap["DISPATCHED"] || 0;
    const pendingTrips = tripStatusMap["DRAFT"] || 0;
    const completedTrips = tripStatusMap["COMPLETED"] || 0;

    // Get driver stats
    const driverStats = await prisma.driver.groupBy({
      by: ["status"],
      _count: true,
    });

    const driverStatusMap = {};
    driverStats.forEach((stat) => {
      driverStatusMap[stat.status] = stat._count;
    });

    const driversOnDuty = driverStatusMap["ON_TRIP"] || 0;
    const availableDrivers = driverStatusMap["AVAILABLE"] || 0;

    // Calculate fleet utilization
    const fleetUtilization = totalVehicles > 0 
      ? parseFloat(((activeVehicles / totalVehicles) * 100).toFixed(2)) 
      : 0;

    return {
      vehicles: {
        total: totalVehicles,
        active: activeVehicles,
        available: availableVehicles,
        maintenance: vehiclesInMaintenance,
        retired: vehicleStatusMap["RETIRED"] || 0,
      },
      trips: {
        active: activeTrips,
        pending: pendingTrips,
        completed: completedTrips,
        total: activeTrips + pendingTrips + completedTrips,
      },
      drivers: {
        onDuty: driversOnDuty,
        available: availableDrivers,
        offDuty: driverStatusMap["OFF_DUTY"] || 0,
        suspended: driverStatusMap["SUSPENDED"] || 0,
      },
      metrics: {
        fleetUtilization,
      },
    };
  }

  async getFleetStats() {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        trips: {
          where: { status: "COMPLETED" },
        },
        fuelLogs: true,
        maintenanceLogs: true,
        expenses: true,
      },
    });

    const stats = vehicles.map((vehicle) => {
      const totalTrips = vehicle.trips.length;
      const totalDistance = vehicle.trips.reduce(
        (sum, trip) => sum + (trip.actualDistance || 0),
        0
      );
      const totalFuel = vehicle.fuelLogs.reduce((sum, log) => sum + log.liters, 0);
      const totalFuelCost = vehicle.fuelLogs.reduce((sum, log) => sum + log.cost, 0);
      const maintenanceCost = vehicle.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
      const expenseCost = vehicle.expenses.reduce((sum, exp) => sum + exp.amount, 0);

      const fuelEfficiency = totalFuel > 0 ? parseFloat((totalDistance / totalFuel).toFixed(2)) : 0;
      const totalCost = totalFuelCost + maintenanceCost + expenseCost;
      const roi =
        vehicle.acquisitionCost > 0
          ? parseFloat((((totalTrips * 1000 - totalCost) / vehicle.acquisitionCost) * 100).toFixed(2))
          : 0;

      return {
        vehicleId: vehicle.id,
        registrationNo: vehicle.registrationNo,
        name: vehicle.name,
        status: vehicle.status,
        tripCount: totalTrips,
        totalDistance,
        totalFuel,
        fuelEfficiency,
        totalCost,
        roi,
      };
    });

    return {
      totalVehicles: vehicles.length,
      vehicles: stats,
    };
  }

  async getRecentTrips(limit = 10) {
    const trips = await prisma.trip.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    return trips;
  }

  async getActivitiyTimeline(limit = 20) {
    const trips = await prisma.trip.findMany({
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        vehicle: true,
        driver: true,
      },
    });

    const maintenance = await prisma.maintenanceLog.findMany({
      take: limit,
      orderBy: { updatedAt: "desc" },
      include: {
        vehicle: true,
      },
    });

    const combined = [
      ...trips.map((trip) => ({
        id: trip.id,
        type: "TRIP",
        title: `Trip ${trip.status}`,
        description: `${trip.vehicle.name} - ${trip.source} to ${trip.destination}`,
        timestamp: trip.updatedAt,
      })),
      ...maintenance.map((maint) => ({
        id: maint.id,
        type: "MAINTENANCE",
        title: "Maintenance",
        description: `${maint.vehicle.name} - ${maint.description}`,
        timestamp: maint.updatedAt,
      })),
    ];

    return combined.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  async getOperationalCosts() {
    const fuelTotal = await prisma.fuelLog.aggregate({
      _sum: { cost: true },
    });

    const maintenanceTotal = await prisma.maintenanceLog.aggregate({
      _sum: { cost: true },
    });

    const expenseTotal = await prisma.expense.aggregate({
      _sum: { amount: true },
    });

    const totalFuelCost = fuelTotal._sum.cost || 0;
    const totalMaintenanceCost = maintenanceTotal._sum.cost || 0;
    const totalExpenseCost = expenseTotal._sum.amount || 0;
    const grandTotal = totalFuelCost + totalMaintenanceCost + totalExpenseCost;

    return {
      fuel: totalFuelCost,
      maintenance: totalMaintenanceCost,
      expenses: totalExpenseCost,
      total: grandTotal,
      breakdown: {
        fuelPercentage: grandTotal > 0 ? parseFloat(((totalFuelCost / grandTotal) * 100).toFixed(2)) : 0,
        maintenancePercentage: grandTotal > 0 ? parseFloat(((totalMaintenanceCost / grandTotal) * 100).toFixed(2)) : 0,
        expensesPercentage: grandTotal > 0 ? parseFloat(((totalExpenseCost / grandTotal) * 100).toFixed(2)) : 0,
      },
    };
  }
}

module.exports = new DashboardService();
